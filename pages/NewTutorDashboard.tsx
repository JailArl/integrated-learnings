import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Link, useNavigate } from 'react-router-dom';
import { Section, Button, Card } from '../components/Components';
import { getCurrentUser, signOut } from '../services/auth';
import { TutorProfileEdit } from '../components/TutorProfileEdit';
import {
  getAvailableCases,
  getMyBids,
  uploadCertificate,
  getTutorProfile,
  getTutorCertificates,
  updateTutorProfile,
} from '../services/platformApi';
import { getTutorTypeLabel } from '../constants';
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
  LogOut,
  Edit,
  MessageSquare,
  Award,
  Users,
  Calendar,
  Phone,
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
  tutor_type: string | null;
  preferred_rate: number | null;
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
  match?: {
    id: string;
    first_class_date: string | null;
    first_class_location: string | null;
    first_class_notes: string | null;
  };
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
  questionnaire_completed: boolean;
  teaching_philosophy?: string;
  why_tutoring?: string;
  strengths?: string;
  preferred_student_levels?: string[];
  availability_days?: string[];
  max_students?: number;
  emergency_contact?: string;
}

const STUDENT_LEVELS = [
  'Primary 1-2', 'Primary 3-4', 'Primary 5-6',
  'Secondary 1-2', 'Secondary 3-5',
  'JC/MI'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

const CaseCard: React.FC<{ caseData: Case }> = ({ caseData }) => {
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

        {caseData.tutor_type && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-semibold text-green-900 mb-1">Parent's Preference</div>
            <div className="text-sm text-green-800">
              <span className="font-medium">Type:</span> {caseData.tutor_type}
              {caseData.preferred_rate && (
                <>
                  <br />
                  <span className="font-medium">Budget:</span> ${caseData.preferred_rate}/hour
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Link 
        to={`/tutors/case/${caseData.id}`}
        className="block w-full px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-center transition duration-200 shadow-sm"
      >
        View & Bid for This Case
      </Link>
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

      {bid.request.status === 'matched' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
            <div className="flex-1">
              <h5 className="font-semibold text-green-900 mb-1">🎉 Congratulations! Your bid was approved!</h5>
              <p className="text-sm text-green-800 mb-3">
                The parent has been notified. They will contact you shortly to arrange the first lesson.
              </p>

              {bid.match?.first_class_date && (
                <div className="bg-white rounded p-3 border border-green-300 mt-2">
                  <h6 className="font-semibold text-green-900 text-sm mb-2">First Class Details:</h6>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Date & Time:</span>{' '}
                      <span className="text-gray-900">
                        {new Date(bid.match.first_class_date).toLocaleString('en-SG', { 
                          dateStyle: 'medium', 
                          timeStyle: 'short' 
                        })}
                      </span>
                    </div>
                    {bid.match.first_class_location && (
                      <div>
                        <span className="font-semibold text-gray-700">Location:</span>{' '}
                        <span className="text-gray-900">
                          {bid.match.first_class_location.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                    {bid.match.first_class_notes && (
                      <div>
                        <span className="font-semibold text-gray-700">Notes:</span>{' '}
                        <span className="text-gray-900">{bid.match.first_class_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

const QuestionnaireForm: React.FC<{
  tutorId: string;
  onComplete: () => void;
}> = ({ tutorId, onComplete }) => {
  const [formData, setFormData] = useState({
    teachingPhilosophy: '',
    whyTutoring: '',
    strengths: '',
    preferredLevels: [] as string[],
    availableDays: [] as string[],
    maxStudents: '5',
    emergencyContact: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleLevel = (level: string) => {
    setFormData(prev => ({
      ...prev,
      preferredLevels: prev.preferredLevels.includes(level)
        ? prev.preferredLevels.filter(l => l !== level)
        : [...prev.preferredLevels, level]
    }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.teachingPhilosophy.trim() || 
        !formData.whyTutoring.trim() || 
        !formData.strengths.trim() ||
        formData.preferredLevels.length === 0 ||
        formData.availableDays.length === 0 ||
        !formData.emergencyContact.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);

    const result = await updateTutorProfile(tutorId, {
      teachingPhilosophy: formData.teachingPhilosophy,
      whyTutoring: formData.whyTutoring,
      strengths: formData.strengths,
      preferredStudentLevels: formData.preferredLevels,
      availabilityDays: formData.availableDays,
      maxStudents: parseInt(formData.maxStudents),
      emergencyContact: formData.emergencyContact,
      questionnaireCompleted: true,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Failed to save questionnaire');
      return;
    }

    alert('Questionnaire completed successfully!');
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-green-600" />
            Teaching Philosophy *
          </div>
        </label>
        <textarea
          name="teachingPhilosophy"
          placeholder="Describe your teaching philosophy and approach..."
          value={formData.teachingPhilosophy}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-green-600" />
            Why Do You Want to Teach/Tutor? *
          </div>
        </label>
        <textarea
          name="whyTutoring"
          placeholder="Share your motivation for teaching..."
          value={formData.whyTutoring}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-green-600" />
            Your Strengths as an Educator *
          </div>
        </label>
        <textarea
          name="strengths"
          placeholder="What are your key strengths as a tutor/teacher?"
          value={formData.strengths}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-green-600" />
            Preferred Student Levels * (Select all that apply)
          </div>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {STUDENT_LEVELS.map(level => (
            <label key={level} className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.preferredLevels.includes(level)}
                onChange={() => toggleLevel(level)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-green-600" />
            Available Days * (Select all that apply)
          </div>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {DAYS_OF_WEEK.map(day => (
            <label key={day} className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.availableDays.includes(day)}
                onChange={() => toggleDay(day)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-green-600" />
            Maximum Number of Students *
          </div>
        </label>
        <select
          name="maxStudents"
          value={formData.maxStudents}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          required
        >
          <option value="1">1 student</option>
          <option value="2">2 students</option>
          <option value="3">3 students</option>
          <option value="5">5 students</option>
          <option value="10">10 students</option>
          <option value="20">20+ students</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-green-600" />
            Emergency Contact *
          </div>
        </label>
        <input
          type="text"
          name="emergencyContact"
          placeholder="Name and phone number of emergency contact"
          value={formData.emergencyContact}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          required
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ${
          saving
            ? 'bg-green-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
        }`}
      >
        {saving ? 'Saving...' : 'Complete Questionnaire'}
      </button>
    </form>
  );
};

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

const QuestionnaireView: React.FC<{ profile: TutorProfile }> = ({ profile }) => {
  const questionnaire = normalizeQuestionnaire(profile.questionnaire_answers);
  const traitScores = questionnaire?.personality?.traitScores;
  const tutorType = getTutorTypeLabel(traitScores);

  return (
    <div className="space-y-5">
      {/* Teaching Style Section */}
      {tutorType && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <Award size={16} className="text-purple-600" />
            Your Teaching Style
          </h4>
          <p className="text-lg font-bold text-purple-700">{tutorType.label}</p>
          <p className="text-sm text-purple-800 mt-1">{tutorType.description}</p>
        </div>
      )}

      {/* Personality Profile Section */}
      {traitScores && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Award size={16} className="text-blue-600" />
            Your Personality Profile
          </h4>
          <div className="space-y-3">
            {Object.entries(traitScores).map(([trait, score]: [string, any]) => (
              <div key={trait}>
                <div className="flex justify-between mb-1">
                  <span className="capitalize text-sm font-semibold text-blue-800">{trait}</span>
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
          {questionnaire?.personality?.topTraits && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-900">
                <strong>Your Top Traits:</strong> {questionnaire.personality.topTraits.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <BookOpen size={16} className="text-green-600" />
          Teaching Philosophy
        </h4>
        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{profile.teaching_philosophy || 'Not provided'}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <MessageSquare size={16} className="text-green-600" />
          Why Teaching/Tutoring
        </h4>
        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{profile.why_tutoring || 'Not provided'}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Award size={16} className="text-green-600" />
          Strengths as an Educator
        </h4>
        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{profile.strengths || 'Not provided'}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Users size={16} className="text-green-600" />
          Preferred Student Levels
        </h4>
        <div className="flex flex-wrap gap-2">
          {(profile.preferred_student_levels || []).map(level => (
            <span key={level} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {level}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Calendar size={16} className="text-green-600" />
          Available Days
        </h4>
        <div className="flex flex-wrap gap-2">
          {(profile.availability_days || []).map(day => (
            <span key={day} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {day}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Clock size={16} className="text-green-600" />
          Maximum Students
        </h4>
        <p className="text-gray-800">{profile.max_students || 'Not specified'}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Phone size={16} className="text-green-600" />
          Emergency Contact
        </h4>
        <p className="text-gray-800">{profile.emergency_contact || 'Not provided'}</p>
      </div>
    </div>
  );
};

const NewTutorDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [availableCases, setAvailableCases] = useState<Case[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Failed to logout');
    }
  };

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

  const subjectOptions = Array.from(
    new Set(
      availableCases
        .flatMap((caseItem) => caseItem.subjects || [])
        .map((subject) => subject.trim())
        .filter(Boolean)
    )
  ).sort();

  const levelOptions = Array.from(
    new Set(
      availableCases
        .map((caseItem) => caseItem.student_level)
        .filter(Boolean)
    )
  ).sort();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCases = availableCases.filter((caseItem) => {
    const searchableText = [
      caseItem.student_name,
      caseItem.student_level,
      caseItem.address,
      caseItem.postal_code,
      (caseItem.subjects || []).join(' '),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
    const matchesSubject =
      !subjectFilter ||
      (caseItem.subjects || []).some(
        (subject) => subject.toLowerCase() === subjectFilter.toLowerCase()
      );
    const matchesLevel = !levelFilter || caseItem.student_level === levelFilter;

    return matchesQuery && matchesSubject && matchesLevel;
  });

  return (
    <>
      <Section>
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                Welcome, {profile?.full_name || 'Tutor'}!
              </h1>
              <p className="text-lg text-gray-600">
                Browse cases, submit bids, and manage your profile
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {profile && (
                <div>
                  <VerificationBadge status={profile.verification_status} />
                </div>
              )}
              <button
                onClick={() => setShowProfileEdit(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-semibold transition"
              >
                <Edit size={18} />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition disabled:opacity-50"
                title="Refresh to see latest updates"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
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
              <div className="md:col-span-2 lg:col-span-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Search</label>
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student, subject, level, or location"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Subject</label>
                      <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All subjects</option>
                        {subjectOptions.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-2">Level</label>
                      <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All levels</option>
                        {levelOptions.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSubjectFilter('');
                          setLevelFilter('');
                        }}
                        className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Showing {filteredCases.length} of {availableCases.length} cases
                  </p>
                </div>
              </div>

              {filteredCases.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 bg-gray-50 border border-gray-200 text-gray-600 px-6 py-8 rounded-lg text-center">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold mb-2">No cases match your filters</p>
                  <p className="text-sm">Try adjusting or clearing your filters to see more cases.</p>
                </div>
              ) : (
                filteredCases.map((caseData) => (
                  <CaseCard
                    key={caseData.id}
                    caseData={caseData}
                  />
                ))
              )}
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

        {/* Profile Questionnaire Section */}
        {tutorId && !profile?.questionnaire_completed && (
          <div className="mb-12">
            <Card title="Complete Your Profile Questionnaire" className="max-w-4xl">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>📋 Help us match you better!</strong> Complete this questionnaire to provide more details about your teaching approach and availability. This helps parents find the right tutor for their children.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button to="/tutors/questionnaire" variant="primary" className="w-full sm:w-auto">
                  Start Questionnaire
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Questionnaire Completed - View Only */}
        {tutorId && profile?.questionnaire_completed && (
          <div className="mb-12">
            <Card title="Your Profile Questionnaire" className="max-w-4xl">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-green-900 font-semibold">Questionnaire Completed!</p>
                  <p className="text-sm text-green-800">You can update this information using the "Edit Profile" button above.</p>
                </div>
              </div>
              <QuestionnaireView profile={profile} />
            </Card>
          </div>
        )}

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

        {/* Profile Edit Modal */}
        {tutorId && (
          <TutorProfileEdit
            tutorId={tutorId}
            isOpen={showProfileEdit}
            onClose={() => setShowProfileEdit(false)}
            onSuccess={loadData}
          />
        )}
      </Section>
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
