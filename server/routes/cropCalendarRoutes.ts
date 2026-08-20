import { Router } from 'express';
import { 
  getPublicCrops, 
  getDistricts, 
  getSeasons, 
  getRecommendations, 
  getActivities, 
  getPeriods, 
  getAlerts,
  getBeforePlanting 
} from '../controllers/cropCalendarController';

const router = Router();

router.get('/crops', getPublicCrops);
router.get('/districts', getDistricts);
router.get('/seasons', getSeasons);
router.get('/recommendations', getRecommendations);
router.get('/activities', getActivities);
router.get('/periods', getPeriods);
router.get('/alerts', getAlerts);
router.get('/before-planting', getBeforePlanting);

export default router;
