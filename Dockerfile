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

# Create necessary directories and set permissions
RUN mkdir -p temp auth_info_baileys && \
    chmod 777 temp auth_info_baileys

# Make start script executable and verify FFmpeg
RUN chmod +x start.sh && \
    ffmpeg -version

# Set environment variables
ENV FFMPEG_PATH=/usr/bin/ffmpeg

# Expose ports
EXPOSE 8000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node check-status.js || exit 1

# Start the app using the startup script
ENTRYPOINT ["./start.sh"] 