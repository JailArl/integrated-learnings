import React, { useState } from 'react';
import { Sparkles, Loader, Copy, CheckCircle } from 'lucide-react';

interface TutorProfile {
  id: string;
  full_name: string;
  subjects: string[];
  experience_years: number;
  qualification: string;
  ai_interview_score?: number;
}

interface StudentRequest {
  id: string;
  student_name: string;
  student_level: string;
  subjects: string[];
  diagnostic_test_results?: string;
  address?: string;
}

interface AdminMatchingAssistantProps {
  tutor?: TutorProfile;
  student?: StudentRequest;
  onClose: () => void;
}

export const AdminMatchingAssistant: React.FC<AdminMatchingAssistantProps> = ({
  tutor,
  student,
  onClose,
}) => {
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateRecommendation = async () => {
    if (!tutor || !student) {
      setRecommendation('Please select both a tutor and a student request.');
      return;
    }

    setLoading(true);
    setRecommendation('');

    try {
      const prompt = `As an education matching expert, evaluate this tutor-student pairing:

TUTOR:
- Name: ${tutor.full_name}
- Subjects: ${tutor.subjects.join(', ')}
- Experience: ${tutor.experience_years} years
- Qualification: ${tutor.qualification}
- Interview Score: ${tutor.ai_interview_score || 'N/A'}/10

STUDENT:
- Name: ${student.student_name}
- Level: ${student.student_level}
- Needs: ${student.subjects.join(', ')}
- Location: ${student.address || 'N/A'}
${student.diagnostic_test_results ? `- Diagnostic Results: ${student.diagnostic_test_results}` : ''}

Provide a brief, practical matching assessment (2-3 sentences) addressing:
1. Subject alignment and expertise fit
2. Any concerns or red flags
3. Overall recommendation (Good Match / Proceed with Caution / Not Recommended)

Keep it direct and actionable for the admin.`;

      // Use OpenAI API via environment variable
      const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        setRecommendation('⚠️ AI is not configured. OpenAI API key not found. Manual review recommended.');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setRecommendation(`⚠️ API Error: ${error.error?.message || 'Failed to generate recommendation'}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || 'No recommendation generated';
      setRecommendation(text);
    } catch (error: any) {
      setRecommendation(`Error: ${error.message || 'Failed to generate recommendation'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (recommendation) {
      navigator.clipboard.writeText(recommendation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-600" size={20} />
          <h3 className="font-bold text-gray-900">AI Matching Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 font-bold"
        >
          ✕
        </button>
      </div>

      {!tutor || !student ? (
        <div className="text-sm text-gray-600 p-3 bg-white/50 rounded border border-gray-200 mb-3">
          📌 Select a tutor bid and scroll down to see AI matching insights
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-600 mb-4 bg-white/50 p-3 rounded">
            <p className="font-semibold mb-1">Selected for analysis:</p>
            <p>🎓 Tutor: <strong>{tutor.full_name}</strong></p>
            <p>👤 Student: <strong>{student.student_name}</strong> ({student.student_level})</p>
          </div>

          {!recommendation && !loading && (
            <button
              onClick={generateRecommendation}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Analyze Match Quality
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader className="animate-spin text-purple-600" size={18} />
              <span className="text-sm text-gray-600">Analyzing...</span>
            </div>
          )}

          {recommendation && (
            <div className="bg-white rounded-lg p-4 border border-purple-200 mt-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold text-purple-700 uppercase">AI Assessment</p>
                <button
                  onClick={handleCopy}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={14} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {recommendation}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={generateRecommendation}
                  disabled={loading}
                  className="flex-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded font-semibold transition disabled:opacity-50"
                >
                  Regenerate
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
