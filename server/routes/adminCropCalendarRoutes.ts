import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';
import * as ctrl from '../controllers/adminCropCalendarController';

const router = Router();

// Protect all admin crop calendar routes
router.use(requireAuth, requireRole(['admin']));

// Legacy crops setup
router.get('/crops', ctrl.getCrops);
router.post('/crops', ctrl.createCrop);
router.put('/crops/:id', ctrl.updateCrop);
router.delete('/crops/:id', ctrl.deleteCrop);

const setupCrud = (path: string, controllerObj: any) => {
    router.get(`/${path}`, controllerObj.getAll);
    router.get(`/${path}/:id`, controllerObj.getOne);
    router.post(`/${path}`, controllerObj.create);
    router.put(`/${path}/:id`, controllerObj.update);
    router.delete(`/${path}/:id`, controllerObj.delete);
};

setupCrud('seasons', ctrl.seasons);
setupCrud('periods', ctrl.periods);
setupCrud('recommendations', ctrl.recommendations);
setupCrud('activities', ctrl.activities);
setupCrud('before-planting', ctrl.beforePlanting);
setupCrud('alerts', ctrl.alerts);
setupCrud('women-farmer', ctrl.womenFarmer);
setupCrud('audit-logs', ctrl.auditLogs);

export default router;
