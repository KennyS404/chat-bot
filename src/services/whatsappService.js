import pkg from '@whiskeysockets/baileys';
const { 
  default: makeWASocket,
  DisconnectReason, 
  useMultiFileAuthState,
  downloadMediaMessage
} = pkg;
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { AudioService } from './audioService.js';
import { EnhancedAIService } from './enhancedAIService.js';
import { SocketService } from './socketService.js';
import databaseService from './databaseService.js';

export class WhatsAppService {
  constructor() {
    this.audioService = new AudioService();
    this.enhancedAIService = new EnhancedAIService();
    this.socketService = new SocketService();
    this.sock = null;
    this.processingMessages = new Set();
    
    // Iniciar servidor Socket.io
    this.socketService.start(8080);
    
    // Configurar listeners para comandos do admin
    this.setupAdminListeners();
  }

  setupAdminListeners() {
    // Escutar eventos do admin via EventEmitter do socketService
    this.socketService.io?.on('connection', (socket) => {
      socket.on('request-new-qr', async () => {
        logger.info('Admin solicitou novo QR Code');
        await this.requestNewQR();
      });
      
      socket.on('disconnect-whatsapp', async () => {
        logger.info('Admin solicitou desconexão');
        await this.disconnect();
      });
      
      socket.on('reconnect-whatsapp', async () => {
        logger.info('Admin solicitou reconexão');
        await this.reconnect();
      });
    });
  }

  async start() {
    // Inicializar banco de dados
    try {
      await databaseService.initialize();
      logger.info('✅ Banco de dados inicializado com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao inicializar banco de dados:', error);
      throw error;
    }

    const { state, saveCreds } = await useMultiFileAuthState(config.whatsapp.authDir);

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger,
      browser: ['Audio Corrector Bot', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: true,
    });

    // Eventos de conexão
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Usar função otimizada para melhor visualização no Render
        await this.displayQRCodeOptimized(qr);
        
        // Enviar QR para o admin
        this.socketService.setQRCode(qr);
        this.socketService.sendLog('info', 'Novo QR Code gerado com múltiplos métodos');
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
          : true;

        logger.info('Conexão fechada devido a', lastDisconnect?.error, ', reconectando', shouldReconnect);
        
        // Atualizar status
        this.socketService.setConnected(false);
        this.socketService.sendLog('warning', `Conexão fechada: ${lastDisconnect?.error}`);

        if (shouldReconnect) {
          setTimeout(() => this.start(), 5000);
        }
      } else if (connection === 'open') {
        logger.info('✅ Conectado ao WhatsApp com sucesso!');
        logger.info('🤖 Bot pronto para receber mensagens!');
        logger.info('📱 Envie um áudio para testar a correção gramatical');
        
        // Atualizar status
        this.socketService.setConnected(true);
        
        // Obter informações do usuário
        const user = this.sock.user;
        const phoneNumber = user?.id?.split(':')[0] || 'Desconhecido';
        this.socketService.setAuthenticated(true, phoneNumber);
        this.socketService.sendLog('info', 'Bot conectado com sucesso');
      }
    });

    // Salvar credenciais
    this.sock.ev.on('creds.update', saveCreds);

    // Processar mensagens
    this.sock.ev.on('messages.upsert', async (m) => {
      try {
        const message = m.messages[0];
        if (!message.message || message.key.fromMe) return;

        // Incrementar contador de mensagens recebidas
        this.socketService.incrementMessageReceived();

        // Ignorar mensagens de sistema e grupos
        if (message.key.remoteJid.endsWith('@g.us')) {
          logger.debug('Ignorando mensagem de grupo');
          return;
        }

        // Ignorar tipos de mensagem de sistema
        const messageType = Object.keys(message.message)[0];
        const systemMessageTypes = [
          'senderKeyDistributionMessage',
          'messageContextInfo',
          'protocolMessage',
          'reactionMessage'
        ];
        
        if (systemMessageTypes.includes(messageType)) {
          logger.debug(`Ignorando mensagem de sistema: ${messageType}`);
          return;
        }

        await this.handleMessage(message);
      } catch (error) {
        logger.error('Erro ao processar mensagem:', error);
        this.socketService.incrementErrors();
        this.socketService.sendLog('error', `Erro ao processar mensagem: ${error.message}`);
      }
    });
  }

  async handleMessage(message) {
    const messageId = message.key.id;
    const from = message.key.remoteJid;
    const messageType = Object.keys(message.message)[0];

    logger.info(`Nova mensagem recebida - Tipo: ${messageType}, De: ${from}, ID: ${messageId}`);
    this.socketService.sendLog('info', `Nova mensagem - Tipo: ${messageType}`);

    // Evitar processar a mesma mensagem múltiplas vezes
    if (this.processingMessages.has(messageId)) {
      logger.debug('Mensagem já está sendo processada, ignorando duplicata');
      return;
    }
    this.processingMessages.add(messageId);

    try {
      // Salvar ou atualizar usuário
      try {
        const userInfo = await this.sock.fetchStatus(from);
        await databaseService.createUser(
          from,
          from.split('@')[0],
          userInfo?.status || 'Usuário WhatsApp'
        );
        await databaseService.updateUserLastInteraction(from);
      } catch (userError) {
        logger.error('Error creating user:', userError.message || userError);
        logger.error('User creation stack trace:', userError.stack);
        logger.error('User creation details:', {
          from,
          phoneNumber: from.split('@')[0],
          message: userError.message,
          code: userError.code,
          type: userError.constructor.name
        });
        // Não falha o processamento se o usuário não puder ser criado
        // Pode ser um usuário duplicado ou problema temporário de conectividade
      }

      // Mensagem de boas-vindas para texto
      if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
        logger.info('Mensagem de texto recebida, enviando boas-vindas');
        
        // Comando de teste
        const textMessage = message.message.conversation || message.message.extendedTextMessage?.text || '';
        if (textMessage.toLowerCase() === 'ping') {
          await this.sendMessage(from, '🏓 Pong! Bot está funcionando!');
          this.socketService.incrementMessageProcessed();
          return;
        }
        
        // Comando de teste de áudio (COMENTADO conforme solicitado)
        if (textMessage.toLowerCase() === 'testaudio') {
          logger.info('Comando testaudio recebido, mas áudio está desabilitado...');
          await this.sendMessage(from, '🔊 Funcionalidade de áudio está temporariamente desabilitada.');
          this.socketService.incrementMessageProcessed();
          return;
        }
        
        // Comando para limpar contexto de conversa
        if (textMessage.toLowerCase() === 'limpar') {
          logger.info('Comando limpar recebido, limpando contexto de conversa...');
          this.enhancedAIService.clearConversationContext(from);
          await this.sendMessage(from, '🧹 Contexto de conversa limpo! Podemos começar uma nova conversa.');
          this.socketService.incrementMessageProcessed();
          return;
        }
        
        await this.sendMessage(from, config.messages.welcome);
        this.socketService.incrementMessageProcessed();
        return;
      }

      // Processar apenas áudios
      if (messageType !== 'audioMessage') {
        logger.info(`Tipo de mensagem não suportado: ${messageType}`);
        await this.sendMessage(from, config.messages.notAudio);
        this.socketService.incrementMessageProcessed();
        return;
      }

      logger.info('Processando mensagem de áudio...');
      this.socketService.sendLog('info', 'Processando áudio recebido');

      // Enviar mensagem de processamento
      await this.sendMessage(from, config.messages.processing);

      try {
        // Baixar o áudio
        logger.info('Baixando áudio...');
        const audioBuffer = await downloadMediaMessage(
          message,
          'buffer',
          {},
          {
            logger,
            reuploadRequest: this.sock.updateMediaMessage
          }
        );
        logger.info(`Áudio baixado - Tamanho: ${audioBuffer.length} bytes`);

        // Verificar duração do áudio
        logger.info('Verificando duração do áudio...');
        const duration = await this.audioService.getAudioDuration(audioBuffer, messageId);
        logger.info(`Duração do áudio: ${duration} segundos`);
        
        if (duration > config.app.maxAudioDuration) {
          await this.sendMessage(from, config.messages.audioTooLong);
          this.socketService.incrementMessageProcessed();
          return;
        }

        // Salvar áudio no banco de dados
        logger.info('Salvando áudio no banco de dados...');
        const audioData = {
          buffer: audioBuffer,
          duration,
          mimeType: 'audio/ogg'
        };
        const savedAudio = await databaseService.storeAudio(from, audioData);
        logger.info('Áudio salvo com sucesso');

        // Converter áudio para MP3
        logger.info('Convertendo áudio para MP3...');
        const mp3Buffer = await this.audioService.downloadAndConvert(audioBuffer, messageId);
        logger.info(`Áudio convertido - Tamanho MP3: ${mp3Buffer.length} bytes`);

        // Processar com IA Aprimorada
        logger.info('Enviando para IA Aprimorada...');
        const result = await this.enhancedAIService.processAudio(mp3Buffer, from);
        logger.info('Resposta da IA Aprimorada recebida');

        // Atualizar transcrição no banco de dados
        await databaseService.updateAudioTranscription(
          savedAudio.id,
          result.transcription,
          result.correction
        );

        // Enviar resposta completa
        let response = `🎯 *Transcrição:*\n_"${result.transcription}"_\n\n`;
        response += `📝 *Correção:*\n${result.correction}\n\n`;
        
        // Adicionar informação sobre tipo de conteúdo
        if (result.contentType === 'MUSIC') {
          response += `🎵 *Detectado:* Fragmento de música\n\n`;
        } else if (result.contentType === 'QUESTION') {
          response += `❓ *Detectado:* Pergunta de conhecimento\n\n`;
        }
        
        response += `💬 *Conversa:*\n${result.interactiveResponse}`;

        await this.sendMessage(from, response);
        
        // Áudio está comentado conforme solicitado
        // if (result.hasCorrections && result.audioResponse) {
        //   logger.info('Enviando áudio com a correção...');
        //   try {
        //     await this.sendAudio(from, result.audioResponse, result.transcription);
        //     this.socketService.incrementAudioCorrected();
        //   } catch (audioError) {
        //     logger.error('Falha ao enviar áudio, tentando alternativa...', {
        //       error: audioError.message,
        //       code: audioError.code,
        //       stack: audioError.stack
        //     });
        //     
        //     // Tentar enviar como documento de áudio se PTT falhar
        //     try {
        //       await this.sock.sendMessage(from, {
        //         document: result.audioResponse,
        //         mimetype: 'audio/mpeg',
        //         fileName: 'correcao_gramatical.mp3'
        //       });
        //       logger.info('Áudio enviado como documento');
        //       this.socketService.incrementAudioCorrected();
        //     } catch (docError) {
        //       logger.error('Falha ao enviar áudio como documento:', {
        //         error: docError.message,
        //         code: docError.code,
        //         stack: docError.stack
        //       });
        //       // Enviar mensagem informando o erro
        //       await this.sendMessage(from, '⚠️ Não foi possível enviar o áudio com a correção, mas o texto está acima.');
        //       this.socketService.incrementErrors();
        //     }
        //   }
        // }
        
        logger.info('Resposta enviada com sucesso');
        this.socketService.incrementMessageProcessed();
        this.socketService.sendLog('info', 'Áudio processado com sucesso');

      } catch (error) {
        logger.error('Erro ao processar áudio:', error.message || error);
        logger.error('Stack trace completo:', error.stack);
        logger.error('Detalhes do erro:', {
          message: error.message,
          code: error.code,
          status: error.status,
          response: error.response?.data,
          type: error.constructor.name,
          cause: error.cause,
          messageId,
          from,
          messageType
        });

        // Verificar tipo específico de erro
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          await this.sendMessage(from, '⚠️ Erro de conexão com o serviço. Por favor, tente novamente em alguns instantes.');
        } else if (error.message?.includes('invalid audio file')) {
          await this.sendMessage(from, '⚠️ O arquivo de áudio parece estar corrompido. Por favor, tente enviar novamente.');
        } else {
          await this.sendMessage(from, config.messages.error);
        }

        this.socketService.incrementErrors();
        this.socketService.sendLog('error', `Erro ao processar áudio: ${error.message}`);
      } finally {
        this.processingMessages.delete(messageId);
      }

    } catch (error) {
      logger.error('Erro ao processar mensagem:', error);
      logger.error('Stack trace completo:', error.stack);
      logger.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response?.data,
        type: error.constructor.name,
        cause: error.cause
      });
      await this.sendMessage(from, config.messages.error);
      this.socketService.incrementErrors();
      this.socketService.sendLog('error', `Erro ao processar mensagem: ${error.message}`);
    }
  }

  async sendMessage(to, text) {
    try {
      await this.sock.sendMessage(to, { text });
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      this.socketService.incrementErrors();
    }
  }

  async sendAudio(to, audioBuffer, caption) {
    try {
      logger.info(`Preparando para enviar áudio - Destinatário: ${to}`);
      logger.info(`Tamanho do buffer de áudio: ${audioBuffer.length} bytes`);
      logger.info(`Tipo do buffer: ${typeof audioBuffer}, É Buffer: ${Buffer.isBuffer(audioBuffer)}`);
      
      const messageOptions = {
        audio: audioBuffer,
        mimetype: 'audio/mpeg', // Mudando para audio/mpeg que é mais compatível
        ptt: true, // Enviar como mensagem de voz
        fileName: 'correcao.mp3'
      };
      
      logger.info('Opções da mensagem:', {
        mimetype: messageOptions.mimetype,
        ptt: messageOptions.ptt,
        audioSize: messageOptions.audio.length
      });
      
      const result = await this.sock.sendMessage(to, messageOptions);
      
      logger.info('Resultado do envio:', {
        key: result?.key,
        status: result?.status,
        messageID: result?.key?.id
      });
      
      logger.info('Áudio enviado com sucesso');
      return result;
    } catch (error) {
      logger.error('Erro ao enviar áudio:', error);
      logger.error('Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        type: error.constructor.name
      });
      throw error;
    }
  }

  async requestNewQR() {
    try {
      // Desconectar e limpar dados de autenticação
      await this.disconnect();
      
      // Limpar diretório de autenticação
      const fs = await import('fs/promises');
      const path = await import('path');
      const authDir = path.join(process.cwd(), 'auth_info_baileys');
      
      try {
        await fs.rm(authDir, { recursive: true, force: true });
        logger.info('Diretório de autenticação limpo com sucesso');
      } catch (error) {
        logger.error('Erro ao limpar diretório de autenticação:', error);
      }
      
      // Aguardar um momento para garantir que tudo foi limpo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reiniciar conexão
      await this.start();
      
      // Notificar frontend
      this.socketService.sendLog('info', 'Novo QR Code solicitado');
    } catch (error) {
      logger.error('Erro ao solicitar novo QR:', error);
      this.socketService.setError('Erro ao gerar novo QR Code');
    }
  }

  async disconnect() {
    try {
      this.sock?.end();
      this.socketService.setConnected(false);
      this.socketService.setAuthenticated(false);
      this.socketService.sendLog('info', 'Bot desconectado');
    } catch (error) {
      logger.error('Erro ao desconectar:', error);
      this.socketService.setError('Erro ao desconectar');
    }
  }

  async reconnect() {
    try {
      await this.disconnect();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.start();
    } catch (error) {
      logger.error('Erro ao reconectar:', error);
      this.socketService.setError('Erro ao reconectar');
    }
  }

  async stop() {
    this.sock?.end();
  }

  // Função alternativa para gerar QR code ASCII simples
  async generateSimpleQR(qrString) {
    try {
      // Gerar QR code como texto ASCII simples
      const qrAscii = await QRCode.toString(qrString, {
        type: 'terminal',
        small: true,
        errorCorrectionLevel: 'L',
        margin: 1
      });
      
      console.log('\n');
      console.log('> QR CODE ASCII SIMPLES:');
      console.log('*'.repeat(40));
      console.log(qrAscii);
      console.log('*'.repeat(40));
      console.log('\n');
      
    } catch (error) {
      logger.error('Erro ao gerar QR ASCII simples:', error);
    }
  }

  // Função para melhorar visualização do QR code no Render
  async displayQRCodeOptimized(qrString) {
    try {
      // Não usar console.clear() no ambiente de deploy
      const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
      
      if (!isProduction) {
        console.clear();
      }
      
      // Espaçamento inicial
      console.log('\n'.repeat(3));
      
      // Cabeçalho chamativo usando apenas ASCII
      console.log('='.repeat(60));
      console.log('                 WHATSAPP QR CODE                 ');
      console.log('='.repeat(60));
      console.log('\n');
      
      // Método 1: QR code terminal padrão
      console.log('> METODO 1 - ESCANEIE COM SEU WHATSAPP:');
      console.log('-'.repeat(50));
      console.log('\n');
      
      qrcode.generate(qrString, {
        small: true,
        errorCorrectionLevel: 'L',
        margin: 1
      });
      
      console.log('\n');
      console.log('-'.repeat(50));
      console.log('\n');
      
      // Método 2: QR code ASCII alternativo
      await this.generateSimpleQR(qrString);
      
      // Método 3: Versão ainda mais simples
      console.log('> METODO 3 - VERSAO ULTRA SIMPLES:');
      console.log('.'.repeat(30));
      console.log('\n');
      
      qrcode.generate(qrString, {
        small: true,
        errorCorrectionLevel: 'L',
        margin: 0
      });
      
      console.log('\n');
      console.log('.'.repeat(30));
      console.log('\n');
      
      // Instruções usando apenas ASCII
      console.log('='.repeat(50));
      console.log('COMO CONECTAR:');
      console.log('='.repeat(50));
      console.log('1. Abra o WhatsApp no celular');
      console.log('2. Toque nos 3 pontos no canto superior');
      console.log('3. Selecione "Dispositivos conectados"');
      console.log('4. Toque em "Conectar um dispositivo"');
      console.log('5. Escaneie QUALQUER UM dos QR codes acima');
      console.log('6. Aguarde alguns segundos...');
      console.log('='.repeat(50));
      console.log('\n');
      
      // Dicas específicas para Render
      console.log('DICAS PARA O RENDER:');
      console.log('- Expanda os logs para ver todos os QR codes');
      console.log('- Tente todos os 3 metodos se necessario');
      console.log('- Use CTRL+F e busque por "block" ou quadrados');
      console.log('- QR codes sao renovados automaticamente');
      console.log('- Tente diferentes distancias da tela');
      console.log('- Use um celular com boa camera');
      console.log('\n');
      
      // Status
      console.log('AGUARDANDO CONEXAO... QR valido por alguns minutos');
      console.log('Se expirar, o bot ira gerar novos automaticamente');
      console.log('='.repeat(60));
      console.log('\n');
      
    } catch (error) {
      logger.error('Erro ao exibir QR code otimizado:', error);
      // Fallback super simples
      console.log('\n> QR Code WhatsApp (FALLBACK):\n');
      qrcode.generate(qrString, { 
        small: true,
        errorCorrectionLevel: 'L'
      });
      console.log('\n> Use o QR code acima para conectar\n');
    }
  }
} 