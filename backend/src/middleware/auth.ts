import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
  serverId?: string | null;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Nicht authentifiziert' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; serverId?: string | null };
    
    // Prüfe ob User noch existiert
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Benutzer nicht gefunden' });
    }

    req.userId = decoded.userId;
    req.serverId = decoded.serverId || null;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Ungültiger Token' });
  }
};
