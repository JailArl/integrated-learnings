import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Section } from '../components/Components';
import { getCurrentUser } from '../services/auth';
import { getAvailableCases, submitBid, getMyBids } from '../services/platformApi';
import { 
  MapPin, 
  BookOpen, 
  FileText, 
  Clock, 
  User, 
  Send, 
  ArrowLeft,
  CheckCircle2 
} from 'lucide-react';

interface Case {
  id: string;
  student_name: string;
  student_level: string;
  subjects: string[];
  address: string;
  postal_code: string;
  diagnostic_test_booked: boolean;
  diagnostic_test_date: string | null;
  diagnostic_test_completed: boolean;
  status: string;
  created_at: string;
}

interface Bid {
  id: string;
  message: string;
  created_at: string;
  request: Case;
}

const CaseDetailContent: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alreadyBid, setAlreadyBid] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const { user } = await getCurrentUser();
        if (!user) {
          setError('You are not authenticated. Please log in to continue.');
          setLoading(false);
          return;
        }

        setTutorId(user.id);

        // Load all cases and find the one we need
        const casesResult = await getAvailableCases();
        if (casesResult.success && casesResult.data) {
          const foundCase = casesResult.data.find(c => c.id === caseId);
          if (foundCase) {
            setCaseData(foundCase);
          } else {
            setError('Case not found');
          }
        } else {
          setError('Failed to load case details');
        }

        // Check if we've already bid on this case
        const bidsResult = await getMyBids(user.id);
        if (bidsResult.success && bidsResult.data) {
          const existingBid = bidsResult.data.find(b => b.request.id === caseId);
          if (existingBid) {
            setAlreadyBid(true);
          }
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading case details');
      }

      setLoading(false);
    };

    loadData();
  }, [caseId]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidMessage.trim()) {
      setError('Please enter a bid message');
      return;
    }

    if (!tutorId || !caseId) return;

    setSubmitting(true);
    setError('');

    const result = await submitBid(tutorId, caseId, bidMessage);

    setSubmitting(false);

    if (result.success) {
      alert('Bid submitted successfully!');
      setBidMessage('');
      setAlreadyBid(true);
    } else {
      setError(result.error || 'Failed to submit bid');
    }
  };

  if (loading) {
    return (
      <Section>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading case details...</p>
        </div>
      </Section>
    );
  }

  if (!caseData) {
    return (
      <Section>
        <div className="text-center py-12">
          <p className="text-red-600 text-lg font-semibold mb-4">{error || 'Case not found'}</p>
          <button
            onClick={() => navigate('/tutors')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/tutors')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {/* Case Details Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8 mb-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Case Details</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Student Info */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-4 pb-3 border-b border-gray-200">Student Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <User className="text-blue-600 mt-1" size={20} />
                <div>
                  <div className="text-sm font-semibold text-gray-700">Student Name</div>
                  <div className="text-lg text-gray-900 font-medium">{caseData.student_name}</div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <BookOpen className="text-blue-600 mt-1" size={20} />
                <div>
                  <div className="text-sm font-semibold text-gray-700">Level</div>
                  <div className="text-lg text-gray-900 font-medium">{caseData.student_level}</div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FileText className="text-blue-600 mt-1" size={20} />
                <div>
                  <div className="text-sm font-semibold text-gray-700">Subjects</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {caseData.subjects.map((subject, idx) => (
                      <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Info - Highlighted */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-4 pb-3 border-b border-gray-200">Location</h2>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start space-x-4">
                <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={32} />
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Address</div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{caseData.address}</div>
                  <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                    Postal Code: S{caseData.postal_code}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Test Info */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-4 pb-3 border-b border-gray-200">Diagnostic Test Status</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${caseData.diagnostic_test_booked ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-gray-700">
                  {caseData.diagnostic_test_booked ? 'Diagnostic test booked' : 'No diagnostic test booked'}
                </span>
              </div>

              {caseData.diagnostic_test_booked && caseData.diagnostic_test_date && (
                <div className="flex items-center space-x-3">
                  <Clock className="text-blue-600" size={20} />
                  <span className="text-gray-700">
                    Date: {new Date(caseData.diagnostic_test_date).toLocaleDateString('en-SG', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {caseData.diagnostic_test_completed && (
                <div className="flex items-center space-x-3 text-green-600">
                  <CheckCircle2 size={20} />
                  <span className="font-semibold">Diagnostic test completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Bid Section */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-primary mb-4">Submit Your Bid</h2>

            {alreadyBid && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6">
                <p className="font-semibold">✓ You have already submitted a bid for this case</p>
                <p className="text-sm mt-1">The parent will review your bid and contact you if interested.</p>
              </div>
            )}

            {!alreadyBid && (
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Bid Message
                  </label>
                  <textarea
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    placeholder="Introduce yourself, explain why you're a good fit for this student, and your expected rate..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={submitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !bidMessage.trim()}
                  className={`inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold text-white transition duration-200 ${
                    submitting || !bidMessage.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  <Send size={18} />
                  <span>{submitting ? 'Submitting...' : 'Submit Bid'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

const CaseDetail: React.FC = () => (
  <ProtectedRoute requiredRole="tutor" redirectTo="/tutor-login">
    <CaseDetailContent />
  </ProtectedRoute>
);

export default CaseDetail;
