
CFLAGS = -Wall -fPIC

MODE ?= dev

ifeq ($(MODE), prod)
	CFLAGS += -O3
else
	CFLAGS += -O0 -g
endif

all: engine.so

engine.so: engine.c
	gcc $(CFLAGS) -shared -o engine.so engine.c

clean:
	rm engine.so

