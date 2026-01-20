.PHONY: dev test prod build down logs clean install help

# Default target
.DEFAULT_GOAL := help

# ==================== Setup ====================

install: ## Install all dependencies
	bun install

# ==================== Development ====================

dev: ## Start development environment with hot reload
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up --build

dev-detached: ## Start development environment in background
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up -d --build

dev-down: ## Stop development environment
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# ==================== Testing ====================

test: ## Run tests
	docker compose -f docker-compose.yml -f docker-compose.test.yml --env-file .env.test up --build --abort-on-container-exit

test-down: ## Stop test environment
	docker compose -f docker-compose.yml -f docker-compose.test.yml down -v

# ==================== Production ====================

prod: ## Start production environment
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up --build -d

prod-down: ## Stop production environment
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

build: ## Build all production images
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# ==================== Logs ====================

logs: ## View logs from all containers
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

logs-backend: ## View backend logs
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend

logs-admin: ## View admin frontend logs
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f admin-frontend

logs-student: ## View student frontend logs
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f student-frontend

# ==================== Database ====================

db-shell: ## Open MongoDB shell
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec mongodb mongosh "mongodb://silveredge:silveredge_dev_password@localhost:27017/silveredge_dev?authSource=admin"

# ==================== MinIO ====================

minio-console: ## Open MinIO console URL
	@echo "MinIO Console: http://localhost:9001"
	@echo "Default credentials: minioadmin / minioadmin"

# ==================== Cleanup ====================

clean: ## Remove all containers, volumes, and images
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --rmi local
	docker compose -f docker-compose.yml -f docker-compose.test.yml down -v --rmi local
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v --rmi local

clean-volumes: ## Remove all volumes
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.yml -f docker-compose.test.yml down -v

clean-node: ## Remove all node_modules
	bun run clean
	rm -rf node_modules

# ==================== Help ====================

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
