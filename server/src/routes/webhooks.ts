import express from 'express';
import {
  getWebhooks,
  createWebhook,
  deleteWebhook,
  getWebhookLogs,
} from '../controllers/webhookController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getWebhooks);
router.post('/', authenticate, createWebhook);
router.delete('/:id', authenticate, deleteWebhook);
router.get('/:webhookId/logs', authenticate, getWebhookLogs);

export default router;
