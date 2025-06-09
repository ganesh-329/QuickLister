import { Server as IOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ollamaService } from './ollamaService.js';
import { Chat, Message } from '../models/index.js';

interface ServerOptions {
  httpServer: HTTPServer;
}

interface JoinPayload {
  chatId: string;
  userId: string;
}

interface MessagePayload {
  chatId: string;
  content: string;
}

export function createSocketService({ httpServer }: ServerOptions) {
  const io = new IOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join chat room
    socket.on('join', async ({ chatId, userId }: JoinPayload) => {
      socket.join(chatId);
      socket.data.userId = userId;
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    // Handle new message
    socket.on('message', async ({ chatId, content }: MessagePayload) => {
      console.log('📨 Received message event:', { chatId, content, socketId: socket.id });
      console.log('👤 Socket user data:', socket.data);
      
      try {
        // Check if user ID is available
        if (!socket.data.userId) {
          console.error('❌ No userId in socket data, message cannot be saved');
          socket.emit('error', { error: 'User not identified. Please refresh and try again.' });
          return;
        }

        console.log('💾 Creating user message in database...');
        // Save user message
        const message = await Message.create({
          chat: chatId,
          sender: socket.data.userId,
          senderType: 'user',
          content,
        });
        console.log('✅ User message created:', message._id);

        // Populate sender information
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name email');
        console.log('📤 Broadcasting user message to chat room:', chatId);
        io.to(chatId).emit('message', populatedMessage);

        // Check if AI is enabled for this chat
        console.log('🤖 Checking if AI is enabled for chat...');
        const chat = await Chat.findById(chatId);
        console.log('💬 Chat details:', { id: chat?._id, aiEnabled: chat?.aiEnabled });
        
        if (chat?.aiEnabled) {
          console.log('🧠 AI is enabled, getting conversation context...');
          // Get recent messages for context with optimization
          const messages = await Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .limit(12)  // Reduced from 20 to 12
            .lean();  // Use lean() for better performance
          
          console.log(`📚 Found ${messages.length} messages for context`);
          
          // Reverse to get chronological order
          messages.reverse();
          
          // Optimize context by filtering and truncating
          const context = messages
            .filter((m: any) => m.senderType === 'user' || m.senderType === 'ai') // Only user and AI messages
            .map((m: any) => ({
              role: m.senderType === 'user' ? 'user' as 'user' : 'assistant' as 'assistant',
              content: (m.content as string).length > 500 
                ? (m.content as string).substring(0, 500) + '...' 
                : m.content as string, // Truncate long messages
            }))
            .slice(-8); // Keep only last 8 relevant messages (4 exchanges)

          console.log('🎯 Prepared optimized context for AI:', context.length, 'messages');
          console.log('📊 Context stats:', {
            totalMessages: messages.length,
            filteredMessages: context.length,
            avgMessageLength: Math.round(context.reduce((sum, msg) => sum + msg.content.length, 0) / context.length),
            totalContextSize: context.reduce((sum, msg) => sum + msg.content.length, 0)
          });

          // Get AI response
          try {
            console.log('🚀 Calling Ollama service...');
            const aiContent = await ollamaService.chat(context);
            console.log('✅ Received AI response:', aiContent ? 'Success' : 'Empty response');
            
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
            io.to(chatId).emit('ai_error', { error: 'AI failed to respond.' });
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

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
