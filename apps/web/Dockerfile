FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy all package.json files for proper workspace resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "dev"]
