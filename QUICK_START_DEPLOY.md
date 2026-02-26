# 🚀 Quick Start: Online Deployment

## Schritt 1: GitHub Repository erstellen

1. Gehe zu https://github.com
2. Klicke auf "New repository"
3. Name: `salz-sand` (oder wie du willst)
4. **WICHTIG**: Lass es **öffentlich** oder **privat** (deine Wahl)
5. Klicke "Create repository"

## Schritt 2: Code zu GitHub pushen

```bash
# Im Projekt-Ordner (z. B. C:\Users\info\Desktop\SalzundSand)
git add .
git commit -m "Initial commit: Salz und Sand Browsergame"

# Ersetze DEIN-USERNAME mit deinem GitHub-Username
git remote add origin https://github.com/DEIN-USERNAME/salz-sand.git
git branch -M main
git push -u origin main
```

## Schritt 3: Backend auf Railway deployen

1. Gehe zu https://railway.app
2. Klicke "New Project" → "Deploy from GitHub repo"
3. Wähle dein Repository aus
4. Railway erkennt automatisch das Backend
5. **WICHTIG**: Setze Environment Variables:
   - Öffne deinen PostgreSQL Service in Railway
   - Kopiere den `DATABASE_URL` (öffentlicher Hostname!)
   - Gehe zu deinem Backend Service → Variables
   - Füge hinzu:
     ```
     DATABASE_URL=postgresql://postgres:gbnJhKJpAxfTNUqiJxPLPGuGIarDxsEy@yamabiko.proxy.rlwy.net:35268/railway?schema=public&connection_limit=10&sslmode=require
     JWT_SECRET=salz-sand-super-secret-jwt-key-2024-change-this-in-production-min-32-chars-long
     JWT_EXPIRES_IN=24h
     NODE_ENV=production
     FRONTEND_URL=https://deine-frontend-url.vercel.app
     ```
6. Railway deployt automatisch!
7. Kopiere die Backend-URL (z.B. `https://salz-sand-backend.railway.app`)

## Schritt 4: Frontend auf Vercel deployen

1. Gehe zu https://vercel.com
2. Klicke "Add New Project"
3. Verbinde GitHub → Wähle dein Repository
4. **Settings**:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build` (automatisch)
   - Output Directory: `dist` (automatisch)
5. **Environment Variables**:
   ```
   VITE_API_URL=https://deine-backend-url.railway.app/api
   ```
   (Ersetze mit deiner Railway Backend-URL)
6. Klicke "Deploy"
7. Kopiere die Frontend-URL (z.B. `https://salz-sand.vercel.app`)

## Schritt 5: Backend CORS aktualisieren

1. Gehe zurück zu Railway → Backend Service
2. Variables → `FRONTEND_URL` aktualisieren:
   ```
   FRONTEND_URL=https://deine-frontend-url.vercel.app
   ```
3. Railway deployt automatisch neu

## ✅ Fertig!

Jetzt:
- **Lokal entwickeln** → `git push` → **Automatisch online!**
- Frontend: https://deine-frontend-url.vercel.app
- Backend: https://deine-backend-url.railway.app

## 🔄 Workflow für die Zukunft

```bash
# 1. Lokal entwickeln
# 2. Änderungen committen
git add .
git commit -m "Neue Funktion hinzugefügt"
git push

# 3. Fertig! Railway und Vercel deployen automatisch
```

---

## 🆘 Hilfe

- **Backend startet nicht?** → Prüfe Railway Logs
- **Frontend kann Backend nicht erreichen?** → Prüfe `VITE_API_URL` und CORS
- **Datenbank-Fehler?** → Prüfe `DATABASE_URL` (öffentlicher Hostname!)

Siehe auch: `DEPLOYMENT.md` für detaillierte Anleitung
