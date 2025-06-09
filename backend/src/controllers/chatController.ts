import { Request, Response } from 'express';
import { Chat, Message } from '../models/index.js';
import { z } from 'zod';

// Validation schemas
const createChatSchema = z.object({
  participants: z.array(z.string()),
  gig: z.string().optional(),
});

const toggleAISchema = z.object({
  enabled: z.boolean(),
});

// Start new chat session
export const startChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createChatSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid request data',
        details: validation.error.errors 
      });
      return;
    }

    const { participants, gig } = validation.data;
    
    // Check if chat already exists between these participants
    const existingChat = await Chat.findOne({
      participants: { $all: participants },
      $expr: { $eq: [{ $size: "$participants" }, participants.length] }
    });

    if (existingChat) {
      res.status(200).json({ success: true, chat: existingChat });
      return;
    }

    const chat = await Chat.create({ participants, gig });
    res.status(201).json({ success: true, chat });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// Get user's chats
export const getUserChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const chats = await Chat.find({ 
      participants: userId 
    })
    .populate('participants', 'name email')
    .populate('gig', 'title')
    .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// Get chat messages
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant in this chat
    const userId = req.user?.id;
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chat) {
      res.status(404).json({ success: false, error: 'Chat not found' });
      return;
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ chat: chatId });

    res.json({ 
      success: true, 
      messages: messages.reverse(), // Reverse to get chronological order
      pagination: {
        page,
        limit,
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// Enable/disable AI assistant
export const toggleAI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const validation = toggleAISchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid request data',
        details: validation.error.errors 
      });
      return;
    }

    const { enabled } = validation.data;
    const userId = req.user?.id;

    // Verify user is participant in this chat
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chat) {
      res.status(404).json({ success: false, error: 'Chat not found' });
      return;
    }

    chat.aiEnabled = enabled;
    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    console.error('Toggle AI error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// Delete chat session
export const deleteChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id;

    // Verify user is participant in this chat
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chat) {
      res.status(404).json({ success: false, error: 'Chat not found' });
      return;
    }

    // Delete all messages first
    await Message.deleteMany({ chat: chatId });
    
    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}; 