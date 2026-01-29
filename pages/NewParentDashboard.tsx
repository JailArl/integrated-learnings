import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Section, Button, Card } from '../components/Components';
import { getCurrentUser } from '../services/auth';
import { submitParentRequest, getMyRequests, getMyMatch } from '../services/platformApi';
import { CheckCircle2, Clock, Download, FileText, User, MapPin, BookOpen, Calendar } from 'lucide-react';

// Student level options
const STUDENT_LEVELS = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4', 'Secondary 5',
  'JC 1', 'JC 2', 'Millennia Institute'
];

// Subject options based on level
const getSubjectsForLevel = (level: string) => {
  if (!level) return [];
  
  const isPriLower = ['Primary 1', 'Primary 2'].includes(level);
  const isPriUpper = ['Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'].includes(level);
  const isSecLower = ['Secondary 1', 'Secondary 2'].includes(level);
  const isSecUpper = ['Secondary 3', 'Secondary 4', 'Secondary 5'].includes(level);
  const isJC = ['JC 1', 'JC 2', 'Millennia Institute'].includes(level);

  if (isPriLower) {
    return ['English', 'Mathematics', 'Chinese', 'Malay', 'Tamil'];
  }
  
  if (isPriUpper) {
    return [
      'English', 'Mathematics', 'Science', 
      'Chinese', 'Higher Chinese', 'Malay', 'Higher Malay', 'Tamil', 'Higher Tamil'
    ];
  }

  if (isSecLower) {
    return [
      'English', 'Mathematics', 'Science', 
      'Chinese', 'Higher Chinese', 'Malay', 'Higher Malay', 'Tamil', 'Higher Tamil',
      'History', 'Geography', 'Literature'
    ];
  }

  if (isSecUpper) {
    return [
      'English', 
      'Elementary Math (E-Math)', 'Additional Math (A-Math)',
      'Pure Physics', 'Pure Chemistry', 'Pure Biology',
      'Combined Science (Phy/Chem)', 'Combined Science (Bio/Chem)', 'Combined Science (Phy/Bio)',
      'Pure Geography', 'Pure History', 'Pure Literature',
      'Social Studies',
      'Elective Geography', 'Elective History', 'Elective Literature',
      'Combined Humanities (SS + Geog)', 'Combined Humanities (SS + Hist)', 'Combined Humanities (SS + Lit)',
      'Chinese', 'Higher Chinese', 'Malay', 'Higher Malay', 'Tamil', 'Higher Tamil',
      'Principle of Accounts (POA)'
    ];
  }

  if (isJC) {
    return [
      'General Paper (GP)',
      'H1 Mathematics', 'H2 Mathematics', 'H3 Mathematics',
      'H1 Physics', 'H2 Physics',
      'H1 Chemistry', 'H2 Chemistry',
      'H1 Biology', 'H2 Biology',
      'H1 Economics', 'H2 Economics',
      'H1 Geography', 'H2 Geography',
      'H1 History', 'H2 History',
      'H1 Literature', 'H2 Literature',
      'Knowledge & Inquiry (KI)',
      'China Studies'
    ];
  }
  
  return [];
};

interface RequestFormData {
  studentName: string;
  studentLevel: string;
  subjects: string[];
  address: string;
  postalCode: string;
  diagnosticTestBooked: boolean;
  diagnosticTestDate: string;
}

interface Request {
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

interface MatchData {
  id: string;
  tutor: {
    full_name: string;
    qualification: string;
    experience_years: number;
    hourly_rate: number;
  };
  invoice_url?: string;
}

const RequestSubmissionForm: React.FC<{ 
  parentId: string; 
  onSuccess: () => void; 
}> = ({ parentId, onSuccess }) => {
  const [formData, setFormData] = useState<RequestFormData>({
    studentName: '',
    studentLevel: '',
    subjects: [],
    address: '',
    postalCode: '',
    diagnosticTestBooked: false,
    diagnosticTestDate: '',
  });
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.studentLevel) {
      const subjects = getSubjectsForLevel(formData.studentLevel);
      setAvailableSubjects(subjects);
      setFormData(prev => ({ ...prev, subjects: [] }));
    }
  }, [formData.studentLevel]);

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.studentName || !formData.studentLevel || formData.subjects.length === 0 || !formData.address || !formData.postalCode) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.diagnosticTestBooked && !formData.diagnosticTestDate) {
      setError('Please select a date and time for the diagnostic test');
      return;
    }

    setSubmitting(true);

    const result = await submitParentRequest({
      parentId,
      studentName: formData.studentName,
      studentLevel: formData.studentLevel,
      subjects: formData.subjects,
      address: formData.address,
      postalCode: formData.postalCode,
      diagnosticTestBooked: formData.diagnosticTestBooked,
      diagnosticTestDate: formData.diagnosticTestBooked ? formData.diagnosticTestDate : undefined,
    });

    setSubmitting(false);

    if (result.success) {
      setFormData({
        studentName: '',
        studentLevel: '',
        subjects: [],
        address: '',
        postalCode: '',
        diagnosticTestBooked: false,
        diagnosticTestDate: '',
      });
      onSuccess();
    } else {
      setError(result.error || 'Failed to submit request');
    }
  };

  return (
    <Card title="Submit New Request" className="mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Student Name *
          </label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter student name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Student Level *
          </label>
          <select
            value={formData.studentLevel}
            onChange={(e) => setFormData({ ...formData, studentLevel: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select level</option>
            {STUDENT_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {availableSubjects.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subjects * (Select one or more)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableSubjects.map(subject => (
                <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Address *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter full address"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Postal Code *
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter postal code"
            maxLength={6}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.diagnosticTestBooked}
              onChange={(e) => setFormData({ ...formData, diagnosticTestBooked: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">
              Book 30min diagnostic test (optional)
            </span>
          </label>
        </div>

        {formData.diagnosticTestBooked && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.diagnosticTestDate}
              onChange={(e) => setFormData({ ...formData, diagnosticTestDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition duration-200 text-base shadow-sm ${
            submitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-secondary text-white hover:bg-blue-800 shadow-blue-900/20'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </Card>
  );
};

const ProgressBar: React.FC<{ request: Request; match: MatchData | null }> = ({ request, match }) => {
  const steps = [
    { label: 'Request Submitted', completed: true },
    { label: 'Diagnostic Test Booked', completed: request.diagnostic_test_booked, applicable: request.diagnostic_test_booked },
    { label: 'Test Completed', completed: request.diagnostic_test_completed, applicable: request.diagnostic_test_booked },
    { label: 'Tutor Matched', completed: request.status === 'matched' || request.status === 'invoiced' },
    { label: 'Invoice Ready', completed: request.status === 'invoiced' },
  ];

  const applicableSteps = steps.filter(step => step.applicable !== false);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {applicableSteps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {step.completed ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              </div>
              <div className={`mt-2 text-xs text-center ${
                step.completed ? 'text-green-600 font-semibold' : 'text-gray-500'
              }`}>
                {step.label}
              </div>
            </div>
            {index < applicableSteps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${
                step.completed ? 'bg-green-500' : 'bg-gray-300'
              }`} style={{ maxWidth: '80px' }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const RequestCard: React.FC<{ request: Request; match: MatchData | null }> = ({ request, match }) => {
  return (
    <Card title={`Request for ${request.student_name}`} className="mb-6">
      <ProgressBar request={request} match={match} />
      
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex items-start space-x-2">
          <User className="text-blue-600 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-gray-700">Student</div>
            <div className="text-sm text-gray-600">{request.student_name} - {request.student_level}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <BookOpen className="text-blue-600 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-gray-700">Subjects</div>
            <div className="text-sm text-gray-600">{request.subjects.join(', ')}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <MapPin className="text-blue-600 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-gray-700">Location</div>
            <div className="text-sm text-gray-600">{request.address} (S{request.postal_code})</div>
          </div>
        </div>

        {request.diagnostic_test_booked && request.diagnostic_test_date && (
          <div className="flex items-start space-x-2">
            <Calendar className="text-blue-600 mt-0.5" size={18} />
            <div>
              <div className="text-sm font-semibold text-gray-700">Diagnostic Test</div>
              <div className="text-sm text-gray-600">
                {new Date(request.diagnostic_test_date).toLocaleString('en-SG', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
                {request.diagnostic_test_completed && (
                  <span className="ml-2 text-green-600 font-semibold">✓ Completed</span>
                )}
              </div>
            </div>
          </div>
        )}

        {match && (request.status === 'matched' || request.status === 'invoiced') && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Matched Tutor</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">Name:</span> {match.tutor.full_name}</div>
              <div><span className="font-semibold">Qualification:</span> {match.tutor.qualification}</div>
              <div><span className="font-semibold">Experience:</span> {match.tutor.experience_years} years</div>
              <div><span className="font-semibold">Hourly Rate:</span> ${match.tutor.hourly_rate}</div>
            </div>
          </div>
        )}

        {request.status === 'invoiced' && match?.invoice_url && (
          <div className="mt-4">
            <a
              href={match.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download size={18} />
              <span>Download Invoice</span>
            </a>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          Submitted on {new Date(request.created_at).toLocaleDateString('en-SG', { dateStyle: 'long' })}
        </div>
      </div>
    </Card>
  );
};

const NewParentDashboardContent: React.FC = () => {
  const [parentId, setParentId] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [matches, setMatches] = useState<{ [key: string]: MatchData | null }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    const { user } = await getCurrentUser();
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setParentId(user.id);

    const requestsResult = await getMyRequests(user.id);
    if (requestsResult.success && requestsResult.data) {
      setRequests(requestsResult.data);
      
      // Load matches for requests that are matched or invoiced
      const matchPromises = requestsResult.data
        .filter(req => req.status === 'matched' || req.status === 'invoiced')
        .map(async (req) => {
          const matchResult = await getMyMatch(req.id);
          return { requestId: req.id, match: matchResult.data || null };
        });
      
      const matchResults = await Promise.all(matchPromises);
      const matchesMap: { [key: string]: MatchData | null } = {};
      matchResults.forEach(({ requestId, match }) => {
        matchesMap[requestId] = match;
      });
      setMatches(matchesMap);
    } else {
      setError(requestsResult.error || 'Failed to load requests');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Section>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Section>
    );
  }

  if (error && !parentId) {
    return (
      <Section>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Parent Dashboard</h1>
        <p className="text-lg text-gray-600">Manage your tuition requests and track progress</p>
      </div>

      {parentId && (
        <RequestSubmissionForm parentId={parentId} onSuccess={loadData} />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Your Requests</h2>
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {requests.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 px-6 py-8 rounded-lg text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold mb-2">No requests yet</p>
            <p className="text-sm">Submit your first tuition request above to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                match={matches[request.id] || null} 
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};

const NewParentDashboard: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="parent" redirectTo="/parent-login">
      <NewParentDashboardContent />
    </ProtectedRoute>
  );
};

export default NewParentDashboard;
