import { Router } from 'express';
import { handleChat, getConversations, getConversation, deleteConversation, deleteAllConversations } from '../controllers/agromartAIController.js';

const router = Router();

router.post('/chat', handleChat);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.delete('/conversations', deleteAllConversations);
router.delete('/conversations/:id', deleteConversation);

export default router;
