declare class OllamaService {
    private baseUrl;
    private model;
    private timeout;
    private maxTokens;
    constructor();
    setModel(model: string): void;
    chat(messages: {
        role: 'user' | 'assistant';
        content: string;
    }[], opts?: {
        model?: string;
        max_tokens?: number;
    }): Promise<string>;
    chatWithContext(messages: {
        role: 'user' | 'assistant';
        content: string;
    }[], chatId: string, userId?: string, gigId?: string, opts?: {
        model?: string;
        max_tokens?: number;
    }): Promise<string>;
    isAvailable(): Promise<boolean>;
    testConnection(): Promise<{
        available: boolean;
        error?: string;
        details?: any;
    }>;
}
export declare const ollamaService: OllamaService;
export {};
//# sourceMappingURL=ollamaService.d.ts.map