import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateApiKey, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require API key authentication
router.use(authenticateApiKey);

// Get all forms
router.get('/forms', async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.userId;

    const forms = await prisma.form.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        views: true,
        submissionCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, forms });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch forms', details: error.message });
  }
});

// Get single form
router.get('/forms/:id', async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const { id } = req.params;

    const form = await prisma.form.findFirst({
      where: { id, userId },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({ success: true, form });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch form', details: error.message });
  }
});

// Get submissions for a form
router.get('/forms/:formId/submissions', async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const { formId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    // Verify form belongs to user
    const form = await prisma.form.findFirst({
      where: { id: formId, userId },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const submissions = await prisma.submission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.submission.count({ where: { formId } });

    res.json({
      success: true,
      submissions,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch submissions', details: error.message });
  }
});

// Get single submission
router.get('/submissions/:id', async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { form: true },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Verify form belongs to user
    if (submission.form.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, submission });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch submission', details: error.message });
  }
});

// Get webhooks
router.get('/webhooks', async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.userId;

    const webhooks = await prisma.webhook.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        url: true,
        events: true,
        isActive: true,
        lastTriggered: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, webhooks });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch webhooks', details: error.message });
  }
});

// Get API usage stats
router.get('/usage', async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const { days = '30' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const apiCalls = await prisma.apiLog.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });

    res.json({
      success: true,
      usage: {
        apiCalls,
        period: `last ${days} days`,
        limit: user?.plan?.apiCallsLimit || 1000,
        remaining: Math.max(0, (user?.plan?.apiCallsLimit || 1000) - apiCalls),
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch usage stats', details: error.message });
  }
});

export default router;
