import { Router } from 'express';
import { getSellerDashboardStats, getSellerReviews , updateSellerProfile } from '../controllers/sellerController';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// ==========================================
// Protected Seller Endpoints
// ==========================================
router.get('/stats', requireAuth, requireRole(['seller']), getSellerDashboardStats);
router.get('/reviews', requireAuth, requireRole(['seller']), getSellerReviews);

router.put('/profile', requireAuth, requireRole(['seller']), updateSellerProfile);
export default router;
