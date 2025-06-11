import { createServer } from 'http';
import { Server } from 'socket.io';
import { logger } from '../logger.js';

export class SocketService {
    constructor() {
        this.io = null;
        this.stats = {
            messagesReceived: 0,
            messagesProcessed: 0,
            audiosCorrected: 0,
            errors: 0,
            startTime: Date.now()
        };
        this.status = {
            connected: false,
            authenticated: false,
            phoneNumber: null,
            qrCode: null,
            error: null
        };
    }

    start(port = 8080) {
        const server = createServer();
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            logger.info('Cliente administrativo conectado:', socket.id);
            
            // Enviar status inicial
            socket.emit('bot-status', this.getStatus());
            socket.emit('stats-update', this.getStats());
            
            // Handlers de eventos do admin
            socket.on('request-new-qr', () => {
                this.emit('admin-request-qr');
            });
            
            socket.on('disconnect-whatsapp', () => {
                this.emit('admin-disconnect');
            });
            
            socket.on('reconnect-whatsapp', () => {
                this.emit('admin-reconnect');
            });
            
            socket.on('get-stats', () => {
                socket.emit('stats-update', this.getStats());
            });
            
            socket.on('disconnect', () => {
                logger.info('Cliente administrativo desconectado:', socket.id);
            });
        });

        server.listen(port, () => {
            logger.info(`🌐 Servidor Socket.io rodando na porta ${port}`);
        });
    }

    // Métodos para atualizar status
    updateStatus(updates) {
        this.status = { ...this.status, ...updates };
        this.broadcast('bot-status', this.getStatus());
    }

    setConnected(connected) {
        this.status.connected = connected;
        this.updateStatus({ connected });
    }

    setAuthenticated(authenticated, phoneNumber = null) {
        this.status.authenticated = authenticated;
        this.status.phoneNumber = phoneNumber;
        this.status.qrCode = null;
        this.updateStatus({ authenticated, phoneNumber, qrCode: null });
    }

    setQRCode(qrCode) {
        this.status.qrCode = qrCode;
        this.status.authenticated = false;
        this.status.connected = false;
        this.status.phoneNumber = null;
        this.updateStatus({ 
            qrCode, 
            authenticated: false,
            connected: false,
            phoneNumber: null,
            error: null
        });
        
        // Enviar instruções para o frontend
        this.sendLog('info', 'QR Code gerado. Por favor, escaneie com seu WhatsApp.');
    }

    setError(error) {
        this.status.error = error;
        this.updateStatus({ error });
    }

    // Métodos para estatísticas
    incrementMessageReceived() {
        this.stats.messagesReceived++;
        this.broadcast('stats-update', this.getStats());
        this.broadcast('message-received');
    }

    incrementMessageProcessed() {
        this.stats.messagesProcessed++;
        this.broadcast('stats-update', this.getStats());
        this.broadcast('message-processed');
    }

    incrementAudioCorrected() {
        this.stats.audiosCorrected++;
        this.broadcast('stats-update', this.getStats());
        this.broadcast('audio-corrected');
    }

    incrementErrors() {
        this.stats.errors++;
        this.broadcast('stats-update', this.getStats());
    }

    // Enviar log para o admin
    sendLog(level, message) {
        this.broadcast('log-entry', {
            timestamp: new Date(),
            level,
            message
        });
    }

    // Métodos auxiliares
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

    broadcast(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    emit(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
} 