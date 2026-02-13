# 🚀 Deployment-Anleitung für Salz&Sand

## Übersicht

Dieses Projekt nutzt **Git-basiertes Deployment**: 
- Lokal entwickeln
- `git push` → Automatisches Deployment online

## 🏗️ Architektur

- **Backend**: Railway oder Vercel
- **Frontend**: Vercel oder Netlify
- **Datenbank**: Railway PostgreSQL (bereits eingerichtet)

---

## 📦 Option 1: Railway (Backend) + Vercel (Frontend) - EMPFOHLEN

### Backend auf Railway deployen

1. **Railway Dashboard öffnen**: https://railway.app
2. **Neues Projekt erstellen** → "Deploy from GitHub repo"
3. **Repository verbinden** (oder "New Project" → "Empty Project")
4. **Service hinzufügen**:
   - "New" → "GitHub Repo" → Dein Repository auswählen
   - Oder: "New" → "Empty Service" → Code manuell hochladen

5. **Root Directory setzen**:
   - Settings → Root Directory: `backend`

6. **Environment Variables setzen** (Settings → Variables):
   ```
   DATABASE_URL=postgresql://postgres:gbnJhKJpAxfTNUqiJxPLPGuGIarDxsEy@yamabiko.proxy.rlwy.net:35268/railway?schema=public&connection_limit=10&sslmode=require
   JWT_SECRET=salz-sand-super-secret-jwt-key-2024-change-this-in-production-min-32-chars-long
   JWT_EXPIRES_IN=24h
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://deine-frontend-url.vercel.app
   ```

7. **Build & Deploy**:
   - Railway erkennt automatisch `package.json`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

8. **Domain zuweisen** (optional):
   - Settings → Generate Domain
   - Oder Custom Domain hinzufügen

### Frontend auf Vercel deployen

1. **Vercel Dashboard öffnen**: https://vercel.com
2. **"Add New Project"** → GitHub Repository auswählen
3. **Project Settings**:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables** (Settings → Environment Variables):
   ```
   VITE_API_URL=https://deine-backend-url.railway.app/api
   ```

5. **Deploy**:
   - Vercel deployt automatisch bei jedem `git push`
   - Custom Domain hinzufügen (optional)

---

## 📦 Option 2: Vercel (Backend + Frontend)

### Backend auf Vercel

1. **Vercel Dashboard** → "Add New Project"
2. **Settings**:
   - Framework: **Other**
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://postgres:gbnJhKJpAxfTNUqiJxPLPGuGIarDxsEy@yamabiko.proxy.rlwy.net:35268/railway?schema=public&connection_limit=10&sslmode=require
   JWT_SECRET=salz-sand-super-secret-jwt-key-2024-change-this-in-production-min-32-chars-long
   JWT_EXPIRES_IN=24h
   NODE_ENV=production
   FRONTEND_URL=https://deine-frontend-url.vercel.app
   ```

4. **Vercel.json** ist bereits konfiguriert

### Frontend auf Vercel

1. **Neues Projekt** → Repository auswählen
2. **Settings**:
   - Framework: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**:
   ```
   VITE_API_URL=https://deine-backend-url.vercel.app/api
   ```

---

## 📦 Option 3: Netlify (Frontend) + Railway (Backend)

### Frontend auf Netlify

1. **Netlify Dashboard**: https://netlify.com
2. **"Add new site"** → "Import an existing project" → GitHub
3. **Build settings**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Environment Variables** (Site settings → Environment variables):
   ```
   VITE_API_URL=https://deine-backend-url.railway.app/api
   ```

5. **netlify.toml** ist bereits konfiguriert

---

## 🔄 Git Workflow (Push to Deploy)

### Erster Commit & Push

```bash
# Im Projekt-Root
git add .
git commit -m "Initial commit: Salz&Sand Browsergame"
git branch -M main

# GitHub Repository erstellen (auf github.com)
# Dann:
git remote add origin https://github.com/DEIN-USERNAME/salz-sand.git
git push -u origin main
```

### Normaler Workflow

```bash
# 1. Lokal entwickeln
# 2. Änderungen committen
git add .
git commit -m "Feature: Neue Funktion hinzugefügt"
git push

# 3. Automatisches Deployment läuft!
# - Railway/Vercel baut automatisch
# - Frontend wird automatisch deployed
```

---

## 🔐 Wichtige Environment Variables

### Backend (Railway/Vercel)

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `DATABASE_URL` | PostgreSQL Connection String | Von Railway kopiert |
| `JWT_SECRET` | Mindestens 32 Zeichen | Starkes Secret generieren |
| `JWT_EXPIRES_IN` | `24h` | Token-Gültigkeit |
| `NODE_ENV` | `production` | Production Mode |
| `FRONTEND_URL` | Frontend URL | Für CORS |
| `PORT` | `3000` | Server Port (Railway setzt automatisch) |

### Frontend (Vercel/Netlify)

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `VITE_API_URL` | Backend URL | z.B. `https://backend.railway.app/api` |

---

## ✅ Deployment-Checkliste

- [ ] GitHub Repository erstellt
- [ ] Code zu GitHub gepusht
- [ ] Backend auf Railway/Vercel deployed
- [ ] Frontend auf Vercel/Netlify deployed
- [ ] Environment Variables gesetzt
- [ ] DATABASE_URL korrekt (Railway PostgreSQL)
- [ ] FRONTEND_URL in Backend gesetzt
- [ ] VITE_API_URL in Frontend gesetzt
- [ ] HTTPS aktiv (automatisch bei Vercel/Netlify)
- [ ] Custom Domain eingerichtet (optional)

---

## 🐛 Troubleshooting

### Backend startet nicht
- Prüfe Environment Variables
- Prüfe Build-Logs in Railway/Vercel
- Prisma Client generiert? (`prisma generate` im Build)

### Frontend kann Backend nicht erreichen
- Prüfe `VITE_API_URL` in Frontend
- Prüfe CORS in Backend (`FRONTEND_URL`)
- Prüfe ob Backend läuft (Health Check)

### Datenbank-Verbindung fehlgeschlagen
- Prüfe `DATABASE_URL` (öffentlicher Hostname!)
- Prüfe ob Railway PostgreSQL läuft
- Prüfe SSL Mode (`sslmode=require`)

---

## 🎯 Nächste Schritte nach Deployment

1. **Teste die Live-URLs**:
   - Backend: `https://deine-backend-url.railway.app/health`
   - Frontend: `https://deine-frontend-url.vercel.app`

2. **Registriere einen Test-Account**

3. **Prüfe Logs**:
   - Railway: Deployments → Logs
   - Vercel: Deployments → Logs

4. **Custom Domain** (optional):
   - Vercel: Settings → Domains
   - DNS-Einträge konfigurieren

---

## 📝 Notizen

- **Railway**: Automatisches Deployment bei Git Push
- **Vercel**: Automatisches Deployment bei Git Push
- **Netlify**: Automatisches Deployment bei Git Push
- Alle Services unterstützen **CI/CD** automatisch!

**Workflow**: Entwickeln → Commit → Push → Automatisches Deployment! 🚀
