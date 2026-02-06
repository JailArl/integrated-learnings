import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, CheckCircle, MessageCircle } from 'lucide-react';
import { sendInterviewMessage, getInitialQuestion, submitInterviewAppeal } from '../services/aiInterview';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIInterviewProps {
  tutorId: string;
  tutorProfile?: any;
  onComplete?: (scores: any) => void;
  retakeCount?: number;
}

export const AIInterview: React.FC<AIInterviewProps> = ({ tutorId, tutorProfile, onComplete, retakeCount = 0 }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [scores, setScores] = useState<any>(null);
  const [appealReason, setAppealReason] = useState('');
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [appealError, setAppealError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxRetakes = 1;
  const canRetake = retakeCount < maxRetakes;
  const lowScoreThreshold = 7;
  const isLowScore = typeof scores?.overall === 'number' && scores.overall < lowScoreThreshold;

  // Initialize with first question
  useEffect(() => {
    const initialQuestion = getInitialQuestion();
    setMessages([{ role: 'assistant', content: initialQuestion }]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setError('');
    setLoading(true);

    // Add user message to conversation
    const userMessage = userInput.trim();
    const updatedMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(updatedMessages);
    setUserInput('');

    try {
      const result = await sendInterviewMessage(tutorId, userMessage, messages, tutorProfile);

      if (!result.success) {
        setError(result.error || 'Failed to process response');
        setLoading(false);
        return;
      }

      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: result.data!.message,
      };
      setMessages([...updatedMessages, aiMessage]);

      // Check if interview is complete
      if (result.data!.conversationOver) {
        setInterviewComplete(true);
        setScores(result.data!.scores);
        if (onComplete) {
          onComplete(result.data!.scores);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeInterview = () => {
    // Reset all state to restart interview
    setInterviewComplete(false);
    setScores(null);
    setAppealReason('');
    setAppealSubmitting(false);
    setAppealSubmitted(false);
    setAppealError('');
    setMessages([{ role: 'assistant', content: getInitialQuestion() }]);
    setUserInput('');
    setError('');
  };

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim()) {
      setAppealError('Please tell us why you want an appeal.');
      return;
    }

    setAppealError('');
    setAppealSubmitting(true);

    const attemptNumber = retakeCount + 1;
    const result = await submitInterviewAppeal({
      tutorId,
      reason: appealReason.trim(),
      overallScore: scores?.overall ?? null,
      interviewAttempt: attemptNumber,
    });

    setAppealSubmitting(false);

    if (!result.success) {
      setAppealError(result.error || 'Failed to submit appeal');
      return;
    }

    setAppealSubmitted(true);
  };

  if (interviewComplete) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
          <p className="text-gray-600">
            Thank you for completing your character interview. Your scores have been saved.
          </p>
        </div>

        {scores ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <ScoreCard label="Patience" score={scores.patience} />
            <ScoreCard label="Empathy" score={scores.empathy} />
            <ScoreCard label="Communication" score={scores.communication} />
            <ScoreCard label="Professionalism" score={scores.professionalism} />
            <ScoreCard label="Subject Mastery" score={scores.subjectMastery} />
            <ScoreCard label="Teaching Ability" score={scores.teachingAbility} />
            <ScoreCard label="Overall" score={scores.overall} highlight />
          </div>
        ) : (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900">
            ⚠️ We could not display your score breakdown. Our team can still review your interview transcript.
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            ✅ Your interview has been submitted to our admin team for review. You'll be notified once your results are processed.
          </p>
        </div>

        {isLowScore && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900 font-semibold mb-2">Not satisfied with your score?</p>
            <p className="text-sm text-amber-900 mb-3">
              You can submit an appeal for a manual review (one request per interview).
            </p>
            <textarea
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              placeholder="Share why you believe your score should be reviewed..."
              rows={3}
              disabled={appealSubmitted || appealSubmitting}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100"
            />
            {appealError && (
              <div className="mt-2 text-sm text-red-700">{appealError}</div>
            )}
            {appealSubmitted ? (
              <div className="mt-3 text-sm text-green-700">✅ Appeal submitted. We will review and update you.</div>
            ) : (
              <button
                onClick={handleSubmitAppeal}
                disabled={appealSubmitting}
                className="mt-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-4 py-2 rounded-lg font-semibold text-sm"
              >
                {appealSubmitting ? 'Submitting...' : 'Submit Appeal'}
              </button>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          {canRetake ? (
            <button
              onClick={handleRetakeInterview}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
            >
              Retake Interview
            </button>
          ) : (
            <div className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold text-center">
              ℹ️ You've used your retake attempt. Submit this score for review.
            </div>
          )}
          <a
            href="/tutors/dashboard"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md text-center"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle size={24} />
          <h2 className="text-2xl font-bold">Character Interview</h2>
        </div>
        <p className="text-blue-100">
          Let's have a conversation about your teaching style and character
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-lg rounded-lg px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 rounded-lg rounded-bl-none px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={18} />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      {!interviewComplete && (
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-6 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Be thoughtful and honest in your responses. Take your time.
          </p>
        </form>
      )}
    </div>
  );
};

// Score card component
const ScoreCard: React.FC<{ label: string; score: number; highlight?: boolean }> = ({
  label,
  score,
  highlight,
}) => {
  const percentage = (score / 10) * 100;
  return (
    <div className={`rounded-lg p-4 text-center ${highlight ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-100'}`}>
      <p className={`text-sm font-semibold ${highlight ? 'text-blue-900' : 'text-gray-700'}`}>
        {label}
      </p>
      <div className="mt-2 w-full bg-gray-300 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            highlight ? 'bg-blue-600' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={`text-2xl font-bold mt-2 ${highlight ? 'text-blue-600' : 'text-gray-800'}`}>
        {score}
      </p>
    </div>
  );
};
