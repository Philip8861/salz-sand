# Multi-stage build für optimale Image-Größe
FROM node:18-alpine AS builder

WORKDIR /app

# Kopiere package files
COPY package*.json ./
COPY prisma ./prisma/

# Installiere Dependencies
RUN npm ci

# Kopiere Source Code
COPY . .

# Generiere Prisma Client und baue TypeScript
RUN npm run prisma:generate
RUN npm run build

# Production Stage
FROM node:18-alpine AS production

WORKDIR /app

# Kopiere package files
COPY package*.json ./
COPY prisma ./prisma/

# Installiere nur Production Dependencies
RUN npm ci --only=production

# Kopiere gebaute Dateien vom Builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Exponiere Port
EXPOSE 3000

# Start Command
CMD ["npm", "start"]
