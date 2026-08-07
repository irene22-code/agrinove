import { Router } from 'express';
import { 
  createOrder, 
  getBuyerOrders, 
  getSellerOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder 
} from '../controllers/orderController';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Create order (Buyer)
router.post('/', requireAuth, requireRole(['buyer']), createOrder);

// Get orders (Buyer)
router.get('/buyer', requireAuth, requireRole(['buyer']), getBuyerOrders);

// Get orders (Seller)
router.get('/seller', requireAuth, requireRole(['seller']), getSellerOrders);

// Get order details (Buyer or Seller)
router.get('/:id', requireAuth, getOrderById);

// Update order status (Seller)
router.patch('/:id/status', requireAuth, requireRole(['seller']), updateOrderStatus);

// Cancel order (Buyer)
router.patch('/:id/cancel', requireAuth, requireRole(['buyer']), cancelOrder);

export default router;
