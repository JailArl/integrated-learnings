import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Section, Card, Button } from '../components/Components';
import { getAllTutors, getAllRequests, approveBid } from '../services/platformApi';
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
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const tutorTypeForModal = selectedQuestionnaire?.personality?.traitScores
    ? getTutorTypeLabel(selectedQuestionnaire.personality.traitScores)
    : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const [tutorsResult, requestsResult] = await Promise.all([
      getAllTutors(),
      getAllRequests()
    ]);

    if (tutorsResult.success && tutorsResult.data) {
      console.log('📊 TUTORS DATA FROM DB:');
      tutorsResult.data.forEach((tutor: any) => {
        console.log(`✓ ${tutor.full_name}:`, {
          questionnaire_completed: tutor.questionnaire_completed,
          questionnaire_answers: tutor.questionnaire_answers
        });
      });
      setTutors(tutorsResult.data);
    } else {
      setError(tutorsResult.error || 'Failed to fetch tutors');
    }

    if (requestsResult.success && requestsResult.data) {
      setRequests(requestsResult.data.filter((r: ParentRequest) => 
        r.status !== 'matched' && r.status !== 'invoiced'
      ));
    }

    setLoading(false);
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

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = !searchQuery || 
      tutor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tutor.teaching_subjects || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || tutor.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-3xl font-bold text-primary mb-2">Tutor Management</h1>
        <p className="text-lg text-gray-600">Browse tutor profiles and create manual matches</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card title="Filters" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </Card>

      {/* Tutor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutors.map((tutor) => {
          const tutorType = getTutorTypeLabel(
            tutor.questionnaire_answers?.personality?.traitScores
          );
          return (
            <Card key={tutor.id} title={tutor.full_name} className="hover:shadow-lg transition">
              <div className="space-y-4">
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
                {getStatusBadge(tutor.verification_status)}
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
              <div className="pt-4 border-t space-y-2">
                {tutor.questionnaire_answers && (
                  <Button 
                    onClick={() => {
                      setSelectedQuestionnaire(tutor.questionnaire_answers);
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
                          <div className="text-sm text-gray-600">Parent: {request.parent.full_name}</div>
                          <div className="text-xs text-gray-500">{request.parent.email}</div>
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
