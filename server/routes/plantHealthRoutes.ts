import { Router } from 'express';
import {
  getPublicPlantHealth,
  getPublicPlantHealthBySlug,
  getPlantHealthLookupData
} from '../controllers/plantHealthController';

const router = Router();

// Public routes
router.get('/lookups', getPlantHealthLookupData);
router.get('/:slug', getPublicPlantHealthBySlug);
router.get('/', getPublicPlantHealth);

export default router;
