# Python Dockerfile

FROM python:3.9-slim

WORKDIR /root

COPY file /root/main.py

CMD ["python", "main.py"]
