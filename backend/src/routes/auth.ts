import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { registerSchema, loginSchema } from '../utils/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

// Brute Force Protection für Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 5, // Max 5 Login-Versuche
  message: 'Zu viele Login-Versuche. Bitte in 15 Minuten erneut versuchen.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Brute Force Protection für Registrierung
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 3, // Max 3 Registrierungen pro Stunde
  message: 'Zu viele Registrierungsversuche. Bitte später erneut versuchen.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Account Lockout nach fehlgeschlagenen Versuchen
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 Minuten

const checkAccountLockout = async (email: string): Promise<boolean> => {
  const key = `lockout:${email}`;
  const lockoutUntil = (global as any)[key];
  if (lockoutUntil && Date.now() < lockoutUntil) {
    return true;
  }
  return false;
};

const recordFailedAttempt = async (email: string) => {
  const key = `failed_attempts:${email}`;
  const attempts = ((global as any)[key] || 0) + 1;
  (global as any)[key] = attempts;

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const lockoutKey = `lockout:${email}`;
    (global as any)[lockoutKey] = Date.now() + LOCKOUT_DURATION;
    // Reset attempts nach Lockout
    setTimeout(() => {
      delete (global as any)[key];
    }, LOCKOUT_DURATION);
  }
};

const clearFailedAttempts = (email: string) => {
  delete (global as any)[`failed_attempts:${email}`];
  delete (global as any)[`lockout:${email}`];
};

// Registrierung mit erweiterten Checks
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    const { username, email, password } = validated;

    // Passwort-Stärke prüfen
    const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordStrength.test(password)) {
      return res.status(400).json({
        error: 'Passwort muss Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen enthalten'
      });
    }

    // Prüfe ob User bereits existiert
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Benutzer existiert bereits' });
    }

    // Hash Passwort mit höherer Rundenanzahl
    const hashedPassword = await bcrypt.hash(password, 14);

    // Erstelle User und GameData in Transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          gameData: {
            create: {
              level: 1,
              experience: 0,
              coins: 100,
              salt: 0,
              sand: 0,
            }
          }
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        }
      });

      // Log Registrierung
      await tx.gameAction.create({
        data: {
          userId: newUser.id,
          actionType: 'user_registered',
          data: { timestamp: new Date() },
        }
      });

      return newUser;
    });

    // JWT Token mit kürzerer Gültigkeit
    const token = jwt.sign(
      { userId: user.id, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user,
      token,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ungültige Eingabedaten', details: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Fehler bei der Registrierung' });
  }
});

// Login mit Account Lockout und Server-Auswahl
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    const { email, password, serverId } = validated;

    // Prüfe Account Lockout
    if (await checkAccountLockout(email)) {
      return res.status(429).json({
        error: 'Account temporär gesperrt. Bitte in 15 Minuten erneut versuchen.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await recordFailedAttempt(email);
      // Gleiche Antwort für Sicherheit (keine User-Enumeration)
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await recordFailedAttempt(email);
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Erfolgreicher Login - Reset Failed Attempts
    clearFailedAttempts(email);

    // Wenn Server-ID angegeben, prüfe ob Server existiert, aktiv ist und Startzeit erreicht wurde
    let selectedServer = null;
    if (serverId) {
      selectedServer = await prisma.server.findUnique({
        where: { id: serverId },
      });

      if (!selectedServer) {
        return res.status(404).json({ error: 'Server nicht gefunden' });
      }

      if (selectedServer.status !== 'active') {
        return res.status(400).json({ error: 'Server ist nicht aktiv' });
      }

      // Prüfe ob Startzeit erreicht wurde
      const now = new Date();
      if (selectedServer.startTime && selectedServer.startTime > now) {
        return res.status(400).json({ 
          error: 'Server ist noch nicht verfügbar',
          startTime: selectedServer.startTime.toISOString(),
        });
      }

      // Erstelle oder hole GameData für diesen Server
      await prisma.gameData.upsert({
        where: {
          userId_serverId: {
            userId: user.id,
            serverId: serverId,
          },
        },
        create: {
          userId: user.id,
          serverId: serverId,
          level: 1,
          experience: 0,
          coins: 100,
          salt: 0,
          sand: 0,
        },
        update: {},
      });
    }

    // Log Login
    await prisma.gameAction.create({
      data: {
        userId: user.id,
        actionType: 'user_login',
        data: { timestamp: new Date(), ip: req.ip, serverId: serverId || null },
      }
    });

    const token = jwt.sign(
      { userId: user.id, serverId: serverId || null, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Hole alle verfügbaren Server (nur die, deren Startzeit erreicht wurde)
    const now = new Date();
    const servers = await prisma.server.findMany({
      where: {
        status: 'active',
        OR: [
          { startTime: { lte: now } },
          { startTime: null },
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        settings: true,
        startTime: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
      server: selectedServer ? {
        id: selectedServer.id,
        name: selectedServer.name,
        settings: selectedServer.settings,
      } : null,
      servers, // Alle verfügbaren Server für Frontend
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ungültige Eingabedaten' });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Fehler beim Login' });
  }
});

// Get Current User (mit Server-Informationen)
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Nicht authentifiziert' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Wenn Server ausgewählt, hole GameData für diesen Server
    let gameData = null;
    let server = null;
    if (req.serverId) {
      const data = await prisma.gameData.findUnique({
        where: {
          userId_serverId: {
            userId: req.userId,
            serverId: req.serverId,
          }
        },
        include: {
          server: {
            select: {
              id: true,
              name: true,
              description: true,
              settings: true,
            }
          }
        }
      });
      if (data) {
        gameData = {
          level: data.level,
          experience: data.experience,
          coins: data.coins,
          salt: data.salt,
          sand: data.sand,
          lastAction: data.lastAction,
        };
        server = data.server;
      }
    }

    res.json({ user, gameData, server });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Benutzers' });
  }
});

export default router;
