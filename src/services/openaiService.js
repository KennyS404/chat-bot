import OpenAI from 'openai';
import { config } from '../config.js';
import { logger } from '../logger.js';

export class OpenAIService {
  constructor() {
    // Check if OpenAI API key is configured
    if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
      logger.error('❌ OpenAI API Key não configurada!');
      logger.error('   Configure OPENAI_API_KEY no arquivo .env');
      logger.error('   Obtenha sua chave em: https://platform.openai.com/api-keys');
      logger.error('   Execute: npm run setup-env para criar o arquivo .env');
      throw new Error('OpenAI API key missing');
    }
    
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async transcribeAudio(audioBuffer) {
    try {
      logger.info('Preparando áudio para transcrição...');
      const file = new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' });
      logger.info(`Arquivo preparado - Tamanho: ${file.size} bytes`);
      
      logger.info(`Enviando para Whisper (modelo: ${config.openai.whisperModel})...`);
      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: config.openai.whisperModel,
        language: 'pt',
        response_format: 'text',
      });

      logger.info('Transcrição recebida:', transcription);
      return transcription;
    } catch (error) {
      logger.error('Erro ao transcrever áudio:', error);
      logger.error('Detalhes do erro:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type
      });
      throw error;
    }
  }

  async correctGrammar(text) {
    try {
      logger.info(`Analisando gramática do texto: "${text}"`);
      logger.info(`Usando modelo: ${config.openai.gptModel}`);
      
      const response = await this.openai.chat.completions.create({
        model: config.openai.gptModel,
        messages: [
          {
            role: 'system',
            content: `Você é um corretor gramatical especializado em português brasileiro. 
            Sua tarefa é analisar o texto transcrito de um áudio e:
            1. Identificar erros gramaticais, ortográficos e de concordância
            2. Sugerir uma versão corrigida do texto
            3. Manter o sentido original da mensagem
            4. Ser conciso e direto na resposta
            
            Formato da resposta:
            - Se houver correções: "Você quis dizer: [texto corrigido]"
            - Se não houver correções: "✅ Seu áudio está correto!"
            
            Importante: Mantenha a naturalidade da fala, apenas corrija erros evidentes.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const correction = response.choices[0].message.content;
      logger.info('Correção recebida:', correction);
      return correction;
    } catch (error) {
      logger.error('Erro ao corrigir gramática:', error);
      logger.error('Detalhes do erro:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type
      });
      throw error;
    }
  }

  async textToSpeech(text) {
    try {
      logger.info('Gerando áudio da resposta...');
      logger.info(`Texto para TTS: "${text}"`);
      const startTime = Date.now();
      
      // Usar a voz mais natural disponível (nova voz da OpenAI)
      const response = await this.openai.audio.speech.create({
        model: config.openai.ttsModel, // tts-1 é mais rápido que tts-1-hd
        voice: config.openai.ttsVoice, // nova é a voz mais natural em português
        input: text,
        speed: 1.0, // Velocidade normal
        response_format: 'mp3' // Especificar formato MP3 explicitamente
      });

      logger.info('Resposta TTS recebida, convertendo para buffer...');
      
      // Converter a resposta em buffer
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      
      const duration = Date.now() - startTime;
      logger.info(`Áudio gerado em ${duration}ms - Tamanho: ${audioBuffer.length} bytes`);
      logger.info(`Primeiros bytes do áudio: ${audioBuffer.slice(0, 10).toString('hex')}`);
      
      // Verificar se é um MP3 válido (deve começar com ID3 ou FF FB)
      const header = audioBuffer.slice(0, 3).toString();
      const isValidMP3 = header === 'ID3' || audioBuffer[0] === 0xFF;
      logger.info(`Validação MP3 - Header: ${header}, É válido: ${isValidMP3}`);
      
      return audioBuffer;
    } catch (error) {
      logger.error('Erro ao gerar áudio:', error);
      logger.error('Detalhes do erro:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        response: error.response?.data
      });
      throw error;
    }
  }

  async processAudio(audioBuffer) {
    try {
      // Transcrever o áudio
      const transcription = await this.transcribeAudio(audioBuffer);
      logger.info('Transcrição:', transcription);

      // Corrigir gramática e gerar áudio em paralelo para máxima velocidade
      const correctionPromise = this.correctGrammar(transcription);
      
      // Aguardar a correção primeiro
      const correction = await correctionPromise;
      const hasCorrections = !correction.includes('✅');
      
      // Gerar áudio apenas se houver correções e estiver habilitado
      let audioResponse = null;
      if (hasCorrections && config.app.enableAudioResponse) {
        // Extrair apenas o texto corrigido para o áudio
        const correctedText = correction.replace('Você quis dizer: ', '');
        
        // Gerar áudio em paralelo com o envio da mensagem de texto
        audioResponse = await this.textToSpeech(correctedText);
      }
      
      return {
        transcription,
        correction,
        hasCorrections,
        audioResponse
      };
    } catch (error) {
      logger.error('Erro ao processar áudio:', error);
      throw error;
    }
  }
} 