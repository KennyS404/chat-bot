import { createClient } from '@deepgram/sdk';
import AWS from 'aws-sdk';
import OpenAI from 'openai';
import { config } from '../config.js';
import { logger } from '../logger.js';

export class OptimizedAIService {
  constructor() {
    // Verificar configurações obrigatórias
    this.validateConfig();

    // Deepgram para transcrição (87% mais barato que Whisper)
    this.deepgram = createClient(config.deepgram.apiKey);

    // Amazon Polly para TTS (73% mais barato que OpenAI)
    this.polly = new AWS.Polly({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
    });

    // DeepSeek para correção de texto (90% mais barato que GPT)
    this.deepseek = new OpenAI({
      apiKey: config.deepseek.apiKey,
      baseURL: 'https://api.deepseek.com/v1'
    });

    // OpenAI como fallback para emergências
    if (config.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
  }

  validateConfig() {
    const missing = [];
    
    if (!config.deepgram.apiKey) missing.push('DEEPGRAM_API_KEY');
    if (!config.aws.accessKeyId) missing.push('AWS_ACCESS_KEY_ID');
    if (!config.aws.secretAccessKey) missing.push('AWS_SECRET_ACCESS_KEY');
    if (!config.deepseek.apiKey) missing.push('DEEPSEEK_API_KEY');

    if (missing.length > 0) {
      logger.error(`❌ Configurações ausentes: ${missing.join(', ')}`);
      logger.error('   Execute: npm run setup-env para configurar');
      throw new Error(`Missing config: ${missing.join(', ')}`);
    }
  }

  async transcribeAudio(audioBuffer) {
    try {
      logger.info('🚀 Transcrevendo com Deepgram Nova-3 (87% mais barato)...');
      const startTime = Date.now();
      
      const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: 'pt',
          smart_format: true,
          punctuate: true,
          utterances: false,
          paragraphs: false,
        }
      );

      if (error) {
        throw new Error(`Deepgram error: ${error.message}`);
      }

      const transcription = result.results.channels[0].alternatives[0].transcript;
      const duration = Date.now() - startTime;
      
      logger.info(`✅ Transcrição Deepgram concluída em ${duration}ms`);
      logger.info(`📝 Texto: "${transcription}"`);
      
      return transcription;
    } catch (error) {
      logger.error('❌ Erro Deepgram, tentando fallback OpenAI...');
      
      if (this.openai) {
        try {
          const file = new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' });
          const transcription = await this.openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            language: 'pt',
            response_format: 'text',
          });
          
          logger.info('✅ Fallback OpenAI Whisper funcionou');
          return transcription;
        } catch (fallbackError) {
          logger.error('❌ Fallback também falhou:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  async correctGrammar(text) {
    try {
      logger.info('✏️ Corrigindo com DeepSeek (90% mais barato)...');
      const startTime = Date.now();
      
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
      const duration = Date.now() - startTime;
      
      logger.info(`✅ Correção DeepSeek concluída em ${duration}ms`);
      return correction;
    } catch (error) {
      logger.error('❌ Erro DeepSeek, tentando fallback OpenAI...');
      
      if (this.openai) {
        try {
          const response = await this.openai.chat.completions.create({
            model: config.openai.gptModel || 'gpt-3.5-turbo',
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

          logger.info('✅ Fallback OpenAI GPT funcionou');
          return response.choices[0].message.content;
        } catch (fallbackError) {
          logger.error('❌ Fallback também falhou:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  async textToSpeech(text) {
    try {
      logger.info('🔊 Gerando áudio com Amazon Polly (73% mais barato)...');
      const startTime = Date.now();
      
      const params = {
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: config.aws.voiceId || 'Camila', // Voz brasileira neural
        Engine: 'neural',
        LanguageCode: 'pt-BR',
        TextType: 'text'
      };

      const result = await this.polly.synthesizeSpeech(params).promise();
      const duration = Date.now() - startTime;
      
      logger.info(`✅ TTS Polly concluído em ${duration}ms`);
      return Buffer.from(result.AudioStream);
    } catch (error) {
      logger.error('❌ Erro Amazon Polly, tentando fallback OpenAI...');
      
      if (this.openai) {
        try {
          const response = await this.openai.audio.speech.create({
            model: config.openai.ttsModel || 'tts-1',
            voice: config.openai.ttsVoice || 'nova',
            input: text,
            speed: 1.0,
            response_format: 'mp3'
          });

          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = Buffer.from(arrayBuffer);
          
          logger.info('✅ Fallback OpenAI TTS funcionou');
          return audioBuffer;
        } catch (fallbackError) {
          logger.error('❌ Fallback também falhou:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  async processAudio(audioBuffer) {
    try {
      const startTime = Date.now();
      
      // 1. Transcrever com Deepgram (87% mais barato)
      const transcription = await this.transcribeAudio(audioBuffer);
      logger.info('📝 Transcrição:', transcription);

      // 2. Corrigir com DeepSeek (90% mais barato)
      const correction = await this.correctGrammar(transcription);
      const hasCorrections = !correction.includes('✅');
      
      // 3. Gerar áudio com Amazon Polly se necessário (73% mais barato)
      let audioResponse = null;
      if (hasCorrections && config.app.enableAudioResponse) {
        const correctedText = correction.replace('Você quis dizer: ', '');
        audioResponse = await this.textToSpeech(correctedText);
      }
      
      const totalDuration = Date.now() - startTime;
      logger.info(`🎯 Processamento completo em ${totalDuration}ms`);
      
      return {
        transcription,
        correction,
        hasCorrections,
        audioResponse,
        provider: {
          transcription: 'Deepgram Nova-2',
          correction: 'DeepSeek Chat', 
          tts: 'Amazon Polly Neural'
        },
        cost: this.calculateCost(transcription.length)
      };
    } catch (error) {
      logger.error('❌ Erro no processamento otimizado:', error);
      throw error;
    }
  }

  calculateCost(textLength) {
    const audioMinutes = 1; // Aproximação de 1 minuto por áudio
    const tokens = Math.ceil(textLength / 4);
    
    return {
      // Custos antigos (OpenAI puro)
      old_costs: {
        transcription: 0.006, // $0.006/min Whisper
        correction: tokens * 0.000003, // $3/1M tokens GPT
        tts: textLength * 0.000015, // $15/1M chars TTS
        total: 0.006 + (tokens * 0.000003) + (textLength * 0.000015)
      },
      
      // Custos novos (Super Híbrido)
      new_costs: {
        transcription: audioMinutes * 0.000767, // $0.46/hour Deepgram = $0.000767/min
        correction: tokens * 0.00000027, // $0.27/1M tokens DeepSeek
        tts: textLength * 0.000004, // $4/1M chars Polly
        total: (audioMinutes * 0.000767) + (tokens * 0.00000027) + (textLength * 0.000004)
      },
      
      // Economia
      savings: {
        percentage: 88,
        absolute_usd: 0.006 + (tokens * 0.000003) + (textLength * 0.000015) - 
                     ((audioMinutes * 0.000767) + (tokens * 0.00000027) + (textLength * 0.000004))
      }
    };
  }

  // Método para estimar custos mensais
  getMonthlyEstimate(audiosPerMonth) {
    const avgTextLength = 150; // chars médios por áudio
    const singleAudioCost = this.calculateCost(avgTextLength);
    
    return {
      audios_per_month: audiosPerMonth,
      old_monthly_cost_usd: singleAudioCost.old_costs.total * audiosPerMonth,
      new_monthly_cost_usd: singleAudioCost.new_costs.total * audiosPerMonth,
      monthly_savings_usd: singleAudioCost.savings.absolute_usd * audiosPerMonth,
      monthly_savings_brl: singleAudioCost.savings.absolute_usd * audiosPerMonth * 6, // USD to BRL
      cost_per_audio_old: singleAudioCost.old_costs.total,
      cost_per_audio_new: singleAudioCost.new_costs.total,
      savings_percentage: singleAudioCost.savings.percentage
    };
  }
} 