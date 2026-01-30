import React, { useState, useEffect } from 'react';
import { updateTutorProfile, getTutorProfile } from '../services/platformApi';
import { X, User, DollarSign, BookOpen, Calendar, Clock } from 'lucide-react';

const STUDENT_LEVELS = [
  'Primary 1-2', 'Primary 3-4', 'Primary 5-6',
  'Secondary 1-2', 'Secondary 3-5',
  'JC/MI'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SUBJECTS = [
  'English', 'Mathematics', 'Science',
  'Physics', 'Chemistry', 'Biology',
  'Additional Mathematics', 'Elementary Mathematics',
  'Chinese', 'Malay', 'Tamil',
  'History', 'Geography', 'Literature',
  'Economics', 'Accounting',
  'General Paper'
];

interface TutorProfileEditProps {
  tutorId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TutorProfileEdit: React.FC<TutorProfileEditProps> = ({
  tutorId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hourlyRate: '',
    teachingSubjects: [] as string[],
    preferredLevels: [] as string[],
    availableDays: [] as string[],
    availabilityNotes: '',
    maxStudents: '5',
  });

  useEffect(() => {
    if (isOpen && tutorId) {
      loadProfile();
    }
  }, [isOpen, tutorId]);

  const loadProfile = async () => {
    const result = await getTutorProfile(tutorId);
    if (result.success && result.data) {
      setFormData({
        hourlyRate: result.data.hourly_rate?.toString() || '',
        teachingSubjects: result.data.teaching_subjects || [],
        preferredLevels: result.data.preferred_student_levels || [],
        availableDays: result.data.availability_days || [],
        availabilityNotes: result.data.availability_notes || '',
        maxStudents: result.data.max_students?.toString() || '5',
      });
    }
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      teachingSubjects: prev.teachingSubjects.includes(subject)
        ? prev.teachingSubjects.filter(s => s !== subject)
        : [...prev.teachingSubjects, subject]
    }));
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

    if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
      setError('Please enter a valid hourly rate');
      return;
    }

    if (formData.teachingSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    if (formData.preferredLevels.length === 0) {
      setError('Please select at least one student level');
      return;
    }

    if (formData.availableDays.length === 0) {
      setError('Please select at least one available day');
      return;
    }

    setLoading(true);

    const result = await updateTutorProfile(tutorId, {
      hourlyRate: parseFloat(formData.hourlyRate),
      teachingSubjects: formData.teachingSubjects,
      preferredStudentLevels: formData.preferredLevels,
      availabilityDays: formData.availableDays,
      availabilityNotes: formData.availabilityNotes,
      maxStudents: parseInt(formData.maxStudents),
    });

    setLoading(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Failed to update profile');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" />
                Hourly Rate (SGD) *
              </div>
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              placeholder="e.g. 50"
              min="20"
              max="300"
              step="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Teaching Subjects */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-green-600" />
                Teaching Subjects * (Select all that you can teach)
              </div>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {SUBJECTS.map(subject => (
                <label key={subject} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={formData.teachingSubjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Student Levels */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-green-600" />
                Preferred Student Levels * (Select all that apply)
              </div>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STUDENT_LEVELS.map(level => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
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

          {/* Available Days */}
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
                    checked={formData.availableDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-green-600" />
                Availability Notes (Optional)
              </div>
            </label>
            <textarea
              value={formData.availabilityNotes}
              onChange={(e) => setFormData({ ...formData, availabilityNotes: e.target.value })}
              placeholder="E.g., Available weekday evenings after 6pm, weekends anytime..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Max Students */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Number of Students *
            </label>
            <select
              value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
                loading
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorProfileEdit;
