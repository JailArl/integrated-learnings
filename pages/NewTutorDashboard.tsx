import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Section, Button, Card } from '../components/Components';
import { getCurrentUser } from '../services/auth';
import {
  getAvailableCases,
  getMyBids,
  submitBid,
  uploadCertificate,
  getTutorProfile,
  getTutorCertificates,
} from '../services/platformApi';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MapPin,
  BookOpen,
  FileText,
  Upload,
  X,
  Send,
} from 'lucide-react';

const FILE_UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_EXTENSIONS: '.pdf,.jpg,.jpeg,.png',
};

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

interface Certificate {
  id: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
  verified: boolean;
}

interface TutorProfile {
  id: string;
  full_name: string;
  verification_status: 'pending' | 'verified' | 'rejected';
}

interface BidModalProps {
  isOpen: boolean;
  caseData: Case | null;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

const BidModal: React.FC<BidModalProps> = ({ isOpen, caseData, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !caseData) return null;

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setSubmitting(true);
    await onSubmit(message);
    setSubmitting(false);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Submit Bid</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start space-x-2">
              <User className="text-blue-600 mt-0.5" size={18} />
              <div>
                <div className="text-sm font-semibold text-gray-700">Student</div>
                <div className="text-sm text-gray-600">
                  {caseData.student_name} - {caseData.student_level}
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <BookOpen className="text-blue-600 mt-0.5" size={18} />
              <div>
                <div className="text-sm font-semibold text-gray-700">Subjects</div>
                <div className="text-sm text-gray-600">{caseData.subjects.join(', ')}</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="text-blue-600 mt-0.5" size={18} />
              <div>
                <div className="text-sm font-semibold text-gray-700">Location</div>
                <div className="text-sm text-gray-600">
                  {caseData.address} (S{caseData.postal_code})
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Proposal/Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Introduce yourself and explain why you're a good fit for this case..."
              rows={6}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition duration-200 text-base shadow-sm ${
              !message.trim() || submitting
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-secondary text-white hover:bg-blue-800 shadow-blue-900/20'
            }`}
          >
            <Send size={18} />
            <span>{submitting ? 'Submitting...' : 'Submit Bid'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const VerificationBadge: React.FC<{ status: 'pending' | 'verified' | 'rejected' }> = ({
  status,
}) => {
  const configs = {
    pending: {
      icon: Clock,
      text: 'Verification Pending',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
    },
    verified: {
      icon: CheckCircle2,
      text: 'Verified',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
    },
    rejected: {
      icon: XCircle,
      text: 'Verification Rejected',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor}`}
    >
      <Icon size={20} className={config.iconColor} />
      <span className="font-semibold">{config.text}</span>
    </div>
  );
};

const CaseCard: React.FC<{ caseData: Case; onBid: () => void }> = ({ caseData, onBid }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
      <div className="space-y-3 mb-4">
        <div className="flex items-start space-x-2">
          <User className="text-blue-600 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-gray-700">Student</div>
            <div className="text-sm text-gray-600">
              {caseData.student_name} - {caseData.student_level}
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <BookOpen className="text-blue-600 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-gray-700">Subjects</div>
            <div className="text-sm text-gray-600">{caseData.subjects.join(', ')}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <MapPin className="text-blue-600 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-gray-700">Location</div>
            <div className="text-sm text-gray-600">
              {caseData.address} (S{caseData.postal_code})
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <FileText className="text-blue-600 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-gray-700">Diagnostic Test</div>
            <div className="text-sm text-gray-600">
              {caseData.diagnostic_test_booked ? (
                <>
                  {caseData.diagnostic_test_completed ? (
                    <span className="text-green-600 font-semibold">✓ Completed</span>
                  ) : (
                    <span className="text-orange-600">Booked</span>
                  )}
                  {caseData.diagnostic_test_date && (
                    <span className="ml-1">
                      - {new Date(caseData.diagnostic_test_date).toLocaleDateString('en-SG')}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">Not booked</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Button variant="primary" onClick={onBid} className="w-full">
        Bid for This Case
      </Button>
    </div>
  );
};

const BidCard: React.FC<{ bid: Bid }> = ({ bid }) => {
  const getStatusBadge = () => {
    if (bid.request.status === 'matched') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          <CheckCircle2 size={14} />
          <span>Matched</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
        <Clock size={14} />
        <span>Pending</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-lg font-bold text-primary">
          {bid.request.student_name} - {bid.request.student_level}
        </h4>
        {getStatusBadge()}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start space-x-2">
          <BookOpen className="text-blue-600 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-gray-700">Subjects</div>
            <div className="text-sm text-gray-600">{bid.request.subjects.join(', ')}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <MapPin className="text-blue-600 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-gray-700">Location</div>
            <div className="text-sm text-gray-600">
              {bid.request.address} (S{bid.request.postal_code})
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-1">Your Bid Message</div>
          <div className="text-sm text-gray-600">{bid.message}</div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Submitted on {new Date(bid.created_at).toLocaleDateString('en-SG', { dateStyle: 'long' })}
      </div>
    </div>
  );
};

const CertificateUpload: React.FC<{
  tutorId: string;
  onUploadSuccess: () => void;
}> = ({ tutorId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (!FILE_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a PDF, JPG, or PNG file');
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > FILE_UPLOAD_CONFIG.MAX_SIZE) {
      setError('File size must be less than 5MB');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    const result = await uploadCertificate(tutorId, selectedFile);

    setUploading(false);

    if (result.success) {
      setSelectedFile(null);
      onUploadSuccess();
      // Reset file input
      const fileInput = document.getElementById('certificate-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else {
      setError(result.error || 'Failed to upload certificate');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="certificate-upload"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Upload Certificate (PDF, JPG, PNG - Max 5MB)
        </label>
        <input
          id="certificate-upload"
          type="file"
          accept={FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS}
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="text-blue-600" size={20} />
            <span className="text-sm text-gray-700">{selectedFile.name}</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition duration-200 text-base shadow-sm ${
          !selectedFile || uploading
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-secondary text-white hover:bg-blue-800 shadow-blue-900/20'
        }`}
      >
        <Upload size={18} />
        <span>{uploading ? 'Uploading...' : 'Upload Certificate'}</span>
      </button>
    </div>
  );
};

const CertificateList: React.FC<{ certificates: Certificate[] }> = ({ certificates }) => {
  if (certificates.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-600 px-6 py-8 rounded-lg text-center">
        <FileText size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-sm">No certificates uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {certificates.map((cert) => (
        <div
          key={cert.id}
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <FileText className="text-blue-600" size={20} />
            <div>
              <div className="text-sm font-semibold text-gray-700">{cert.file_name}</div>
              <div className="text-xs text-gray-500">
                Uploaded {new Date(cert.uploaded_at).toLocaleDateString('en-SG')}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {cert.verified ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <CheckCircle2 size={14} />
                <span>Verified</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                <Clock size={14} />
                <span>Pending</span>
              </span>
            )}
            <a
              href={cert.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              View
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

const NewTutorDashboardContent: React.FC = () => {
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [availableCases, setAvailableCases] = useState<Case[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

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

      // Load tutor profile
      const profileResult = await getTutorProfile(user.id);
      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data);
      } else {
        setError(profileResult.error || 'Failed to load tutor profile');
      }

      // Load available cases
      const casesResult = await getAvailableCases();
      if (casesResult.success && casesResult.data) {
        setAvailableCases(casesResult.data);
      }

      // Load my bids
      const bidsResult = await getMyBids(user.id);
      if (bidsResult.success && bidsResult.data) {
        setMyBids(bidsResult.data);
      }

      // Load certificates
      const certsResult = await getTutorCertificates(user.id);
      if (certsResult.success && certsResult.data) {
        setCertificates(certsResult.data);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Error loading tutor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBidClick = (caseData: Case) => {
    setSelectedCase(caseData);
    setBidModalOpen(true);
  };

  const handleBidSubmit = async (message: string) => {
    if (!tutorId || !selectedCase) return;

    const result = await submitBid(tutorId, selectedCase.id, message);

    if (result.success) {
      setBidModalOpen(false);
      setSelectedCase(null);
      await loadData(); // Reload data to update bids and available cases
    } else {
      alert(result.error || 'Failed to submit bid');
    }
  };

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

  if (error && !tutorId) {
    return (
      <Section>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section>
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                Tutor Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Browse cases, submit bids, and manage your profile
              </p>
            </div>
            {profile && (
              <div>
                <VerificationBadge status={profile.verification_status} />
              </div>
            )}
          </div>

          {profile?.verification_status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg mb-6">
              <p className="font-semibold">Your profile is pending verification</p>
              <p className="text-sm mt-1">
                Upload your certificates below to speed up the verification process. You can still
                browse cases and submit bids.
              </p>
            </div>
          )}

          {profile?.verification_status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
              <p className="font-semibold">Your profile verification was rejected</p>
              <p className="text-sm mt-1">
                Please contact support or upload additional certificates for re-verification.
              </p>
            </div>
          )}
        </div>

        {/* Available Cases Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">Available Cases</h2>
          {availableCases.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-600 px-6 py-8 rounded-lg text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">No available cases</p>
              <p className="text-sm">Check back later for new tuition requests!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCases.map((caseData) => (
                <CaseCard
                  key={caseData.id}
                  caseData={caseData}
                  onBid={() => handleBidClick(caseData)}
                />
              ))}
            </div>
          )}
        </div>

        {/* My Bids Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">My Bids</h2>
          {myBids.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-600 px-6 py-8 rounded-lg text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">No bids yet</p>
              <p className="text-sm">
                Browse available cases above and submit your first bid to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myBids.map((bid) => (
                <BidCard key={bid.id} bid={bid} />
              ))}
            </div>
          )}
        </div>

        {/* Certificate Upload Section */}
        {tutorId && (
          <div className="mb-12">
            <Card title="Certificates" className="max-w-4xl">
              <div className="space-y-6">
                <CertificateUpload tutorId={tutorId} onUploadSuccess={loadData} />
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-bold text-primary mb-4">Uploaded Certificates</h4>
                  <CertificateList certificates={certificates} />
                </div>
              </div>
            </Card>
          </div>
        )}
      </Section>

      <BidModal
        isOpen={bidModalOpen}
        caseData={selectedCase}
        onClose={() => {
          setBidModalOpen(false);
          setSelectedCase(null);
        }}
        onSubmit={handleBidSubmit}
      />
    </>
  );
};

const NewTutorDashboard: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="tutor" redirectTo="/tutor-login">
      <NewTutorDashboardContent />
    </ProtectedRoute>
  );
};

export default NewTutorDashboard;
