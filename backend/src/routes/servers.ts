import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { serverSchema, updateServerSchema } from '../utils/validation';

const router = express.Router();
const prisma = new PrismaClient();

// Alle Server auflisten (öffentlich) - nur verfügbare Server
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const servers = await prisma.server.findMany({
      where: {
        OR: [
          { status: 'active', startTime: { lte: now } }, // Aktiv und Startzeit erreicht
          { status: 'active', startTime: null }, // Aktiv ohne Startzeit
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startTime: true,
        settings: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ servers });
  } catch (error) {
    console.error('Get servers error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Server' });
  }
});

// Alle Server auflisten (Admin - inkl. nicht verfügbare)
router.get('/admin/all', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const servers = await prisma.server.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startTime: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ servers });
  } catch (error) {
    console.error('Get all servers error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Server' });
  }
});

// Server-Details abrufen (öffentlich)
router.get('/:id', async (req, res) => {
  try {
    const server = await prisma.server.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startTime: true,
        settings: true,
        createdAt: true,
      },
    });

    if (!server) {
      return res.status(404).json({ error: 'Server nicht gefunden' });
    }

    res.json({ server });
  } catch (error) {
    console.error('Get server error:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Servers' });
  }
});

// Server erstellen (nur Admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const validated = serverSchema.parse(req.body);
    const { name, description, status, startTime, settings } = validated;

    // Wenn startTime in der Zukunft liegt, setze Status auf 'inactive'
    const startDateTime = startTime ? new Date(startTime) : null;
    const now = new Date();
    const finalStatus = startDateTime && startDateTime > now ? 'inactive' : (status || 'inactive');

    const server = await prisma.server.create({
      data: {
        name,
        description,
        status: finalStatus,
        startTime: startDateTime,
        settings: settings || { gameSpeed: 1 },
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startTime: true,
        settings: true,
        createdAt: true,
      },
    });

    // Log Server-Erstellung
    if (req.userId) {
      await prisma.gameAction.create({
        data: {
          userId: req.userId,
          actionType: 'server_created',
          data: { serverId: server.id, serverName: server.name },
        },
      });
    }

    res.status(201).json({ server });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ungültige Eingabedaten', details: error.errors });
    }
    console.error('Create server error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Servers' });
  }
});

// Server aktualisieren (nur Admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const validated = updateServerSchema.parse(req.body);
    const updateData: any = {};

    if (validated.name) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.status) updateData.status = validated.status;
    if (validated.startTime) updateData.startTime = new Date(validated.startTime);
    if (validated.settings) updateData.settings = validated.settings;

    const server = await prisma.server.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startTime: true,
        settings: true,
        updatedAt: true,
      },
    });

    // Log Server-Update
    if (req.userId) {
      await prisma.gameAction.create({
        data: {
          userId: req.userId,
          actionType: 'server_updated',
          data: { serverId: server.id, changes: validated },
        },
      });
    }

    res.json({ server });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Server nicht gefunden' });
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Ungültige Eingabedaten', details: error.errors });
    }
    console.error('Update server error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Servers' });
  }
});

// Server löschen (nur Admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const server = await prisma.server.delete({
      where: { id: req.params.id },
    });

    // Log Server-Löschung
    if (req.userId) {
      await prisma.gameAction.create({
        data: {
          userId: req.userId,
          actionType: 'server_deleted',
          data: { serverId: server.id, serverName: server.name },
        },
      });
    }

    res.json({ message: 'Server erfolgreich gelöscht' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Server nicht gefunden' });
    }
    console.error('Delete server error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Servers' });
  }
});

export default router;
