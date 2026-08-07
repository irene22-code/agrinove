const fs = require('fs');

const routeContent = `
import { Router } from 'express';
import multer from 'multer';
import { registerBuyer, registerSeller, login, logout, getProfile } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post('/register/buyer', registerBuyer);
router.post('/register/seller', upload.single('profile_picture'), registerSeller);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', requireAuth, getProfile);

export default router;
`;
fs.writeFileSync('server/routes/authRoutes.ts', routeContent);
console.log('Updated auth routes');
