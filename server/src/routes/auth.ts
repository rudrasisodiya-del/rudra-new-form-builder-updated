import express from 'express';
import { signup, login, getCurrentUser, regenerateApiKey, getApiKey } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.get('/api-key', authenticate, getApiKey);
router.post('/regenerate-api-key', authenticate, regenerateApiKey);

export default router;
