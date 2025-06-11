import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { BotConnector } from './src/services/botConnector.js';
import { authRouter } from './src/routes/auth.js';
import { apiRouter } from './src/routes/api.js';
import { authMiddleware } from './src/middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Rotas
app.use('/auth', authRouter);
app.use('/api', authMiddleware, apiRouter);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Inicializar conexão com o bot
const botConnector = new BotConnector(io);

// Socket.io para comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Enviar status inicial
  socket.emit('bot-status', botConnector.getStatus());

  // Handlers de eventos
  socket.on('request-qr', async () => {
    try {
      await botConnector.requestNewQR();
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect-bot', async () => {
    try {
      await botConnector.disconnect();
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('reconnect-bot', async () => {
    try {
      await botConnector.reconnect();
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('get-stats', async () => {
    try {
      const stats = await botConnector.getStats();
      socket.emit('stats-update', stats);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor administrativo rodando em http://localhost:${PORT}`);
  botConnector.connect();
}); 