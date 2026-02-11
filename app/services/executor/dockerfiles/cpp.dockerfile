# C++ Dockerfile

FROM gcc:13

WORKDIR /root

COPY file /root/main.cpp

CMD ["sh", "-c", "g++ main.cpp -o main && ./main"]
