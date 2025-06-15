import { Server as IOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { cohereService } from './cohereService.js';
import { Chat, Message } from '../models/index.js';

interface ServerOptions {
  httpServer: HTTPServer;
}

interface MessagePayload {
  chatId: string;
  content: string;
}

export function createSocketService({ httpServer }: ServerOptions) {
  const io = new IOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join', ({ chatId }: { chatId: string }) => {
      socket.join(chatId);
      console.log(`User ${socket.data.userId} joined chat ${chatId}`);
    });

    // Handle message
    socket.on('message', async ({ chatId, content }: MessagePayload) => {
      console.log('📨 Received message event:', { chatId, content, socketId: socket.id });

      try {
        console.log('💾 Saving user message to database...');
        const message = await Message.create({
          chat: chatId,
          senderType: 'user',
          content,
        });
        console.log('✅ User message created:', message._id);

        // Populate message for broadcasting
        const populatedMessage = await Message.findById(message._id);
        console.log('📤 Broadcasting user message to chat room:', chatId);
        io.to(chatId).emit('message', populatedMessage);

        // Check if AI is enabled for this chat
        console.log('🔍 Checking if AI is enabled for chat:', chatId);
        const chat = await Chat.findById(chatId);
        
        if (chat?.aiEnabled) {
          console.log('🧠 AI is enabled, getting conversation context...');
          
          // Get recent messages for context with optimization
          const messages = await Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .limit(10)  // Reduced for better performance
            .lean();
          
          console.log(`📚 Found ${messages.length} messages for context`);
          
          // Reverse to get chronological order and prepare for Cohere
          messages.reverse();
          
          // Optimize context by filtering and truncating
          const context = messages
            .filter((m: any) => m.senderType === 'user' || m.senderType === 'ai')
            .map((m: any) => ({
              role: m.senderType === 'user' ? 'user' as const : 'assistant' as const,
              content: (m.content as string).length > 800 
                ? (m.content as string).substring(0, 800) + '...' 
                : m.content as string,
            }))
            .slice(-6); // Keep only last 6 relevant messages (3 exchanges)

          console.log('🎯 Prepared optimized context for AI:', context.length, 'messages');
          console.log('📊 Context stats:', {
            totalMessages: messages.length,
            filteredMessages: context.length,
            avgMessageLength: Math.round(context.reduce((sum, msg) => sum + msg.content.length, 0) / context.length),
            totalContextSize: context.reduce((sum, msg) => sum + msg.content.length, 0)
          });

          // Get AI response from Cohere
          try {
            console.log('🚀 Calling Cohere service...');
            const aiContent = await cohereService.chat(context);
            console.log('✅ Received Cohere response:', aiContent ? 'Success' : 'Empty response');
            
            console.log('💾 Saving AI message to database...');
            const aiMessage = await Message.create({
              chat: chatId,
              senderType: 'ai',
              content: aiContent,
            });
            console.log('✅ AI message created:', aiMessage._id);

            const populatedAiMessage = await Message.findById(aiMessage._id);
            console.log('📤 Broadcasting AI message to chat room:', chatId);
            io.to(chatId).emit('message', populatedAiMessage);
            console.log('🎉 AI response flow completed successfully');
          } catch (err) {
            console.error('❌ AI response error:', err);
            console.error('🔍 AI error details:', {
              message: err instanceof Error ? err.message : 'Unknown error',
              stack: err instanceof Error ? err.stack : undefined
            });
            
            // Send user-friendly error message
            const errorMessage = err instanceof Error ? err.message : 'AI failed to respond.';
            io.to(chatId).emit('ai_error', { error: errorMessage });
          }
        } else {
          console.log('🚫 AI is disabled for this chat, skipping AI response');
        }
      } catch (error) {
        console.error('❌ Message handling error:', error);
        console.error('🔍 Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        socket.emit('error', { error: 'Failed to send message' });
      }
    });

    // Leave room
    socket.on('leave', ({ chatId }: { chatId: string }) => {
      socket.leave(chatId);
      console.log(`User ${socket.data.userId} left chat ${chatId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
