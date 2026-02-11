# Rust Dockerfile

FROM rust:1.58-alpine

WORKDIR /root

COPY file /root/main.rs

CMD ["sh", "-c", "rustc main.rs && ./main"]
