# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 1b. Minimal dependencies for migration runner only
FROM base AS migrate-deps
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY app/db/migrate-package.json ./package.json
RUN npm install


# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
ARG NEXTAUTH_SECRET
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB
ARG CLIENT_ID_GITHUB
ARG CLIENT_SECRET_GITHUB
ARG CLIENT_ID_GOOGLE
ARG CLIENT_SECRET_GOOGLE

ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV POSTGRES_USER=$POSTGRES_USER
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD
ENV POSTGRES_DB=$POSTGRES_DB
ENV CLIENT_ID_GITHUB=$CLIENT_ID_GITHUB
ENV CLIENT_SECRET_GITHUB=$CLIENT_SECRET_GITHUB
ENV CLIENT_ID_GOOGLE=$CLIENT_ID_GOOGLE
ENV CLIENT_SECRET_GOOGLE=$CLIENT_SECRET_GOOGLE

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy minimal node_modules needed by migration runner (typeorm, pg, bcrypt)
COPY --from=migrate-deps /app/node_modules ./node_modules

# Copy migration runner and migration files
COPY --from=builder /app/app/db/runMigrations.js ./app/db/runMigrations.js
COPY --from=builder /app/app/db/migrations ./app/db/migrations

EXPOSE 3000

CMD ["node", "server.js"]
