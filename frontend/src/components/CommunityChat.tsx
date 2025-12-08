import React, { useState } from 'react';
import { MessageSquare, Send, User, Clock } from 'lucide-react';

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

const CommunityChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', author: 'Alice Johnson', content: 'Emergency resources deployed to downtown', timestamp: '2 mins ago' },
    { id: '2', author: 'Bob Smith', content: 'Medical teams en route to reported incident', timestamp: '5 mins ago' },
    { id: '3', author: 'Carol White', content: 'Supply distribution center operational', timestamp: '10 mins ago' },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Math.random().toString(36).substr(2, 9),
        author: 'You',
        content: newMessage,
        timestamp: 'now',
      };
      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <MessageSquare className="text-blue-600" />
        Community Chat
      </h2>

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex gap-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Send size={18} />
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2">
                <User className="text-gray-400" size={16} />
                <span className="font-semibold text-sm">{message.author}</span>
                <Clock className="text-gray-400" size={14} />
                <span className="text-xs text-gray-500">{message.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
