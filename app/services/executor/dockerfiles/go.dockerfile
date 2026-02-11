# Go Dockerfile

FROM golang:1.17-alpine

WORKDIR /root

COPY file /root/main.go

CMD ["go", "run", "main.go"]
