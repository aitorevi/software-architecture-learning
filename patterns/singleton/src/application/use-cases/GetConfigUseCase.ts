/**
 * GetConfigUseCase - Caso de uso para obtener configuración
 */

import { ConfigManager, AppConfig } from '../../infrastructure/singleton/ConfigManager.js';
import { Logger } from '../../infrastructure/singleton/Logger.js';

export class GetConfigUseCase {
  execute(): AppConfig {
    const logger = Logger.getInstance();

    try {
      const configManager = ConfigManager.getInstance();
      const config = configManager.getConfig();

      logger.debug('Configuration retrieved', {
        environment: config.environment,
      });

      return config;
    } catch (error) {
      logger.error('Failed to get configuration', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
