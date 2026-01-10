import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { generateApiKey } from '../utils/generateApiKey';

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
