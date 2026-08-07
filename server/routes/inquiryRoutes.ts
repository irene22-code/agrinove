import { Router } from 'express';
import { createInquiry, getInquiries, getInquiryById, updateInquiryStatus } from '../controllers/inquiryController';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Create inquiry (Buyer only)
router.post('/', requireAuth, requireRole(['buyer']), createInquiry);

// Get inquiries (Buyer or Seller)
router.get('/', requireAuth, getInquiries);

// Get inquiry by id (Buyer or Seller)
router.get('/:id', requireAuth, getInquiryById);

// Update inquiry status (Buyer or Seller)
router.patch('/:id/status', requireAuth, updateInquiryStatus);

export default router;
