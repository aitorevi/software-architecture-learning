/**
 * DatabaseConnection - Singleton con Eager Initialization
 *
 * DIFERENCIA CON Logger:
 * - Logger usa LAZY initialization (se crea cuando se pide)
 * - DatabaseConnection usa EAGER initialization (se crea al cargar la clase)
 *
 * EAGER INITIALIZATION:
 * La instancia se crea inmediatamente cuando se carga la clase,
 * no cuando se llama a getInstance().
 *
 * ¿CUÁNDO USAR EAGER vs LAZY?
 *
 * EAGER (como aquí):
 * - Cuando sabes que SIEMPRE se va a usar
 * - Cuando la inicialización es rápida y barata
 * - Cuando quieres que falle rápido si hay error en la configuración
 * - En aplicaciones pequeñas donde el orden de carga no importa
 *
 * LAZY (como Logger):
 * - Cuando la inicialización es costosa (tiempo, memoria, I/O)
 * - Cuando puede que no se use en todos los casos
 * - Cuando necesitas control sobre cuándo se inicializa
 * - Cuando la configuración puede cambiar antes del primer uso
 */

import { ConnectionConfig } from '../../domain/value-objects/ConnectionConfig.js';
import { Logger } from './Logger.js';

export class DatabaseConnection {
  // EAGER: La instancia se crea INMEDIATAMENTE al cargar la clase
  private static instance: DatabaseConnection = new DatabaseConnection();

  private config: ConnectionConfig | null = null;
  private connected: boolean = false;
  private connectionCount: number = 0;

  /**
   * Constructor privado - CLAVE DEL PATRÓN
   */
  private constructor() {
    Logger.getInstance().debug('DatabaseConnection singleton created (eager)');
  }

  /**
   * getInstance - Devuelve la instancia ya creada
   *
   * A diferencia del lazy, aquí la instancia YA EXISTE.
   * No hay if que compruebe si es null.
   */
  public static getInstance(): DatabaseConnection {
    return DatabaseConnection.instance;
  }

  /**
   * configure - Configura la conexión
   */
  configure(config: ConnectionConfig): void {
    if (this.connected) {
      throw new Error('Cannot reconfigure while connected. Disconnect first.');
    }
    this.config = config;
    Logger.getInstance().info('Database configured', {
      host: config.host,
      port: config.port,
      database: config.database,
    });
  }

  /**
   * connect - Establece la conexión
   *
   * En un caso real, aquí abrirías el pool de conexiones a la BD.
   */
  async connect(): Promise<void> {
    if (!this.config) {
      throw new Error('Database not configured. Call configure() first.');
    }

    if (this.connected) {
      Logger.getInstance().warn('Already connected to database');
      return;
    }

    Logger.getInstance().info('Connecting to database...', {
      connectionString: this.config.getConnectionString(),
    });

    // Simular conexión asíncrona
    await new Promise(resolve => setTimeout(resolve, 100));

    this.connected = true;
    this.connectionCount++;

    Logger.getInstance().info('Database connected successfully', {
      connectionNumber: this.connectionCount,
    });
  }

  /**
   * disconnect - Cierra la conexión
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      Logger.getInstance().warn('Not connected to database');
      return;
    }

    Logger.getInstance().info('Disconnecting from database...');

    // Simular desconexión asíncrona
    await new Promise(resolve => setTimeout(resolve, 50));

    this.connected = false;

    Logger.getInstance().info('Database disconnected successfully');
  }

  /**
   * query - Ejecuta una query (simulada)
   */
  async query<T = unknown>(sql: string): Promise<T[]> {
    if (!this.connected) {
      throw new Error('Database not connected. Call connect() first.');
    }

    Logger.getInstance().debug('Executing query', { sql });

    // Simular query
    await new Promise(resolve => setTimeout(resolve, 10));

    Logger.getInstance().debug('Query executed successfully');

    return [] as T[];
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConnectionCount(): number {
    return this.connectionCount;
  }

  getConfig(): ConnectionConfig | null {
    return this.config;
  }

  /**
   * resetForTesting - Solo para tests
   */
  static resetForTesting(): void {
    const instance = DatabaseConnection.getInstance();
    instance.config = null;
    instance.connected = false;
    instance.connectionCount = 0;
  }
}
