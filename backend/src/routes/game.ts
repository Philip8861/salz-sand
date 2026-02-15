import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { gameActionSchema } from '../utils/validation';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const prisma = new PrismaClient();

// Cooldown für Aktionen (Anti-Spam)
const ACTION_COOLDOWNS: Record<string, number> = {
  collect_salt: 2000, // 2 Sekunden
  collect_sand: 2000,
  sell_resources: 1000,
};

// Cooldown Tracking
const cooldowns = new Map<string, number>();

const checkCooldown = (userId: string, actionType: string): boolean => {
  const key = `${userId}:${actionType}`;
  const lastAction = cooldowns.get(key);
  const cooldown = ACTION_COOLDOWNS[actionType] || 1000;

  if (lastAction && Date.now() - lastAction < cooldown) {
    return false;
  }

  cooldowns.set(key, Date.now());
  return true;
};

// Validierung von Ressourcen-Mengen
const validateResourceAmount = (amount: number, max: number): number => {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
    return 0;
  }
  return Math.floor(Math.min(amount, max));
};

router.use(authenticate);

// Get Game Data (server-spezifisch)
router.get('/data', async (req: AuthRequest, res) => {
  try {
    if (!req.serverId) {
      return res.status(400).json({ error: 'Kein Server ausgewählt' });
    }

    const gameData = await prisma.gameData.findUnique({
      where: {
        userId_serverId: {
          userId: req.userId!,
          serverId: req.serverId,
        }
      },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            settings: true,
          }
        }
      }
    });

    if (!gameData) {
      return res.status(404).json({ error: 'Spieldaten nicht gefunden' });
    }

    // Nur notwendige Daten senden
    res.json({
      gameData: {
        level: gameData.level,
        experience: gameData.experience,
        coins: gameData.coins,
        salt: gameData.salt,
        sand: gameData.sand,
        lastAction: gameData.lastAction,
      },
      server: gameData.server,
    });
  } catch (error) {
    console.error('Get game data error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Spieldaten' });
  }
});

// Game Action mit Anti-Cheat
router.post('/action', strictRateLimiter, async (req: AuthRequest, res) => {
  try {
    const validated = gameActionSchema.parse(req.body);
    const { actionType, data } = validated;

    // Cooldown Check
    if (!checkCooldown(req.userId!, actionType)) {
      return res.status(429).json({ error: 'Aktion zu schnell. Bitte warten.' });
    }

    if (!req.serverId) {
      return res.status(400).json({ error: 'Kein Server ausgewählt' });
    }

    // Hole Server-Einstellungen
    const server = await prisma.server.findUnique({
      where: { id: req.serverId },
    });

    if (!server || server.status !== 'active') {
      return res.status(400).json({ error: 'Server nicht verfügbar' });
    }

    const gameSpeed = (server.settings as any)?.gameSpeed || 1;

    // Hole aktuelle Game Data mit Lock (FOR UPDATE)
    const gameData = await prisma.$transaction(async (tx) => {
      return await tx.gameData.findUnique({
        where: {
          userId_serverId: {
            userId: req.userId!,
            serverId: req.serverId!,
          }
        }
      });
    });

    if (!gameData) {
      return res.status(404).json({ error: 'Spieldaten nicht gefunden' });
    }

    // Serverseitige Game-Logik mit strikter Validierung
    let updatedData = {
      salt: gameData.salt,
      sand: gameData.sand,
      coins: gameData.coins,
      level: gameData.level,
      experience: gameData.experience,
    };

    switch (actionType) {
      case 'collect_salt':
        // Maximal 1 Salz pro Aktion, multipliziert mit Spielgeschwindigkeit
        const saltAmount = Math.floor(1 * gameSpeed);
        updatedData.salt += saltAmount;
        updatedData.experience += Math.floor(5 * gameSpeed);
        break;

      case 'collect_sand':
        // Maximal 1 Sand pro Aktion, multipliziert mit Spielgeschwindigkeit
        const sandAmount = Math.floor(1 * gameSpeed);
        updatedData.sand += sandAmount;
        updatedData.experience += Math.floor(5 * gameSpeed);
        break;

      case 'sell_resources':
        // Validierung der Mengen
        const saltAmount = validateResourceAmount(data?.salt || 0, gameData.salt);
        const sandAmount = validateResourceAmount(data?.sand || 0, gameData.sand);

        if (saltAmount === 0 && sandAmount === 0) {
          return res.status(400).json({ error: 'Keine Ressourcen zum Verkaufen' });
        }

        // Preise serverseitig berechnen (kann nicht manipuliert werden)
        const saltPrice = 10;
        const sandPrice = 5;
        const totalCoins = (saltAmount * saltPrice) + (sandAmount * sandPrice);

        updatedData.coins += totalCoins;
        updatedData.salt -= saltAmount;
        updatedData.sand -= sandAmount;
        updatedData.experience += Math.floor((saltAmount + sandAmount) * 2);
        break;

      default:
        return res.status(400).json({ error: 'Ungültige Aktion' });
    }

    // Level Up Check (serverseitig)
    const expForNextLevel = updatedData.level * 100;
    if (updatedData.experience >= expForNextLevel) {
      updatedData.level += 1;
      updatedData.experience = 0;
      updatedData.coins += 50; // Level Up Bonus
    }

    // Maximalwerte (Anti-Exploit)
    const MAX_LEVEL = 1000;
    const MAX_COINS = 999999999;
    const MAX_RESOURCES = 999999;

    updatedData.level = Math.min(updatedData.level, MAX_LEVEL);
    updatedData.coins = Math.min(updatedData.coins, MAX_COINS);
    updatedData.salt = Math.min(updatedData.salt, MAX_RESOURCES);
    updatedData.sand = Math.min(updatedData.sand, MAX_RESOURCES);

    // Update in Datenbank mit Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prüfe nochmal aktuelle Daten (Optimistic Locking)
      const currentData = await tx.gameData.findUnique({
        where: {
          userId_serverId: {
            userId: req.userId!,
            serverId: req.serverId!,
          }
        }
      });

      if (!currentData) {
        throw new Error('Spieldaten nicht gefunden');
      }

      // Prüfe ob Daten zwischenzeitlich geändert wurden
      if (currentData.lastAction.getTime() > gameData.lastAction.getTime()) {
        throw new Error('Daten wurden zwischenzeitlich geändert');
      }

      const updated = await tx.gameData.update({
        where: {
          userId_serverId: {
            userId: req.userId!,
            serverId: req.serverId!,
          }
        },
        data: {
          salt: updatedData.salt,
          sand: updatedData.sand,
          coins: updatedData.coins,
          level: updatedData.level,
          experience: updatedData.experience,
          lastAction: new Date(),
        }
      });

      // Log Action für Audit
      await tx.gameAction.create({
        data: {
          userId: req.userId!,
          actionType,
          data: {
            ...data,
            timestamp: new Date(),
            ip: req.ip,
            requestId: (req as any).id,
          },
        }
      });

      return updated;
    });

    res.json({
      gameData: {
        level: result.level,
        experience: result.experience,
        coins: result.coins,
        salt: result.salt,
        sand: result.sand,
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ungültige Eingabedaten' });
    }
    console.error('Game Action Error:', error);
    res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Fehler bei der Spielaktion'
        : error.message
    });
  }
});

export default router;
