import React, { useState, useEffect, useRef } from 'react';
import { MessageCircleIcon, XIcon, SendIcon, BotIcon, UserIcon, SettingsIcon } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuth } from '../Auth';
import { formatDistanceToNow } from 'date-fns';

const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const {
    currentChat,
    messages,
    isLoading,
    error,
    isConnected,
    createChat,
    sendMessage,
    toggleAI,
    connectSocket,
    setCurrentChat,
    clearError,
    addMessage,
  } = useChatStore();

  // Initialize socket connection when component mounts and user is available
  useEffect(() => {
    if (user && !isConnected) {
      connectSocket(user.id);
    }
  }, [user, isConnected, connectSocket]);

  // Create default AI chat when opening for the first time
  useEffect(() => {
    if (isOpen && user && !currentChat) {
      initializeAIChat();
    }
  }, [isOpen, user, currentChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeAIChat = async () => {
    if (!user) return;
    
    console.log('FloatingChatbot: Initializing AI chat for user:', user);
    console.log('FloatingChatbot: User ID:', user.id);
    console.log('FloatingChatbot: Access token in localStorage:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
    
    try {
      const chat = await createChat([user.id]);
      setCurrentChat(chat);
      console.log('FloatingChatbot: AI chat initialized successfully:', chat._id);
      
      // No automatic welcome message - chat starts empty
    } catch (error) {
      console.error('FloatingChatbot: Failed to initialize AI chat:', error);
      // The error will be handled by the chat store and displayed in the UI
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (error) {
      clearError();
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentChat) return;
    
    sendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleAI = async () => {
    if (!currentChat) return;
    
    try {
      await toggleAI(currentChat._id, !currentChat.aiEnabled);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to toggle AI:', error);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  if (!user) {
    return null; // Don't show chat if user is not logged in
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1002]">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <BotIcon size={20} className="mr-2" />
              <div>
                <h3 className="font-medium">QuickLister AI</h3>
                <p className="text-xs opacity-90">
                  {currentChat?.aiEnabled ? 'AI Assistant Active' : 'AI Disabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-blue-700 rounded"
                title="Settings"
              >
                <SettingsIcon size={16} />
              </button>
              <button
                onClick={toggleChatbot}
                className="p-1 hover:bg-blue-700 rounded"
              >
                <XIcon size={20} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && currentChat && (
            <div className="bg-gray-50 p-3 border-b">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Assistant</span>
                <button
                  onClick={handleToggleAI}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    currentChat.aiEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currentChat.aiEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {currentChat.aiEnabled 
                  ? 'AI will respond to your messages' 
                  : 'AI responses are disabled'
                }
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto">
            {error && (
              <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {messages.map((message, index) => {
              const isOptimistic = message._id.startsWith('temp-');
              return (
                <div
                  key={`${message._id}-${index}`}
                  className={`mb-3 flex ${
                    message.senderType === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.senderType === 'user'
                        ? `bg-blue-500 text-white ${isOptimistic ? 'opacity-70' : ''}`
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start">
                      {message.senderType === 'ai' && (
                        <BotIcon size={16} className="mr-2 mt-0.5 text-blue-600" />
                      )}
                      {message.senderType === 'user' && message.sender && (
                        <UserIcon size={16} className="mr-2 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 opacity-70 ${
                          message.senderType === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BotIcon size={16} className="text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-3 flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              disabled={isLoading || !currentChat}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading || !currentChat}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon size={18} />
            </button>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-yellow-100 border-t border-yellow-200 p-2 text-center">
              <p className="text-xs text-yellow-700">
                Connecting to chat server...
              </p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={toggleChatbot}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors group"
          title="Open AI Assistant"
        >
          <MessageCircleIcon size={24} className="group-hover:scale-110 transition-transform" />
          {error && (
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      )}
    </div>
  );
};

export default FloatingChatbot;
