interface CohereMessage {
    role: 'user' | 'assistant';
    content: string;
}
declare class CohereService {
    private cohere;
    private model;
    private maxTokens;
    private timeout;
    constructor();
    private buildQuickListerSystemMessage;
    private convertToCohereChatMessages;
    chat(messages: CohereMessage[]): Promise<string>;
    isAvailable(): Promise<boolean>;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy' | 'degraded';
        message: string;
        details: any;
    }>;
}
export declare const cohereService: CohereService;
export {};
//# sourceMappingURL=cohereService.d.ts.map