# syntax=docker/dockerfile:1
# Image Next.js 16 (standalone) optimisée pour Coolify : multi-stage, petite & rapide.
# Base Debian slim (Prisma fonctionne sans config d'engine particulière).

############################
# 1) Dépendances
############################
FROM node:22-slim AS deps
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
# On copie le schéma Prisma avant `npm ci` (postinstall lance `prisma generate`).
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

############################
# 2) Build
############################
FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Les variables NEXT_PUBLIC_* sont INLINÉES au build : il faut les passer en build args.
# (Dans Coolify : cocher "Build Variable" sur ces variables d'environnement.)
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_FACEBOOK_URL
ARG NEXT_PUBLIC_INSTAGRAM_URL
ENV NEXT_TELEMETRY_DISABLED=1

# `npm run build` lance d'abord `prebuild` (prisma generate), puis `next build`.
# Pas besoin de DATABASE_URL ici : le root layout est force-dynamic (aucun prerender).
RUN npm run build

############################
# 3) Runtime (image finale minimale)
############################
FROM node:22-slim AS runner
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

# Sortie standalone : serveur + node_modules tracés
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Garantit le client + le moteur Prisma au runtime (au cas où le tracing ne les inclut pas)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
