#!/bin/bash
set -e

echo "Iniciando script de inicialização..."

# Verificar e instalar FFmpeg se necessário
echo "Verificando FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg não encontrado, tentando instalar..."
    apt-get update
    apt-get install -y ffmpeg
    rm -rf /var/lib/apt/lists/*
fi

# Verificar se o FFmpeg foi instalado corretamente
echo "Verificando instalação do FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "FFmpeg encontrado:"
    ffmpeg -version
    echo "Caminho do FFmpeg: $(which ffmpeg)"
else
    echo "ERRO: FFmpeg não pôde ser instalado"
    exit 1
fi

# Verificar permissões do diretório temp
echo "Verificando diretório temp..."
mkdir -p temp
chmod 777 temp

# Verificar permissões do diretório auth_info_baileys
echo "Verificando diretório auth_info_baileys..."
mkdir -p auth_info_baileys
chmod 777 auth_info_baileys

# Configurar variáveis de ambiente
export FFMPEG_PATH=$(which ffmpeg)
echo "FFMPEG_PATH configurado como: $FFMPEG_PATH"

# Iniciar a aplicação
echo "Iniciando aplicação..."
exec npm start 