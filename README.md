# Salz&Sand - Browsergame

Ein sicheres, professionelles Browsergame mit serverseitiger Validierung.

## 🚀 Setup

### Voraussetzungen
- Node.js 18+
- PostgreSQL Datenbank (Railway)
- npm oder yarn

### Backend Setup

1. In `backend/` Ordner wechseln:
```bash
cd backend
```

2. Dependencies installieren:
```bash
npm install
```

3. `.env` Datei ist bereits erstellt mit Railway Connection String

4. Prisma Setup:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Server starten:
```bash
npm run dev
```

### Frontend Setup

1. In `frontend/` Ordner wechseln:
```bash
cd frontend
```

2. Dependencies installieren:
```bash
npm install
```

3. Development Server starten:
```bash
npm run dev
```

## 🔒 Sicherheitsfeatures

- ✅ Alle Game-Logik serverseitig
- ✅ JWT Authentifizierung
- ✅ Rate Limiting
- ✅ Input Validation & Sanitization
- ✅ SQL Injection Prevention (Prisma)
- ✅ XSS Prevention
- ✅ CORS Konfiguration
- ✅ Helmet.js Security Headers
- ✅ Passwort Hashing (bcrypt)
- ✅ Transaction-basierte Updates
- ✅ Account Lockout nach fehlgeschlagenen Versuchen
- ✅ Cooldowns für Game Actions
- ✅ Brute Force Protection
- ✅ Request Timeout Protection

## 📁 Projektstruktur

```
Salz&Sand/
├── backend/          # Node.js + Express API
├── frontend/         # React Frontend
└── README.md
```

## 🎮 Game Features

- Benutzer-Registrierung & Login
- Salz & Sand sammeln
- Ressourcen verkaufen
- Level-System mit Erfahrungspunkten
- Münzen-System

## 🚢 Deployment

Für Production:
1. Backend auf Vercel/Railway/Render deployen
2. PostgreSQL Datenbank (Railway)
3. Frontend auf Vercel/Netlify deployen
4. Environment Variables setzen
