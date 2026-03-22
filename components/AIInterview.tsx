import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, CheckCircle, MessageCircle } from 'lucide-react';
import { sendInterviewMessage, getInitialQuestion } from '../services/aiInterview';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_INPUT_CHARS = 400;

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
    if (userInput.length > MAX_INPUT_CHARS) {
      setError(`Please keep answers under ${MAX_INPUT_CHARS} characters.`);
      return;
    }

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

  if (interviewComplete) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
          <p className="text-gray-600">
            Thank you for chatting with us! We now have a great picture of your teaching style and personality.
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            ✅ Our team will review your responses and match you with students who'll benefit most from your approach. You'll hear from us soon!
          </p>
        </div>

        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <a
            href="/tutors"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md text-center"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-blue-100" size={24} />
          <div>
            <h2 className="text-2xl font-bold">Getting to Know You</h2>
            <p className="text-blue-100">
              A quick chat about your teaching style and personality — takes about 10 minutes
            </p>
          </div>
        </div>
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


