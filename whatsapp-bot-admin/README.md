# WhatsApp Bot Admin

Interface web administrativa para gerenciar o WhatsApp Audio Corrector Bot.

## 🚀 Recursos

- **Dashboard em tempo real** - Visualize o status do bot e estatísticas
- **Gerenciamento de conexão** - Conecte/desconecte o WhatsApp via QR Code
- **Estatísticas detalhadas** - Acompanhe mensagens processadas e áudios corrigidos
- **Sistema de logs** - Visualize e exporte logs do sistema
- **Interface responsiva** - Funciona em desktop e mobile
- **Autenticação segura** - Proteja o acesso ao painel administrativo

## 📋 Pré-requisitos

- Node.js 14+ instalado
- O bot principal deve estar rodando (por padrão em http://localhost:8080)

## 🔧 Instalação

1. Entre no diretório do projeto:
```bash
cd whatsapp-bot-admin
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o ambiente:
```bash
cp env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
# Porta do servidor web
PORT=3000

# URL do bot principal
BOT_URL=http://localhost:8080

# Credenciais de admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura

# Secret para sessões
SESSION_SECRET=sua_chave_secreta
```

## 🎯 Uso

1. Inicie o servidor:
```bash
npm start
```

Ou em modo desenvolvimento:
```bash
npm run dev
```

2. Acesse no navegador:
```
http://localhost:3000
```

3. Faça login com as credenciais configuradas no `.env`

## 🖥️ Funcionalidades

### Status
- Visualize o status atual do bot
- Veja se o WhatsApp está conectado
- Monitore o tempo online
- Ações rápidas: reconectar, desconectar, solicitar novo QR

### Conexão
- Exiba o QR Code para conectar o WhatsApp
- Instruções passo a passo para conexão
- QR Code atualizado automaticamente

### Estatísticas
- Total de mensagens recebidas
- Mensagens processadas
- Áudios corrigidos
- Contagem de erros
- Gráfico de visualização

### Logs
- Visualize logs em tempo real
- Filtre por nível (info, warning, error)
- Exporte logs para arquivo
- Limpe histórico de logs

### Configurações
- Configure URL do bot
- Ative/desative reconexão automática
- Configure notificações

## 🔒 Segurança

- Autenticação básica (recomenda-se implementar JWT em produção)
- Todas as rotas da API são protegidas
- Comunicação via Socket.io para atualizações em tempo real

## 🛠️ Desenvolvimento

### Estrutura do projeto
```
whatsapp-bot-admin/
├── public/              # Arquivos estáticos
│   ├── css/            # Estilos
│   ├── js/             # JavaScript do cliente
│   └── index.html      # Página principal
├── src/
│   ├── middleware/     # Middlewares Express
│   ├── routes/         # Rotas da API
│   └── services/       # Serviços (conexão com bot)
├── server.js           # Servidor principal
└── package.json
```

### Tecnologias utilizadas
- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **UI**: Design responsivo com CSS Grid e Flexbox
- **Comunicação**: WebSockets para tempo real

## 📝 Notas

- O bot principal precisa estar modificado para aceitar conexões Socket.io
- Em produção, use HTTPS e implemente autenticação mais robusta
- Configure um proxy reverso (nginx) para servir a aplicação

## 🤝 Contribuindo

Sinta-se à vontade para contribuir com melhorias!

## 📄 Licença

Este projeto está sob a licença MIT. 