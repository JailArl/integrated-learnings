import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Section, Card, Button } from '../components/Components';
import {
  getAllTutors,
  getAllRequests,
  approveBid,
  getTutorCertificates,
  verifyTutor,
  updateCertificateStatus,
  setTutorCaseAccess,
  setTutorCertVerificationStatus,
  updateTutorPhotoStatus,
  getTutorProfile,
} from '../services/platformApi';
import { User, Mail, Phone, Award, BookOpen, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getTutorTypeLabel } from '../constants';

interface TutorProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  qualification: string;
  experience_years: number;
  hourly_rate: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  photo_url?: string | null;
  photo_verification_status?: 'approved' | 'rejected' | 'pending' | 'missing' | null;
  cert_verification_status?: 'pending' | 'approved' | 'rejected' | null;
  can_access_cases?: boolean | null;
  ai_interview_status?: 'pending' | 'completed' | 'failed' | null;
  ai_interview_score?: number | null;
  ai_interview_assessment?: string | null;
  ai_interview_attempts?: number | null;
  questionnaire_completed: boolean;
  questionnaire_answers?: any;
  teaching_philosophy: string;
  why_tutoring: string;
  strengths: string;
  preferred_student_levels: string[];
  availability_days: string[];
  teaching_subjects: string[];
  availability_notes: string;
  max_students: number;
  created_at: string;
}

interface InterviewQuestionBreakdownItem {
  questionNumber: string;
  question: string;
  answerSummary: string;
  category: string;
  score: number;
  rationale: string;
}

interface InterviewBreakdown {
  overallScore: number;
  categoryScores: {
    patience: number;
    empathy: number;
    communication: number;
    professionalism: number;
    subjectMastery: number;
    teachingAbility: number;
    overall: number;
  };
  fitRecommendation?: {
    summary?: string;
    bestWith?: string[];
    avoid?: string[];
    notes?: string;
  };
  questionBreakdown: InterviewQuestionBreakdownItem[];
}

const extractJsonObject = (text: string, startIndex: number): string | null => {
  let depth = 0;
  let started = false;

  for (let i = startIndex; i < text.length; i += 1) {
    const char = text[i];
    if (char === '{') {
      depth += 1;
      started = true;
    }
    if (char === '}') {
      depth -= 1;
      if (started && depth === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }

  return null;
};

const parseInterviewBreakdown = (assessment?: string | null): InterviewBreakdown | null => {
  if (!assessment) return null;
  const marker = 'INTERVIEW_BREAKDOWN_JSON';
  const markerIndex = assessment.indexOf(marker);
  if (markerIndex === -1) return null;

  const jsonStart = assessment.indexOf('{', markerIndex);
  if (jsonStart === -1) return null;

  const jsonText = extractJsonObject(assessment, jsonStart);
  if (!jsonText) return null;

  try {
    const parsed = JSON.parse(jsonText) as InterviewBreakdown;
    if (!parsed || !Array.isArray(parsed.questionBreakdown)) return null;
    return parsed;
  } catch (error) {
    console.error('Failed to parse interview breakdown JSON:', error);
    return null;
  }
};

interface ParentRequest {
  id: string;
  student_name: string;
  student_level: string;
  subjects: string[];
  address: string;
  postal_code: string;
  tutor_type: string | null;
  preferred_rate: number | null;
  status: string;
  created_at: string;
  parent: {
    full_name: string;
    email: string;
  };
}

export const AdminTutors: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [selectedTutorDetails, setSelectedTutorDetails] = useState<TutorProfile | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [showTutorDetailsModal, setShowTutorDetailsModal] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const [selectedTutorCertificates, setSelectedTutorCertificates] = useState<any[]>([]);
  const [loadingTutorCertificates, setLoadingTutorCertificates] = useState(false);
  const [processingTutor, setProcessingTutor] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
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
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const [tutorsResult, requestsResult] = await Promise.all([
      getAllTutors(),
      getAllRequests()
    ]);

    if (tutorsResult.success && tutorsResult.data) {
      setTutors(tutorsResult.data);
      if (selectedTutorDetails) {
        const refreshedTutor = tutorsResult.data.find((item) => item.id === selectedTutorDetails.id) || null;
        setSelectedTutorDetails(refreshedTutor);
      }
    } else {
      setError(tutorsResult.error || 'Failed to fetch tutors');
    }

    if (requestsResult.success && requestsResult.data) {
      setRequests(requestsResult.data);
    } else {
      console.error('Failed to fetch requests');
      setError(requestsResult.error || 'Failed to fetch requests');
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

    if (!window.confirm(confirmMessage)) return;

    setProcessingTutor(tutorId);
    setError(null);
    setSuccessMessage(null);

    const result = await verifyTutor(tutorId, status);

    if (result.success) {
      setSuccessMessage(`Tutor ${status === 'verified' ? 'approved' : 'rejected'} successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await evaluateCaseAccess(tutorId);
      await fetchData();
    } else {
      setError(result.error || 'Failed to update tutor status');
    }

    setProcessingTutor(null);
  };

  const handlePhotoStatus = async (tutorId: string, status: 'approved' | 'rejected') => {
    setProcessingTutor(tutorId);
    setError(null);

    const result = await updateTutorPhotoStatus(tutorId, status);

    if (result.success) {
      await evaluateCaseAccess(tutorId);
      await fetchData();
      if (selectedTutorDetails?.id === tutorId) {
        await openTutorDetails({ ...selectedTutorDetails, photo_verification_status: status });
      }
    } else {
      setError(result.error || 'Failed to update photo status');
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
      await fetchData();
      if (selectedTutorDetails?.id === tutorId) {
        await openTutorDetails(selectedTutorDetails);
      }
    } else {
      setError(result.error || 'Failed to update certificate status');
    }

    setProcessingTutor(null);
  };

  const handleCaseAccess = async (tutorId: string, allowAccess: boolean) => {
    setProcessingTutor(tutorId);
    setError(null);

    const result = await setTutorCaseAccess(tutorId, allowAccess);

    if (result.success) {
      setSuccessMessage(`Case access ${allowAccess ? 'enabled' : 'disabled'} successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchData();
    } else {
      setError(result.error || 'Failed to update case access');
    }

    setProcessingTutor(null);
  };

  const handleManualMatch = async (requestId: string, tutorId: string) => {
    if (!window.confirm('Confirm manual match?')) return;

    const result = await approveBid(requestId, tutorId);
    if (result.success) {
      alert('Match created successfully!');
      setShowMatchModal(false);
      setSelectedTutor(null);
      fetchData();
    } else {
      alert(result.error || 'Failed to create match');
    }
  };

  const openTutorDetails = async (tutor: TutorProfile) => {
    setSelectedTutorDetails(tutor);
    setShowTutorDetailsModal(true);
    setLoadingTutorCertificates(true);

    const certResult = await getTutorCertificates(tutor.id);
    if (certResult.success && certResult.data) {
      setSelectedTutorCertificates(certResult.data);
    } else {
      setSelectedTutorCertificates([]);
    }

    setLoadingTutorCertificates(false);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, any> = {
      pending: {
        icon: Clock,
        text: 'Pending',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
      },
      verified: {
        icon: CheckCircle2,
        text: 'Verified',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
      },
      rejected: {
        icon: XCircle,
        text: 'Rejected',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
      },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full ${config.bgColor} ${config.borderColor} ${config.textColor} text-xs font-semibold border`}>
        <Icon size={14} />
        <span>{config.text}</span>
      </span>
    );
  };

  const getInterviewBadge = (status?: string | null) => {
    const configs: Record<string, any> = {
      completed: {
        text: 'Interview Completed',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
      },
      pending: {
        text: 'Interview Pending',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
      },
      failed: {
        text: 'Interview Failed',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
      },
    };

    const key = status || 'pending';
    const config = configs[key] || configs.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full ${config.bgColor} ${config.borderColor} ${config.textColor} text-xs font-semibold border`}>
        {config.text}
      </span>
    );
  };

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = !searchQuery || 
      tutor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tutor.teaching_subjects || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || tutor.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalFilteredTutors = filteredTutors.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredTutors / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedTutors = filteredTutors.slice(pageStartIndex, pageStartIndex + pageSize);

  if (loading) {
    return (
      <Section>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tutors...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mb-6 flex items-center border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${location.pathname === '/admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/admin/matching')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${location.pathname === '/admin/matching' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Matching
          </button>
          <button
            onClick={() => navigate('/admin/tutors')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${location.pathname === '/admin/tutors' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Tutor Review
          </button>
        </div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Tutor Review</h1>
        <p className="text-lg text-gray-600">Review tutor profiles, interview details, and verification in one place</p>
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

      {/* Filters */}
      <Card title="Filters" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or subject..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={fetchData} className="w-full">
              Refresh
            </Button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rows Per Page</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <p>
          Showing {totalFilteredTutors === 0 ? 0 : pageStartIndex + 1}-{Math.min(pageStartIndex + pageSize, totalFilteredTutors)} of {totalFilteredTutors} tutors
        </p>
        <p>Page {safeCurrentPage} of {totalPages}</p>
      </div>

      {/* Tutor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTutors.map((tutor) => {
          const questionnaire = normalizeQuestionnaire(tutor.questionnaire_answers);
          const tutorType = getTutorTypeLabel(
            questionnaire?.personality?.traitScores
          );
          return (
            <Card key={tutor.id} title={tutor.full_name} className="hover:shadow-lg transition cursor-pointer">
              <div className="space-y-4" onClick={() => openTutorDetails(tutor)}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{tutor.full_name}</h3>
                    <p className="text-sm text-gray-600">{tutor.qualification}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(tutor.verification_status)}
                  {getInterviewBadge(tutor.ai_interview_status)}
                </div>
              </div>

              {tutorType && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  <Award size={14} />
                  {tutorType.label}
                </div>
              )}
              
              {!tutorType && tutor.questionnaire_completed && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                  <Award size={14} />
                  Questionnaire Pending Analysis
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail size={16} />
                  <span>{tutor.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone size={16} />
                  <span>{tutor.phone}</span>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 font-semibold">Experience</div>
                  <div className="text-gray-900">{tutor.experience_years} years</div>
                </div>
                <div>
                  <div className="text-gray-600 font-semibold">Rate</div>
                  <div className="text-gray-900">${tutor.hourly_rate}/hr</div>
                </div>
              </div>

              {/* Teaching Subjects */}
              {tutor.teaching_subjects && tutor.teaching_subjects.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <BookOpen size={14} />
                    Subjects
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tutor.teaching_subjects.slice(0, 3).map(subject => (
                      <span key={subject} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {subject}
                      </span>
                    ))}
                    {tutor.teaching_subjects.length > 3 && (
                      <span className="text-xs text-gray-500">+{tutor.teaching_subjects.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Availability */}
              {tutor.availability_days && tutor.availability_days.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar size={14} />
                    Available Days
                  </div>
                  <div className="text-xs text-gray-600">
                    {tutor.availability_days.join(', ')}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t space-y-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={() => openTutorDetails(tutor)}
                  variant="outline"
                  className="w-full"
                >
                  Open Full Review
                </Button>
                {questionnaire && (
                  <Button 
                    onClick={() => {
                      setSelectedQuestionnaire(questionnaire);
                      setShowQuestionnaireModal(true);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    View Questionnaire
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setSelectedTutor(tutor);
                    setShowMatchModal(true);
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Manual Match
                </Button>
              </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTutors.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No tutors found matching your filters</p>
        </div>
      )}

      {totalFilteredTutors > 0 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safeCurrentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">Page {safeCurrentPage} / {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Tutor Details Modal */}
      {showTutorDetailsModal && selectedTutorDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tutor Details</h2>
                <p className="text-sm text-gray-600">{selectedTutorDetails.full_name}</p>
              </div>
              <button
                onClick={() => {
                  setShowTutorDetailsModal(false);
                  setSelectedTutorDetails(null);
                  setSelectedTutorCertificates([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Summary</h3>
                  <p className="text-sm text-gray-600">Email: {selectedTutorDetails.email}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedTutorDetails.phone}</p>
                  <p className="text-sm text-gray-600">Qualification: {selectedTutorDetails.qualification}</p>
                  <p className="text-sm text-gray-600">Experience: {selectedTutorDetails.experience_years} years</p>
                  <p className="text-sm text-gray-600">Rate: ${selectedTutorDetails.hourly_rate}/hr</p>
                  <p className="text-sm text-gray-600">
                    Joined: {new Date(selectedTutorDetails.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {getStatusBadge(selectedTutorDetails.verification_status)}
                    {getInterviewBadge(selectedTutorDetails.ai_interview_status)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${selectedTutorDetails.can_access_cases ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      Cases: {selectedTutorDetails.can_access_cases ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Teaching Preferences</h3>
                  <p className="text-sm text-gray-600">
                    Subjects: {selectedTutorDetails.teaching_subjects?.length ? selectedTutorDetails.teaching_subjects.join(', ') : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Preferred Levels: {selectedTutorDetails.preferred_student_levels?.length ? selectedTutorDetails.preferred_student_levels.join(', ') : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Availability: {selectedTutorDetails.availability_days?.length ? selectedTutorDetails.availability_days.join(', ') : 'N/A'}
                  </p>
                  {selectedTutorDetails.availability_notes && (
                    <p className="text-sm text-gray-600">Notes: {selectedTutorDetails.availability_notes}</p>
                  )}
                  <p className="text-sm text-gray-600">Max Students: {selectedTutorDetails.max_students}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Verification Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleVerifyTutor(selectedTutorDetails.id, 'verified')}
                    disabled={processingTutor === selectedTutorDetails.id}
                    className="text-sm"
                  >
                    {processingTutor === selectedTutorDetails.id ? 'Processing...' : 'Approve Tutor'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleVerifyTutor(selectedTutorDetails.id, 'rejected')}
                    disabled={processingTutor === selectedTutorDetails.id}
                    className="text-sm border-red-500 text-red-500 hover:bg-red-50"
                  >
                    {processingTutor === selectedTutorDetails.id ? 'Processing...' : 'Reject Tutor'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCaseAccess(selectedTutorDetails.id, true)}
                    disabled={processingTutor === selectedTutorDetails.id}
                    className="text-sm border-green-500 text-green-600 hover:bg-green-50"
                  >
                    Unlock Cases
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCaseAccess(selectedTutorDetails.id, false)}
                    disabled={processingTutor === selectedTutorDetails.id}
                    className="text-sm"
                  >
                    Lock Cases
                  </Button>
                </div>
              </div>

              {selectedTutorDetails.photo_url && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Photo</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedTutorDetails.photo_url}
                      alt="Tutor"
                      className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="text-sm text-gray-600">
                      Photo status: {selectedTutorDetails.photo_verification_status || 'pending'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handlePhotoStatus(selectedTutorDetails.id, 'approved')}
                        disabled={processingTutor === selectedTutorDetails.id}
                        className="text-xs px-3 py-1"
                      >
                        Approve Photo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePhotoStatus(selectedTutorDetails.id, 'rejected')}
                        disabled={processingTutor === selectedTutorDetails.id}
                        className="text-xs px-3 py-1 border-red-500 text-red-600 hover:bg-red-50"
                      >
                        Reject Photo
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Assessment</h3>
                {selectedTutorDetails.ai_interview_status === 'completed' ? (() => {
                  const breakdown = parseInterviewBreakdown(selectedTutorDetails.ai_interview_assessment);
                  if (!breakdown) {
                    return (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-900 font-semibold">Overall Score</p>
                          <p className="text-3xl font-bold text-blue-700 mt-1">
                            {selectedTutorDetails.ai_interview_score ?? 'N/A'}/10
                          </p>
                          {selectedTutorDetails.ai_interview_attempts !== null && selectedTutorDetails.ai_interview_attempts !== undefined && (
                            <p className="text-xs text-blue-800 mt-2">Attempts: {selectedTutorDetails.ai_interview_attempts}</p>
                          )}
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
                          Structured interview breakdown is not available for this tutor. Showing available assessment notes below.
                        </div>

                        {selectedTutorDetails.ai_interview_assessment ? (
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Full Assessment Notes</p>
                            <p className="text-xs text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                              {selectedTutorDetails.ai_interview_assessment}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-sm">
                            No assessment notes are available yet.
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900 font-semibold">Overall Score</p>
                        <p className="text-3xl font-bold text-blue-700 mt-1">
                          {breakdown.overallScore || selectedTutorDetails.ai_interview_score || 'N/A'}/10
                        </p>
                        {selectedTutorDetails.ai_interview_attempts !== null && selectedTutorDetails.ai_interview_attempts !== undefined && (
                          <p className="text-xs text-blue-800 mt-2">Attempts: {selectedTutorDetails.ai_interview_attempts}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(breakdown.categoryScores || {}).map(([category, value]) => (
                          <div key={category} className="bg-white border border-slate-200 rounded-lg p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">{category}</p>
                            <p className="text-lg font-bold text-slate-900">{value as number}/10</p>
                          </div>
                        ))}
                      </div>

                      {breakdown.fitRecommendation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                          <p className="font-semibold">AI Recommendation</p>
                          {breakdown.fitRecommendation.summary && (
                            <p className="mt-1">{breakdown.fitRecommendation.summary}</p>
                          )}
                          {breakdown.fitRecommendation.bestWith?.length ? (
                            <p className="mt-2">
                              <span className="font-semibold">Best with:</span> {breakdown.fitRecommendation.bestWith.join(', ')}
                            </p>
                          ) : null}
                          {breakdown.fitRecommendation.avoid?.length ? (
                            <p className="mt-1">
                              <span className="font-semibold">Avoid:</span> {breakdown.fitRecommendation.avoid.join(', ')}
                            </p>
                          ) : null}
                          {breakdown.fitRecommendation.notes && (
                            <p className="mt-1">{breakdown.fitRecommendation.notes}</p>
                          )}
                        </div>
                      )}

                      {selectedTutorDetails.ai_interview_assessment && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-white">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Full Assessment Notes</p>
                          <p className="text-xs text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {selectedTutorDetails.ai_interview_assessment}
                          </p>
                        </div>
                      )}

                      {breakdown.questionBreakdown?.length ? (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-700">Question Breakdown</p>
                          {breakdown.questionBreakdown.map((item) => (
                            <div key={`${item.questionNumber}-${item.score}`} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  {item.questionNumber}
                                </span>
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
                                  {item.category}
                                </span>
                                <span className="text-xs font-semibold text-gray-700">
                                  Score: {item.score}/10
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 font-semibold">{item.question}</p>
                              <p className="text-sm text-gray-600 mt-2">Answer summary: {item.answerSummary}</p>
                              <p className="text-xs text-gray-500 mt-2">Reason: {item.rationale}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
                          Interview question-by-question scoring is not available yet.
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-sm">
                    Interview status: {selectedTutorDetails.ai_interview_status || 'pending'}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Certificates</h3>
                {loadingTutorCertificates ? (
                  <div className="text-sm text-gray-500">Loading certificates...</div>
                ) : selectedTutorCertificates.length === 0 ? (
                  <div className="text-sm text-gray-500">No certificates uploaded yet.</div>
                ) : (
                  <div className="space-y-2">
                    {selectedTutorCertificates.map((cert) => (
                      <div key={cert.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{cert.file_name}</p>
                          <p className="text-xs text-gray-500">Status: {cert.verification_status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={cert.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                          >
                            View
                          </a>
                          <Button
                            variant="primary"
                            onClick={() => handleCertificateStatus(selectedTutorDetails.id, cert.id, 'approved')}
                            disabled={processingTutor === selectedTutorDetails.id}
                            className="text-xs px-3 py-1"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCertificateStatus(selectedTutorDetails.id, cert.id, 'rejected')}
                            disabled={processingTutor === selectedTutorDetails.id}
                            className="text-xs px-3 py-1 border-red-500 text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Match Modal */}
      {showMatchModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Manual Match: {selectedTutor.full_name}
              </h2>
              <button
                onClick={() => {
                  setShowMatchModal(false);
                  setSelectedTutor(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Select a parent request to match with this tutor:
              </p>

              <div className="space-y-4">
                {requests.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No pending requests available</p>
                  </div>
                ) : (
                  requests.map(request => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{request.student_name}</h4>
                          <p className="text-sm text-gray-600">{request.student_level}</p>
                        </div>
                        <div className="text-right">
                          {request.parent && (
                            <>
                              <div className="text-sm text-gray-600">Parent: {request.parent.full_name}</div>
                              <div className="text-xs text-gray-500">{request.parent.email}</div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div>
                          <span className="font-semibold text-gray-700">Subjects:</span>{' '}
                          <span className="text-gray-600">{request.subjects.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Location:</span>{' '}
                          <span className="text-gray-600">{request.address} (S{request.postal_code})</span>
                        </div>
                        {request.preferred_rate && (
                          <div>
                            <span className="font-semibold text-gray-700">Budget:</span>{' '}
                            <span className="text-gray-600">${request.preferred_rate}/hr</span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleManualMatch(request.id, selectedTutor.id)}
                        variant="primary"
                        className="w-full"
                      >
                        Match with {request.student_name}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
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

export default AdminTutors;
