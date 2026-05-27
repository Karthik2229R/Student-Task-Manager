import express from 'express';
import { generateSubtasks } from '../controllers/breakdownController.js';
import { protect } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';

const router = express.Router();

// Route is protected via JWT auth middleware
router.post(
  '/',
  protect,
  [
    body('taskTitle').notEmpty().withMessage('Task title is required to generate subtasks'),
  ],
  generateSubtasks
);

export default router;
