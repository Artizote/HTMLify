# Node.js Dockerfile

FROM node:16-slim

WORKDIR /home/root

COPY app.js /home/root

CMD ["node", "app.js"]
