import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import {
  requestId,
  sanitizeInput,
  requestTimeout,
} from './middleware/security';
import { logger } from './middleware/logger';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Request ID für Audit
app.use(requestId);

// Logger
app.use(logger);

// Security Headers (erweitert)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));

// CORS mit strikten Einstellungen
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 Stunden
}));

// Body Parser mit Limits
app.use(express.json({
  limit: '10kb', // Kleine Limits gegen DoS
  verify: (req: any, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      res.status(400).json({ error: 'Ungültiges JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10kb',
  parameterLimit: 10, // Max 10 Parameter
}));

// Request Timeout
app.use(requestTimeout(30000)); // 30 Sekunden

// Input Sanitization
app.use(sanitizeInput);

// Rate Limiting
app.use('/api/', rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Health Check (ohne Rate Limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint nicht gefunden' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Graceful Shutdown
const server = app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`🔒 Sicherheitsmodus: ${process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'}`);
});

// Shutdown Handler
const shutdown = async () => {
  console.log('🛑 Server wird heruntergefahren...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
