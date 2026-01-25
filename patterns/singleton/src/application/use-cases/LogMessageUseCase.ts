/**
 * LogMessageUseCase - Caso de uso para registrar mensajes
 *
 * NOTA: Este caso de uso demuestra cómo usar el Logger singleton
 * desde la capa de aplicación.
 */

import { Logger } from '../../infrastructure/singleton/Logger.js';
import { LogLevel } from '../../domain/entities/LogEntry.js';

export interface LogMessageRequest {
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

export class LogMessageUseCase {
  private logger: Logger;

  constructor() {
    // Obtener la instancia única del logger
    this.logger = Logger.getInstance();
  }

  execute(request: LogMessageRequest): void {
    switch (request.level) {
      case 'DEBUG':
        this.logger.debug(request.message, request.metadata);
        break;
      case 'INFO':
        this.logger.info(request.message, request.metadata);
        break;
      case 'WARN':
        this.logger.warn(request.message, request.metadata);
        break;
      case 'ERROR':
        this.logger.error(request.message, request.metadata);
        break;
    }
  }
}
