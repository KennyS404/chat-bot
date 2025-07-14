# 🚀 Comandos PM2 para WhatsApp Bot

## 📦 Instalação e Configuração

```bash
# 1. Instalar PM2 globalmente
npm install -g pm2

# 2. Dar permissão ao script
chmod +x start-pm2.sh

# 3. Executar configuração automática
./start-pm2.sh
```

## 🎯 Comandos Essenciais

### Status e Monitoramento
```bash
# Ver status de todos os processos
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs de um processo específico
pm2 logs whatsapp-bot
pm2 logs whatsapp-admin

# Ver logs de erro
pm2 logs --err
```

### Controle de Processos
```bash
# Iniciar todos os processos
pm2 start all

# Parar todos os processos
pm2 stop all

# Reiniciar todos os processos
pm2 restart all

# Deletar todos os processos
pm2 delete all

# Reiniciar processo específico
pm2 restart whatsapp-bot
pm2 restart whatsapp-admin
```

### Configuração Persistente
```bash
# Salvar configuração atual
pm2 save

# Configurar para iniciar no boot
pm2 startup

# Carregar configuração salva
pm2 resurrect
```

## 🔧 Comandos Avançados

### Monitoramento Detalhado
```bash
# Dashboard interativo
pm2 monit

# Informações detalhadas
pm2 show whatsapp-bot
pm2 show whatsapp-admin

# Estatísticas de uso
pm2 stats
```

### Logs e Debug
```bash
# Limpar logs
pm2 flush

# Ver logs com timestamp
pm2 logs --timestamp

# Ver logs de um período específico
pm2 logs --lines 100
```

### Reinicialização e Manutenção
```bash
# Zero-downtime reload
pm2 reload all

# Reiniciar com delay
pm2 restart all --update-env

# Verificar configuração
pm2 show ecosystem.config.js
```

## 🚨 Solução de Problemas

### Se o processo não iniciar
```bash
# Verificar logs de erro
pm2 logs --err

# Verificar se as portas estão livres
netstat -tulpn | grep :8080
netstat -tulpn | grep :3000

# Reiniciar com logs detalhados
pm2 restart all --update-env
```

### Se o PM2 não iniciar no boot
```bash
# Reconfigurar startup
pm2 unstartup
pm2 startup
pm2 save
```

### Limpeza completa
```bash
# Parar e deletar tudo
pm2 stop all
pm2 delete all
pm2 kill

# Reinstalar PM2
npm uninstall -g pm2
npm install -g pm2

# Reconfigurar
./start-pm2.sh
```

## 📊 Monitoramento no Hostinger

### Verificar se está rodando
```bash
# Status geral
pm2 status

# Verificar portas
ss -tulpn | grep :8080
ss -tulpn | grep :3000

# Verificar uso de memória
pm2 stats
```

### Logs importantes
```bash
# Logs do bot
tail -f logs/bot-combined.log

# Logs da interface admin
tail -f logs/admin-combined.log

# Logs de erro
tail -f logs/bot-error.log
tail -f logs/admin-error.log
```

## 🌐 URLs de Acesso

- **Interface Admin**: http://SEU_IP:3000
- **Bot WhatsApp**: Porta 8080 (Socket.io)
- **Login Admin**: `admin` / `ClearEnough404.com`

## ⚡ Comandos Rápidos

```bash
# Iniciar tudo
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs
pm2 logs

# Reiniciar tudo
pm2 restart all
``` 