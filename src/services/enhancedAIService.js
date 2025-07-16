import OpenAI from 'openai';
import { config } from '../config.js';
import { logger } from '../logger.js';

export class EnhancedAIService {
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

    // Armazenar contexto de conversa por usuário
    this.conversationContext = new Map();
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

  async detectContentType(text) {
    try {
      logger.info('🔍 Analisando tipo de conteúdo...');
      
      const response = await this.deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Analise o texto e identifique se contém:
            1. Fragmento de música (letra, melodia, ritmo)
            2. Pergunta de conhecimento geral
            3. Apenas conversa normal
            
            Responda apenas com:
            - "MUSIC" se contiver música
            - "QUESTION" se for pergunta de conhecimento
            - "CONVERSATION" se for conversa normal`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 50,
      });

      const contentType = response.choices[0].message.content.trim();
      logger.info(`✅ Tipo de conteúdo detectado: ${contentType}`);
      return contentType;
    } catch (error) {
      logger.error('❌ Erro na detecção de conteúdo, usando fallback...');
      return 'CONVERSATION'; // Fallback para conversa normal
    }
  }

  async correctGrammarWithCommand(text, contentType) {
    try {
      logger.info('✏️ Corrigindo gramática com comando específico...');
      
      // Se for música, não corrigir gramática
      if (contentType === 'MUSIC') {
        return "🎵 Detectado fragmento de música - não aplicando correção gramatical";
      }
      
      const response = await this.deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Você é um corretor gramatical especializado em português brasileiro. 
            
            INSTRUÇÕES ESPECÍFICAS:
            - Corrija e melhore o texto
            - Use linguagem formal
            - Seja gentil na correção
            - Mantenha o sentido original
            - Preserve a naturalidade da fala
            
            Formato da resposta:
            - Se houver correções: "Você quis dizer: [texto corrigido]"
            - Se não houver correções: "✅ Seu áudio está correto!"
            
            IMPORTANTE: Use linguagem formal e seja gentil em todas as correções.`
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
      logger.info('✅ Correção com comando específico concluída');
      return correction;
    } catch (error) {
      logger.error('❌ Erro DeepSeek, fallback para OpenAI...');
      
      // Fallback para OpenAI se DeepSeek falhar
      const response = await this.openai.chat.completions.create({
        model: config.openai.gptModel,
        messages: [
          {
            role: 'system',
            content: `Você é um corretor gramatical especializado em português brasileiro. 
            Corrija e melhore o texto usando linguagem formal e sendo gentil.`
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

  async generateInteractiveResponse(text, contentType, userId) {
    try {
      logger.info('💬 Gerando resposta interativa...');
      
      // Obter contexto da conversa
      const context = this.conversationContext.get(userId) || [];
      
      let systemPrompt = '';
      
      // Definir prompt baseado no tipo de conteúdo
      switch (contentType) {
        case 'MUSIC':
          systemPrompt = `Você é um assistente musical amigável e especializado. 
          
          REGRAS IMPORTANTES:
          - Identifique a música/artista se possível
          - Comente sobre o gênero musical e época
          - Mantenha um tom alegre e musical
          - Responda no mesmo idioma do usuário
          - Seja específico e informativo
          - Faça perguntas sobre preferências musicais
          
          EXEMPLOS:
          - "Que clássico dos Beatles! 'Help!' é de 1965. Você gosta de rock dos anos 60?"
          - "Essa música tem uma melodia incrível! Qual é seu gênero favorito?"
          - "Conheço essa música! É muito boa. Você toca algum instrumento?"`;
          break;
          
        case 'QUESTION':
          systemPrompt = `Você é um assistente de conhecimento geral muito útil.
          
          REGRAS IMPORTANTES:
          - Responda de forma educativa e clara
          - Use linguagem acessível
          - Responda no mesmo idioma do usuário
          - Mantenha um tom amigável e útil
          - Seja específico e detalhado
          - Ofereça informações adicionais quando relevante
          
          EXEMPLOS:
          - "Ótima pergunta! Vou explicar detalhadamente..."
          - "Interessante! Deixe-me te ajudar com isso..."
          - "Que pergunta inteligente! Aqui está a resposta..."`;
          break;
          
        default:
          systemPrompt = `Você é um assistente conversacional muito amigável e envolvente.
          
          REGRAS IMPORTANTES:
          - Responda no mesmo idioma do usuário
          - Seja amigável, interessado e empático
          - Faça perguntas específicas e relevantes
          - Mantenha o contexto da conversa
          - Seja natural e humano
          - Mostre interesse genuíno
          
          EXEMPLOS:
          - "Que legal! Como foi sua experiência com isso?"
          - "Interessante! Me conte mais sobre..."
          - "Entendo perfeitamente! O que você acha sobre..."
          - "Que ótimo! Como posso te ajudar com isso?"`;
      }

      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...context.slice(-4), // Manter apenas as últimas 4 mensagens para contexto
        {
          role: 'user',
          content: text
        }
      ];

      const response = await this.deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.8,
        max_tokens: 400,
      });

      const assistantResponse = response.choices[0].message.content;
      
      // Atualizar contexto da conversa
      context.push(
        { role: 'user', content: text },
        { role: 'assistant', content: assistantResponse }
      );
      
      // Manter apenas as últimas 10 mensagens para não sobrecarregar
      if (context.length > 10) {
        context.splice(0, context.length - 10);
      }
      
      this.conversationContext.set(userId, context);
      
      logger.info('✅ Resposta interativa gerada');
      return assistantResponse;
    } catch (error) {
      logger.error('❌ Erro na resposta interativa, usando fallback...');
      
      // Fallback melhorado
      const fallbackResponses = {
        'MUSIC': 'Que música incrível! Você tem um gosto musical muito bom. Qual é seu gênero favorito?',
        'QUESTION': 'Excelente pergunta! Deixe-me te ajudar com isso. Posso explicar melhor se precisar.',
        'CONVERSATION': 'Que interessante! Me conte mais sobre isso. Como foi sua experiência?'
      };
      
      return fallbackResponses[contentType] || 'Obrigado por compartilhar isso comigo! É muito interessante.';
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

  async processAudio(audioBuffer, userId) {
    try {
      // 1. Transcrever o áudio
      const transcription = await this.transcribeAudio(audioBuffer);
      logger.info('📝 Transcrição:', transcription);

      // 2. Detectar tipo de conteúdo
      const contentType = await this.detectContentType(transcription);
      
      // 3. Corrigir gramática com comando específico
      const correction = await this.correctGrammarWithCommand(transcription, contentType);
      const hasCorrections = !correction.includes('✅') && !correction.includes('🎵');
      
      // 4. Gerar resposta interativa
      const interactiveResponse = await this.generateInteractiveResponse(transcription, contentType, userId);
      
      // 5. Gerar áudio (COMENTADO conforme solicitado)
      let audioResponse = null;
      // if (hasCorrections && config.app.enableAudioResponse) {
      //   const correctedText = correction.replace('Você quis dizer: ', '');
      //   audioResponse = await this.textToSpeech(correctedText);
      // }
      
      return {
        transcription,
        correction,
        hasCorrections,
        contentType,
        interactiveResponse,
        audioResponse, // Sempre null agora
        provider: {
          transcription: 'OpenAI Whisper',
          correction: 'DeepSeek Chat',
          conversation: 'DeepSeek Chat'
        }
      };
    } catch (error) {
      logger.error('❌ Erro no processamento aprimorado:', error);
      throw error;
    }
  }

  // Método para limpar contexto de conversa
  clearConversationContext(userId) {
    this.conversationContext.delete(userId);
    logger.info(`🧹 Contexto de conversa limpo para usuário: ${userId}`);
  }

  // Método para estimativa de custos
  getEstimatedCost(textLength) {
    const tokens = Math.ceil(textLength / 4); // Aproximação
    
    return {
      transcription: 0.006, // $0.006/minuto OpenAI Whisper
      correction: tokens * 0.00000027, // $0.27/1M tokens DeepSeek
      conversation: tokens * 0.00000027, // $0.27/1M tokens DeepSeek
      total: 'Muito econômico com DeepSeek'
    };
  }
} 