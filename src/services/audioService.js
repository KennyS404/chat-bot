import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { join } from 'path';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class AudioService {
  constructor() {
    this.tempDir = config.app.tempDir;
    this.ensureTempDir();
    this.checkFFmpeg();
  }

  async checkFFmpeg() {
    try {
      const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
      const { stdout } = await execAsync(`${ffmpegPath} -version`);
      logger.info('FFmpeg encontrado:', stdout.split('\n')[0]);
      
      // Configure fluent-ffmpeg to use the correct path
      ffmpeg.setFfmpegPath(ffmpegPath);
    } catch (error) {
      logger.error('FFmpeg não encontrado! Instale com: sudo apt install ffmpeg');
      throw new Error('FFmpeg não está instalado');
    }
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      logger.error('Erro ao criar diretório temporário:', error);
    }
  }

  async downloadAndConvert(audioBuffer, messageId) {
    const inputPath = join(this.tempDir, `${messageId}_input.ogg`);
    const outputPath = join(this.tempDir, `${messageId}_output.mp3`);

    try {
      logger.info(`Salvando áudio em: ${inputPath}`);
      // Salvar o buffer do áudio
      await fs.writeFile(inputPath, audioBuffer);
      logger.info(`Arquivo salvo, tamanho: ${audioBuffer.length} bytes`);

      // Verificar se o arquivo foi salvo corretamente
      const stats = await fs.stat(inputPath);
      if (stats.size === 0) {
        throw new Error('Arquivo de áudio vazio após salvar');
      }

      // Converter para MP3 usando FFmpeg
      logger.info('Iniciando conversão com FFmpeg...');
      await new Promise((resolve, reject) => {
        const ffmpegProcess = ffmpeg(inputPath)
          .toFormat('mp3')
          .audioCodec('libmp3lame')
          .audioChannels(1)
          .audioFrequency(16000)
          .on('start', (commandLine) => {
            logger.info('Comando FFmpeg:', commandLine);
          })
          .on('progress', (progress) => {
            logger.debug('Progresso FFmpeg:', progress);
          })
          .on('end', () => {
            logger.info('Conversão FFmpeg concluída');
            resolve();
          })
          .on('error', (err) => {
            logger.error('Erro FFmpeg:', err);
            logger.error('Detalhes do erro FFmpeg:', {
              message: err.message,
              code: err.code,
              stack: err.stack,
              inputPath,
              outputPath,
              ffmpegPath: ffmpeg.path
            });
            reject(err);
          })
          .save(outputPath);

        // Adicionar timeout para o processo FFmpeg
        setTimeout(() => {
          if (ffmpegProcess) {
            ffmpegProcess.kill('SIGKILL');
            reject(new Error('Timeout na conversão do áudio'));
          }
        }, 30000); // 30 segundos de timeout
      });

      // Verificar se o arquivo de saída foi gerado
      const outputStats = await fs.stat(outputPath);
      if (outputStats.size === 0) {
        throw new Error('Arquivo MP3 vazio após conversão');
      }

      // Ler o arquivo convertido
      logger.info(`Lendo arquivo convertido: ${outputPath}`);
      const mp3Buffer = await fs.readFile(outputPath);
      logger.info(`MP3 lido, tamanho: ${mp3Buffer.length} bytes`);

      // Limpar arquivos temporários
      await this.cleanup(messageId);

      return mp3Buffer;
    } catch (error) {
      logger.error('Erro ao processar áudio:', error);
      logger.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        inputPath,
        outputPath,
        messageId,
        audioSize: audioBuffer.length,
        audioType: typeof audioBuffer,
        isBuffer: Buffer.isBuffer(audioBuffer),
        ffmpegPath: ffmpeg.path
      });

      // Verificar se é um erro de FFmpeg
      if (error.message?.includes('ffmpeg')) {
        logger.error('Erro específico do FFmpeg:', {
          ffmpegVersion: await this.getFFmpegVersion(),
          ffmpegPath: ffmpeg.path
        });
      }

      await this.cleanup(messageId);
      throw error;
    }
  }

  async getFFmpegVersion() {
    try {
      const { stdout } = await exec('ffmpeg -version');
      return stdout.split('\n')[0];
    } catch (error) {
      return 'FFmpeg version not available';
    }
  }

  async cleanup(messageId) {
    const files = [
      join(this.tempDir, `${messageId}_input.ogg`),
      join(this.tempDir, `${messageId}_output.mp3`)
    ];

    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // Ignorar erros de arquivo não encontrado
      }
    }
  }

  async getAudioDuration(audioBuffer, messageId) {
    const tempPath = join(this.tempDir, `${messageId}_duration.ogg`);

    try {
      logger.info(`Salvando áudio temporário para análise de duração: ${tempPath}`);
      await fs.writeFile(tempPath, audioBuffer);

      // Verificar se o arquivo foi salvo corretamente
      const stats = await fs.stat(tempPath);
      logger.info(`Arquivo salvo: ${stats.size} bytes`);

      // Verificar se o arquivo não está vazio
      if (stats.size === 0) {
        logger.warn('Arquivo de áudio está vazio, usando duração padrão');
        return 10;
      }

      return new Promise((resolve, reject) => {
        // Usar timeout para evitar travamento
        const timeout = setTimeout(() => {
          logger.warn('Timeout ao analisar duração do áudio, usando duração padrão');
          resolve(10);
        }, 5000); // 5 segundos de timeout

        // Tentar usar ffprobe primeiro
        ffmpeg.ffprobe(tempPath, (err, metadata) => {
          clearTimeout(timeout);
          
          if (err) {
            logger.error('Erro ao analisar duração:', err.message);
            logger.error('Erro detalhado do ffprobe:', {
              message: err.message,
              code: err.code,
              path: tempPath,
              fileSize: stats.size
            });
            
            // Se falhar, tentar método alternativo com ffmpeg
            logger.info('Tentando método alternativo para obter duração...');
            this.getAudioDurationAlternative(tempPath)
              .then(duration => {
                logger.info(`Duração obtida por método alternativo: ${duration} segundos`);
                resolve(duration);
              })
              .catch(altErr => {
                logger.warn('Método alternativo também falhou, usando duração padrão de 10 segundos');
                logger.debug('Erro do método alternativo:', altErr.message);
                resolve(10); // Duração padrão
              });
          } else {
            try {
              const duration = metadata.format.duration || 0;
              logger.info(`Metadados do áudio:`, {
                duration,
                format: metadata.format.format_name,
                bitrate: metadata.format.bit_rate,
                size: metadata.format.size
              });
              
              // Validar duração
              if (duration > 0 && duration < 7200) { // Máximo de 2 horas
                resolve(Math.ceil(duration));
              } else {
                logger.warn(`Duração suspeita (${duration}s), usando duração padrão`);
                resolve(10);
              }
            } catch (parseError) {
              logger.error('Erro ao processar metadados:', parseError.message);
              resolve(10);
            }
          }
        });
      });
    } catch (error) {
      logger.error('Erro ao obter duração:', error.message);
      return 10; // Retornar duração padrão em caso de erro
    } finally {
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        logger.debug('Erro ao deletar arquivo temporário:', error.message);
      }
    }
  }

  async getAudioDurationAlternative(audioPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(audioPath)
        .ffprobe((err, data) => {
          if (err) {
            reject(err);
          } else {
            const duration = data.format.duration || 10;
            resolve(Math.ceil(duration));
          }
        });
    });
  }
} 