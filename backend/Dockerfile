FROM python:3.11-slim
# Install system tools for debugging

RUN apt-get update && \
    apt-get install -y curl iputils-ping && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

#dependencies
COPY requirements.txt . 
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

#start uvicorn sv
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]