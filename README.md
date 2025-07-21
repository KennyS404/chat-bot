# WhatsApp Audio Corrector Bot 🎙️

Um chatbot para WhatsApp que transcreve áudios e sugere correções gramaticais usando IA.

## 🚀 Como rodar o projeto

### 1. Pré-requisitos

- **Node.js 20+**
- **Conta OpenAI com créditos**
- **WhatsApp no celular**

### 2. Instalação

Clone o repositório e instale as dependências:

```bash
git clone <seu-repositorio>
cd projeto-chat
npm install
```

### 3. Configuração

Crie um arquivo `.env` na raiz do projeto com pelo menos a seguinte variável:

```env
OPENAI_API_KEY=sua_chave_openai_aqui
```

Se usar Supabase ou outros serviços, adicione também:

```env
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase
```

> Consulte o início do arquivo `src/config.js` para ver todas as variáveis de ambiente suportadas.

### 4. Iniciando o Bot

No diretório principal, execute:

```bash
npm start
```

O bot irá iniciar na porta padrão (8080).

### 5. Interface Administrativa (opcional)

Se quiser usar a interface web:

```bash
cd whatsapp-bot-admin
npm install
npm start
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🎯 Uso

1. Envie um áudio para o número conectado ao bot.
2. O bot irá transcrever, corrigir e responder via WhatsApp.
3. Acompanhe logs e status em tempo real pela interface web (opcional).

---

## 📝 Dicas

- Mantenha seu arquivo `.env` seguro e nunca compartilhe sua chave da OpenAI.
- Para resetar a sessão do WhatsApp, apague a pasta `auth_info_baileys/`.
- Para personalizar mensagens, edite `src/config.js`.

---

## 🛠️ Estrutura do Projeto

```
projeto-chat/
├── src/                  # Código-fonte do bot
│   ├── services/         # Serviços de IA, áudio, WhatsApp, etc.
│   ├── config.js         # Configurações principais
│   └── index.js          # Ponto de entrada do bot
├── whatsapp-bot-admin/   # Interface administrativa (opcional)
├── package.json
└── .env                  # Suas variáveis de ambiente (NÃO versionar)
```

---

Desenvolvido com ❤️ para ajudar na correção gramatical via WhatsApp 