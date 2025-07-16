# WhatsApp Audio Corrector Bot 🎙️

Um chatbot para WhatsApp que transcreve áudios e sugere correções gramaticais usando IA.

## 🚀 Início Rápido

```bash
# 1. Clone o projeto
git clone <seu-repositorio>
cd projeto-chat

# 2. Configure o Node.js 20
nvm use 20

# 3. Instale as dependências
npm install

# 4. Configure o arquivo .env
cp env.example .env
# Edite .env e adicione sua OPENAI_API_KEY

# 5. Execute o bot
npm start
```

## 🚀 Funcionalidades

- **Transcrição de áudios**: Converte mensagens de voz em texto usando Whisper da OpenAI
- **Correção gramatical**: Analisa e corrige erros de português usando GPT-4
- **Resposta em áudio**: Gera um novo áudio com a pronúncia correta
- **Interface administrativa**: Painel web para gerenciar o bot
- **Monitoramento em tempo real**: Acompanhe estatísticas e status do bot
- **Gerenciamento remoto**: Conecte/desconecte o WhatsApp sem usar o terminal

## 📋 Pré-requisitos

- Node.js 14 ou superior
- NPM ou Yarn
- Conta na OpenAI com créditos
- WhatsApp instalado em um celular

## 🔧 Instalação Rápida

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd whatsapp-audio-corrector
```

2. Execute o script de instalação:
```bash
./setup.sh
```

Este script irá:
- Verificar as dependências
- Instalar os pacotes necessários
- Configurar os arquivos de ambiente
- Preparar tanto o bot quanto a interface administrativa

## ⚙️ Configuração Manual

### Bot Principal

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

3. Edite o arquivo `.env` e adicione sua chave da API da OpenAI:
```env
OPENAI_API_KEY=sua_chave_aqui
```

### Interface Administrativa

1. Entre no diretório da interface:
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
PORT=3000
BOT_URL=http://localhost:8080
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura
SESSION_SECRET=sua_chave_secreta
```

## 🎯 Uso

### Iniciando o Bot

1. No diretório principal, inicie o bot:
```bash
npm start
```

2. Em outro terminal, inicie a interface administrativa:
```bash
cd whatsapp-bot-admin
npm start
```

3. Acesse a interface no navegador:
```
http://localhost:3000
```

4. Faça login com as credenciais configuradas

5. Na página de "Conexão", escaneie o QR Code com seu WhatsApp

### Usando o Bot

1. Envie um áudio para o número conectado
2. O bot irá:
   - Transcrever o áudio
   - Analisar a gramática
   - Enviar a transcrição e correções
   - Se houver erros, enviar um áudio com a pronúncia correta

### Comandos Especiais

- `ping` - Verifica se o bot está funcionando
- `testaudio` - Gera um áudio de teste

## 🖥️ Interface Administrativa

A interface web oferece:

- **Dashboard**: Visualize o status em tempo real
- **Conexão**: Gerencie a conexão do WhatsApp e veja o QR Code
- **Estatísticas**: Acompanhe mensagens processadas e áudios corrigidos
- **Logs**: Visualize e exporte logs do sistema
- **Configurações**: Ajuste as configurações do bot

## 🔒 Segurança

- Mude as credenciais padrão antes de usar em produção
- Use HTTPS em produção
- Configure um firewall para proteger as portas
- Mantenha sua chave da OpenAI segura

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
whatsapp-audio-corrector/
├── src/
│   ├── services/
│   │   ├── whatsappService.js    # Serviço principal do WhatsApp
│   │   ├── openaiService.js      # Integração com OpenAI
│   │   ├── audioService.js       # Processamento de áudio
│   │   └── socketService.js      # Comunicação com a interface admin
│   ├── config.js                 # Configurações
│   ├── logger.js                 # Sistema de logs
│   └── index.js                  # Entrada principal
├── whatsapp-bot-admin/           # Interface administrativa
│   ├── public/                   # Frontend
│   ├── src/                      # Backend da interface
│   └── server.js                 # Servidor web
├── temp/                         # Arquivos temporários
├── auth_info_baileys/           # Autenticação do WhatsApp
└── package.json
```

### Tecnologias Utilizadas

- **Bot**: Node.js, Baileys, OpenAI API, FFmpeg
- **Interface**: Express, Socket.io, HTML5, CSS3, JavaScript
- **Comunicação**: WebSockets para atualizações em tempo real

## 📝 Configurações Avançadas

Edite `src/config.js` para personalizar:

- Mensagens do bot
- Limites de duração de áudio
- Prompts da IA
- Configurações de voz

## 🐛 Solução de Problemas

### O bot não conecta
- Verifique se a porta 8080 está livre
- Certifique-se de que o WhatsApp está atualizado
- Tente deletar a pasta `auth_info_baileys` e reconectar

### Erro de transcrição
- Verifique sua chave da OpenAI
- Confirme que tem créditos disponíveis
- Verifique o formato do áudio

### Interface não carrega
- Verifique se ambos os serviços estão rodando
- Confirme que as portas estão corretas no `.env`
- Verifique o console do navegador para erros

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ⚠️ Avisos Importantes

- Este bot é para uso educacional e pessoal
- Respeite os termos de serviço do WhatsApp
- Use com responsabilidade e evite spam
- Os custos da API da OpenAI são por sua conta

## 🙏 Agradecimentos

- [Baileys](https://github.com/WhiskeySockets/Baileys) - Biblioteca WhatsApp Web
- [OpenAI](https://openai.com) - APIs de IA
- Comunidade open source

---

Desenvolvido com ❤️ para ajudar na correção gramatical via WhatsApp 