import express from 'express';
import {
  signup,
  login,
  getCurrentUser,
  updateProfile,
  regenerateApiKey,
  getApiKey,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestEmail
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.get('/api-key', authenticate, getApiKey);
router.post('/regenerate-api-key', authenticate, regenerateApiKey);

// Notification preferences
router.get('/notifications', authenticate, getNotificationPreferences);
router.put('/notifications', authenticate, updateNotificationPreferences);

// Test email
router.post('/send-test-email', authenticate, sendTestEmail);

export default router;
