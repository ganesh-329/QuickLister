import axios from 'axios';
import { MessageData } from './socketService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ChatData {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
  }[];
  gig?: {
    _id: string;
    title: string;
  };
  aiEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MessagesResponse {
  success: boolean;
  messages: MessageData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ChatsResponse {
  success: boolean;
  chats: ChatData[];
}

interface CreateChatRequest {
  participants: string[];
  gig?: string;
}

interface ChatResponse {
  success: boolean;
  chat: ChatData;
}

class ChatService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    console.log('ChatService: Retrieved token from localStorage:', token ? 'Token present' : 'No token found');
    console.log('ChatService: Token value:', token?.substring(0, 20) + '...' || 'null');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async createChat(data: CreateChatRequest): Promise<ChatData> {
    const response = await axios.post<ChatResponse>(
      `${BASE_URL}/chat`,
      data,
      this.getAuthHeaders()
    );
    return response.data.chat;
  }

  async getUserChats(): Promise<ChatData[]> {
    const response = await axios.get<ChatsResponse>(
      `${BASE_URL}/chat`,
      this.getAuthHeaders()
    );
    return response.data.chats;
  }

  async getChatMessages(chatId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    const response = await axios.get<MessagesResponse>(
      `${BASE_URL}/chat/${chatId}/messages?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    return response.data;
  }

  async toggleAI(chatId: string, enabled: boolean): Promise<ChatData> {
    const response = await axios.patch<ChatResponse>(
      `${BASE_URL}/chat/${chatId}/ai`,
      { enabled },
      this.getAuthHeaders()
    );
    return response.data.chat;
  }

  async deleteChat(chatId: string): Promise<void> {
    await axios.delete(
      `${BASE_URL}/chat/${chatId}`,
      this.getAuthHeaders()
    );
  }
}

export const chatService = new ChatService();
export type { ChatData, MessageData, MessagesResponse, ChatsResponse, CreateChatRequest }; 