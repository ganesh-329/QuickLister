import { Router } from 'express';
import { startChat, getUserChats, getMessages, toggleAI, deleteChat } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// All chat routes require authentication
router.use(authenticate);
// Start new chat session
router.post('/', startChat);
// Get user's chats
router.get('/', getUserChats);
// Get chat messages
router.get('/:chatId/messages', getMessages);
// Toggle AI assistant
router.patch('/:chatId/ai', toggleAI);
// Delete chat session
router.delete('/:chatId', deleteChat);
export default router;
//# sourceMappingURL=chat.js.map