import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, MessageSquare } from 'lucide-react';

interface ChatMessage {
  text: string;
  isUser: boolean;
}

const FloatingWidgets: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages = [...messages, { text: inputValue, isUser: true }];
    setMessages(newMessages);
    setInputValue('');

    // Auto reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Thank you for your message! A tutor consultant will get back to you soon. For urgent enquiries, WhatsApp us at +65 9888 2675.',
          isUser: false,
        },
      ]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-4 z-40">
      {/* Chat Window */}
      {isChatOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 mb-2 border border-gray-200 overflow-hidden fade-in flex flex-col" style={{ maxHeight: '500px', height: '400px' }}>
          {/* Chat Header */}
          <div className="bg-[#0A2540] text-white p-4 flex justify-between items-center">
            <h3 className="font-bold text-sm">Integrated Learnings Support</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-300">
              <X size={18} />
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-xs mt-4">
                Welcome! How can we help you today?
              </p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.isUser
                      ? 'bg-[#4BA3C7] text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow text-sm p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#4BA3C7]"
            />
            <button
              type="submit"
              className="bg-[#0A2540] text-white p-2 rounded-r-md hover:bg-opacity-90"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Buttons Container */}
      <div className="flex items-center space-x-4">
        {/* Chatbot Toggle */}
        <button
          onClick={toggleChat}
          className="bg-[#0A2540] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-transform hover:scale-105"
          aria-label="Chat with us"
        >
          <MessageSquare size={24} />
        </button>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/6598882675"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-transform hover:scale-105"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={24} />
        </a>
      </div>
    </div>
  );
};

export default FloatingWidgets;