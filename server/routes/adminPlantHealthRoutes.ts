import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';
import multer from 'multer';
import {
  getAdminPlantHealth,
  getAdminPlantHealthById,
  createPlantHealth,
  updatePlantHealth,
  deletePlantHealth,
  updatePlantHealthStatus,
  uploadPlantHealthImage,
  uploadPlantHealthDocument,
  getAdminPlantHealthLookups,
  createPlantHealthLookup,
  updatePlantHealthLookup,
  deletePlantHealthLookup
} from '../controllers/plantHealthController';

const upload = multer();
const router = Router();

router.use(requireAuth, requireRole(['admin']));

router.use((req, res, next) => {
    console.log("=> ADMIN PLANT HEALTH ROUTE:", req.method, req.url);
    next();
});


router.get('/', getAdminPlantHealth);
router.get('/:id', getAdminPlantHealthById);
router.post('/', createPlantHealth);
router.put('/:id', updatePlantHealth);
router.delete('/:id', deletePlantHealth);
router.patch('/:id/status', updatePlantHealthStatus);

// Specialized endpoints for uploads via Supabase storage
router.post('/upload-image', upload.single('image'), uploadPlantHealthImage);
router.post('/upload-document', upload.single('document'), uploadPlantHealthDocument);

export default router;

router.get('/lookups/data/:type', getAdminPlantHealthLookups);
router.post('/lookups/data/:type', createPlantHealthLookup);
router.put('/lookups/data/:type/:id', updatePlantHealthLookup);
router.delete('/lookups/data/:type/:id', deletePlantHealthLookup);
