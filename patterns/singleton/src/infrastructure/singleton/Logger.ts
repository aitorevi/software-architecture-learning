/**
 * Logger - Implementación del Singleton Pattern (Lazy Initialization)
 *
 * VENTAJAS:
 * ✅ Una única instancia en toda la aplicación
 * ✅ Inicialización perezosa (se crea cuando se necesita)
 * ✅ Estado centralizado (todos los logs en un solo lugar)
 * ✅ Configuración consistente
 * ✅ Control de acceso global
 *
 * CARACTERÍSTICAS DEL SINGLETON:
 * 1. Constructor privado (no se puede hacer `new Logger()`)
 * 2. Instancia estática privada
 * 3. Método público estático `getInstance()` que devuelve siempre la misma instancia
 * 4. Lazy initialization: se crea solo cuando se pide por primera vez
 *
 * USO:
 * const logger = Logger.getInstance();
 * logger.info('Mensaje');
 */

import { LogEntry, LogLevel } from '../../domain/entities/LogEntry.js';

export class Logger {
  // La única instancia (inicialmente null)
  private static instance: Logger | null = null;

  // Estado del logger
  private logs: LogEntry[] = [];
  private logLevel: LogLevel;

  /**
   * Constructor privado - CLAVE DEL PATRÓN
   *
   * Al ser privado, nadie puede hacer `new Logger()` desde fuera.
   * Solo se puede crear desde dentro de la clase.
   */
  private constructor(logLevel: LogLevel = 'INFO') {
    this.logLevel = logLevel;
    console.log('✅ Logger singleton initialized');
  }

  /**
   * getInstance - PUNTO DE ACCESO ÚNICO
   *
   * Este método controla la creación de la instancia.
   * Si ya existe, la devuelve. Si no, la crea primero.
   *
   * LAZY INITIALIZATION: La instancia no se crea hasta que alguien
   * la pide por primera vez.
   */
  public static getInstance(logLevel?: LogLevel): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel ?? 'INFO');
    }
    return Logger.instance;
  }

  /**
   * resetInstance - Para testing
   *
   * En producción NO deberías necesitar esto, pero en tests
   * es útil poder resetear el singleton entre tests.
   */
  public static resetInstance(): void {
    Logger.instance = null;
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

  getLogCount(): number {
    return this.logs.length;
  }
}
