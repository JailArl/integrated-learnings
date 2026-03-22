import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Section, Button } from '../components/Components';
import { getCurrentUser } from '../services/auth';
import { getTutorProfile, getTutorCertificates, uploadCertificate, uploadTutorPhoto, updateTutorProfile } from '../services/platformApi';
import {
  CheckCircle2,
  Circle,
  Upload,
  Camera,
  FileText,
  ClipboardList,
  Brain,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

const FILE_UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOC_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
};

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  action?: string;
}

const TutorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    bio: '',
    teaching_philosophy: '',
    subjects: [] as string[],
    levels: [] as string[],
    experience_years: '',
    rates: '',
    teaching_mode: 'home',
    travel_locations: '',
    availability: '',
  });

  const SUBJECTS_LIST = [
    'English', 'Mathematics', 'Science', 'Chinese', 'Malay', 'Tamil',
    'Additional Mathematics', 'Elementary Mathematics', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Literature', 'General Paper', 'Economics',
  ];

  const LEVELS_LIST = [
    'Primary 1-3', 'Primary 4-6', 'Secondary 1-2', 'Secondary 3-4/5', 'JC 1-2', 'IB/IGCSE',
  ];

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/tutors/login');
        return;
      }
      setTutorId(user.id);

      const [profileRes, certsRes] = await Promise.all([
        getTutorProfile(user.id),
        getTutorCertificates(user.id),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
        setProfileForm({
          bio: profileRes.data.bio || '',
          teaching_philosophy: profileRes.data.teaching_philosophy || '',
          subjects: profileRes.data.subjects || [],
          levels: profileRes.data.levels || [],
          experience_years: String(profileRes.data.experience_years || ''),
          rates: profileRes.data.rates || profileRes.data.hourly_rate?.toString() || '',
          teaching_mode: profileRes.data.teaching_mode || 'home',
          travel_locations: profileRes.data.travel_locations || '',
          availability: profileRes.data.availability || '',
        });
      }

      if (certsRes.success) {
        setCertificates(certsRes.data || []);
      }

      setLoading(false);
    };
    init();
  }, [navigate]);

  const hasPhoto = profile?.photo_url;
  const hasProfile = profile?.teaching_philosophy && profile?.subjects?.length > 0;
  const hasCertificates = certificates.length > 0;
  const hasInterview = profile?.ai_interview_status === 'completed';

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add bio, subjects, qualifications, rates, and teaching preferences.',
      completed: !!hasProfile,
      icon: <ClipboardList size={20} />,
    },
    {
      id: 'photo',
      title: 'Upload Profile Photo',
      description: 'A clear, professional photo helps build trust with families.',
      completed: !!hasPhoto,
      icon: <Camera size={20} />,
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Certificates, transcripts, resume, and supporting documents.',
      completed: hasCertificates,
      icon: <FileText size={20} />,
    },
    {
      id: 'interview',
      title: 'Getting-to-Know-You Chat',
      description: 'A quick 10-minute AI conversation about your teaching style and personality.',
      completed: !!hasInterview,
      icon: <Brain size={20} />,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const allComplete = completedCount === steps.length;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tutorId) return;

    if (file.size > FILE_UPLOAD_CONFIG.MAX_SIZE) {
      setError('Photo must be under 5MB.');
      return;
    }

    if (!FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Photo must be a JPEG or PNG image.');
      return;
    }

    setSaving(true);
    setError('');
    const result = await uploadTutorPhoto(tutorId, file);
    setSaving(false);

    if (result.success) {
      setSuccess('Photo uploaded!');
      setProfile((p: any) => ({ ...p, photo_url: result.photoUrl }));
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to upload photo.');
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file || !tutorId) return;

    if (file.size > FILE_UPLOAD_CONFIG.MAX_SIZE) {
      setError('File must be under 5MB.');
      return;
    }

    if (!FILE_UPLOAD_CONFIG.ALLOWED_DOC_TYPES.includes(file.type)) {
      setError('File must be a PDF, JPEG, or PNG.');
      return;
    }

    setSaving(true);
    setError('');
    const result = await uploadCertificate(tutorId, file);
    setSaving(false);

    if (result.success) {
      setCertificates((prev) => [...prev, { id: Date.now(), file_name: file.name, file_url: result.fileUrl, document_type: docType }]);
      setSuccess(`${docType} uploaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to upload document.');
    }
  };

  const handleProfileSave = async () => {
    if (!tutorId) return;
    if (!profileForm.bio.trim() || profileForm.subjects.length === 0 || !profileForm.rates.trim()) {
      setError('Please fill in at least bio, subjects, and rates.');
      return;
    }

    setSaving(true);
    setError('');

    const result = await updateTutorProfile(tutorId, {
      bio: profileForm.bio,
      teachingPhilosophy: profileForm.teaching_philosophy,
      subjects: profileForm.subjects,
      levels: profileForm.levels,
      experienceYears: profileForm.experience_years ? parseInt(profileForm.experience_years) : undefined,
      rates: profileForm.rates,
      teachingMode: profileForm.teaching_mode,
      travelLocations: profileForm.travel_locations,
      availability: profileForm.availability,
    });

    setSaving(false);

    if (result.success) {
      setProfile((p: any) => ({
        ...p,
        bio: profileForm.bio,
        teaching_philosophy: profileForm.teaching_philosophy,
        subjects: profileForm.subjects,
        levels: profileForm.levels,
        rates: profileForm.rates,
      }));
      setSuccess('Profile saved!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to save profile.');
    }
  };

  const toggleItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  if (loading) {
    return (
      <Section>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading your onboarding...</span>
        </div>
      </Section>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-10">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-3xl font-bold text-white">Welcome, {profile?.full_name || 'Tutor'}!</h1>
          <p className="mt-2 text-emerald-100">Complete below steps to start receiving matched cases.</p>
          {/* Progress */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${(completedCount / steps.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-white">{completedCount}/{steps.length}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        {allComplete && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Onboarding Complete!</h2>
            <p className="mt-2 text-slate-600">Your profile is under review. You'll be notified when you're approved to access cases.</p>
            <Link to="/tutors" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700">
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          {/* Step sidebar */}
          <div className="space-y-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveSection(step.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                  activeSection === step.id
                    ? 'border-blue-300 bg-blue-50 shadow-sm'
                    : step.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`flex-shrink-0 ${step.completed ? 'text-green-600' : activeSection === step.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  {step.completed ? <CheckCircle2 size={20} /> : step.icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${step.completed ? 'text-green-800' : 'text-slate-800'}`}>{step.title}</p>
                  <p className="text-xs text-slate-500">{step.completed ? 'Done' : 'Pending'}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {/* PROFILE */}
            {activeSection === 'profile' && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Personal & Teaching Profile</h2>
                <p className="mb-6 text-sm text-slate-500">This information helps us match you with the right students.</p>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Bio / About You</label>
                    <textarea rows={3} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Brief introduction about yourself, your background, and teaching approach..."
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Teaching Philosophy</label>
                    <textarea rows={2} value={profileForm.teaching_philosophy} onChange={(e) => setProfileForm({ ...profileForm, teaching_philosophy: e.target.value })}
                      placeholder="How do you approach teaching? What makes your method effective?"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Subjects You Teach *</label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS_LIST.map((s) => (
                        <button type="button" key={s} onClick={() => toggleItem(profileForm.subjects, s, (v) => setProfileForm({ ...profileForm, subjects: v }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${profileForm.subjects.includes(s) ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:border-blue-400'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Levels You Teach</label>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS_LIST.map((l) => (
                        <button type="button" key={l} onClick={() => toggleItem(profileForm.levels, l, (v) => setProfileForm({ ...profileForm, levels: v }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${profileForm.levels.includes(l) ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:border-indigo-400'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Experience (years)</label>
                      <input type="number" min="0" max="50" value={profileForm.experience_years} onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Hourly Rate (SGD) *</label>
                      <input type="text" value={profileForm.rates} onChange={(e) => setProfileForm({ ...profileForm, rates: e.target.value })}
                        placeholder="e.g. $50-70"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Teaching Mode</label>
                      <select value={profileForm.teaching_mode} onChange={(e) => setProfileForm({ ...profileForm, teaching_mode: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                        <option value="home">Home Tuition</option>
                        <option value="online">Online</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Travel Locations</label>
                    <input type="text" value={profileForm.travel_locations} onChange={(e) => setProfileForm({ ...profileForm, travel_locations: e.target.value })}
                      placeholder="e.g. East, Central, Tampines, Bedok..."
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Availability</label>
                    <input type="text" value={profileForm.availability} onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                      placeholder="e.g. Weekday evenings, Saturday mornings..."
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                  </div>
                  <button onClick={handleProfileSave} disabled={saving}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* PHOTO */}
            {activeSection === 'photo' && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Profile Photo</h2>
                <p className="mb-6 text-sm text-slate-500">Upload a clear, professional-looking photo. Max 5MB.</p>
                {hasPhoto && (
                  <div className="mb-6">
                    <img src={profile.photo_url} alt="Profile" className="h-32 w-32 rounded-xl border border-slate-200 object-cover shadow-sm" />
                    <p className="mt-2 text-sm text-green-600 font-medium">Photo uploaded</p>
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50">
                  <Camera size={20} />
                  {hasPhoto ? 'Replace Photo' : 'Upload Photo'}
                  <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* DOCUMENTS */}
            {activeSection === 'documents' && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Upload Documents</h2>
                <p className="mb-6 text-sm text-slate-500">Add your certificates, transcripts, resume, and any supporting documents. PDF, JPG, PNG accepted (max 5MB each).</p>
                {certificates.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Uploaded Documents:</p>
                    {certificates.map((cert: any) => (
                      <div key={cert.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                        <FileText size={16} className="text-slate-500" />
                        <span className="flex-1 text-slate-700">{cert.file_name}</span>
                        <a href={cert.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {['Certificate', 'Transcript', 'Resume', 'Other'].map((docType) => (
                    <label key={docType} className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm transition hover:border-blue-400 hover:bg-blue-50">
                      <Upload size={18} className="text-slate-500" />
                      <span className="font-medium text-slate-600">Upload {docType}</span>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocUpload(e, docType)} className="hidden" />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* GETTING-TO-KNOW-YOU CHAT */}
            {activeSection === 'interview' && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Getting-to-Know-You Chat</h2>
                <p className="mb-6 text-sm text-slate-500">A friendly 10-minute AI conversation covering your teaching style, personality, and approach — all in one go.</p>
                {hasInterview ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-green-600" />
                    <p className="font-semibold text-green-800">Chat completed!</p>
                    <p className="mt-1 text-sm text-slate-600">Our team will review your responses and match you with ideal students.</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-slate-600">You'll answer 10 quick questions — a mix of multiple choice, short answers, and personality ratings. The AI adapts to you, so just be yourself!</p>
                    <Link to="/tutors/ai-interview" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                      <Brain size={18} />
                      Start Chat
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorOnboarding;
