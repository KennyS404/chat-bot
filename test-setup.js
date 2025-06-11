import { config } from './src/config.js';
import { logger } from './src/logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkSetup() {
  console.log('🔍 Verificando configuração do projeto...\n');

  // Verificar Node.js
  try {
    const { stdout } = await execAsync('node --version');
    console.log(`✅ Node.js: ${stdout.trim()}`);
  } catch (error) {
    console.log('❌ Node.js não encontrado');
  }

  // Verificar FFmpeg
  try {
    const { stdout } = await execAsync('ffmpeg -version | head -n 1');
    console.log(`✅ FFmpeg: ${stdout.trim()}`);
  } catch (error) {
    console.log('❌ FFmpeg não encontrado. Instale com: sudo apt install ffmpeg');
  }

  // Verificar OpenAI API Key
  if (config.openai.apiKey && config.openai.apiKey !== 'your_openai_api_key_here') {
    console.log('✅ OpenAI API Key configurada');
  } else {
    console.log('❌ OpenAI API Key não configurada. Edite o arquivo .env');
  }

  // Verificar diretórios
  console.log(`\n📁 Diretórios configurados:`);
  console.log(`   - Temp: ${config.app.tempDir}`);
  console.log(`   - Auth: ${config.whatsapp.authDir}`);

  console.log('\n📋 Configurações:');
  console.log(`   - Duração máxima de áudio: ${config.app.maxAudioDuration}s`);
  console.log(`   - Modelo Whisper: ${config.openai.whisperModel}`);
  console.log(`   - Modelo GPT: ${config.openai.gptModel}`);
  console.log(`   - Nível de log: ${config.app.logLevel}`);

  console.log('\n🚀 Para iniciar o bot:');
  console.log('   1. Configure sua OPENAI_API_KEY no arquivo .env');
  console.log('   2. Execute: npm start');
  console.log('   3. Escaneie o QR Code com seu WhatsApp');
}

checkSetup().catch(console.error); 