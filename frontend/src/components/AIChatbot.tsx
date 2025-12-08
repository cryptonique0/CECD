import React, { useState } from 'react';
import { MessageSquare, Bot, Send, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your emergency coordination AI assistant. I can help with incident reporting, volunteer assignments, and resource allocation. What do you need?',
      timestamp: '10:15 AM',
    },
    {
      id: '2',
      role: 'user',
      content: 'What\'s the current status of medical resources?',
      timestamp: '10:16 AM',
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Currently, we have: 45 medical staff deployed, 3 mobile medical units active, 250+ hospital beds available, and 85% supply stock levels. Is there a specific medical need?',
      timestamp: '10:16 AM',
    },
  ]);

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      const userMessage: ChatMessage = {
        id: Math.random().toString(),
        role: 'user',
        content: input,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, userMessage]);

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: Math.random().toString(),
          role: 'assistant',
          content: 'I understand. Let me process that request and provide recommendations based on current emergency protocols.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 1000);

      setInput('');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Bot className="text-purple-600" />
        AI Emergency Assistant
      </h2>

      <div className="bg-white rounded-lg shadow border border-purple-100 overflow-hidden flex flex-col h-96">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-sm rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'assistant' ? (
                    <Bot size={16} />
                  ) : (
                    <User size={16} />
                  )}
                  <span className="text-xs opacity-75">{message.timestamp}</span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about emergency response..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-600">AI can suggest incident response strategies, allocate resources, and answer protocol questions.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm font-medium text-purple-700">
          💡 Suggest Deployment
        </button>
        <button className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm font-medium text-purple-700">
          📋 Generate Report
        </button>
        <button className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm font-medium text-purple-700">
          🚨 Emergency Protocol
        </button>
        <button className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm font-medium text-purple-700">
          ❓ FAQ
        </button>
      </div>
    </div>
  );
};

export default AIChatbot;
