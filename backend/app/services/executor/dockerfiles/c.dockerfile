# C Dockerfile

FROM gcc:13

WORKDIR /root

COPY file /root/main.c

CMD ["sh", "-c", "gcc main.c -o main && ./main"]
