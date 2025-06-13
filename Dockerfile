# WhatsApp Audio Corrector Bot - Dockerfile
FROM node:18-bullseye

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip3 install --no-cache-dir \
    openai-whisper \
    torch \
    numpy

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

# Create necessary directories
RUN mkdir -p temp auth_info_baileys

# Make start script executable
RUN chmod +x start.sh

# Expose ports
EXPOSE 8000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node check-status.js || exit 1

# Start the app using the startup script
CMD ["./start.sh"] 