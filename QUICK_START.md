# 🚀 WhatsApp Audio Corrector - Início Rápido

## Requisitos
- **Node.js 20+** (obrigatório)
- **Conta OpenAI com créditos** (obrigatório)
- **Banco Supabase** (obrigatório)
- WhatsApp no celular

## Executar tudo com 1 comando

```bash
git./run-project.sh
```

Este script fará **TUDO** automaticamente:
- ✅ Verifica se Node.js 20+ está instalado
- 📦 Instala todas as dependências 
- ⚙️ Configura arquivos .env completos
- 🔍 Verifica configurações obrigatórias
- 🚀 Inicia bot WhatsApp (porta 8080)
- 🖥️ Inicia interface admin (porta 3000)
- 📋 Mostra logs em tempo real

## ⚠️ Configurações Obrigatórias

O script irá guiá-lo para configurar:

### 1. 🔑 OpenAI API Key
- Acesse: https://platform.openai.com/api-keys
- Crie uma nova chave de API
- Certifique-se de ter créditos na conta

### 2. 🗄️ Supabase (Banco de Dados)

**Opção 1 - Supabase na nuvem (recomendado):**
- Acesse: https://supabase.com
- Crie uma conta/projeto gratuito
- Vá em Settings > API
- Copie URL e anon/public key

**Opção 2 - Supabase local:**
```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Iniciar Supabase local
npx supabase start
```

## Depois que rodar o script

1. **O script detectará automaticamente** se as configurações estão faltando
2. **Seguirá um menu interativo** para configurar .env
3. **Verificará** se tudo está correto antes de iniciar

4. **Acesse a interface**
   - Abra: http://localhost:3000
   - Login: `admin` / Senha: `admin123`

5. **Conecte o WhatsApp**
   - Na interface, vá para "Conexão"
   - Escaneie o QR Code com seu WhatsApp

6. **Teste o bot**
   - Envie um áudio para o número conectado
   - O bot irá transcrever e corrigir automaticamente

## Menu Interativo do Script

Quando executar pela primeira vez, o script oferecerá:

```
1. 🔧 Configurar .env agora (abrirá editor)
2. ⏭️  Pular configuração (configure depois manualmente)
3. 🌐 Abrir URLs das chaves no navegador
4. ❌ Sair
```

## Comandos úteis

```bash
# Parar todos os serviços
Ctrl + C

# Verificar status
npm run status

# Limpar arquivos temporários  
npm run clean

# Rodar apenas o bot
npm start

# Rodar apenas a interface (em outra pasta)
cd whatsapp-bot-admin && npm start
```

## Portas utilizadas
- **8080**: Bot WhatsApp
- **3000**: Interface administrativa

## Solução de problemas

### ❌ "supabaseUrl is required"
```bash
# Editar .env e configurar Supabase
nano .env

# Adicionar:
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_publica
```

### ❌ "Porta já está em uso"
```bash
# Verificar quem está usando a porta
lsof -i :8080
lsof -i :3000

# Matar processo se necessário
kill -9 <PID>
```

### ❌ "Node.js versão incorreta"
```bash
# Instalar Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### ❌ "Erro de transcrição OpenAI"
- Verifique se tem créditos na OpenAI
- Confirme se a chave da API está correta no `.env`
- Teste se a chave funciona: `curl -H "Authorization: Bearer sua_chave" https://api.openai.com/v1/models`

### 🔄 Reconfigurar tudo
```bash
# Remover configurações
rm .env whatsapp-bot-admin/.env

# Executar script novamente
./run-project.sh
```

## Estrutura das Configurações

O script criará um `.env` completo com:

```env
# OpenAI - OBRIGATÓRIO
OPENAI_API_KEY=sua_chave_aqui

# Supabase - OBRIGATÓRIO  
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_publica

# Configurações de áudio, modelos, etc.
```

---

**Pronto!** 🎉 Agora o script é inteligente e te guia através de toda configuração! 