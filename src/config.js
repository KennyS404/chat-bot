import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    whisperModel: process.env.WHISPER_MODEL || 'whisper-1',
    gptModel: process.env.GPT_MODEL || 'gpt-3.5-turbo',
    ttsModel: process.env.TTS_MODEL || 'tts-1',
    ttsVoice: process.env.TTS_VOICE || 'nova',
  },
  whatsapp: {
    sessionName: process.env.SESSION_NAME || 'whatsapp-bot',
    authDir: join(__dirname, '..', 'auth_info_baileys'),
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    storage: {
      bucket: 'audio-messages',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['audio/ogg', 'audio/mpeg', 'audio/wav'],
      compression: {
        enabled: true,
        maxSize: 1024 * 1024, // 1MB
        quality: 0.8
      }
    },
    database: {
      maxConnections: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    }
  },
  app: {
    tempDir: process.env.TEMP_DIR || join(__dirname, '..', 'temp'),
    maxAudioDuration: parseInt(process.env.MAX_AUDIO_DURATION || '120'),
    logLevel: process.env.LOG_LEVEL || 'info',
    enableAudioResponse: process.env.ENABLE_AUDIO_RESPONSE !== 'false',
  },
  messages: {
    welcome: '👋 Olá! Sou um assistente que corrige áudios. Envie um áudio e eu vou transcrever e sugerir correções gramaticais.',
    processing: '🎧 Processando seu áudio...',
    error: '❌ Desculpe, ocorreu um erro ao processar seu áudio. Por favor, tente novamente.',
    audioTooLong: '⏱️ O áudio é muito longo. Por favor, envie áudios de até 2 minutos.',
    notAudio: '🎵 Por favor, envie apenas mensagens de áudio.',
  }
};

// Validação de configuração
if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
  console.error('❌ OPENAI_API_KEY não configurada! Configure no arquivo .env');
  process.exit(1);
} 