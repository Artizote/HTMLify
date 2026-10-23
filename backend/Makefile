# HTMLify Backend

.PHONY: all banner dirs install dev build start clean

PYTHON := $(shell command -v python3 2>/dev/null || command -v python 2>/dev/null || command -v py 2>/dev/null)
PIP := $(PYTHON) -m pip


all: dev

banner:
	@ echo " ▄▄▄▄   ┓┏┏┳┓┳┳┓┓ •┏   "
	@ echo " ████   ┣┫ ┃ ┃┃┃┃ ┓╋┓┏ "
	@ echo " ▀▀▀▀   ┛┗ ┻ ┛ ┗┗┛┗┛┗┫ "
	@ echo " $$(date '+%a %b %d %H:%M:%S') ┛"

config.json:
	@echo '{"SECRET_KEY": "session_key", "SERVER_NAME": "localhost:3000"}' > config.json

dirs:
	@ mkdir -p files
	@ mkdir -p files/blob
	@ mkdir -p files/dp
	@ mkdir -p files/tmp
	@ mkdir -p files/qr
	@ mkdir -p instance

install:
	$(PIP) install -r requirements.txt

dev: config.json dirs banner
	@ $(PYTHON) -m app

build:
	$(PYTHON) -m compileall .

start: config.json dirs banner build
	uvicorn app:app --host 0.0.0.0 --port 8000

clean:
	@ find . -type d -name "__pycache__" -exec rm -rf {} +
	@ find . -type f \( -name "*.pyc" -o -name "*.pyo" \) -delete
	@ rm -rf files/qr
	@ rm -rf files/tmp
	@ echo "Cleaned"

