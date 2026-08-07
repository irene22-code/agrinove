import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret === 'YOUR_JWT_SECRET') {
    console.warn('JWT_SECRET is not configured properly in .env');
    return res.status(500).json({ success: false, error: 'Server configuration error: Missing JWT Secret' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // JWT from Supabase contains 'sub' as user ID
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // The role might be in user_metadata from the Supabase JWT, or we might need to fetch it.
    // We'll extract it from user_metadata or app_metadata if available.
    const role = req.user?.user_metadata?.role || req.user?.role;
    
    if (!role || !roles.includes(role)) {
       return res.status(403).json({ success: false, error: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};
