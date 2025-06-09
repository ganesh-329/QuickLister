import axios from 'axios';
import { config } from '../config/env.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'tinyllama';
const OLLAMA_TIMEOUT = Number(process.env.OLLAMA_TIMEOUT || 30000);
const OLLAMA_MAX_TOKENS = Number(process.env.OLLAMA_MAX_TOKENS || 2048);

interface OllamaChatRequest {
  model: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  max_tokens?: number;
  stream?: boolean;
}

interface OllamaChatResponse {
  message: {
    content: string;
    // you can include other fields like role, id, etc., if needed
  };
}

class OllamaService {
  private baseUrl: string;
  private model: string;
  private timeout: number;
  private maxTokens: number;

  constructor() {
    this.baseUrl = OLLAMA_BASE_URL;
    this.model = OLLAMA_MODEL;
    this.timeout = OLLAMA_TIMEOUT;
    this.maxTokens = OLLAMA_MAX_TOKENS;
  }

  setModel(model: string) {
    this.model = model;
  }

  async chat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    opts?: { model?: string; max_tokens?: number }
  ): Promise<string> {
    const payload: OllamaChatRequest = {
      model: opts?.model || this.model,
      messages,
      max_tokens: opts?.max_tokens || this.maxTokens,
      stream: false,
    };

    console.log('🤖 Ollama chat request:', {
      baseUrl: this.baseUrl,
      model: payload.model,
      messageCount: messages.length,
      timeout: this.timeout,
      maxTokens: payload.max_tokens
    });

    try {
      const startTime = Date.now();
      const response = await axios.post<OllamaChatResponse>(
        `${this.baseUrl}/api/chat`,
        payload,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      const duration = Date.now() - startTime;
      console.log('✅ Ollama response received:', {
        status: response.status,
        duration: `${duration}ms`,
        contentLength: response.data?.message?.content?.length || 0
      });

      return response.data?.message?.content || '';
    } catch (error: any) {
      console.error('❌ Ollama chat error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Ollama server. Please check if Ollama is running.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Ollama request timed out. The model might be loading or the server is overloaded.');
      } else if (error.response?.status === 404) {
        throw new Error(`Ollama model '${payload.model}' not found. Please check if the model is installed.`);
      } else {
        throw new Error(`Ollama service error: ${error.message}`);
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

export const ollamaService = new OllamaService();
