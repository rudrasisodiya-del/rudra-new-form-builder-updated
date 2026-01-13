import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { dispatchWebhooks } from '../utils/webhookDispatcher';
import { sendSubmissionNotification } from '../utils/emailService';

const prisma = new PrismaClient();

// Submit form (public endpoint)
export const submitForm = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const data = req.body;

    const form = await prisma.form.findUnique({ where: { id: formId } });

    if (!form || form.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Form not found or not published' });
    }

    const submission = await prisma.submission.create({
      data: {
        formId,
        data,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'NEW',
      },
    });

    // Increment submission count
    await prisma.form.update({
      where: { id: formId },
      data: { submissionCount: { increment: 1 } },
    });

    // Dispatch webhooks asynchronously (don't wait for completion)
    dispatchWebhooks(formId, form.title, submission.id, data).catch(err => {
      console.error('Webhook dispatch error:', err);
    });

    // Send email notification if user has enabled it
    try {
      const formOwner = await prisma.user.findUnique({
        where: { id: form.userId },
        select: { email: true, notifyEmail: true, notifySubmissions: true }
      });

      if (formOwner && formOwner.notifyEmail && formOwner.notifySubmissions) {
        sendSubmissionNotification(formOwner.email, {
          formTitle: form.title,
          formId: form.id,
          submissionId: submission.id,
          submissionData: data,
          submittedAt: submission.createdAt.toISOString()
        }).catch(err => {
          console.error('Email notification error:', err);
        });
      }
    } catch (emailError) {
      console.error('Error checking notification preferences:', emailError);
    }

    res.status(201).json({ success: true, message: 'Form submitted successfully', submission });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit form', details: error.message });
  }
};

// Get submissions for a form
export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, submissions });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch submissions', details: error.message });
  }
};

// Get single submission
export const getSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { form: true },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ success: true, submission });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch submission', details: error.message });
  }
};

// Update submission status
export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const submission = await prisma.submission.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, submission });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update submission', details: error.message });
  }
};

// Delete submission
export const deleteSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.submission.delete({ where: { id } });

    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete submission', details: error.message });
  }
};
