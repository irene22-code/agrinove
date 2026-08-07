import { getAdminReports } from '../controllers/adminReportsController';
import { Router } from 'express';
import multer from 'multer';
const upload = multer();
import {
  getAdminMessages,
  getAdminMessageDetails,
  updateAdminMessageStatus,
  replyToAdminMessage,
  getAdminCategories,
  getDashboardStats, 
  getAllUsers, verifySeller, updateUserStatus,
  getAdminProducts, updateAdminProductStatus, deleteAdminProduct,
  createCategory, updateCategory, deleteCategory, uploadAdminCategoryImage,
  getAdminOrders, updateAdminOrderStatus,
  getSettings, updateSettings,
  getAuditLogs,
  getSellers, getAdminReviews, deleteAdminReview,
  updateUserRole,
  deleteUser,
  createAdmin,
} from '../controllers/adminController';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Secure all admin routes
router.use(requireAuth, requireRole(['admin']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', (req, res, next) => { console.log('Admin route reached: DELETE /users/:id', req.params.id); next(); }, deleteUser);
router.post('/users', createAdmin);
router.get('/sellers', getSellers, getAdminReviews);
router.patch('/sellers/:id/verify', verifySeller);

// Products
router.get('/products', getAdminProducts);
router.patch('/products/:id/status', updateAdminProductStatus);
router.delete('/products/:id', deleteAdminProduct);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.post('/categories/:id/image', upload.single('image'), uploadAdminCategoryImage);

// Messages
router.get('/messages', getAdminMessages);
router.get('/messages/:id', getAdminMessageDetails);
router.patch('/messages/:id/status', updateAdminMessageStatus);
router.post('/messages/:id/reply', replyToAdminMessage);

// Orders
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateAdminOrderStatus);

// System Settings
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

router.get('/reviews', getAdminReviews);
router.delete('/reviews/:id', deleteAdminReview,);
// Reports
router.get('/reports', getAdminReports);

export default router;

