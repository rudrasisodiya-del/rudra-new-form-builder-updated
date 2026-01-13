import express from 'express';
import {
  getForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  publishForm,
  incrementViews,
  getPublicForm,
  parseFormUrl,
  parseFormHtml,
} from '../controllers/formController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public/:id', getPublicForm);
router.post('/:id/view', incrementViews);

// Form import/parsing routes (place before /:id routes to prevent route conflicts)
router.post('/import/url', authenticate, parseFormUrl);
router.post('/import/html', authenticate, parseFormHtml);

// Protected routes (authentication required)
router.get('/', authenticate, getForms);
router.get('/:id', authenticate, getForm);
router.post('/', authenticate, createForm);
router.put('/:id', authenticate, updateForm);
router.delete('/:id', authenticate, deleteForm);
router.post('/:id/publish', authenticate, publishForm);

export default router;
