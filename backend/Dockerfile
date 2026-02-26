# Debian-basiert (nicht Alpine), damit Prisma-Engine mit OpenSSL 3 läuft (Railway/libssl.so.1.1-Fix)
FROM node:20-slim AS builder

WORKDIR /app

# OpenSSL für Prisma Query Engine (Debian slim hat es, explizit sicherstellen)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production Stage (gleiche Basis = gleiches Prisma-Binary)
FROM node:20-slim AS production

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["npm", "start"]
