import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    (req as AuthRequest).user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;

  if (authReq.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// API Key authentication middleware
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for API key in header
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    // Validate API key format
    if (!apiKey.startsWith('pbk_')) {
      return res.status(401).json({ error: 'Invalid API key format' });
    }

    // Find user by API key
    const user = await prisma.user.findUnique({
      where: { apiKey },
      select: {
        id: true,
        role: true,
        isActive: true,
        plan: {
          select: {
            apiCallsLimit: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Log API call
    await prisma.apiLog.create({
      data: {
        userId: user.id,
        endpoint: req.path,
        method: req.method,
        statusCode: 200,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || undefined,
      }
    });

    // Set user info on request
    (req as AuthRequest).user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error: any) {
    console.error('API key authentication error:', error);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};

// Combined auth - accepts either JWT or API key
export const authenticateJwtOrApiKey = async (req: Request, res: Response, next: NextFunction) => {
  // First try JWT authentication
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
      (req as AuthRequest).user = decoded;
      return next();
    } catch (error) {
      // JWT failed, try API key
    }
  }

  // Try API key authentication
  const apiKey = req.headers['x-api-key'] as string;
  if (apiKey) {
    return authenticateApiKey(req, res, next);
  }

  return res.status(401).json({ error: 'Authentication required. Provide a Bearer token or X-API-Key header.' });
};
