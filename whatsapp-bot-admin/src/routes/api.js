import { Router } from 'express';

export const apiRouter = Router();

// Rota para obter configurações
apiRouter.get('/config', (req, res) => {
  res.json({
    botUrl: process.env.BOT_URL || 'http://localhost:8080',
    version: '1.0.0'
  });
});

// Rota para obter logs (simulado)
apiRouter.get('/logs', (req, res) => {
  const logs = [
    { timestamp: new Date(), level: 'info', message: 'Bot iniciado' },
    { timestamp: new Date(), level: 'info', message: 'Conectado ao WhatsApp' }
  ];
  res.json(logs);
}); 