import { Router } from 'express';
import { 
  updateBuyerProfile,
   getBuyerProfile, 
  getBuyerStats, 
  getFavorites, 
  addFavorite, 
  removeFavorite, 
  getBuyerInquiries,
  getNotifications,
  markNotificationRead, deleteNotification
} from '../controllers/buyerController';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Buyer profile & stats
router.get('/profile', requireAuth, requireRole(['buyer']), getBuyerProfile);
router.put('/profile', requireAuth, requireRole(['buyer']), updateBuyerProfile);
router.get('/stats', requireAuth, requireRole(['buyer']), getBuyerStats);

// Favorites
router.get('/favorites', requireAuth, requireRole(['buyer']), getFavorites);
router.post('/favorites', requireAuth, requireRole(['buyer']), addFavorite);
router.delete('/favorites/:id', requireAuth, requireRole(['buyer']), removeFavorite);

// Inquiries
router.get('/inquiries', requireAuth, requireRole(['buyer']), getBuyerInquiries);

// Notifications (Can be used by buyer or seller, but we'll mount it here for now or it can be generic)
router.get('/notifications', requireAuth, getNotifications);
router.patch('/notifications/:id/read', requireAuth, markNotificationRead, deleteNotification);

export default router;
