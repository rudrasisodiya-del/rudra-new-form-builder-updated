import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { generateApiKey } from '../utils/generateApiKey';
import { sendEmail } from '../utils/emailService';

const prisma = new PrismaClient();

// Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, company } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get free plan
    let freePlan = await prisma.plan.findFirst({ where: { name: 'free' } });

    // Create free plan if doesn't exist
    if (!freePlan) {
      freePlan = await prisma.plan.create({
        data: {
          name: 'free',
          displayName: 'Free Plan',
          price: 0,
          billingPeriod: 'monthly',
          formLimit: 5,
          submissionLimit: 100,
          storageLimit: 100,
          teamMembers: 1,
          apiCallsLimit: 1000,
          features: ['Basic form builder', '5 forms', '100 submissions/month'],
        },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company: company || '',
        planId: freePlan.id,
        apiKey: generateApiKey(),
        role: 'USER',
      },
    });

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'pabbly-forms-secret-key-2024';
    const signOptions: SignOptions = { expiresIn: '7d' };
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      signOptions
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed', details: error.message });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive. Please contact support.' });
    }

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'pabbly-forms-secret-key-2024';
    const signOptions: SignOptions = { expiresIn: '7d' };
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      signOptions
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
        apiKey: true,
        plan: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user', details: error.message });
  }
};

// Update profile (including email)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, email, company } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email is already in use by another account' });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (company !== undefined) updateData.company = company;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
};

// Regenerate API key
export const regenerateApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const newApiKey = generateApiKey();

    const user = await prisma.user.update({
      where: { id: userId },
      data: { apiKey: newApiKey },
      select: {
        id: true,
        apiKey: true,
      },
    });

    res.json({
      success: true,
      message: 'API key regenerated successfully',
      apiKey: user.apiKey
    });
  } catch (error: any) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({ error: 'Failed to regenerate API key', details: error.message });
  }
};

// Get API key
export const getApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        apiKey: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      apiKey: user.apiKey,
      createdAt: user.createdAt
    });
  } catch (error: any) {
    console.error('Get API key error:', error);
    res.status(500).json({ error: 'Failed to get API key', details: error.message });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        notifyEmail: true,
        notifySubmissions: true,
        notifyWeeklyReports: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      preferences: {
        emailNotifications: user.notifyEmail,
        formSubmissions: user.notifySubmissions,
        weeklyReports: user.notifyWeeklyReports,
      }
    });
  } catch (error: any) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Failed to get notification preferences', details: error.message });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { emailNotifications, formSubmissions, weeklyReports } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        notifyEmail: emailNotifications !== undefined ? emailNotifications : undefined,
        notifySubmissions: formSubmissions !== undefined ? formSubmissions : undefined,
        notifyWeeklyReports: weeklyReports !== undefined ? weeklyReports : undefined,
      },
      select: {
        notifyEmail: true,
        notifySubmissions: true,
        notifyWeeklyReports: true,
      },
    });

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: {
        emailNotifications: user.notifyEmail,
        formSubmissions: user.notifySubmissions,
        weeklyReports: user.notifyWeeklyReports,
      }
    });
  } catch (error: any) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences', details: error.message });
  }
};

// Send test email
export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate test email HTML
    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Email Notifications Enabled!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your test email was sent successfully</p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; margin: 0 0 16px 0;">Hi ${user.name || 'there'},</p>

            <p style="color: #6b7280; margin: 0 0 24px 0;">
              Great news! Your email notifications are now working correctly. You will receive emails when:
            </p>

            <ul style="color: #6b7280; margin: 0 0 24px 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Someone submits one of your forms</li>
              <li style="margin-bottom: 8px;">You receive your weekly analytics report (if enabled)</li>
              <li style="margin-bottom: 8px;">Important account updates occur</li>
            </ul>

            <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #10b981;">
              <p style="color: #065f46; margin: 0; font-weight: 600;">
                This is a test email to confirm your notification settings are working.
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 24px;">
              <a href="http://localhost:5173/dashboard"
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Go to Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">Sent by Pabbly Form Builder</p>
            <p style="margin: 8px 0 0 0;">This is a test email sent at ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail(
      user.email,
      'Test Email - Notifications Enabled!',
      testEmailHtml
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        previewUrl: result.previewUrl || null,
        email: user.email,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email',
        details: result.message,
      });
    }
  } catch (error: any) {
    console.error('Send test email error:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
};
