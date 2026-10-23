# HTMLify


.PHONY: all
.PHONY: dev dev-frontend dev-backend
.PHONY: install install-frontend install-backend
.PHONY: build build-frontend build-backend
.PHONY: clean clean-frontend clean-backend



all: dev


dev:
	@make -j 2 dev-frontend dev-backend

dev-frontend:
	@make -C frontend dev

dev-backend:
	@make -C backend dev


install: install-frontend install-backend

install-frontend:
	@make -C frontend install

install-backend:
	@make -C backend install


build: build-frontend build-backend

build-frontend:
	@make -C frontend build

build-fbackend:
	@make -C backend build


start:
	@make -j 2 start-frontend start-backend

start-frontend:
	@make -C frontend start

start-backend:
	@make -C backend start


clean: clean-frontend clean-backend

clean-frontend:
	@make -C frontend clean

clean-backend:
	@make -C bcakend clean


## Editor configs

.PHONY: editor-config-vscode clean-editor-configs

editor-config-vscode:
	rm -rf .vscode
	cp -r editor-configs/vscode .vscode

clean-editor-configs:
	rm -rf .vscode

