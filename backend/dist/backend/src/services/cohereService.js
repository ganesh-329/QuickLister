import { CohereClientV2 } from 'cohere-ai';
import { config } from '../config/env.js';
const COHERE_MODEL = 'command-r-plus';
const COHERE_MAX_TOKENS = 2048;
const COHERE_TIMEOUT = 15000; // 15 seconds - much faster than Ollama
class CohereService {
    cohere;
    model;
    maxTokens;
    timeout;
    constructor() {
        if (!config.COHERE_API_KEY) {
            throw new Error('COHERE_API_KEY is required but not provided');
        }
        this.cohere = new CohereClientV2({
            token: config.COHERE_API_KEY,
        });
        this.model = COHERE_MODEL;
        this.maxTokens = COHERE_MAX_TOKENS;
        this.timeout = COHERE_TIMEOUT;
    }
    buildQuickListerSystemMessage() {
        return `You are QuickLister AI Assistant, specialized in helping users with the QuickLister gig platform. 

QUICKLISTER PLATFORM CONTEXT:
- QuickLister is a micro-job platform where users can find and offer local services/gigs
- Users can post gigs, apply for gigs, and manage their profiles
- The platform focuses on location-based services and quick tasks

YOUR ROLE:
Help users ONLY with QuickLister platform-related tasks:

✅ WHAT YOU CAN HELP WITH:
- Finding relevant gigs based on skills/location
- Writing compelling gig descriptions
- Understanding the application process
- Platform navigation and features
- Profile optimization tips
- Basic troubleshooting (login issues, posting problems)
- Best practices for getting hired
- Platform policies and guidelines

❌ WHAT YOU SHOULD NOT DO:
- General purpose conversations unrelated to QuickLister
- Personal advice not related to the platform
- Technical support beyond basic platform issues
- Legal or financial advice
- Content unrelated to gig work or the platform

RESPONSE STYLE:
- Be concise and helpful
- Focus on actionable advice
- Use bullet points for clarity
- Always relate advice back to QuickLister platform features
- Ask clarifying questions about their gig needs when helpful

If asked about something outside QuickLister scope, politely redirect: "I'm specialized in helping with QuickLister platform features. How can I assist you with finding gigs, posting services, or navigating the platform?"`;
    }
    convertToCohereChatMessages(messages) {
        const cohereMessages = [];
        // Add system message first
        cohereMessages.push({
            role: 'system',
            content: this.buildQuickListerSystemMessage()
        });
        // Add conversation history
        for (const msg of messages) {
            cohereMessages.push({
                role: msg.role,
                content: msg.content
            });
        }
        return cohereMessages;
    }
    async chat(messages) {
        if (!messages.length) {
            return "Hello! I'm your QuickLister AI Assistant. I can help you find gigs, write descriptions, understand the application process, and navigate the platform. What would you like assistance with?";
        }
        const cohereMessages = this.convertToCohereChatMessages(messages);
        console.log('🤖 Cohere chat request:', {
            model: this.model,
            messageCount: messages.length,
            totalMessages: cohereMessages.length,
            maxTokens: this.maxTokens
        });
        const startTime = Date.now();
        try {
            const response = await this.cohere.chat({
                model: this.model,
                messages: cohereMessages,
                maxTokens: this.maxTokens,
                temperature: 0.7,
            });
            const duration = Date.now() - startTime;
            const aiResponse = response.message?.content?.[0]?.text?.trim() || '';
            console.log('✅ Cohere response received:', {
                duration: `${duration}ms`,
                contentLength: aiResponse.length,
                model: this.model
            });
            if (!aiResponse) {
                return "I apologize, but I couldn't generate a response. Could you please rephrase your question about QuickLister?";
            }
            return aiResponse;
        }
        catch (error) {
            console.error('❌ Cohere API error:', {
                message: error.message,
                status: error.status,
                statusText: error.statusText,
                body: error.body
            });
            // Handle specific Cohere API errors
            if (error.status === 401) {
                throw new Error('Invalid Cohere API key. Please check your API key configuration.');
            }
            else if (error.status === 429) {
                throw new Error('Cohere API rate limit exceeded. Please try again in a moment.');
            }
            else if (error.status === 400) {
                throw new Error('Invalid request to Cohere API. Please try rephrasing your message.');
            }
            else {
                throw new Error(`Cohere AI service temporarily unavailable: ${error.message}`);
            }
        }
    }
    async isAvailable() {
        try {
            // Test with a simple chat request to verify API key and service availability
            await this.cohere.chat({
                model: this.model,
                messages: [{ role: 'user', content: 'Test' }],
                maxTokens: 5,
            });
            return true;
        }
        catch (error) {
            console.error('Cohere availability check failed:', error);
            return false;
        }
    }
    // Health check with more detailed information
    async healthCheck() {
        try {
            const startTime = Date.now();
            const testResponse = await this.cohere.chat({
                model: this.model,
                messages: [{ role: 'user', content: 'Respond with just "OK"' }],
                maxTokens: 10,
            });
            const duration = Date.now() - startTime;
            const responseText = testResponse.message?.content?.[0]?.text?.trim() || '';
            return {
                status: 'healthy',
                message: 'Cohere service is working properly',
                details: {
                    model: this.model,
                    responseTime: `${duration}ms`,
                    testResponse: responseText.substring(0, 50),
                    timestamp: new Date().toISOString(),
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: 'Cohere service is not available',
                details: {
                    error: error.message,
                    status: error.status,
                    timestamp: new Date().toISOString(),
                }
            };
        }
    }
}
export const cohereService = new CohereService();
//# sourceMappingURL=cohereService.js.map