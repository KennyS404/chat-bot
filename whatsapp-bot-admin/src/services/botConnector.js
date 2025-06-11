import { io as ioClient } from 'socket.io-client';
import QRCode from 'qrcode';
import EventEmitter from 'events';

export class BotConnector extends EventEmitter {
  constructor(ioServer) {
    super();
    this.ioServer = ioServer;
    this.botSocket = null;
    this.status = {
      connected: false,
      authenticated: false,
      phoneNumber: null,
      lastSeen: null,
      qrCode: null,
      error: null
    };
    this.stats = {
      messagesReceived: 0,
      messagesProcessed: 0,
      audiosCorrected: 0,
      errors: 0,
      uptime: 0,
      startTime: Date.now()
    };
  }

  connect() {
    const botUrl = process.env.BOT_URL || 'http://localhost:8080';
    
    this.botSocket = ioClient(botUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.botSocket.on('connect', () => {
      console.log('Conectado ao bot principal');
      this.status.connected = true;
      this.status.error = null;
      this.broadcastStatus();
    });

    this.botSocket.on('disconnect', () => {
      console.log('Desconectado do bot principal');
      this.status.connected = false;
      this.broadcastStatus();
    });

    this.botSocket.on('qr', async (qr) => {
      console.log('QR Code recebido');
      try {
        const qrDataUrl = await QRCode.toDataURL(qr);
        this.status.qrCode = qrDataUrl;
        this.status.authenticated = false;
        this.broadcastStatus();
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      }
    });

    this.botSocket.on('ready', (info) => {
      console.log('Bot autenticado:', info);
      this.status.authenticated = true;
      this.status.qrCode = null;
      this.status.phoneNumber = info.phoneNumber;
      this.broadcastStatus();
    });

    this.botSocket.on('message-received', () => {
      this.stats.messagesReceived++;
      this.broadcastStats();
    });

    this.botSocket.on('message-processed', () => {
      this.stats.messagesProcessed++;
      this.broadcastStats();
    });

    this.botSocket.on('audio-corrected', () => {
      this.stats.audiosCorrected++;
      this.broadcastStats();
    });

    this.botSocket.on('error', (error) => {
      console.error('Erro do bot:', error);
      this.status.error = error.message;
      this.stats.errors++;
      this.broadcastStatus();
      this.broadcastStats();
    });

    this.botSocket.on('status-update', (status) => {
      this.status = { ...this.status, ...status };
      this.broadcastStatus();
    });

    this.botSocket.on('stats-update', (stats) => {
      this.stats = { ...this.stats, ...stats };
      this.broadcastStats();
    });
  }

  async requestNewQR() {
    if (!this.botSocket || !this.status.connected) {
      throw new Error('Não conectado ao bot principal');
    }
    
    this.botSocket.emit('request-new-qr');
  }

  async disconnect() {
    if (!this.botSocket || !this.status.connected) {
      throw new Error('Não conectado ao bot principal');
    }
    
    this.botSocket.emit('disconnect-whatsapp');
  }

  async reconnect() {
    if (!this.botSocket || !this.status.connected) {
      throw new Error('Não conectado ao bot principal');
    }
    
    this.botSocket.emit('reconnect-whatsapp');
  }

  getStatus() {
    return {
      ...this.status,
      uptime: Date.now() - this.stats.startTime
    };
  }

  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime
    };
  }

  broadcastStatus() {
    this.ioServer.emit('bot-status', this.getStatus());
  }

  broadcastStats() {
    this.ioServer.emit('stats-update', this.getStats());
  }
} 