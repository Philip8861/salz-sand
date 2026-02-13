import { z } from 'zod';

// Username: Nur alphanumerisch + Unterstrich, 3-20 Zeichen
export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Benutzername muss mindestens 3 Zeichen lang sein')
    .max(20, 'Benutzername darf maximal 20 Zeichen lang sein')
    .regex(/^[a-zA-Z0-9_]+$/, 'Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten')
    .transform(val => val.trim().toLowerCase()),
  email: z.string()
    .email('Ungültige E-Mail-Adresse')
    .max(100, 'E-Mail zu lang')
    .transform(val => val.trim().toLowerCase()),
  password: z.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .max(100, 'Passwort zu lang')
    .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
    .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten')
    .regex(/[@$!%*?&]/, 'Passwort muss mindestens ein Sonderzeichen enthalten'),
});

export const loginSchema = z.object({
  email: z.string()
    .email('Ungültige E-Mail-Adresse')
    .max(100)
    .transform(val => val.trim().toLowerCase()),
  password: z.string().min(1, 'Passwort erforderlich').max(100),
});

export const gameActionSchema = z.object({
  actionType: z.enum(['collect_salt', 'collect_sand', 'sell_resources'], {
    errorMap: () => ({ message: 'Ungültiger Aktionstyp' })
  }),
  data: z.object({
    salt: z.number().int().min(0).max(999999).optional(),
    sand: z.number().int().min(0).max(999999).optional(),
  }).optional(),
});
