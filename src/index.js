// Node.js version check
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0]);

if (majorVersion < 20) {
  console.error('❌ Este projeto requer Node.js 20 ou superior');
  console.error(`   Versão atual: ${nodeVersion}`);
  console.error('   Use: nvm use 20 (ou instale Node.js 20+)');
  process.exit(1);
}

// Polyfill para crypto no Node.js
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

// Garantir que o webcrypto está disponível
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  console.error('❌ Crypto API não disponível. Certifique-se de que está usando Node.js 20+');
  process.exit(1);
}

import { WhatsAppService } from './services/whatsappService.js';
import { logger } from './logger.js';

async function main() {
  logger.info('🚀 Iniciando WhatsApp Audio Corrector Bot...');

  const whatsappService = new WhatsAppService();

  // Tratamento de sinais para encerramento gracioso
  process.on('SIGINT', async () => {
    logger.info('⏹️  Encerrando aplicação...');
    await whatsappService.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('⏹️  Encerrando aplicação...');
    await whatsappService.stop();
    process.exit(0);
  });

  // Tratamento de erros não capturados
  process.on('uncaughtException', (error) => {
    logger.error('Erro não capturado:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promise rejeitada não tratada:', reason);
    process.exit(1);
  });

  try {
    await whatsappService.start();
  } catch (error) {
    logger.error('Erro ao iniciar serviço:', error);
    process.exit(1);
  }
}

main(); 