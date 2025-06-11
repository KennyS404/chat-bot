# 🚀 Deployment Guide - WhatsApp Audio Corrector Bot

Este guia mostra como fazer deploy do bot em diferentes plataformas.

## 🆓 Plataformas GRATUITAS

### ⭐ Render (100% Gratuito)
**Por que Render é a melhor opção gratuita:**
- ✅ **Completamente GRATUITO** (750h/mês)
- ✅ FFmpeg incluído
- ✅ Aplicação persistente 
- ✅ Deploy automático do GitHub
- ✅ SSL incluído

**Deploy no Render:**
1. Vá para https://render.com
2. Conecte sua conta GitHub
3. Clique em "New +" → "Web Service"
4. Selecione seu repositório
5. Configure:
   - **Name:** whatsapp-bot
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
6. Adicione as variáveis de ambiente
7. Deploy automático!

### 🌊 Koyeb (Gratuito)
**Alternativa gratuita:**
- ✅ Plano gratuito permanente
- ✅ Deploy global
- ✅ SSL automático
- ✅ Container-based (usa nosso Dockerfile)

## 💰 Plataformas PAGAS (Melhores)

### 🚂 Railway ($5/mês)
**Melhor opção paga:**
- ✅ Muito confiável
- ✅ Fácil de usar
- ✅ Recursos generosos
- ✅ Suporte excelente

### 🌊 DigitalOcean App Platform ($5/mês)
**Alternativa confiável:**
- ✅ Muito estável
- ✅ Boa performance
- ✅ Documentação excelente

## 📋 Variáveis de Ambiente Necessárias

```bash
# OpenAI
OPENAI_API_KEY=sk-sua-chave-openai

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-supabase

# Configurações opcionais
LOG_LEVEL=info
MAX_AUDIO_DURATION=120
ENABLE_AUDIO_RESPONSE=true
```

## 🎯 Deploy GRATUITO - Render (Recomendado)

**Passo a passo completo:**

### 1. Preparar Repositório GitHub
```bash
# Se ainda não tem repositório no GitHub
git init
git add .
git commit -m "WhatsApp Audio Corrector Bot"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/whatsapp-bot.git
git push -u origin main
```

### 2. Deploy no Render
1. **Acesse:** https://render.com
2. **Clique:** "Get Started for Free"
3. **Conecte:** sua conta GitHub
4. **New +** → **Web Service**
5. **Connect:** seu repositório
6. **Configure:**
   - Name: `whatsapp-audio-bot`
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**

### 3. Adicionar Variáveis de Ambiente
No painel do Render:
- **OPENAI_API_KEY:** sua chave da OpenAI
- **SUPABASE_URL:** sua URL do Supabase  
- **SUPABASE_KEY:** sua chave do Supabase
- **NODE_VERSION:** 20

### 4. Deploy Automático
- Render fará deploy automaticamente
- Aguarde ~5-10 minutos
- Bot ficará online em: `https://seu-app.onrender.com`

## 📊 Comparação Atualizada

| Plataforma | Preço | Facilidade | Uptime | FFmpeg | Limitações |
|------------|--------|------------|--------|--------|------------|
| **Render** | **GRATUITO** | ⭐⭐⭐⭐⭐ | 99.9% | ✅ | 750h/mês (suficiente) |
| **Koyeb** | **GRATUITO** | ⭐⭐⭐⭐ | 99% | ✅ | Recursos limitados |
| Railway | $5/mês | ⭐⭐⭐⭐⭐ | 99.9% | ✅ | Nenhuma |
| DigitalOcean | $5/mês | ⭐⭐⭐ | 99.9% | ✅ | Configuração manual |
| Vercel | Grátis | ⭐⭐ | N/A | ❌ | **NÃO funciona** |

## 🚨 Importante: Render vs Railway

**Render (GRATUITO):**
- ✅ 750 horas/mês (suficiente para bot 24/7)
- ✅ SSL automático
- ✅ Deploy do GitHub
- ⚠️ App "hiberna" após 15min sem uso (normal)

**Railway ($5/mês):**
- ✅ Sem hibernação
- ✅ Mais recursos
- ✅ Melhor performance
- ✅ Melhor para produção

## 🔄 Após Deploy no Render

1. **Aguarde deploy** (~10 minutos)
2. **Acesse logs** no painel do Render
3. **Procure QR Code** nos logs para conectar WhatsApp
4. **Teste o bot** enviando áudio

## 🆘 Troubleshooting Render

**App hiberna/desconecta:**
- Normal no plano gratuito
- Bot reconecta automaticamente
- Para 100% uptime: upgrade para pago ($7/mês)

**Erro de deploy:**
- Verifique variáveis de ambiente
- Veja logs no painel
- Certifique-se que tem `package.json` correto

## 💡 Dicas para Render Gratuito

1. **Use external cron** para manter bot ativo:
   - https://cron-job.org (gratuito)
   - Ping seu app a cada 10 minutos

2. **Monitore uso de horas:**
   - 750h/mês = ~24h/dia 
   - Suficiente para uso normal

3. **Configure webhook uptime:**
   - UptimeRobot.com (gratuito)
   - Monitora e reativa o bot

## 🎉 Recomendação Final

**Para começar:** Use **Render (gratuito)**
**Para produção:** Upgrade para **Railway ($5/mês)** ou **Render Pro ($7/mês)**

🚀 **Render é perfeito para testar e usar pessoalmente!** 