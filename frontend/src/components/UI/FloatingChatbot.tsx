import React, { useState } from 'react';
import { MessageCircleIcon, XIcon, SendIcon } from 'lucide-react';
const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: 1,
    text: "Hi there! I'm your AI assistant. How can I help you find the perfect gig today?",
    sender: 'bot'
  }]);
  const [newMessage, setNewMessage] = useState('');
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user'
    };
    setMessages([...messages, userMessage]);
    setNewMessage('');
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: 'I found several gigs matching your skills nearby. Would you like me to show them on the map?',
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  return <div className="fixed bottom-6 right-6 z-[1002]">
      {isOpen ? <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col overflow-hidden">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">GigMapper Assistant</h3>
            <button onClick={toggleChatbot}>
              <XIcon size={20} />
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map(message => <div key={message.id} className={`mb-3 max-w-[80%] p-3 rounded-lg ${message.sender === 'bot' ? 'bg-gray-100 text-gray-800' : 'bg-blue-500 text-white ml-auto'}`}>
                {message.text}
              </div>)}
          </div>
          <div className="border-t p-3 flex items-center">
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" onKeyPress={e => e.key === 'Enter' && handleSendMessage()} />
            <button onClick={handleSendMessage} className="ml-2 bg-blue-500 text-white p-2 rounded-full">
              <SendIcon size={18} />
            </button>
          </div>
        </div> : <button onClick={toggleChatbot} className="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700">
          <MessageCircleIcon size={24} />
        </button>}
    </div>;
};
export default FloatingChatbot;