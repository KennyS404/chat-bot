#!/bin/bash

echo "🚀 Configurando WhatsApp Bot com PM2..."

# Criar diretório de logs
mkdir -p logs

# Instalar PM2 globalmente se não estiver instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Parar processos existentes
echo "🛑 Parando processos existentes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Iniciar aplicações com PM2
echo "🚀 Iniciando aplicações com PM2..."
pm2 start ecosystem.json

# Salvar configuração do PM2
echo "💾 Salvando configuração do PM2..."
pm2 save

# Configurar PM2 para iniciar automaticamente no boot
echo "⚙️ Configurando PM2 para iniciar no boot..."
pm2 startup

echo "✅ Configuração completa!"
echo ""
echo "📋 Comandos úteis:"
echo "• Ver status: pm2 status"
echo "• Ver logs: pm2 logs"
echo "• Reiniciar: pm2 restart all"
echo "• Parar: pm2 stop all"
echo "• Iniciar: pm2 start all"
echo ""
echo "🌐 Acessos:"
echo "• Interface Admin: http://localhost:3000"
echo "• Bot WhatsApp: Porta 8080"
echo ""
echo "📊 Status atual:"
pm2 status 