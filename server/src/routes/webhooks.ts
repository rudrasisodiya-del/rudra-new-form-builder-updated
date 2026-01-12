import express from 'express';
import {
  getWebhooks,
  createWebhook,
  deleteWebhook,
  getWebhookLogs,
  testWebhook,
  updateWebhook,
} from '../controllers/webhookController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getWebhooks);
router.post('/', authenticate, createWebhook);
router.put('/:id', authenticate, updateWebhook);
router.delete('/:id', authenticate, deleteWebhook);
router.post('/:id/test', authenticate, testWebhook);
router.get('/:webhookId/logs', authenticate, getWebhookLogs);

export default router;
