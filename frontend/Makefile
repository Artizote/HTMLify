# HTMLify Frontend

.PHONY: all banner install dirs dev build start clean

SRCS := $(shell find app lib components hooks public -type f) pnpm-lock.yaml
PNPM := $(shell command -v pnpm 2>/dev/null)


all: dev

banner:
	@ echo " ▄▄▄▄   ┓┏┏┳┓┳┳┓┓ •┏   "
	@ echo " ████   ┣┫ ┃ ┃┃┃┃ ┓╋┓┏ "
	@ echo " ▀▀▀▀   ┛┗ ┻ ┛ ┗┗┛┗┛┗┫ "
	@ echo " $$(date '+%a %b %d %H:%M:%S') ┛"

install:
	$(PNPM) install

dev: banner
	@ $(PNPM) dev

.next/BUILD_ID: $(SRCS)
	$(PNPM) build

build: .next/BUILD_ID

start: banner build
	$(PNPM) start

clean:
	@ rm -rf .next
	@ echo "Cleaned"

