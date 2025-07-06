interface UserContext {
    userId?: string;
    userName?: string;
    userLocation?: string;
    userType: 'guest' | 'job_seeker' | 'job_poster' | 'both';
}
interface GigContext {
    gigId?: string;
    gigTitle?: string;
    gigCategory?: string;
    gigStatus?: string;
    gigLocation?: string;
}
interface ChatContext {
    chatId?: string;
    chatType: 'ai_assistant' | 'user_to_user' | 'gig_specific';
    aiEnabled: boolean;
}
export declare class ChatContextService {
    private static readonly APP_CONTEXT;
    static buildSystemPrompt(userContext?: UserContext, gigContext?: GigContext, chatContext?: ChatContext): Promise<string>;
    private static formatUserContext;
    private static formatGigContext;
    private static formatChatContext;
    static getUserContext(userId: string): Promise<UserContext | null>;
    static getGigContext(gigId: string): Promise<GigContext | null>;
    static getChatContext(chatId: string): Promise<ChatContext | null>;
    static buildContextForChat(chatId: string, userId?: string, gigId?: string): Promise<string>;
    static getQuickHelp(): string[];
}
export default ChatContextService;
//# sourceMappingURL=chatContextService.d.ts.map