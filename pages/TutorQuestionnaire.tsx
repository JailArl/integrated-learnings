import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Card, Button } from '../components/Components';
import { getCurrentUser } from '../services/auth';
import { getTutorProfile, updateTutorProfile } from '../services/platformApi';
import { Award, BookOpen, Calendar, CheckCircle2, Clock, MessageSquare, Phone, Users } from 'lucide-react';

const TEACHING_PHILOSOPHY_OPTIONS = [
  'Structured and results-driven (clear goals, mastery checks)',
  'Concept-first and inquiry-based (build deep understanding)',
  'Student-led coaching (guided discovery, high autonomy)',
  'Balanced blend (structure + flexibility based on learner)',
];

const WHY_TUTORING_OPTIONS = [
  'I enjoy helping students gain confidence and improve',
  'I love teaching and sharing knowledge',
  'I want flexible, meaningful work alongside my studies/career',
  'I have strong subject expertise and want to apply it',
];

const STRENGTHS_OPTIONS = [
  'Explaining complex concepts simply',
  'Motivating students who struggle',
  'Designing structured lesson plans',
  'Exam techniques and time management',
  'Building rapport and student confidence',
  'Diagnosing learning gaps quickly',
];

const PERSONALITY_QUESTIONS = [
  {
    id: 'q1',
    text: 'I prefer a clear lesson structure and predictable routine.',
    weights: { structured: 1 }
  },
  {
    id: 'q2',
    text: 'I adapt my explanations to match different learning styles.',
    weights: { supportive: 0.5, adaptive: 1 }
  },
  {
    id: 'q3',
    text: 'I enjoy breaking down complex problems into step-by-step logic.',
    weights: { analytical: 1 }
  },
  {
    id: 'q4',
    text: 'I bring energy and enthusiasm into every session.',
    weights: { energetic: 1 }
  },
  {
    id: 'q5',
    text: 'I focus on building student confidence and mindset.',
    weights: { supportive: 1 }
  },
  {
    id: 'q6',
    text: 'I prioritize measurable progress and exam results.',
    weights: { structured: 0.5, analytical: 0.5 }
  },
  {
    id: 'q7',
    text: 'I frequently check for understanding and adjust pacing.',
    weights: { adaptive: 1 }
  },
  {
    id: 'q8',
    text: 'I prefer coaching students to discover answers themselves.',
    weights: { supportive: 0.5, adaptive: 0.5 }
  },
  {
    id: 'q9',
    text: 'I am comfortable challenging students to reach higher goals.',
    weights: { energetic: 0.5, structured: 0.5 }
  },
  {
    id: 'q10',
    text: 'I enjoy analyzing mistakes to identify root learning gaps.',
    weights: { analytical: 1 }
  },
  {
    id: 'q11',
    text: 'I prefer interactive lessons over lecture-style teaching.',
    weights: { energetic: 0.5, adaptive: 0.5 }
  },
  {
    id: 'q12',
    text: 'I keep lessons flexible based on how the student is doing that day.',
    weights: { adaptive: 1 }
  },
];

const PERSONALITY_TRAITS = ['structured', 'supportive', 'analytical', 'energetic', 'adaptive'] as const;

const STUDENT_LEVELS = [
  'Primary 1-3',
  'Primary 4-6',
  'Secondary 1-2',
  'Secondary 3-4',
  'JC/Pre-U',
  'IB/International',
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TutorQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    teachingPhilosophy: '',
    whyTutoring: '',
    strengths: [] as string[],
    preferredLevels: [] as string[],
    availableDays: [] as string[],
    maxStudents: '5',
    emergencyContact: '',
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/tutor-login');
        return;
      }
      setTutorId(user.id);

      const profileResult = await getTutorProfile(user.id);
      if (profileResult.success && profileResult.data) {
        const profile = profileResult.data;
        setFormData({
          teachingPhilosophy: profile.teaching_philosophy || '',
          whyTutoring: profile.why_tutoring || '',
          strengths: profile.strengths ? String(profile.strengths).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          preferredLevels: profile.preferred_student_levels || [],
          availableDays: profile.availability_days || [],
          maxStudents: String(profile.max_students || '5'),
          emergencyContact: profile.emergency_contact || '',
        });
        if (profile.questionnaire_answers?.personality?.responses) {
          setResponses(profile.questionnaire_answers.personality.responses);
        }
      }

      setLoading(false);
    };

    init();
  }, [navigate]);

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

  const toggleStrength = (strength: string) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.includes(strength)
        ? prev.strengths.filter(s => s !== strength)
        : [...prev.strengths, strength]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tutorId) {
      setError('You are not authenticated. Please log in.');
      return;
    }

    if (!formData.teachingPhilosophy ||
        !formData.whyTutoring ||
        formData.strengths.length === 0 ||
        formData.preferredLevels.length === 0 ||
        formData.availableDays.length === 0 ||
        !formData.emergencyContact.trim() ||
        PERSONALITY_QUESTIONS.some(q => responses[q.id] === undefined)) {
      setError('Please complete all required fields.');
      return;
    }

    const traitTotals: Record<string, { sum: number; weight: number }> = {};
    PERSONALITY_TRAITS.forEach(trait => {
      traitTotals[trait] = { sum: 0, weight: 0 };
    });

    PERSONALITY_QUESTIONS.forEach(question => {
      const response = responses[question.id] || 0;
      Object.entries(question.weights).forEach(([trait, weight]) => {
        traitTotals[trait].sum += response * weight;
        traitTotals[trait].weight += weight;
      });
    });

    const traitScores: Record<string, number> = {};
    Object.entries(traitTotals).forEach(([trait, data]) => {
      const normalized = data.weight === 0 ? 0 : (data.sum / data.weight) / 5;
      traitScores[trait] = Math.round(normalized * 100);
    });

    const topTraits = Object.entries(traitScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([trait]) => trait);

    setSaving(true);

    const result = await updateTutorProfile(tutorId, {
      teachingPhilosophy: formData.teachingPhilosophy,
      whyTutoring: formData.whyTutoring,
      strengths: formData.strengths.join(', '),
      questionnaireAnswers: {
        version: 'personality_v1',
        teachingPhilosophy: formData.teachingPhilosophy,
        whyTutoring: formData.whyTutoring,
        strengths: formData.strengths,
        personality: {
          responses,
          traitScores,
          topTraits,
        },
        completedAt: new Date().toISOString(),
      },
      preferredStudentLevels: formData.preferredLevels,
      availabilityDays: formData.availableDays,
      maxStudents: parseInt(formData.maxStudents, 10),
      emergencyContact: formData.emergencyContact,
      questionnaireCompleted: true,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Failed to save questionnaire');
      return;
    }

    setSuccess('Questionnaire submitted successfully!');
    setTimeout(() => navigate('/tutors'), 1200);
  };

  if (loading) {
    return (
      <Section>
        <div className="text-center py-12">
          <p className="text-lg text-slate-600">Loading questionnaire...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Tutor Profile Questionnaire</h1>
        <p className="text-slate-600">Answer a quick set of multiple-choice questions to help us match you better.</p>
      </div>

      <Card title="Complete Your Profile" className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-green-600" />
                Teaching Philosophy *
              </div>
            </label>
            <div className="space-y-2">
              {TEACHING_PHILOSOPHY_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="teachingPhilosophy"
                    value={option}
                    checked={formData.teachingPhilosophy === option}
                    onChange={() => setFormData(prev => ({ ...prev, teachingPhilosophy: option }))}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-green-600" />
                Why Do You Want to Teach/Tutor? *
              </div>
            </label>
            <div className="space-y-2">
              {WHY_TUTORING_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="whyTutoring"
                    value={option}
                    checked={formData.whyTutoring === option}
                    onChange={() => setFormData(prev => ({ ...prev, whyTutoring: option }))}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-green-600" />
                Your Strengths as an Educator * (Select all that apply)
              </div>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {STRENGTHS_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.strengths.includes(option)}
                    onChange={() => toggleStrength(option)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Personality Fit * (1 = Strongly Disagree, 5 = Strongly Agree)
            </label>
            <div className="space-y-4">
              {PERSONALITY_QUESTIONS.map(question => (
                <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800 mb-3">{question.text}</p>
                  <div className="grid grid-cols-5 gap-2 text-xs text-gray-600">
                    {[1, 2, 3, 4, 5].map(value => (
                      <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={value}
                          checked={responses[question.id] === value}
                          onChange={() => setResponses(prev => ({ ...prev, [question.id]: value }))}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
              value={formData.maxStudents}
              onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
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
              placeholder="Name and phone number of emergency contact"
              value={formData.emergencyContact}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              required
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" to="/tutors" className="w-full">Back to Dashboard</Button>
            <Button variant="primary" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Submit Questionnaire'}
            </Button>
          </div>
        </form>
      </Card>
    </Section>
  );
};

export default TutorQuestionnaire;
