#!/bin/bash

# Verificar e instalar FFmpeg se necessário
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg não encontrado, tentando instalar..."
    apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*
fi

# Verificar se o FFmpeg foi instalado corretamente
if command -v ffmpeg &> /dev/null; then
    echo "FFmpeg encontrado:"
    ffmpeg -version
else
    echo "ERRO: FFmpeg não pôde ser instalado"
    exit 1
fi

# Iniciar a aplicação
exec npm start 