import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskStats,
  getTaskAnalytics,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';

const router = express.Router();

// All routes are protected
router.use(protect);

// CRUD
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']),
    body('status').optional().isIn(['Pending', 'Completed', 'Overdue']),
    body('dueDate').optional().isISO8601().withMessage('Valid due date required'),
  ],
  createTask
);
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/analytics', getTaskAnalytics);
router.put(
  '/:id',
  [
    body('priority').optional().isIn(['Low', 'Medium', 'High']),
    body('status').optional().isIn(['Pending', 'Completed', 'Overdue']),
    body('dueDate').optional().isISO8601().withMessage('Valid due date required'),
  ],
  updateTask
);
router.delete('/:id', deleteTask);

export default router;
