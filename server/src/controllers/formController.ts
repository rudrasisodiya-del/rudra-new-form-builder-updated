import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { parseFormFromUrl, parseHtmlForm } from '../utils/formParser';

const prisma = new PrismaClient();

// Get all forms for current user
export const getForms = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.userId;

    const forms = await prisma.form.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    res.json({ success: true, forms });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch forms', details: error.message });
  }
};

// Get single form
export const getForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.userId;

    const form = await prisma.form.findFirst({
      where: { id, userId },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({ success: true, form });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch form', details: error.message });
  }
};

// Create form
export const createForm = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const { title, description, fields, settings } = req.body;

    // Check user's form limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plan: true,
        _count: { select: { forms: true } },
      },
    });

    if (user!._count.forms >= user!.plan!.formLimit) {
      return res.status(403).json({
        error: 'Form limit reached',
        message: `You have reached your plan limit of ${user!.plan!.formLimit} forms. Please upgrade your plan.`,
      });
    }

    const form = await prisma.form.create({
      data: {
        userId,
        title: title || 'Untitled Form',
        description: description || '',
        fields: fields || [],
        settings: settings || {},
        status: 'DRAFT',
      },
    });

    res.status(201).json({ success: true, form });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create form', details: error.message });
  }
};

// Update form
export const updateForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.userId;
    const { title, description, fields, settings, status } = req.body;

    const form = await prisma.form.findFirst({
      where: { id, userId },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const updatedForm = await prisma.form.update({
      where: { id },
      data: {
        title,
        description,
        fields,
        settings,
        status,
        ...(status === 'PUBLISHED' && !form.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });

    res.json({ success: true, form: updatedForm });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update form', details: error.message });
  }
};

// Delete form
export const deleteForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.userId;

    const form = await prisma.form.findFirst({
      where: { id, userId },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    await prisma.form.delete({ where: { id } });

    res.json({ success: true, message: 'Form deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete form', details: error.message });
  }
};

// Publish form
export const publishForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.userId;

    const form = await prisma.form.findFirst({
      where: { id, userId },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const updatedForm = await prisma.form.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    res.json({ success: true, form: updatedForm });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to publish form', details: error.message });
  }
};

// Get public form (no authentication required)
export const getPublicForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const form = await prisma.form.findFirst({
      where: {
        id,
        status: 'PUBLISHED' // Only return published forms
      },
    });

    if (!form) {
      return res.status(404).json({
        error: 'Form not found',
        message: 'This form does not exist or is not published yet.'
      });
    }

    // Increment view count
    await prisma.form.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({ success: true, form });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch form', details: error.message });
  }
};

// Increment form views
export const incrementViews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.form.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to increment views', details: error.message });
  }
};

// Parse form from URL (Google Forms, etc.)
export const parseFormUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Parsing form from URL: ${url}`);
    const parsedForm = await parseFormFromUrl(url);

    res.json({
      success: true,
      title: parsedForm.title,
      description: parsedForm.description,
      fields: parsedForm.fields,
      source: new URL(url).hostname,
    });
  } catch (error: any) {
    console.error('Error parsing form URL:', error);
    res.status(500).json({
      error: 'Failed to parse form',
      details: error.message,
    });
  }
};

// Parse form from HTML code
export const parseFormHtml = async (req: Request, res: Response) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML code is required' });
    }

    console.log('Parsing form from HTML code');
    const parsedForm = await parseHtmlForm(html);

    res.json({
      success: true,
      title: parsedForm.title,
      description: parsedForm.description,
      fields: parsedForm.fields,
      source: 'HTML',
    });
  } catch (error: any) {
    console.error('Error parsing HTML form:', error);
    res.status(500).json({
      error: 'Failed to parse HTML',
      details: error.message,
    });
  }
};
