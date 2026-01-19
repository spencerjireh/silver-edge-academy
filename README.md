# Silver Edge Academy

A gamified Learning Management System (LMS) designed to teach coding to children ages 8-18.

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat&logo=vite&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.0.0-FF6B6B?style=flat&logo=bun&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38BDF8?style=flat&logo=tailwindcss&logoColor=black)

## About

Silver Edge Academy provides an engaging coding education platform with gamification features including XP, levels, badges, and virtual shops. The system features dual portals:

- **Student Portal**: Crystal Glass design system with intuitive navigation, course learning paths, code editor with JavaScript/Python support, and gamification celebrations
- **Admin Portal**: Professional minimal interface for teachers and administrators to manage users, courses, classes, rewards, and system settings

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Bun 1.0.0 or later
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd silveredgeacademy

# Install dependencies
bun install

# Copy environment configuration
cp .env.example .env
# Edit .env with your configuration

# Start development environment (MongoDB, MinIO, nginx included)
make dev
```

The application will be available at:
- Admin Portal: http://localhost:5173
- Student Portal: http://localhost:5174
- Backend API: http://localhost:8080
- MinIO Console: http://localhost:9001

## Common Commands

```bash
# Development
make dev                 # Full stack with hot reload
make dev-detached        # Run in background
make dev-down            # Stop environment
make logs                # View all container logs
make logs-backend        # View backend logs only

# Testing
make test                # Run tests in Docker
make test-down           # Clean up test containers

# Build & Lint
bun run build            # Build all apps
bun run lint             # Lint all workspaces

# Database
make db-shell            # Open MongoDB shell
make minio-console       # Show MinIO console URL
```

## Project Structure

```
silveredgeacademy/
├── apps/
│   ├── admin/           # Admin portal (React + Vite + TypeScript)
│   └── student/         # Student portal (React + Vite + TypeScript)
├── packages/
│   └── shared/          # Shared types and utilities (@silveredge/shared)
├── backend/             # Express API server (runs on Bun)
├── nginx/               # Reverse proxy configurations
├── docker-compose.yml   # Base Docker Compose configuration
├── Makefile             # Common commands
└── package.json         # Root workspace configuration
```

### Monorepo

Built with Turborepo for efficient workspace management and build orchestration.

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite 5** - Build tool and dev server
- **TypeScript 5.3** - Type safety
- **TailwindCSS 4** - Utility-first CSS
- **React Router 7** - Client-side routing
- **TanStack Query 5** - Server state management
- **MSW** - API mocking in development

### Backend
- **Express 4** - REST API framework
- **Mongoose 8** - MongoDB ODM
- **Bun 1.0** - JavaScript runtime
- **Zod** - Schema validation
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Infrastructure
- **MongoDB 7** - Database
- **MinIO** - S3-compatible file storage
- **Nginx** - Reverse proxy
- **Docker Compose** - Container orchestration

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# MongoDB
MONGO_USER=silveredge
MONGO_PASSWORD=your_password_here
MONGO_DB=silveredge_db

# MinIO (S3-compatible storage)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
S3_BUCKET=silveredge

# API URL for frontend
VITE_API_URL=http://localhost:8080/api
```

## Documentation

- **Development Guidelines**: [CLAUDE.md](CLAUDE.md)
- **Full Specification**: [unified-spec.md](unified-spec.md)
- **Admin Portal**: [docs/admin-spec.md](docs/admin-spec.md)
- **Student Portal**: [docs/student-spec-v2.md](docs/student-spec-v2.md)
- **Backend API**: [backend-spec.md](backend-spec.md)
- **Database Schema**: [docs/mongodb-schema.md](docs/mongodb-schema.md)

## Development Workflow

This project uses frontend-first development with Mock Service Worker (MSW). All API calls are mocked in development mode, enabling independent frontend development before backend integration.

### Testing

- **Backend tests** (local): `cd backend && bun test` (uses in-memory MongoDB)
- **Backend tests** (Docker): `make test` (uses real MongoDB container)
- **Frontend tests**: `cd apps/admin && bun test` or `cd apps/student && bun test`

### Code Quality

- TypeScript strict mode enabled
- ESLint with max-warnings 0 (no warnings allowed)
- Path imports use `@/` alias in frontend apps
- Shared types go in `packages/shared`

## Infrastructure

### MongoDB
- Database for all application data
- Access shell: `make db-shell`
- Connection via Docker Compose

### MinIO
- S3-compatible object storage for files
- Console: http://localhost:9001 (minioadmin/minioadmin)
- Used for avatar uploads, course assets, etc.

## License

Copyright (c) 2025 Silver Edge Academy. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or modification of this software is strictly prohibited.

---

Built with ❤️ for teaching the next generation of coders.
