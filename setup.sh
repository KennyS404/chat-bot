#!/bin/bash

echo "🚀 Configurando WhatsApp Audio Corrector Bot com Interface Admin"
echo "=================================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
echo -e "\n${YELLOW}Verificando dependências...${NC}"
if ! command_exists node; then
    echo -e "${RED}❌ Node.js não está instalado. Por favor, instale Node.js 14+ primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"

# Verificar npm
if ! command_exists npm; then
    echo -e "${RED}❌ npm não está instalado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm encontrado: $(npm --version)${NC}"

# Instalar dependências do bot principal
echo -e "\n${YELLOW}Instalando dependências do bot principal...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependências do bot instaladas com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências do bot${NC}"
    exit 1
fi

# Configurar arquivo .env do bot principal
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Configurando arquivo .env do bot principal...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado. Por favor, edite-o com sua chave da OpenAI.${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi

# Instalar dependências da interface admin
echo -e "\n${YELLOW}Instalando dependências da interface admin...${NC}"
cd whatsapp-bot-admin
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependências da interface admin instaladas com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências da interface admin${NC}"
    exit 1
fi

# Configurar arquivo .env da interface admin
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Configurando arquivo .env da interface admin...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ Arquivo .env da interface admin criado.${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env da interface admin já existe${NC}"
fi

cd ..

# Instruções finais
echo -e "\n${GREEN}🎉 Instalação concluída com sucesso!${NC}"
echo -e "\n${YELLOW}Próximos passos:${NC}"
echo "1. Edite o arquivo .env e adicione sua chave da OpenAI"
echo "2. Edite o arquivo whatsapp-bot-admin/.env e configure as credenciais de admin"
echo "3. Inicie o bot principal: npm start"
echo "4. Em outro terminal, inicie a interface admin:"
echo "   cd whatsapp-bot-admin && npm start"
echo "5. Acesse http://localhost:3000 no navegador"
echo -e "\n${YELLOW}Credenciais padrão da interface admin:${NC}"
echo "Usuário: admin"
echo "Senha: admin123"
echo -e "\n${RED}⚠️  IMPORTANTE: Mude as credenciais padrão em produção!${NC}"

# Tornar o script executável
chmod +x setup.sh 