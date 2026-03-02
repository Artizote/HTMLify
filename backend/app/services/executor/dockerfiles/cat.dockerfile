# Cat Dockerfile

FROM alpine

WORKDIR /root

COPY file /root/file

CMD ["cat", "file"]
