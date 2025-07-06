import mongoose from 'mongoose';
import { config } from './env.js';
class Database {
    static instance;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.isConnected) {
            console.log('Database already connected');
            return;
        }
        try {
            const mongoUri = config.NODE_ENV === 'test'
                ? config.MONGODB_TEST_URI || config.MONGODB_URI
                : config.MONGODB_URI;
            await mongoose.connect(mongoUri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
            });
            this.isConnected = true;
            // Handle connection events
            mongoose.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
                this.isConnected = false;
            });
            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
                this.isConnected = false;
            });
            mongoose.connection.on('reconnected', () => {
                console.log('✅ MongoDB reconnected');
                this.isConnected = true;
            });
            // Graceful shutdown
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });
        }
        catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            this.isConnected = false;
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose.connection.close();
            this.isConnected = false;
            console.log('✅ MongoDB disconnected successfully');
        }
        catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
    getConnectionStatus() {
        return this.isConnected && mongoose.connection.readyState === 1;
    }
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'error', message: 'Database not connected' };
            }
            // Check if database connection exists and ping it
            if (!mongoose.connection.db) {
                return { status: 'error', message: 'Database connection not available' };
            }
            await mongoose.connection.db.admin().ping();
            return {
                status: 'healthy',
                message: `Connected to ${mongoose.connection.name}`
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: `Database health check failed: ${error}`
            };
        }
    }
}
export const database = Database.getInstance();
//# sourceMappingURL=database.js.map