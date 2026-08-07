import { Router } from 'express';
import { sendMessage, getMessages, markMessageRead, markAllMessagesRead, deleteMessage } from '../controllers/messageController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// In the context of messages, we usually access them via inquiry_id
router.get('/inquiry/:inquiry_id', requireAuth, getMessages);
router.post('/inquiry/:inquiry_id', requireAuth, sendMessage);

router.patch('/:message_id/read', requireAuth, markMessageRead);
router.patch('/inquiry/:inquiry_id/read', requireAuth, markAllMessagesRead);
router.delete('/:message_id', requireAuth, deleteMessage);

export default router;
