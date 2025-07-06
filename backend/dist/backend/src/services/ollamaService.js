import axios from 'axios';
import { ChatContextService } from './chatContextService.js';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'tinyllama';
const OLLAMA_TIMEOUT = Number(process.env.OLLAMA_TIMEOUT || 45000);
const OLLAMA_MAX_TOKENS = Number(process.env.OLLAMA_MAX_TOKENS || 2048);
class OllamaService {
    baseUrl;
    model;
    timeout;
    maxTokens;
    constructor() {
        this.baseUrl = OLLAMA_BASE_URL;
        this.model = OLLAMA_MODEL;
        this.timeout = OLLAMA_TIMEOUT;
        this.maxTokens = OLLAMA_MAX_TOKENS;
    }
    setModel(model) {
        this.model = model;
    }
    async chat(messages, opts) {
        const payload = {
            model: opts?.model || this.model,
            messages,
            max_tokens: opts?.max_tokens || this.maxTokens,
            stream: false,
        };
        // Properly construct the URL to avoid double slashes
        const baseUrl = this.baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
        const chatUrl = `${baseUrl}/api/chat`;
        console.log('🤖 Ollama chat request:', {
            baseUrl: this.baseUrl,
            chatUrl,
            model: payload.model,
            messageCount: messages.length,
            timeout: this.timeout,
            maxTokens: payload.max_tokens
        });
        try {
            const startTime = Date.now();
            const response = await axios.post(chatUrl, payload, {
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            const duration = Date.now() - startTime;
            console.log('✅ Ollama response received:', {
                status: response.status,
                duration: `${duration}ms`,
                contentLength: response.data?.message?.content?.length || 0
            });
            return response.data?.message?.content || '';
        }
        catch (error) {
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
            }
            else if (error.code === 'ETIMEDOUT') {
                throw new Error('Ollama request timed out. The model might be loading or the server is overloaded.');
            }
            else if (error.response?.status === 404) {
                throw new Error(`Ollama model '${payload.model}' not found. Please check if the model is installed.`);
            }
            else if (error.response?.status === 405) {
                throw new Error('Ollama API endpoint does not support the requested method. Please check if the ngrok tunnel is properly configured or if Ollama is running correctly.');
            }
            else if (error.response?.status === 502 || error.response?.status === 503) {
                throw new Error('Ollama service is temporarily unavailable. The ngrok tunnel might be down or Ollama is not responding.');
            }
            else {
                throw new Error(`Ollama service error: ${error.message}`);
            }
        }
    }
    async chatWithContext(messages, chatId, userId, gigId, opts) {
        try {
            console.log('🔧 Building context for chat:', { chatId, userId, gigId });
            // Build the system prompt with context
            const systemPrompt = await ChatContextService.buildContextForChat(chatId, userId, gigId);
            // Prepend system message to the conversation
            const contextualMessages = [
                { role: 'assistant', content: systemPrompt },
                ...messages
            ];
            console.log('📝 System prompt built, message count:', contextualMessages.length);
            // Call the regular chat method with contextual messages
            return await this.chat(contextualMessages, opts);
        }
        catch (error) {
            console.error('❌ Error in chatWithContext:', error);
            // Fallback to regular chat without context if context building fails
            console.log('🔄 Falling back to regular chat without context');
            return await this.chat(messages, opts);
        }
    }
    async isAvailable() {
        try {
            const baseUrl = this.baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
            const tagsUrl = `${baseUrl}/api/tags`;
            console.log('🔍 Checking Ollama availability at:', tagsUrl);
            await axios.get(tagsUrl, {
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                },
            });
            console.log('✅ Ollama is available');
            return true;
        }
        catch (error) {
            console.log('❌ Ollama is not available:', error.message);
            return false;
        }
    }
    // Method to test the connection and provide detailed diagnostics
    async testConnection() {
        try {
            const baseUrl = this.baseUrl.replace(/\/+$/, '');
            const tagsUrl = `${baseUrl}/api/tags`;
            console.log('🧪 Testing Ollama connection:', {
                baseUrl: this.baseUrl,
                cleanBaseUrl: baseUrl,
                tagsUrl,
                model: this.model
            });
            const response = await axios.get(tagsUrl, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                },
            });
            console.log('✅ Ollama connection test successful:', {
                status: response.status,
                data: response.data
            });
            return {
                available: true,
                details: {
                    status: response.status,
                    models: response.data?.models || []
                }
            };
        }
        catch (error) {
            console.error('❌ Ollama connection test failed:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data
            });
            return {
                available: false,
                error: error.message,
                details: {
                    code: error.code,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    responseData: error.response?.data
                }
            };
        }
    }
}
export const ollamaService = new OllamaService();
//# sourceMappingURL=ollamaService.js.map