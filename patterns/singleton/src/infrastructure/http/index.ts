/**
 * Express Server - Demostración de Singleton Pattern
 *
 * Este servidor expone endpoints para demostrar los tres tipos de singleton:
 * - Logger (Lazy initialization)
 * - DatabaseConnection (Eager initialization)
 * - ConfigManager (Thread-safe async initialization)
 */

import express, { Request, Response } from 'express';
import { Logger } from '../singleton/Logger.js';
import { DatabaseConnection } from '../singleton/DatabaseConnection.js';
import { ConfigManager } from '../singleton/ConfigManager.js';
import { ConnectionConfig } from '../../domain/value-objects/ConnectionConfig.js';
import { LogMessageUseCase } from '../../application/use-cases/LogMessageUseCase.js';
import { LogDTOMapper } from '../../application/dtos/LogDTO.js';
import { LogLevel } from '../../domain/entities/LogEntry.js';

const app = express();
app.use(express.json());

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

// Inicializar ConfigManager (async) antes de arrancar el servidor
await ConfigManager.initializeAsync({
  environment: 'development',
  apiUrl: 'http://localhost:3000',
  apiKey: 'dev-singleton-example',
  features: {
    authentication: true,
    analytics: false,
    cache: true,
  },
});

// Logger se inicializa automáticamente en el primer getInstance()
const logger = Logger.getInstance('DEBUG');
logger.info('Server initializing...');

// ============================================================================
// ENDPOINTS - LOGGER
// ============================================================================

/**
 * POST /logs
 * Crear un nuevo log
 */
app.post('/logs', (req: Request, res: Response): void => {
  try {
    const { level, message, metadata } = req.body;

    if (!level || !message) {
      res.status(400).json({
        error: 'Missing required fields: level, message',
      });
      return;
    }

    const useCase = new LogMessageUseCase();
    useCase.execute({ level: level as LogLevel, message, metadata });

    res.status(201).json({
      message: 'Log created successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /logs
 * Obtener todos los logs
 */
app.get('/logs', (_req: Request, res: Response) => {
  const logger = Logger.getInstance();
  const logs = logger.getLogs();
  const dtos = LogDTOMapper.toDTOList(logs);

  res.json({
    count: logs.length,
    logs: dtos,
  });
});

/**
 * DELETE /logs
 * Limpiar todos los logs
 */
app.delete('/logs', (_req: Request, res: Response) => {
  const logger = Logger.getInstance();
  logger.clearLogs();

  res.json({
    message: 'Logs cleared successfully',
  });
});

/**
 * PUT /logs/level
 * Cambiar el nivel de log
 */
app.put('/logs/level', (req: Request, res: Response): void => {
  try {
    const { level } = req.body;

    if (!level) {
      res.status(400).json({
        error: 'Missing required field: level',
      });
      return;
    }

    const logger = Logger.getInstance();
    logger.setLogLevel(level as LogLevel);

    res.json({
      message: `Log level changed to ${level}`,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// ENDPOINTS - DATABASE
// ============================================================================

/**
 * POST /database/connect
 * Conectar a la base de datos
 */
app.post('/database/connect', async (req: Request, res: Response): Promise<void> => {
  try {
    const { host, port, database, username, password } = req.body;

    if (!host || !port || !database || !username || !password) {
      res.status(400).json({
        error: 'Missing required fields: host, port, database, username, password',
      });
      return;
    }

    const config = new ConnectionConfig({
      host,
      port: Number(port),
      database,
      username,
      password,
    });

    const db = DatabaseConnection.getInstance();
    db.configure(config);
    await db.connect();

    res.json({
      message: 'Database connected successfully',
      connectionCount: db.getConnectionCount(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /database/disconnect
 * Desconectar de la base de datos
 */
app.post('/database/disconnect', async (_req: Request, res: Response) => {
  try {
    const db = DatabaseConnection.getInstance();
    await db.disconnect();

    res.json({
      message: 'Database disconnected successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /database/status
 * Obtener el estado de la conexión
 */
app.get('/database/status', (_req: Request, res: Response) => {
  const db = DatabaseConnection.getInstance();
  const config = db.getConfig();

  res.json({
    connected: db.isConnected(),
    connectionCount: db.getConnectionCount(),
    config: config
      ? {
          host: config.host,
          port: config.port,
          database: config.database,
          username: config.username,
        }
      : null,
  });
});

// ============================================================================
// ENDPOINTS - CONFIG
// ============================================================================

/**
 * GET /config
 * Obtener la configuración completa
 */
app.get('/config', (_req: Request, res: Response) => {
  try {
    const configManager = ConfigManager.getInstance();
    const config = configManager.getConfig();

    res.json(config);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /config/feature/:name
 * Verificar si una feature está habilitada
 */
app.get('/config/feature/:name', (req: Request, res: Response): void => {
  try {
    const { name } = req.params;
    const configManager = ConfigManager.getInstance();
    const config = configManager.getConfig();
    const validFeatures = ['authentication', 'analytics', 'cache'] as const;

    if (!validFeatures.includes(name as any)) {
      res.status(400).json({
        error: `Invalid feature. Valid features: ${validFeatures.join(', ')}`,
      });
      return;
    }

    const enabled = config.features[name as keyof typeof config.features];

    res.json({
      feature: name,
      enabled,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// ENDPOINTS - DEMOSTRACIÓN
// ============================================================================

/**
 * GET /demo/singleton-proof
 * Demuestra que Logger es singleton (misma instancia)
 */
app.get('/demo/singleton-proof', (_req: Request, res: Response) => {
  const logger1 = Logger.getInstance();
  const logger2 = Logger.getInstance();

  // En JavaScript, la comparación === verifica si son el mismo objeto en memoria
  const areSameInstance = logger1 === logger2;

  logger1.info('Testing singleton pattern');

  res.json({
    areSameInstance,
    message: areSameInstance
      ? '✅ Logger is a proper singleton (same instance)'
      : '❌ Logger is NOT a singleton (different instances)',
    logCount: logger1.getLogCount(),
  });
});

/**
 * GET /
 * Página de inicio con información
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Singleton Pattern - API de Demostración',
    author: 'El Profe Millo',
    endpoints: {
      logs: {
        'POST /logs': 'Crear un log',
        'GET /logs': 'Obtener todos los logs',
        'DELETE /logs': 'Limpiar logs',
        'PUT /logs/level': 'Cambiar nivel de log',
      },
      database: {
        'POST /database/connect': 'Conectar a BD',
        'POST /database/disconnect': 'Desconectar de BD',
        'GET /database/status': 'Estado de conexión',
      },
      config: {
        'GET /config': 'Obtener configuración',
        'GET /config/feature/:name': 'Verificar feature',
      },
      demo: {
        'GET /demo/singleton-proof': 'Demostrar que es singleton',
      },
    },
  });
});

// ============================================================================
// ARRANCAR SERVIDOR
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║              🎯 SINGLETON PATTERN - SERVER RUNNING                   ║
║                                                                      ║
║                      http://localhost:${PORT}                         ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

Available endpoints:

  LOGS:
    POST   /logs                    → Create a log
    GET    /logs                    → Get all logs
    DELETE /logs                    → Clear logs
    PUT    /logs/level              → Change log level

  DATABASE:
    POST   /database/connect        → Connect to database
    POST   /database/disconnect     → Disconnect from database
    GET    /database/status         → Connection status

  CONFIG:
    GET    /config                  → Get configuration
    GET    /config/feature/:name    → Check feature

  DEMO:
    GET    /demo/singleton-proof    → Prove it's a singleton

  `);
});

export default app;
