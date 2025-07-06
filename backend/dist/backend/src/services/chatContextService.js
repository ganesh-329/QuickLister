import { Chat, User, Gig } from '../models/index.js';
export class ChatContextService {
    static APP_CONTEXT = {
        platform: 'QuickLister',
        purpose: 'A location-based microjob platform that connects service providers with job posters in their vicinity using interactive maps',
        features: [
            'Map-based job discovery and posting',
            'Real-time location tracking',
            'Skill-based matching',
            'UPI payment integration',
            'Rating and review system',
            'AI-powered recommendations',
            'Gig applications and management',
            'Profile management',
            'Chat messaging between users'
        ],
        categories: [
            'home_services', 'repair_maintenance', 'cleaning', 'gardening',
            'tech_services', 'tutoring', 'photography', 'event_services',
            'delivery', 'personal_care', 'pet_services', 'automotive',
            'construction', 'electrical', 'plumbing', 'painting',
            'moving', 'handyman', 'security', 'other'
        ],
        userTypes: ['Job Seekers (Service Providers)', 'Job Posters (Clients)', 'Platform Users'],
        paymentMethods: ['UPI', 'Cash', 'Bank Transfer', 'Razorpay']
    };
    static async buildSystemPrompt(userContext, gigContext, chatContext) {
        const systemPrompt = `You are QuickLister AI, an intelligent assistant for the QuickLister platform.

PLATFORM OVERVIEW:
${this.APP_CONTEXT.purpose}

KEY FEATURES:
${this.APP_CONTEXT.features.map(feature => `- ${feature}`).join('\n')}

AVAILABLE GIG CATEGORIES:
${this.APP_CONTEXT.categories.map(cat => `- ${cat.replace(/_/g, ' ')}`).join('\n')}

PAYMENT METHODS: ${this.APP_CONTEXT.paymentMethods.join(', ')}

YOUR ROLE:
- Help users navigate the QuickLister platform
- Assist with finding and posting gigs
- Explain platform features and policies
- Provide guidance on applications, payments, and ratings
- Answer questions about location-based job discovery
- Help with troubleshooting common issues

USER CONTEXT:
${userContext ? this.formatUserContext(userContext) : 'User is not authenticated or context not available'}

${gigContext ? `GIG CONTEXT:\n${this.formatGigContext(gigContext)}` : ''}

${chatContext ? `CHAT CONTEXT:\n${this.formatChatContext(chatContext)}` : ''}

GUIDELINES:
- Be helpful, friendly, and professional
- Focus on QuickLister-specific solutions
- Provide actionable advice related to the platform
- If asked about features not available, suggest alternatives within the platform
- For technical issues, guide users to appropriate platform sections
- Always prioritize user safety and platform policies
- Keep responses concise but informative
- Use examples relevant to the microjob/gig economy when helpful

RESPONSE STYLE:
- Be conversational but professional
- Use bullet points for lists when appropriate
- Mention specific QuickLister features when relevant
- Encourage users to explore platform capabilities`;
        return systemPrompt;
    }
    static formatUserContext(userContext) {
        const context = [];
        if (userContext.userName) {
            context.push(`- User Name: ${userContext.userName}`);
        }
        if (userContext.userLocation) {
            context.push(`- User Location: ${userContext.userLocation}`);
        }
        context.push(`- User Type: ${userContext.userType}`);
        if (userContext.userType === 'job_seeker') {
            context.push('- Primary Interest: Finding and applying to local gigs');
        }
        else if (userContext.userType === 'job_poster') {
            context.push('- Primary Interest: Posting gigs and finding service providers');
        }
        else if (userContext.userType === 'both') {
            context.push('- Primary Interest: Both finding gigs and posting jobs');
        }
        return context.join('\n');
    }
    static formatGigContext(gigContext) {
        const context = [];
        if (gigContext.gigTitle) {
            context.push(`- Gig Title: ${gigContext.gigTitle}`);
        }
        if (gigContext.gigCategory) {
            context.push(`- Category: ${gigContext.gigCategory.replace(/_/g, ' ')}`);
        }
        if (gigContext.gigStatus) {
            context.push(`- Status: ${gigContext.gigStatus}`);
        }
        if (gigContext.gigLocation) {
            context.push(`- Location: ${gigContext.gigLocation}`);
        }
        return context.join('\n');
    }
    static formatChatContext(chatContext) {
        const context = [];
        context.push(`- Chat Type: ${chatContext.chatType.replace(/_/g, ' ')}`);
        context.push(`- AI Assistant: ${chatContext.aiEnabled ? 'Enabled' : 'Disabled'}`);
        if (chatContext.chatType === 'ai_assistant') {
            context.push('- This is a direct conversation with the AI assistant');
        }
        else if (chatContext.chatType === 'gig_specific') {
            context.push('- This chat is related to a specific gig');
        }
        else if (chatContext.chatType === 'user_to_user') {
            context.push('- This is a conversation between users (AI assists when enabled)');
        }
        return context.join('\n');
    }
    static async getUserContext(userId) {
        try {
            const user = await User.findById(userId).select('name location');
            if (!user)
                return null;
            // Determine user type based on their activity
            const postedGigs = await Gig.countDocuments({ posterId: userId });
            const appliedGigs = await Gig.countDocuments({ 'applications.applicantId': userId });
            let userType = 'guest';
            if (postedGigs > 0 && appliedGigs > 0) {
                userType = 'both';
            }
            else if (postedGigs > 0) {
                userType = 'job_poster';
            }
            else if (appliedGigs > 0) {
                userType = 'job_seeker';
            }
            const userContext = {
                userId: user._id.toString(),
                userName: user.name,
                userType
            };
            if (user.location) {
                userContext.userLocation = user.location;
            }
            return userContext;
        }
        catch (error) {
            console.error('Error fetching user context:', error);
            return null;
        }
    }
    static async getGigContext(gigId) {
        try {
            const gig = await Gig.findById(gigId).select('title category status location');
            if (!gig)
                return null;
            return {
                gigId: gig._id.toString(),
                gigTitle: gig.title,
                gigCategory: gig.category,
                gigStatus: gig.status,
                gigLocation: gig.location.address
            };
        }
        catch (error) {
            console.error('Error fetching gig context:', error);
            return null;
        }
    }
    static async getChatContext(chatId) {
        try {
            const chat = await Chat.findById(chatId).select('participants gig aiEnabled');
            if (!chat)
                return null;
            let chatType = 'user_to_user';
            // Determine chat type
            if (chat.participants.length === 1) {
                chatType = 'ai_assistant';
            }
            else if (chat.gig) {
                chatType = 'gig_specific';
            }
            return {
                chatId: chat._id.toString(),
                chatType,
                aiEnabled: chat.aiEnabled || false
            };
        }
        catch (error) {
            console.error('Error fetching chat context:', error);
            return null;
        }
    }
    static async buildContextForChat(chatId, userId, gigId) {
        try {
            const [userContext, gigContext, chatContext] = await Promise.all([
                userId ? this.getUserContext(userId) : null,
                gigId ? this.getGigContext(gigId) : null,
                this.getChatContext(chatId)
            ]);
            return await this.buildSystemPrompt(userContext || undefined, gigContext || undefined, chatContext || undefined);
        }
        catch (error) {
            console.error('Error building chat context:', error);
            // Return basic system prompt if context building fails
            return await this.buildSystemPrompt();
        }
    }
    static getQuickHelp() {
        return [
            'How do I find gigs near me?',
            'How do I post a new gig?',
            'What payment methods are available?',
            'How does the rating system work?',
            'How do I apply to a gig?',
            'What are the different gig categories?',
            'How do I track my applications?',
            'How does location-based matching work?',
            'What should I include in my gig posting?',
            'How do I message other users?'
        ];
    }
}
export default ChatContextService;
//# sourceMappingURL=chatContextService.js.map