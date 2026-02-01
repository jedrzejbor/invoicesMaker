FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy all package.json files for proper workspace resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Build API
WORKDIR /app/apps/api
RUN pnpm db:generate

EXPOSE 3001

CMD ["pnpm", "start:dev"]
