import pino from 'pino';
import { config } from './config.js';

export const logger = pino({
  level: config.app.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    }
  }
}); 