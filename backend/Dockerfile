# ============================================================
# HYTICON — Dockerfile Producción Backend
# Multi-stage build con soporte para Puppeteer y Prisma
# ============================================================

# ── Etapa 1: Build ───────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilar módulos nativos
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig*.json ./
COPY src ./src/

# Generar cliente de Prisma y compilar NestJS
RUN npm run prisma:generate
RUN npm run build

# Eliminar dependencias de desarrollo
RUN npm prune --production

# ── Etapa 2: Runner de Producción ────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Instalar Chromium y dependencias del sistema para Puppeteer en Linux
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Indicar a Puppeteer la ruta del ejecutable de Chromium del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copiar archivos compilados y dependencias
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Script de arranque: aplica migraciones y arranca la API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
