import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Interner Serverfehler' 
      : err.message
  });
};
