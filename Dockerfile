# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- Dépendances ----
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma
RUN npm install

# ---- Build ----
FROM base AS builder
ARG APP=web
WORKDIR /app
COPY --from=deps /app ./
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npx turbo run build --filter=@odthan/${APP}

# ---- Exécution ----
FROM base AS runner
ARG APP=web
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD npm run start --workspace=@odthan/${APP}
