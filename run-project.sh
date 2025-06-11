#!/bin/bash

# WhatsApp Audio Corrector Bot - Inicializador Completo
# ====================================================
# Este script configura e executa todo o projeto automaticamente

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar versão do Node.js
check_node_version() {
    local node_version=$(node --version | sed 's/v//')
    local major_version=$(echo $node_version | cut -d. -f1)
    if [ "$major_version" -lt 20 ]; then
        return 1
    fi
    return 0
}

# Banner
echo -e "${BLUE}"
echo "=================================="
echo "🚀 WhatsApp Audio Corrector Bot"
echo "=================================="
echo -e "${NC}"

# Verificações de dependências
echo -e "${YELLOW}📋 Verificando pré-requisitos...${NC}"

# Verificar Node.js
if ! command_exists node; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo -e "${YELLOW}📖 Instale Node.js 20+ em: https://nodejs.org${NC}"
    exit 1
fi

if ! check_node_version; then
    echo -e "${RED}❌ Node.js versão $(node --version) encontrada. Requerido: 20+${NC}"
    echo -e "${YELLOW}📖 Atualize para Node.js 20+ em: https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) - OK${NC}"

# Verificar npm
if ! command_exists npm; then
    echo -e "${RED}❌ npm não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) - OK${NC}"

# Instalar dependências do bot principal
echo -e "\n${YELLOW}📦 Configurando bot principal...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📥 Instalando dependências do bot...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar dependências do bot${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependências do bot já instaladas${NC}"
fi

# Configurar .env do bot principal
if [ ! -f ".env" ]; then
    echo -e "${BLUE}⚙️  Criando arquivo .env do bot...${NC}"
    
    # Criar .env com configurações completas
    cat > .env << 'EOF'
# OpenAI Configuration - OBRIGATÓRIO
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
WHISPER_MODEL=whisper-1
GPT_MODEL=gpt-3.5-turbo
TTS_MODEL=tts-1
TTS_VOICE=nova

# WhatsApp Configuration
SESSION_NAME=whatsapp-bot

# Supabase Configuration - OBRIGATÓRIO
SUPABASE_URL=https://tfsrlamwuvycryhqczyv.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmc3JsYW13dXZ5Y3J5aHFjenl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDI2MzYsImV4cCI6MjA2NDExODYzNn0.EOnh_5_d6hYnc8qfiv0Fadp2jxT5EZZX18P4Jhf7wWk

# Audio Configuration
MAX_AUDIO_DURATION=120
ENABLE_AUDIO_RESPONSE=true

# Database Configuration
DB_MAX_CONNECTIONS=10
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

# Storage Configuration
STORAGE_MAX_FILE_SIZE=10485760
STORAGE_COMPRESSION_ENABLED=true
STORAGE_COMPRESSION_MAX_SIZE=1048576
STORAGE_COMPRESSION_QUALITY=0.8

# Logging Configuration
LOG_LEVEL=info

# Diretório para armazenar arquivos temporários
TEMP_DIR=./temp
EOF
    
    echo -e "${GREEN}✅ Arquivo .env criado com configurações padrão!${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  CONFIGURAÇÃO OBRIGATÓRIA ANTES DE CONTINUAR:${NC}"
    echo -e "${RED}1. OPENAI_API_KEY${NC} - Sua chave da API OpenAI"
    echo -e "${RED}2. SUPABASE_URL e SUPABASE_KEY${NC} - Configuração do banco de dados"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo -e "\n${BLUE}🎯 Como obter as chaves necessárias:${NC}"
    echo -e "${YELLOW}OpenAI:${NC}"
    echo "• Acesse: https://platform.openai.com/api-keys"
    echo "• Crie uma nova chave de API"
    echo "• Certifique-se de ter créditos na conta"
    
    echo -e "\n${YELLOW}Supabase (escolha uma opção):${NC}"
    echo -e "${GREEN}Opção 1 - Supabase na nuvem (recomendado):${NC}"
    echo "• Acesse: https://supabase.com"
    echo "• Crie uma nova conta/projeto gratuito"
    echo "• Vá em Settings > API"
    echo "• Copie URL e anon/public key"
    
    echo -e "\n${GREEN}Opção 2 - Supabase local:${NC}"
    echo "• Execute: npx supabase start"
    echo "• Use as credenciais locais fornecidas"
    
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    while true; do
        echo -e "\n${YELLOW}Escolha uma opção:${NC}"
        echo "1. 🔧 Configurar .env agora (abrirá editor)"
        echo "2. ⏭️  Pular configuração (configure depois manualmente)"
        echo "3. 🌐 Abrir URLs das chaves no navegador"
        echo "4. ❌ Sair"
        
        echo -e "\n${BLUE}Digite sua escolha (1-4): ${NC}"
        read -r choice
        
        case $choice in
            1)
                echo -e "${BLUE}📝 Abrindo editor para configurar .env...${NC}"
                ${EDITOR:-nano} .env
                break
                ;;
            2)
                echo -e "${YELLOW}⚠️  Lembre-se de configurar .env antes de usar o bot!${NC}"
                break
                ;;
            3)
                if command_exists xdg-open; then
                    xdg-open "https://platform.openai.com/api-keys" 2>/dev/null &
                    xdg-open "https://supabase.com" 2>/dev/null &
                    echo -e "${GREEN}✅ URLs abertas no navegador!${NC}"
                elif command_exists open; then
                    open "https://platform.openai.com/api-keys" &
                    open "https://supabase.com" &
                    echo -e "${GREEN}✅ URLs abertas no navegador!${NC}"
                else
                    echo -e "${YELLOW}URLs para copiar manualmente:${NC}"
                    echo "OpenAI: https://platform.openai.com/api-keys"
                    echo "Supabase: https://supabase.com"
                fi
                ;;
            4)
                echo -e "${YELLOW}Saindo...${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Opção inválida. Tente novamente.${NC}"
                ;;
        esac
    done
else
    echo -e "${GREEN}✅ Arquivo .env do bot já existe${NC}"
fi

# Configurar interface administrativa
echo -e "\n${YELLOW}🖥️  Configurando interface administrativa...${NC}"
cd whatsapp-bot-admin

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📥 Instalando dependências da interface...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar dependências da interface${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependências da interface já instaladas${NC}"
fi

# Configurar .env da interface admin
if [ ! -f ".env" ]; then
    echo -e "${BLUE}⚙️  Criando arquivo .env da interface admin...${NC}"
    cp env.example .env
    
    # Configuração automática com valores padrão
    cat > .env << 'EOF'
PORT=3000
BOT_URL=http://localhost:8080
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SESSION_SECRET=whatsapp-bot-secret-key-2024
EOF
    
    echo -e "${GREEN}✅ Interface configurada com credenciais padrão${NC}"
    echo -e "${YELLOW}👤 Login: admin / Senha: admin123${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env da interface já existe${NC}"
fi

cd ..

# Verificar se as configurações obrigatórias estão definidas
echo -e "\n${YELLOW}🔍 Verificando configurações obrigatórias...${NC}"

if ! grep -q "YOUR_OPENAI_API_KEY_HERE" .env 2>/dev/null; then
    if ! grep -q "^OPENAI_API_KEY=sk-" .env 2>/dev/null; then
        echo -e "${RED}⚠️  OPENAI_API_KEY não configurada ou inválida${NC}"
        MISSING_CONFIG=true
    fi
fi

if grep -q "your_supabase_url_here\|your_supabase_key_here" .env 2>/dev/null; then
    echo -e "${RED}⚠️  Configurações do Supabase não definidas${NC}"
    MISSING_CONFIG=true
fi

if [ "$MISSING_CONFIG" = true ]; then
    echo -e "\n${RED}❌ Configurações obrigatórias faltando!${NC}"
    echo -e "${YELLOW}Por favor, configure o arquivo .env antes de continuar.${NC}"
    echo -e "${BLUE}Execute: nano .env${NC}"
    echo -e "${YELLOW}Ou execute este script novamente após configurar.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configurações básicas verificadas!${NC}"

# Criar diretórios necessários
mkdir -p temp auth_info_baileys

# Função para cleanup ao sair
cleanup() {
    echo -e "\n${YELLOW}🛑 Encerrando serviços...${NC}"
    if [ ! -z "$BOT_PID" ]; then
        kill $BOT_PID 2>/dev/null
    fi
    if [ ! -z "$ADMIN_PID" ]; then
        kill $ADMIN_PID 2>/dev/null
    fi
    if [ ! -z "$TAIL_PID" ]; then
        kill $TAIL_PID 2>/dev/null
    fi
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Verificar se as portas estão livres
if command_exists lsof; then
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Porta 8080 já está em uso!${NC}"
        exit 1
    fi
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Porta 3000 já está em uso!${NC}"
        exit 1
    fi
fi

# Iniciar os serviços
echo -e "\n${GREEN}🚀 Iniciando WhatsApp Audio Corrector Bot...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Iniciar bot principal em background
echo -e "${YELLOW}🤖 Iniciando bot principal na porta 8080...${NC}"
npm start > bot.log 2>&1 &
BOT_PID=$!
sleep 5

# Verificar se o bot iniciou corretamente
if ! kill -0 $BOT_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar o bot principal${NC}"
    echo -e "${YELLOW}📄 Logs do bot:${NC}"
    cat bot.log
    echo -e "\n${YELLOW}💡 Possíveis soluções:${NC}"
    echo "• Verifique se OPENAI_API_KEY está configurada corretamente"
    echo "• Verifique se SUPABASE_URL e SUPABASE_KEY estão corretas"
    echo "• Certifique-se de ter créditos na conta OpenAI"
    exit 1
fi

# Iniciar interface administrativa em background
echo -e "${YELLOW}🖥️  Iniciando interface admin na porta 3000...${NC}"
cd whatsapp-bot-admin
npm start > ../admin.log 2>&1 &
ADMIN_PID=$!
cd ..
sleep 3

# Verificar se a interface iniciou corretamente
if ! kill -0 $ADMIN_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar interface administrativa${NC}"
    echo -e "${YELLOW}📄 Logs da interface:${NC}"
    cat admin.log
    cleanup
fi

# Status final
echo -e "\n${GREEN}✅ Projeto iniciado com sucesso!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🤖 Bot WhatsApp:${NC} http://localhost:8080"
echo -e "${GREEN}🖥️  Interface Admin:${NC} http://localhost:3000"
echo -e "${YELLOW}👤 Login Admin:${NC} admin / admin123"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}📱 Próximos passos:${NC}"
echo "1. 🌐 Abra http://localhost:3000 no navegador"
echo "2. 🔐 Faça login com: admin / admin123"
echo "3. 📱 Na aba 'Conexão', escaneie o QR Code com WhatsApp"
echo "4. 🎤 Envie áudios para o bot testar!"

echo -e "\n${YELLOW}🔧 Comandos úteis:${NC}"
echo "• npm run status - Verificar status do bot"
echo "• npm run clean - Limpar arquivos temporários"
echo "• Ctrl+C - Parar todos os serviços"

echo -e "\n${GREEN}📋 Logs em tempo real:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Mostrar logs em tempo real
tail -f bot.log admin.log &
TAIL_PID=$!

# Aguardar até o usuário parar o script
wait

# Cleanup será executado automaticamente pelo trap 