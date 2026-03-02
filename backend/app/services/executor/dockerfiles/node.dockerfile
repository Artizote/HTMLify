# Node.js Dockerfile

FROM node:16-slim

WORKDIR /root

COPY file /root/app.js

CMD ["node", "app.js"]
