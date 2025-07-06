declare class Database {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionStatus(): boolean;
    healthCheck(): Promise<{
        status: string;
        message: string;
    }>;
}
export declare const database: Database;
export {};
//# sourceMappingURL=database.d.ts.map