/**
 * ANTES - Logger SIN Singleton Pattern
 *
 * PROBLEMA: Cada vez que hacemos `new Logger()` creamos una nueva instancia.
 * Esto significa:
 * - Múltiples archivos de log abiertos
 * - Configuración inconsistente entre instancias
 * - Desperdicio de recursos (memoria, handles de archivos)
 * - Logs desordenados o perdidos
 *
 * CASO DE USO REAL:
 * En una aplicación con 10 módulos, si cada uno crea su propio logger,
 * tendrás 10 archivos abiertos, 10 buffers en memoria, y los logs se
 * mezclan sin orden cronológico.
 */

import { LogEntry, LogLevel } from '../../domain/entities/LogEntry.js';

export class LoggerBefore {
  private logs: LogEntry[] = [];
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = 'INFO') {
    this.logLevel = logLevel;
    console.log('⚠️  Nueva instancia de Logger creada'); // Ver el problema
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('DEBUG')) {
      this.log('DEBUG', message, metadata);
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('INFO')) {
      this.log('INFO', message, metadata);
    }
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('WARN')) {
      this.log('WARN', message, metadata);
    }
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('ERROR')) {
      this.log('ERROR', message, metadata);
    }
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry = new LogEntry({
      level,
      message,
      timestamp: new Date(),
      metadata,
    });

    this.logs.push(entry);
    console.log(entry.toString());
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}
