FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy workspace config
COPY package.json bun.lock* ./
COPY packages/shared ./packages/shared
COPY backend ./backend

# Install dependencies
RUN bun install --frozen-lockfile

# Build shared package first
WORKDIR /app/packages/shared
RUN bun run build

# Build the application
WORKDIR /app/backend
RUN bun run build

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["bun", "run", "start"]
