# Use prebuilt PyTorch image to avoid downloading torch, numpy, etc.
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

# Set working directory inside the container
WORKDIR /app

# Copy only the requirements file first to leverage Docker caching
COPY requirements.txt .

# Install only necessary Python packages (faster with no-cache)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy rest of the application files
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Start the service using Gunicorn (adjust main:app if needed)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "main:app"]