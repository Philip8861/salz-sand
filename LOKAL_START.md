# Lokal starten (Backend + Datenbank)

**„Verbindung zum Server fehlgeschlagen“** = das Backend läuft nicht. Es muss gestartet werden, bevor du dich registrierst oder anmeldest.

## Backend starten

1. **Windows-Explorer** öffnen und in den Ordner **backend** deines Projekts gehen (Projektordner: **SalzundSand**).
2. **`start-dev.cmd`** **doppelklicken** (oder in der Konsole: `cd backend` dann `.\start-dev.cmd`).
3. Ein schwarzes Fenster erscheint mit „Server läuft auf Port 3000“. **Fenster offen lassen.**
4. In einem **zweiten** Fenster/Konsole das **Frontend** starten: `cd frontend` dann `npm run dev`.
5. Im Browser **http://localhost:5173** öffnen → Registrieren / Anmelden.

## Erledigt für dich

- **`backend/.env`** nutzt eure **Railway-Datenbank** (DATABASE_URL ist gesetzt).
- **`backend/start-dev.cmd`** baut und startet das Backend (per Doppelklick im Explorer starten).

## Option A: Mit Docker (empfohlen)

1. Docker Desktop installieren: https://www.docker.com/products/docker-desktop/
2. Im Projektordner **SalzundSand**:
   ```bash
   npm run db:up
   npm run db:migrate
   npm run dev
   ```
3. Browser: **http://localhost:5173** → Registrieren / Anmelden.

## Option B: Ohne Docker (PostgreSQL schon installiert)

1. Datenbank anlegen (z. B. `createdb salzsand` oder per pgAdmin).
2. In **`backend/.env`** prüfen:  
   `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/salzsand?schema=public`  
   (User/Passwort/Host an deine Installation anpassen.)
3. Im Projektordner:
   ```bash
   npm run db:migrate
   npm run dev
   ```

## Option C: Cloud-Datenbank (z. B. Railway)

1. In **`backend/.env`** die **`DATABASE_URL`** durch die URL aus dem Railway-Dashboard ersetzen.
2. Im Projektordner:
   ```bash
   npm run db:migrate
   npm run dev
   ```

---

**Kurz:** Backend und DB-Konfiguration sind vorbereitet. Mit Docker: `npm run db:up` → `npm run db:migrate` → `npm run dev`. Ohne Docker: PostgreSQL oder Cloud-URL nutzen, dann `npm run db:migrate` und `npm run dev`.
