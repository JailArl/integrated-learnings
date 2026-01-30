import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpTutor } from '../services/auth';
import { updateTutorProfile } from '../services/platformApi';
import { PageHeader, Section } from '../components/Components';
import { Mail, Lock, Phone, User, BookOpen, Clock, Award, MessageSquare, Users, Calendar } from 'lucide-react';

const STUDENT_LEVELS = [
  'Primary 1-2', 'Primary 3-4', 'Primary 5-6',
  'Secondary 1-2', 'Secondary 3-5',
  'JC/MI'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TutorSignup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Account, 2: Questionnaire
  const [tutorId, setTutorId] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [questionnaireData, setQuestionnaireData] = useState({
    teachingPhilosophy: '',
    whyTutoring: '',
    strengths: '',
    preferredLevels: [] as string[],
    availableDays: [] as string[],
    maxStudents: '5',
    emergencyContact: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionnaireChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setQuestionnaireData({ ...questionnaireData, [e.target.name]: e.target.value });
  };

  const toggleLevel = (level: string) => {
    setQuestionnaireData(prev => ({
      ...prev,
      preferredLevels: prev.preferredLevels.includes(level)
        ? prev.preferredLevels.filter(l => l !== level)
        : [...prev.preferredLevels, level]
    }));
  };

  const toggleDay = (day: string) => {
    setQuestionnaireData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    const result = await signUpTutor(
      formData.email,
      formData.password,
      {
        fullName: formData.fullName,
        phone: formData.phone,
      }
    );

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Signup failed');
      return;
    }

    setTutorId(result.userId || '');
    setStep(2); // Move to questionnaire
  };

  const handleQuestionnaireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!questionnaireData.teachingPhilosophy.trim() || 
        !questionnaireData.whyTutoring.trim() || 
        !questionnaireData.strengths.trim() ||
        questionnaireData.preferredLevels.length === 0 ||
        questionnaireData.availableDays.length === 0 ||
        !questionnaireData.emergencyContact.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const result = await updateTutorProfile(tutorId, {
      teachingPhilosophy: questionnaireData.teachingPhilosophy,
      whyTutoring: questionnaireData.whyTutoring,
      strengths: questionnaireData.strengths,
      preferredStudentLevels: questionnaireData.preferredLevels,
      availabilityDays: questionnaireData.availableDays,
      maxStudents: parseInt(questionnaireData.maxStudents),
      emergencyContact: questionnaireData.emergencyContact,
      questionnaireCompleted: true,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to save questionnaire');
      return;
    }

    alert('Account created successfully! Welcome to Integrated Learnings.');
    navigate('/tutors');
  };

  return (
    <div>
      <PageHeader 
        title="Join Our Educator Network" 
        subtitle={step === 1 ? "Create your account" : "Complete your profile"} 
      />
      
      <Section className="bg-gradient-to-br from-green-50 to-slate-50 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
            {/* Progress Indicator */}
            <div className="mb-8 flex items-center justify-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 font-semibold">Account</span>
              </div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 font-semibold">Questionnaire</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Educator Signup</h2>
                  <p className="text-gray-600">Quick signup - Step 1 of 2</p>
                </div>

                <form onSubmit={handleAccountSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-green-600" />
                        Full Name *
                      </div>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-green-600" />
                        Email Address *
                      </div>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={16} className="text-green-600" />
                        Password *
                      </div>
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={16} className="text-green-600" />
                        Confirm Password *
                      </div>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-green-600" />
                        Phone Number *
                      </div>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+65 XXXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 mt-6 ${
                      loading
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                    }`}
                  >
                    {loading ? 'Creating Account...' : 'Continue to Questionnaire'}
                  </button>
                </form>

                <div className="mt-6 text-center border-t border-gray-200 pt-6">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/tutors/login" className="text-green-600 font-semibold hover:text-green-700">
                      Log In
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
                  <p className="text-gray-600">Tell us about your teaching approach and availability</p>
                </div>

                <form onSubmit={handleQuestionnaireSubmit} className="space-y-5">
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
                      value={questionnaireData.teachingPhilosophy}
                      onChange={handleQuestionnaireChange}
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
                      value={questionnaireData.whyTutoring}
                      onChange={handleQuestionnaireChange}
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
                      value={questionnaireData.strengths}
                      onChange={handleQuestionnaireChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-green-600" />
                        Preferred Student Levels * (Select all that apply)
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {STUDENT_LEVELS.map(level => (
                        <label key={level} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={questionnaireData.preferredLevels.includes(level)}
                            onChange={() => toggleLevel(level)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-green-600" />
                        Available Days * (Select all that apply)
                      </div>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <label key={day} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={questionnaireData.availableDays.includes(day)}
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
                      value={questionnaireData.maxStudents}
                      onChange={handleQuestionnaireChange}
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
                      value={questionnaireData.emergencyContact}
                      onChange={handleQuestionnaireChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 mt-6 ${
                      loading
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                    }`}
                  >
                    {loading ? 'Completing Profile...' : 'Complete Signup'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
};

export default TutorSignup;
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-green-600" />
                    Full Name *
                  </div>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-green-600" />
                    Email Address *
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-green-600" />
                    Password *
                  </div>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-green-600" />
                    Confirm Password *
                  </div>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-green-600" />
                    Phone Number *
                  </div>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+65 XXXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 mt-6 ${
                  loading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-gray-200 pt-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/tutors/login" className="text-green-600 font-semibold hover:text-green-700">
                  Log In
                </Link>
              </p>
            </div>

            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-gray-700">
                <strong>ℹ️ What's Next?</strong><br />
                After signup, you'll provide qualifications, subjects, experience, and upload documents for verification.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default TutorSignup;
