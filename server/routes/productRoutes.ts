import { Router } from 'express';
import multer from 'multer';
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    updateProductStatus, 
    updateStock, 
    uploadProductImage 
} from '../controllers/productController';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Multer memory storage configuration for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(), 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ==========================================
// Public Endpoints
// ==========================================
router.get('/', getProducts);
router.get('/:id', getProductById);

// ==========================================
// Protected Seller Endpoints
// ==========================================
router.post('/', requireAuth, requireRole(['seller']), createProduct);
router.put('/:id', requireAuth, requireRole(['seller']), updateProduct);
router.delete('/:id', requireAuth, requireRole(['seller']), deleteProduct);
router.patch('/:id/status', requireAuth, requireRole(['seller']), updateProductStatus);
router.patch('/:id/stock', requireAuth, requireRole(['seller']), updateStock);

// Image Upload (multipart/form-data)
router.post('/:id/images', requireAuth, requireRole(['seller']), upload.array('images', 5), uploadProductImage);

export default router;
