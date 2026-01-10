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
} from '../controllers/formController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public/:id', getPublicForm);
router.post('/:id/view', incrementViews);

// Protected routes (authentication required)
router.get('/', authenticate, getForms);
router.get('/:id', authenticate, getForm);
router.post('/', authenticate, createForm);
router.put('/:id', authenticate, updateForm);
router.delete('/:id', authenticate, deleteForm);
router.post('/:id/publish', authenticate, publishForm);

export default router;
