import React, { useEffect, useState } from 'react';
import { Section, Card, Button } from './Components';
import { getPendingTutors, verifyTutor, getTutorCertificates } from '../services/platformApi';

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
  created_at: string;
  certificates: Array<{
    id: string;
    file_url: string;
    file_name: string;
    uploaded_at: string;
  }>;
}

export const AdminVerification: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingTutor, setProcessingTutor] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      fetchPendingTutors();
    } else {
      setError(result.error || 'Failed to update tutor status');
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Tutor Verification</h2>
        <p className="text-slate-600">Review and verify tutor applications</p>
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
          {tutors.map((tutor) => (
            <Card key={tutor.id} title={tutor.full_name}>
              <div className="space-y-3">
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

                {tutor.certificates && tutor.certificates.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-slate-500 mb-2">Uploaded Certificates</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.certificates.map((cert) => (
                        <a
                          key={cert.id}
                          href={cert.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm"
                        >
                          📄 {cert.file_name || 'Certificate'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t">
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
                    onClick={() => handleVerifyTutor(tutor.id, 'rejected')}
                    disabled={processingTutor === tutor.id}
                    className="text-sm border-red-500 text-red-500 hover:bg-red-50"
                  >
                    {processingTutor === tutor.id ? 'Processing...' : '✗ Reject'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};
