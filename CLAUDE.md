# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Silver Edge Academy is a full-stack Learning Management System (LMS) for teaching coding to children with gamification features. It's a monorepo using Turborepo with Bun as the package manager.

## Common Commands

```bash
# Install dependencies
bun install

# Development (Docker - primary workflow)
make dev                 # Full stack with hot reload (MongoDB, MinIO, nginx included)
make dev-detached        # Run in background
make dev-down            # Stop environment
make logs                # View all container logs
make logs-backend        # View backend logs only

# Database & Storage
make db-shell            # Open MongoDB shell
make minio-console       # Show MinIO console URL (localhost:9001)

# Build & Lint (via Turborepo)
bun run build            # Build all apps
bun run lint             # Lint all workspaces
```

## Testing

```bash
# Backend tests (local - uses in-memory MongoDB)
cd backend && bun test

# Backend tests (Docker - uses real MongoDB container)
make test                # Run tests in Docker
make test-down           # Clean up test containers
```

`bun test` and `make test` run the same test suite. The difference is `bun test` uses `mongodb-memory-server` (no Docker needed), while `make test` uses a real MongoDB container.

## Architecture

### Monorepo Structure

- `apps/admin` - Admin portal (React + Vite + TypeScript)
- `apps/student` - Student portal (React + Vite + TypeScript)
- `packages/shared` - Shared types and utilities (`@silveredge/shared`)
- `backend` - Express API server (runs on Bun)

### Frontend Architecture (Admin App)

Path alias: `@/*` maps to `./src/*`

Key directories:
- `pages/` - Route components
- `components/` - Reusable UI components
- `contexts/` - React context providers (auth, toast, sidebar, page metadata)
- `services/` - API client functions
- `hooks/` - Custom React hooks
- `mocks/` - MSW mock handlers and data for development
- `lib/` - Utility libraries
- `routes/` - Router configuration

State management:
- React Context for global UI state
- TanStack React Query for server state (configured with 5-min stale time)
- MSW (Mock Service Worker) provides API mocking in development

### Backend Architecture

- Express 4.x REST API
- Mongoose ODM for MongoDB
- Bun runtime (not Node.js)

### Infrastructure

- MongoDB 7 for database
- MinIO for S3-compatible file storage (console at localhost:9001)
- Nginx as reverse proxy in Docker setups

## Tech Stack

- **Runtime**: Bun 1.x
- **Frontend**: React 18, Vite 5, TailwindCSS 4, React Router 7, TanStack Query 5
- **Backend**: Express 4, Mongoose 8
- **Testing**: Vitest (frontend), Bun test (backend)
- **Monorepo**: Turborepo 2.x (workspace management, build/lint/test orchestration)

## Code Conventions

- TypeScript strict mode is enabled across all packages
- ESLint with max-warnings 0 (no warnings allowed)
- Path imports use `@/` alias in frontend apps
- Shared types go in `packages/shared`
