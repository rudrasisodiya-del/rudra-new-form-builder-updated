import express from 'express';
import {
  submitForm,
  getSubmissions,
  getSubmission,
  updateSubmissionStatus,
  deleteSubmission,
} from '../controllers/submissionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/:formId/submit', submitForm); // Public endpoint
router.get('/form/:formId', authenticate, getSubmissions);
router.get('/:id', authenticate, getSubmission);
router.put('/:id/status', authenticate, updateSubmissionStatus);
router.delete('/:id', authenticate, deleteSubmission);

export default router;
