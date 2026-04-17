.PHONY: install install-frontend install-backend run run-frontend run-backend build lint format format-check clean

PYTHON_CMD := $(shell command -v python3 >/dev/null 2>&1 && echo python3 || echo python)
PIP_CMD := $(shell command -v uv >/dev/null 2>&1 && echo "uv pip" || echo "pip")
VENV_ACTIVE_CMD := $(shell command -v uv >/dev/null 2>&1 && echo "source .venv/bin/activate" || echo "source .venv/bin/activate")

all: install run

install: install-frontend install-backend

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && ${PYTHON_CMD} setup.py && ${PIP_CMD} install -r requirements.txt

dev:
	@echo "Starting fullstack application..."
	@make -j 2 run-backend run-frontend

run-frontend:
	@echo "Starting frontend dev server..."
	cd frontend && pnpm dev -p 4000

run-backend:
	@echo "Starting backend server..."
	cd backend && ${VENV_ACTIVE_CMD} && python -m app

build:
	@echo "Building frontend..."
	cd frontend && pnpm build

lint:
	@echo "Linting frontend..."
	cd frontend && pnpm lint

lint-fix:
	@echo "Linting frontend..."
	cd frontend && pnpm lint:fix

format:
	@echo "Formatting frontend..."
	cd frontend && pnpm format:fix

format-check:
	@echo "Checking formatting..."
	cd frontend && pnpm format:check

clean:
	@echo "Cleaning project..."
	rm -rf frontend/node_modules
	rm -rf frontend/.next
	rm -rf backend/instance
	rm -rf backend/.venv
	rm -rf backend/__pycache__
