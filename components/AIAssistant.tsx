
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatMessage } from '../types';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      sender: 'ai', 
      text: "Hello! I'm the Integrated Learnings AI Assistant. How can I help you today?",
      actions: [
        { label: "Find a Tutor", action: () => null }, // Placeholder, handled in logic
        { label: "Check Prices", action: () => null },
        { label: "Tuition Roadmap", action: () => null }
      ] 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleAction = (label: string) => {
    // Process button clicks as if user typed them
    handleSend(label);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // 2. Simulate AI Processing Delay
    await new Promise(r => setTimeout(r, 1000));

    // 3. Simple Rule-Based AI Logic (To be replaced by real AI backend later)
    let aiResponse: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: "" };
    const lowerText = text.toLowerCase();

    if (lowerText.includes("price") || lowerText.includes("cost") || lowerText.includes("rate")) {
      aiResponse.text = "Our rates depend on the tutor's qualification. Primary starts from $30/hr, Secondary from $40/hr. Would you like to see the full table?";
      aiResponse.actions = [{ label: "View Pricing Page", action: () => navigate('/pricing') }];
    } 
    else if (lowerText.includes("tutor") || lowerText.includes("find") || lowerText.includes("match")) {
      aiResponse.text = "I can help you find a tutor. To get the best AI match, we need to know your child's learning style.";
      aiResponse.actions = [{ label: "Start Request", action: () => navigate('/parents') }];
    }
    else if (lowerText.includes("fail") || lowerText.includes("weak") || lowerText.includes("bad grade")) {
      aiResponse.text = "It sounds like there might be a foundational gap. Our premium diagnostic matching helps us find the right tutor quickly.";
      aiResponse.actions = [{ label: "How Premium Matching Works", action: () => navigate('/tuition?section=about') }, { label: "Request a Tutor", action: () => navigate('/parents') }];
    }
    else if (lowerText.includes("roadmap") || lowerText.includes("plan")) {
      aiResponse.text = "The Singapore Education Roadmap is complex. Which stage is your child in?";
      aiResponse.actions = [
        { label: "Primary (PSLE)", action: () => navigate('/roadmap/psle') },
        { label: "Secondary (O-Level)", action: () => navigate('/roadmap/olevel') }
      ];
    }
    else {
      aiResponse.text = "I'm still learning! Would you like to speak to a human consultant instead?";
      aiResponse.actions = [{ label: "Contact Us", action: () => navigate('/contact') }];
    }

    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition z-50 flex items-center group"
      >
        <div className="absolute -top-10 right-0 bg-white text-slate-800 text-xs py-1 px-3 rounded shadow-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-slate-200">
          Need help? Chat with AI
        </div>
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-primary p-4 flex justify-between items-center text-white">
        <div className="flex items-center">
          <div className="bg-blue-500/20 p-2 rounded-full mr-3">
            <Sparkles size={18} className="text-blue-300" />
          </div>
          <div>
            <h4 className="font-bold text-sm">IL AI Assistant</h4>
            <p className="text-[10px] text-blue-200 flex items-center"><span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span> Online</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white"><X size={20} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 h-96 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.sender === 'user' ? 'bg-secondary text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'}`}>
              <p>{msg.text}</p>
              {msg.actions && (
                <div className="mt-3 space-y-2">
                  {msg.actions.map((act, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        act.action();
                        handleAction(act.label); // Optional: feed back into chat
                      }}
                      className="block w-full text-left text-xs bg-slate-100 hover:bg-blue-50 text-secondary font-bold py-2 px-3 rounded border border-slate-200 transition flex justify-between items-center"
                    >
                      {act.label} <ChevronRight size={12} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-xl border border-slate-200 rounded-bl-none shadow-sm flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center">
        <input 
          className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
          placeholder="Ask about tuition..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
        />
        <button 
          onClick={() => handleSend(input)}
          className="ml-2 bg-secondary text-white p-2 rounded-full hover:bg-blue-700 transition shadow-sm"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
