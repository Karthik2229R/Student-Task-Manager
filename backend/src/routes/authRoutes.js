import express from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../controllers/authController.js';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
  ],
  registerUser
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').exists().withMessage('Password required')
  ],
  loginUser
);

// @route   POST /api/auth/logout
router.post('/logout', logoutUser);

// @route   GET /api/auth/me (protected)
router.get('/me', protect, getCurrentUser);

export default router;
