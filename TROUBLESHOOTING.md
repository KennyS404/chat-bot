# 🔧 Troubleshooting - WhatsApp Audio Corrector Bot

Este guia vai ajudar você a resolver os problemas mais comuns do bot.

## 🚨 Problemas Comuns e Soluções

### 1. Erro: `Cannot destructure property 'subtle' of 'globalThis.crypto'`

**Causa:** Versão do Node.js incompatível (você está usando v18, mas o projeto requer v20+)

**Solução:**
```bash
# Instalar Node.js 20 via nvm
nvm install 20
nvm use 20

# Verificar versão
node --version  # Deve mostrar v20.x.x
```

### 2. Erro: `OpenAI API Key não configurada`

**Causa:** Arquivo `.env` não existe ou API key não configurada

**Solução:**
```bash
# 1. Criar arquivo .env
npm run setup-env

# 2. Editar .env e adicionar sua API key
# Substituir: your_openai_api_key_here
# Por: sk-sua-chave-aqui
```

**Como obter API key:**
1. Vá para: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em "Create new secret key"
4. Copie a chave e cole no `.env`

### 3. Erro: `Configuração do Supabase não encontrada`

**Causa:** Configuração do banco de dados Supabase não configurada

**Solução:**
```bash
# 1. Criar projeto no Supabase
# Acesse: https://supabase.com/dashboard

# 2. Obter URL e Key do projeto
# Settings > API > Project URL
# Settings > API > anon public key

# 3. Editar .env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anonima-aqui
```

### 4. Erro: `Error getting user` / `Error creating user`

**Causa:** Banco de dados não configurado ou não acessível

**Soluções:**
1. Verificar se SUPABASE_URL e SUPABASE_KEY estão corretos no `.env`
2. Criar as tabelas necessárias no Supabase
3. Verificar conexão com internet

**Criando tabelas no Supabase:**
```sql
-- No SQL Editor do Supabase, execute:

-- Tabela de usuários
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    phone_number VARCHAR,
    name VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    last_interaction TIMESTAMP DEFAULT NOW()
);

-- Tabela de mensagens de áudio
CREATE TABLE audio_messages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    duration INTEGER,
    file_size INTEGER,
    mime_type VARCHAR,
    storage_path VARCHAR,
    transcription TEXT,
    corrected_text TEXT,
    status VARCHAR DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs do sistema
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR,
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Criar bucket de storage para áudios
```

### 5. Erro de FFmpeg / Audio Processing

**Causa:** FFmpeg não instalado ou problemas na conversão de áudio

**Solução Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Solução macOS:**
```bash
brew install ffmpeg
```

### 6. Bot não conecta ao WhatsApp

**Possíveis causas e soluções:**

1. **QR Code expirado**
   - Reinicie o bot
   - Escaneie o novo QR Code rapidamente

2. **Sessão corrompida**
   ```bash
   npm run clean
   npm start
   ```

3. **Múltiplas sessões**
   - Certifique-se de que o WhatsApp Web está desconectado
   - Use apenas uma sessão por vez

## 📋 Checklist de Configuração

Antes de executar o bot, verifique:

- [ ] ✅ Node.js v20+ instalado (`node --version`)
- [ ] ✅ Arquivo `.env` criado (`npm run setup-env`)
- [ ] ✅ OPENAI_API_KEY configurada no `.env`
- [ ] ✅ SUPABASE_URL configurada no `.env`
- [ ] ✅ SUPABASE_KEY configurada no `.env`
- [ ] ✅ FFmpeg instalado (`ffmpeg -version`)
- [ ] ✅ Tabelas criadas no Supabase
- [ ] ✅ Bucket de storage criado no Supabase

## 🚀 Ordem de Execução Correta

```bash
# 1. Usar Node.js 20+
nvm use 20

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
npm run setup-env

# 4. Editar .env com suas credenciais
# (OpenAI API Key, Supabase URL e Key)

# 5. Executar o bot
npm start
```

## 📱 Testando o Bot

1. Abra o WhatsApp no celular
2. Escaneie o QR Code que aparece no terminal
3. Envie um áudio para o número do bot
4. Aguarde a resposta com correções

## 🆘 Ainda com problemas?

Se mesmo seguindo este guia você ainda tiver problemas:

1. Verifique os logs no terminal
2. Verifique se todas as APIs estão funcionando
3. Teste com um áudio simples primeiro
4. Certifique-se de que tem saldo/créditos na OpenAI

## 📊 Comandos Úteis

```bash
# Verificar status
npm run status

# Limpar arquivos temporários
npm run clean

# Ver logs detalhados
tail -f bot.log

# Parar o bot
Ctrl+C
``` 