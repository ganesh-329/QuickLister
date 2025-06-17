import { io, Socket } from 'socket.io-client';

interface MessageData {
  _id: string;
  chat: string;
  sender: {
    _id: string;
    name: string;
    email?: string;
  } | null;
  senderType: 'user' | 'ai';
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatEvents {
  message: (data: MessageData) => void;
  ai_error: (data: { error: string }) => void;
  error: (data: { error: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(serverUrl?: string) {
    if (this.socket?.connected) {
      console.log('🔗 Socket already connected');
      return;
    }

    // Use environment variable or fallback to relative path for production
    const socketUrl = serverUrl || 
                     import.meta.env.VITE_SOCKET_URL || 
                     (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

    console.log('🔄 Connecting to socket server:', socketUrl);

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Fallback to polling for serverless
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Set up event forwarding
    this.socket.on('message', (data: MessageData) => {
      console.log('Received message via socket:', data);
      this.emit('message', data);
    });

    this.socket.on('ai_error', (data: { error: string }) => {
      console.log('Received AI error via socket:', data);
      this.emit('ai_error', data);
    });

    this.socket.on('error', (data: { error: string }) => {
      console.log('Received error via socket:', data);
      this.emit('error', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  joinChat(chatId: string, userId: string) {
    console.log('SocketService joinChat called:', { chatId, userId, isConnected: this.isConnected });
    
    if (!this.socket) {
      console.error('Socket not initialized for joinChat');
      return;
    }
    
    if (!this.socket.connected) {
      console.error('Socket not connected for joinChat');
      return;
    }
    
    console.log('Emitting join event via socket');
    this.socket.emit('join', { chatId, userId });
  }

  leaveChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('leave', { chatId });
    }
  }

  sendMessage(chatId: string, content: string) {
    console.log('SocketService sendMessage called:', { chatId, content, isConnected: this.isConnected });
    
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    
    if (!this.socket.connected) {
      console.error('Socket not connected');
      return;
    }
    
    console.log('Emitting message event via socket');
    this.socket.emit('message', { chatId, content });
  }

  // Event listener management
  on<K extends keyof ChatEvents>(event: K, callback: ChatEvents[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off<K extends keyof ChatEvents>(event: K, callback: ChatEvents[K]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof ChatEvents>(event: K, ...args: Parameters<ChatEvents[K]>) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          (callback as any)(...args);
        } catch (error) {
          console.error('Error in socket event callback:', error);
        }
      });
    }
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export type { MessageData }; 