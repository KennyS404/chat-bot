#!/bin/bash

echo "🚀 Iniciando WhatsApp Bot com PM2 (Método Simples)..."

# Criar diretório de logs
mkdir -p logs

# Parar processos existentes
echo "🛑 Parando processos existentes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Iniciar bot principal
echo "🤖 Iniciando bot principal..."
pm2 start src/index.js --name "whatsapp-bot" --cwd "/root/chat-bot" --env production

# Iniciar interface admin
echo "🖥️ Iniciando interface admin..."
pm2 start server.js --name "whatsapp-admin" --cwd "/root/chat-bot/whatsapp-bot-admin" --env production

# Salvar configuração
echo "💾 Salvando configuração..."
pm2 save

echo "✅ Configuração completa!"
echo ""
echo "📊 Status atual:"
pm2 status
echo ""
echo "📋 Comandos úteis:"
echo "• Ver logs: pm2 logs"
echo "• Ver logs do bot: pm2 logs whatsapp-bot"
echo "• Ver logs da admin: pm2 logs whatsapp-admin"
echo "• Reiniciar tudo: pm2 restart all" 