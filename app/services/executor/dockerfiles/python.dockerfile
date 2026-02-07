# Python Dockerfile

FROM python:3.9-slim

# Do not buffer, straight update stdout
# and stderr streams
ENV PYTHONUNBUFFERED=1

WORKDIR /root

COPY file /root/main.py

CMD ["python", "main.py"]
