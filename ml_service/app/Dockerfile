FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for torch + pip
RUN apt-get update && apt-get install -y \
    build-essential \
    libopenblas-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install only CPU version of torch
COPY requirements.txt .
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
