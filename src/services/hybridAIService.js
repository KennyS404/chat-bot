import OpenAI from 'openai';
import { config } from '../config.js';
import { logger } from '../logger.js';

export class HybridAIService {
  constructor() {
    // OpenAI para áudio (Whisper + TTS)
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    // DeepSeek para correção de texto (muito mais barato!)
    this.deepseek = new OpenAI({
      apiKey: config.deepseek.apiKey,
      baseURL: 'https://api.deepseek.com/v1'
    });
  }

  async transcribeAudio(audioBuffer) {
    try {
      logger.info('🎧 Transcrevendo áudio com OpenAI Whisper...');
      const file = new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' });
      
      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: config.openai.whisperModel,
        language: 'pt',
        response_format: 'text',
      });

      logger.info('✅ Transcrição concluída');
      return transcription;
    } catch (error) {
      logger.error('❌ Erro na transcrição:', error);
      throw error;
    }
  }

  async correctGrammar(text) {
    try {
      logger.info('✏️ Corrigindo gramática com DeepSeek (economia de 90%)...');
      
      const response = await this.deepseek.chat.completions.create({
        model: 'deepseek-chat',
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
      logger.info('✅ Correção concluída com DeepSeek');
      return correction;
    } catch (error) {
      logger.error('❌ Erro DeepSeek, fallback para OpenAI...');
      
      // Fallback para OpenAI se DeepSeek falhar
      const response = await this.openai.chat.completions.create({
        model: config.openai.gptModel,
        messages: [
          {
            role: 'system',
            content: `Você é um corretor gramatical especializado em português brasileiro...`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    }
  }

  async textToSpeech(text) {
    try {
      logger.info('🔊 Gerando áudio com OpenAI TTS...');
      
      const response = await this.openai.audio.speech.create({
        model: config.openai.ttsModel,
        voice: config.openai.ttsVoice,
        input: text,
        speed: 1.0,
        response_format: 'mp3'
      });

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      
      logger.info('✅ Áudio gerado');
      return audioBuffer;
    } catch (error) {
      logger.error('❌ Erro no TTS:', error);
      throw error;
    }
  }

  async processAudio(audioBuffer) {
    try {
      // 1. Transcrever com OpenAI (necessário)
      const transcription = await this.transcribeAudio(audioBuffer);
      logger.info('📝 Transcrição:', transcription);

      // 2. Corrigir com DeepSeek (90% mais barato!)
      const correction = await this.correctGrammar(transcription);
      const hasCorrections = !correction.includes('✅');
      
      // 3. Gerar áudio com OpenAI se necessário
      let audioResponse = null;
      if (hasCorrections && config.app.enableAudioResponse) {
        const correctedText = correction.replace('Você quis dizer: ', '');
        audioResponse = await this.textToSpeech(correctedText);
      }
      
      return {
        transcription,
        correction,
        hasCorrections,
        audioResponse,
        provider: {
          transcription: 'OpenAI Whisper',
          correction: 'DeepSeek Chat',
          tts: 'OpenAI TTS'
        }
      };
    } catch (error) {
      logger.error('❌ Erro no processamento híbrido:', error);
      throw error;
    }
  }

  // Método para estimativa de custos
  getEstimatedCost(textLength) {
    const tokens = Math.ceil(textLength / 4); // Aproximação
    
    return {
      openai_only: {
        correction: tokens * 0.000003, // $3/1M tokens
        transcription: 0.006, // $0.006/minuto
        tts: textLength * 0.000015 // $15/1M chars
      },
      hybrid: {
        correction: tokens * 0.00000027, // $0.27/1M tokens DeepSeek
        transcription: 0.006, // OpenAI Whisper
        tts: textLength * 0.000015, // OpenAI TTS
        savings: '~90% na correção'
      }
    };
  }
} 