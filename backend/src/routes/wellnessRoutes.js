import express from 'express';
import { getWellnessData, logMood, getBurnoutScore, getWeeklyWorkload, getFocusBreakRatio, getRecommendations } from '../controllers/wellnessController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get aggregated wellness data for dashboard
router.get('/', getWellnessData);

// Log daily mood and focus hours
router.post('/log', logMood);

// Get burnout score for user
router.get('/burnout', getBurnoutScore);

// Weekly workload stats
router.get('/weekly', getWeeklyWorkload);

// Focus vs break ratio
router.get('/focus-break', getFocusBreakRatio);

// Smart recommendations
router.get('/recommendations', getRecommendations);

export default router;
