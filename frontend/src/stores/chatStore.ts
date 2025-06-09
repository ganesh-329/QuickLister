import { create } from 'zustand';
import { chatService, ChatData, MessageData } from '../services/chatService';
import { socketService } from '../services/socketService';

interface ChatStore {
  // State
  chats: ChatData[];
  currentChat: ChatData | null;
  messages: MessageData[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;

  // Actions
  setCurrentChat: (chat: ChatData | null) => void;
  createChat: (participants: string[], gig?: string) => Promise<ChatData>;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => void;
  toggleAI: (chatId: string, enabled: boolean) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  addMessage: (message: MessageData) => void;
  addOptimisticMessage: (content: string) => string;
  removeOptimisticMessage: (tempId: string) => void;
  clearMessages: () => void;
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null,
  isConnected: false,

  // Actions
  setCurrentChat: (chat) => {
    const state = get();
    if (state.currentChat) {
      socketService.leaveChat(state.currentChat._id);
    }
    if (chat) {
      // Get user ID from localStorage user object
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userId = user.id;
          if (userId) {
            console.log('ChatStore: Joining chat room:', { chatId: chat._id, userId });
            socketService.joinChat(chat._id, userId);
          } else {
            console.error('ChatStore: No user ID found in user object');
          }
        } catch (error) {
          console.error('ChatStore: Error parsing user from localStorage:', error);
        }
      } else {
        console.error('ChatStore: No user found in localStorage');
      }
    }
    set({ currentChat: chat, messages: [] });
  },

  createChat: async (participants, gig) => {
    set({ isLoading: true, error: null });
    try {
      const chat = await chatService.createChat({ participants, gig });
      set((state) => ({ 
        chats: [chat, ...state.chats],
        isLoading: false 
      }));
      return chat;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create chat';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const chats = await chatService.getUserChats();
      set({ chats, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chats';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchMessages: async (chatId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatService.getChatMessages(chatId);
      set({ messages: response.messages, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      set({ error: errorMessage, isLoading: false });
    }
  },

  sendMessage: (content) => {
    const { currentChat, addOptimisticMessage, removeOptimisticMessage } = get();
    if (currentChat && content.trim()) {
      // Add optimistic message for immediate UI feedback
      const tempId = addOptimisticMessage(content.trim());
      
      // Send message via socket
      socketService.sendMessage(currentChat._id, content.trim());
      
      // Set up a timeout to remove optimistic message if real message doesn't arrive
      setTimeout(() => {
        removeOptimisticMessage(tempId);
      }, 10000); // Remove after 10 seconds if no real message received
    }
  },

  toggleAI: async (chatId, enabled) => {
    set({ isLoading: true, error: null });
    try {
      const updatedChat = await chatService.toggleAI(chatId, enabled);
      set((state) => ({
        chats: state.chats.map(chat => 
          chat._id === chatId ? updatedChat : chat
        ),
        currentChat: state.currentChat?._id === chatId ? updatedChat : state.currentChat,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle AI';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteChat: async (chatId) => {
    set({ isLoading: true, error: null });
    try {
      await chatService.deleteChat(chatId);
      set((state) => ({
        chats: state.chats.filter(chat => chat._id !== chatId),
        currentChat: state.currentChat?._id === chatId ? null : state.currentChat,
        messages: state.currentChat?._id === chatId ? [] : state.messages,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete chat';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addMessage: (message) => {
    set((state) => {
      // Check if message already exists to prevent duplicates
      const messageExists = state.messages.some(existingMessage => existingMessage._id === message._id);
      if (messageExists) {
        console.log('ChatStore: Message already exists, skipping duplicate:', message._id);
        return state; // Return unchanged state
      }
      
      // If this is a real message from the server, remove any optimistic messages with similar content
      let filteredMessages = state.messages;
      if (!message._id.startsWith('temp-') && message.senderType === 'user') {
        filteredMessages = state.messages.filter(existingMessage => {
          if (existingMessage._id.startsWith('temp-') && 
              existingMessage.senderType === 'user' && 
              existingMessage.content.trim() === message.content.trim()) {
            console.log('ChatStore: Removing optimistic message replaced by real message:', existingMessage._id);
            return false;
          }
          return true;
        });
      }
      
      console.log('ChatStore: Adding new message:', message._id);
      return {
        messages: [...filteredMessages, message]
      };
    });
  },

  addOptimisticMessage: (content) => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const userStr = localStorage.getItem('user');
    let user = null;
    
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (error) {
        console.error('ChatStore: Error parsing user for optimistic message:', error);
      }
    }

    const optimisticMessage: MessageData = {
      _id: tempId,
      chat: get().currentChat?._id || '',
      sender: user ? {
        _id: user.id,
        name: user.name,
        email: user.email
      } : null,
      senderType: 'user',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, optimisticMessage]
    }));

    return tempId;
  },

  removeOptimisticMessage: (tempId) => {
    set((state) => ({
      messages: state.messages.filter(message => message._id !== tempId)
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  connectSocket: (userId: string) => {
    console.log('Connecting socket for user:', userId);
    socketService.connect();
    
    // Set up event listeners
    socketService.on('message', (message) => {
      get().addMessage(message);
    });

    socketService.on('ai_error', ({ error }) => {
      set({ error });
    });

    socketService.on('error', ({ error }) => {
      set({ error });
    });

    set({ isConnected: true });
  },

  disconnectSocket: () => {
    socketService.disconnect();
    set({ isConnected: false });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
