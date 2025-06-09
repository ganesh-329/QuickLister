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
    // Calculate context size and adjust timeout accordingly
    const contextSize = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const dynamicTimeout = contextSize > 2000 ? this.timeout * 1.5 : this.timeout;
    
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
      contextSize,
      timeout: dynamicTimeout,
      maxTokens: payload.max_tokens
    });

    // Retry logic for better reliability
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
        const startTime = Date.now();
        
        const response = await axios.post<OllamaChatResponse>(
          `${this.baseUrl}/api/chat`,
          payload,
          {
            timeout: dynamicTimeout,
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
          contentLength: response.data?.message?.content?.length || 0,
          attempt
        });

        return response.data?.message?.content || '';
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, {
          message: error.message,
          code: error.code,
          status: error.response?.status
        });
        
        // Don't retry on certain errors
        if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
          break;
        }
        
        // Wait before retry (except on last attempt)
        if (attempt < maxRetries) {
          console.log(`⏳ Waiting 2s before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // Handle final error after all retries
    console.error('❌ All attempts failed. Final error details:', {
      message: lastError.message,
      code: lastError.code,
      status: lastError.response?.status,
      statusText: lastError.response?.statusText,
      responseData: lastError.response?.data,
      config: {
        url: lastError.config?.url,
        method: lastError.config?.method,
        timeout: lastError.config?.timeout
      }
    });
    
    if (lastError.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to Ollama server. Please check if Ollama is running.');
    } else if (lastError.code === 'ETIMEDOUT' || lastError.code === 'ECONNABORTED') {
      throw new Error('Ollama request timed out. Try again or the server may be overloaded.');
    } else if (lastError.response?.status === 404) {
      throw new Error(`Ollama model '${payload.model}' not found. Please check if the model is installed.`);
    } else {
      throw new Error(`Ollama service error: ${lastError.message}`);
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
