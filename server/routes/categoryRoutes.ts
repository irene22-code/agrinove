import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Publicly accessible route to get all categories
router.get('/', getCategories);

router.post('/', requireAuth, requireRole(['admin']), createCategory);
router.put('/:id', requireAuth, requireRole(['admin']), updateCategory);
router.delete('/:id', requireAuth, requireRole(['admin']), deleteCategory);

export default router;
