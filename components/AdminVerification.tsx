import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Section, Card, Button } from './Components';
import { getTutorTypeLabel } from '../constants';
import {
  getPendingTutors,
  verifyTutor,
  getTutorCertificates,
  getTutorProfile,
  updateCertificateStatus,
  setTutorCaseAccess,
  setTutorCertVerificationStatus,
  updateTutorPhotoStatus,
} from '../services/platformApi';

interface Tutor {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  qualification: string | null;
  experience_years: number | null;
  subjects: string[];
  levels: string[];
  hourly_rate: number | null;
  verification_status: string;
  photo_url?: string | null;
  photo_verification_status?: 'approved' | 'rejected' | 'pending' | 'missing' | null;
  can_access_cases?: boolean | null;
  questionnaire_completed?: boolean;
  questionnaire_answers?: any;
  created_at: string;
  certificates: Array<{
    id: string;
    file_url: string;
    file_name: string;
    verification_status?: 'pending' | 'approved' | 'rejected';
    admin_notes?: string | null;
    uploaded_at: string;
  }>;
}

export const AdminVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingTutor, setProcessingTutor] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const normalizeQuestionnaire = (value: any) => {
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error('Failed to parse questionnaire JSON:', error);
        return null;
      }
    }
    return value;
  };
  const tutorTypeForModal = selectedQuestionnaire?.personality?.traitScores
    ? getTutorTypeLabel(selectedQuestionnaire.personality.traitScores)
    : null;

  useEffect(() => {
    fetchPendingTutors();
  }, []);

  const fetchPendingTutors = async () => {
    setLoading(true);
    setError(null);
    const result = await getPendingTutors();

    if (result.success && result.data) {
      setTutors(result.data);
    } else {
      setError(result.error || 'Failed to fetch pending tutors');
    }
    setLoading(false);
  };

  const evaluateCaseAccess = async (tutorId: string) => {
    const [profileResult, certsResult] = await Promise.all([
      getTutorProfile(tutorId),
      getTutorCertificates(tutorId),
    ]);

    if (!profileResult.success || !profileResult.data || !certsResult.success) return;

    const profile = profileResult.data;
    const certs = certsResult.data || [];

    const hasApprovedCert = certs.some((cert: any) => cert.verification_status === 'approved');
    const photoApproved = profile.photo_verification_status === 'approved';
    const questionnaireDone = !!profile.questionnaire_completed;
    const verified = profile.verification_status === 'verified';

    const allowAccess = hasApprovedCert && photoApproved && questionnaireDone && verified;
    await setTutorCaseAccess(tutorId, allowAccess);

    const certStatus = hasApprovedCert
      ? 'approved'
      : certs.some((cert: any) => cert.verification_status === 'rejected')
      ? 'rejected'
      : 'pending';
    await setTutorCertVerificationStatus(tutorId, certStatus);
  };

  const handleVerifyTutor = async (tutorId: string, status: 'verified' | 'rejected') => {
    const confirmMessage =
      status === 'verified'
        ? 'Are you sure you want to approve this tutor?'
        : 'Are you sure you want to reject this tutor?';

    if (!confirm(confirmMessage)) return;

    setProcessingTutor(tutorId);
    setError(null);
    setSuccessMessage(null);

    const result = await verifyTutor(tutorId, status);

    if (result.success) {
      setSuccessMessage(
        `Tutor ${status === 'verified' ? 'approved' : 'rejected'} successfully!`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      if (status === 'verified') {
        await evaluateCaseAccess(tutorId);
      }
      fetchPendingTutors();
    } else {
      setError(result.error || 'Failed to update tutor status');
    }

    setProcessingTutor(null);
  };

  const handleCertificateStatus = async (
    tutorId: string,
    certificateId: string,
    status: 'approved' | 'rejected'
  ) => {
    setProcessingTutor(tutorId);
    setError(null);

    const result = await updateCertificateStatus(certificateId, status);

    if (result.success) {
      await evaluateCaseAccess(tutorId);
      fetchPendingTutors();
    } else {
      setError(result.error || 'Failed to update certificate status');
    }

    setProcessingTutor(null);
  };

  const handlePhotoStatus = async (
    tutorId: string,
    status: 'approved' | 'rejected'
  ) => {
    setProcessingTutor(tutorId);
    setError(null);

    const result = await updateTutorPhotoStatus(tutorId, status);

    if (result.success) {
      await evaluateCaseAccess(tutorId);
      fetchPendingTutors();
    } else {
      setError(result.error || 'Failed to update photo status');
    }

    setProcessingTutor(null);
  };

  const handleCaseAccess = async (tutorId: string, allowAccess: boolean) => {
    setProcessingTutor(tutorId);
    setError(null);

    const result = await setTutorCaseAccess(tutorId, allowAccess);

    if (result.success) {
      fetchPendingTutors();
    } else {
      setError(result.error || 'Failed to update case access');
    }

    setProcessingTutor(null);
  };

  if (loading) {
    return (
      <Section>
        <div className="text-center py-12">
          <p className="text-lg text-slate-600">Loading pending tutors...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/matching')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              location.pathname === '/admin/matching'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Matching
          </button>
          <button
            onClick={() => navigate('/admin/tutors')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              location.pathname === '/admin/tutors'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tutor Browser
          </button>
          <button
            onClick={() => navigate('/admin/verification')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              location.pathname === '/admin/verification'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Verification
          </button>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Tutor Verification</h2>
        <p className="text-slate-600">Review and verify tutor applications and certificates</p>
        {tutors.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-yellow-800 font-semibold">{tutors.length} pending verification{tutors.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {tutors.length === 0 ? (
        <Card title="No Pending Tutors">
          <p>No tutors pending verification at the moment.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {tutors.map((tutor) => {
            const questionnaire = normalizeQuestionnaire(tutor.questionnaire_answers);
            const tutorType = getTutorTypeLabel(
              questionnaire?.personality?.traitScores
            );
            return (
              <Card key={tutor.id} title={tutor.full_name}>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                      {tutor.photo_url ? (
                        <img src={tutor.photo_url} alt="Tutor" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-sm text-gray-500">No Photo</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Photo</p>
                      <p className="font-semibold">
                        {tutor.photo_verification_status || (tutor.photo_url ? 'pending' : 'missing')}
                      </p>
                      {tutor.photo_url && (
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="primary"
                            onClick={() => handlePhotoStatus(tutor.id, 'approved')}
                            disabled={processingTutor === tutor.id}
                            className="text-xs px-3 py-1"
                          >
                            Approve Photo
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handlePhotoStatus(tutor.id, 'rejected')}
                            disabled={processingTutor === tutor.id}
                            className="text-xs px-3 py-1 border-red-500 text-red-600 hover:bg-red-50"
                          >
                            Reject Photo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold">{tutor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-semibold">{tutor.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Qualification</p>
                    <p className="font-semibold">{tutor.qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Experience</p>
                    <p className="font-semibold">{tutor.experience_years || 0} years</p>
                  </div>
                  {tutorType && (
                    <div>
                      <p className="text-sm text-slate-500">Tutor Type</p>
                      <p className="font-semibold">{tutorType.label}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500">Subjects</p>
                    <p className="font-semibold">
                      {tutor.subjects && tutor.subjects.length > 0
                        ? tutor.subjects.join(', ')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Levels</p>
                    <p className="font-semibold">
                      {tutor.levels && tutor.levels.length > 0 ? tutor.levels.join(', ') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Hourly Rate</p>
                    <p className="font-semibold">${tutor.hourly_rate || 0}/hr</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Applied On</p>
                    <p className="font-semibold">
                      {new Date(tutor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Certificates</p>
                  {tutor.certificates && tutor.certificates.length > 0 ? (
                    <div className="space-y-3">
                      {tutor.certificates.map((cert) => (
                        <div key={cert.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <a
                            href={cert.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm font-medium"
                          >
                            📄 {cert.file_name || 'Certificate'}
                          </a>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600">
                              {cert.verification_status || 'pending'}
                            </span>
                            <Button
                              variant="primary"
                              onClick={() => handleCertificateStatus(tutor.id, cert.id, 'approved')}
                              disabled={processingTutor === tutor.id}
                              className="text-xs px-3 py-1"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCertificateStatus(tutor.id, cert.id, 'rejected')}
                              disabled={processingTutor === tutor.id}
                              className="text-xs px-3 py-1 border-red-500 text-red-600 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                      <p className="font-semibold">⚠️ No certificates uploaded</p>
                      <p className="mt-1">This tutor has not uploaded any certificates yet. Consider rejecting or requesting upload before approval.</p>
                    </div>
                  )}
                </div>

                {tutorType && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Tutor Type</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                      {tutorType.label}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{tutorType.description}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t">
                  {questionnaire && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedQuestionnaire(questionnaire);
                        setShowQuestionnaireModal(true);
                      }}
                      className="text-sm"
                    >
                      📋 View Questionnaire
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => handleVerifyTutor(tutor.id, 'verified')}
                    disabled={processingTutor === tutor.id}
                    className="text-sm"
                  >
                    {processingTutor === tutor.id ? 'Processing...' : '✓ Approve'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCaseAccess(tutor.id, true)}
                    disabled={processingTutor === tutor.id}
                    className="text-sm border-green-500 text-green-600 hover:bg-green-50"
                  >
                    {processingTutor === tutor.id ? 'Processing...' : 'Unlock Cases'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleVerifyTutor(tutor.id, 'rejected')}
                    disabled={processingTutor === tutor.id}
                    className="text-sm border-red-500 text-red-500 hover:bg-red-50"
                  >
                    {processingTutor === tutor.id ? 'Processing...' : '✗ Reject'}
                  </Button>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}

      {/* Questionnaire Modal */}
      {showQuestionnaireModal && selectedQuestionnaire && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-primary mb-4">Profile Questionnaire & Personality</h3>
            
            {selectedQuestionnaire?.personality?.traitScores && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-3">Personality Profile</h4>
                <div className="space-y-3">
                  {Object.entries(selectedQuestionnaire.personality.traitScores).map(([trait, score]: [string, any]) => (
                    <div key={trait}>
                      <div className="flex justify-between mb-1">
                        <span className="capitalize font-semibold text-blue-800">{trait}</span>
                        <span className="font-bold text-blue-900">{score}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {selectedQuestionnaire.personality.topTraits && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Top Fit:</strong> {selectedQuestionnaire.personality.topTraits.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
                    </p>
                  </div>
                )}
                {tutorTypeForModal && (
                  <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Tutor Type:</strong> {tutorTypeForModal.label}
                    </p>
                    <p className="text-xs text-blue-800 mt-1">{tutorTypeForModal.description}</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {selectedQuestionnaire && typeof selectedQuestionnaire === 'object' ? (
                Object.entries(selectedQuestionnaire).map(([key, value]: [string, any]) => {
                  if (key === 'personality' || key === 'version' || key === 'completedAt') return null;
                  if (Array.isArray(value)) value = value.join(', ');
                  return (
                    <div key={key} className="border-b pb-3">
                      <p className="text-sm font-semibold text-slate-700 mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      <p className="text-slate-600">{String(value)}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500">No questionnaire data available.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setShowQuestionnaireModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};
