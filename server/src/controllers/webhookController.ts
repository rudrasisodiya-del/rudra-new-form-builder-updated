import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { generateWebhookSecret } from '../utils/generateApiKey';
import { testWebhook as testWebhookDispatch } from '../utils/webhookDispatcher';

const prisma = new PrismaClient();

// Get all webhooks for user
export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.userId;

    const webhooks = await prisma.webhook.findMany({
      where: { userId },
      include: { form: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, webhooks });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch webhooks', details: error.message });
  }
};

// Create webhook
export const createWebhook = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const { name, url, formId, events } = req.body;

    const webhook = await prisma.webhook.create({
      data: {
        userId,
        name,
        url,
        formId: formId || null,
        events: events || ['form.submitted'],
        secret: generateWebhookSecret(),
      },
    });

    res.status(201).json({ success: true, webhook });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create webhook', details: error.message });
  }
};

// Delete webhook
export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.userId;

    const webhook = await prisma.webhook.findFirst({
      where: { id, userId },
    });

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    await prisma.webhook.delete({ where: { id } });

    res.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete webhook', details: error.message });
  }
};

// Get webhook logs
export const getWebhookLogs = async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;

    const logs = await prisma.webhookLog.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch webhook logs', details: error.message });
  }
};

// Test webhook
export const testWebhook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.userId;

    // Verify webhook belongs to user
    const webhook = await prisma.webhook.findFirst({
      where: { id, userId },
    });

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const result = await testWebhookDispatch(id);

    if (result.success) {
      res.json({ success: true, message: result.message, statusCode: result.statusCode });
    } else {
      res.status(400).json({ success: false, error: result.message, statusCode: result.statusCode });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to test webhook', details: error.message });
  }
};

// Update webhook
export const updateWebhook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.userId;
    const { name, url, formId, events, isActive } = req.body;

    const webhook = await prisma.webhook.findFirst({
      where: { id, userId },
    });

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const updatedWebhook = await prisma.webhook.update({
      where: { id },
      data: {
        name: name !== undefined ? name : webhook.name,
        url: url !== undefined ? url : webhook.url,
        formId: formId !== undefined ? (formId || null) : webhook.formId,
        events: events !== undefined ? events : webhook.events,
        isActive: isActive !== undefined ? isActive : webhook.isActive,
      },
    });

    res.json({ success: true, webhook: updatedWebhook });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update webhook', details: error.message });
  }
};
