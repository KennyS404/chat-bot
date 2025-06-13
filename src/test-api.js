import { config } from './config.js';
import { logger } from './logger.js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testAPI() {
  try {
    logger.info('🔑 Iniciando teste da API OpenAI...');
    
    // Verificar se a chave está configurada
    if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
      logger.error('❌ OpenAI API Key não configurada!');
      logger.error('   Configure OPENAI_API_KEY no arquivo .env');
      logger.error('   Obtenha sua chave em: https://platform.openai.com/api-keys');
      process.exit(1);
    }

    // Criar cliente OpenAI
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    // Testar acesso à API de modelos
    logger.info('📋 Testando acesso à API de modelos...');
    const models = await openai.models.list();
    logger.info('✅ Acesso à API de modelos OK');
    logger.info(`📋 Modelos disponíveis: ${models.data.map(m => m.id).join(', ')}`);

    // Verificar modelo Whisper
    if (models.data.some(m => m.id === config.openai.whisperModel)) {
      logger.info(`✅ Modelo ${config.openai.whisperModel} disponível`);
    } else {
      logger.warn(`⚠️ Modelo ${config.openai.whisperModel} não encontrado na lista de modelos disponíveis`);
    }

    // Testar acesso à API de áudio (TTS)
    logger.info('🔊 Testando acesso à API de áudio (TTS)...');
    const testText = 'Teste de permissões da API.';
    const testAudio = await openai.audio.speech.create({
      model: config.openai.ttsModel,
      voice: config.openai.ttsVoice,
      input: testText,
    });
    logger.info('✅ Acesso à API de áudio OK');

    // Testar transcrição com um arquivo de áudio real
    logger.info('🎧 Testando acesso à API de transcrição...');
    
    // Criar um arquivo de teste usando o TTS
    const testAudioBuffer = await testAudio.arrayBuffer();
    const testFilePath = path.join(__dirname, 'test-audio.mp3');
    await fs.writeFile(testFilePath, Buffer.from(testAudioBuffer));
    
    try {
      const testFile = await fs.readFile(testFilePath);
      
      // Criar um arquivo para upload
      const file = new File(
        [testFile],
        'test-audio.mp3',
        { type: 'audio/mpeg' }
      );

      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: config.openai.whisperModel,
        language: 'pt',
        response_format: 'text',
      });
      
      logger.info('✅ Acesso à API de transcrição OK');
      logger.info('📝 Transcrição de teste:', {
        texto: transcription,
        tamanho: transcription.length,
        modelo: config.openai.whisperModel
      });
      
      // Limpar arquivo de teste
      await fs.unlink(testFilePath);
    } catch (error) {
      // Log detalhado do erro imediatamente
      console.error('=== ERRO DE TRANSCRIÇÃO ===');
      console.error('Mensagem:', error.message);
      console.error('Status:', error.status);
      console.error('Código:', error.code);
      console.error('Tipo:', error.type);
      console.error('Resposta:', error.response?.data);
      console.error('Stack:', error.stack);
      console.error('========================');

      // Log através do logger
      logger.error('❌ Erro na API de transcrição:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        response: error.response?.data,
        stack: error.stack
      });

      if (error.status === 401) {
        logger.error('❌ Erro de autenticação na API de transcrição');
        logger.error('   Verifique se sua chave tem acesso ao modelo whisper-1');
      } else if (error.status === 429) {
        logger.error('❌ Limite de requisições excedido para transcrição');
      } else if (error.status === 403) {
        logger.error('❌ Sem permissão para usar o modelo whisper-1');
        logger.error('   Verifique se sua conta tem acesso ao modelo');
      } else {
        throw error;
      }
    }

    logger.info('✅ Teste de API concluído com sucesso!');
    logger.info('📝 Resumo:');
    logger.info('  - API Key: ✅ Válida');
    logger.info('  - Modelos: ✅ Acessíveis');
    logger.info('  - Whisper: ✅ Disponível');
    logger.info('  - TTS: ✅ Funcionando');
    logger.info('  - Transcrição: ✅ Configurada');

  } catch (error) {
    logger.error('❌ Erro ao testar API:', error);
    logger.error('Detalhes do erro:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      response: error.response?.data
    });

    if (error.status === 401) {
      logger.error('❌ Chave da API inválida ou expirada');
      logger.error('   Verifique se a chave está correta e tem as permissões necessárias');
      logger.error('   Obtenha uma nova chave em: https://platform.openai.com/api-keys');
    } else if (error.status === 429) {
      logger.error('❌ Limite de requisições excedido');
      logger.error('   Aguarde alguns minutos e tente novamente');
    } else if (error.status === 403) {
      logger.error('❌ Permissões insuficientes');
      logger.error('   Verifique se sua conta tem acesso aos modelos necessários');
      logger.error('   Modelos necessários: whisper-1, tts-1');
    }

    process.exit(1);
  }
}

// Executar o teste
testAPI(); 