import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Nicht authentifiziert' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin-Rechte erforderlich' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Fehler bei Admin-Prüfung' });
  }
};
