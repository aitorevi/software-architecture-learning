/**
 * ConnectDatabaseUseCase - Caso de uso para gestionar conexión a BD
 */

import { DatabaseConnection } from '../../infrastructure/singleton/DatabaseConnection.js';
import { ConnectionConfig } from '../../domain/value-objects/ConnectionConfig.js';
import { Logger } from '../../infrastructure/singleton/Logger.js';

export interface ConnectDatabaseRequest {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export class ConnectDatabaseUseCase {
  async execute(request: ConnectDatabaseRequest): Promise<void> {
    const logger = Logger.getInstance();

    try {
      const config = new ConnectionConfig(request);
      const db = DatabaseConnection.getInstance();

      db.configure(config);
      await db.connect();

      logger.info('Database connection established successfully');
    } catch (error) {
      logger.error('Failed to connect to database', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
