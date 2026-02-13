import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Max 100 Requests pro IP
  message: 'Zu viele Anfragen von dieser IP, bitte später erneut versuchen.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Max 10 Requests für sensible Endpoints
  message: 'Zu viele Anfragen, bitte später erneut versuchen.',
});
