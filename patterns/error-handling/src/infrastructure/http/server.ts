/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  EXPRESS SERVER - CONFIGURACIÓN                                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Configura Express con:                                                   ║
 * ║  • JSON parser                                                            ║
 * ║  • Rutas                                                                  ║
 * ║  • Error handling global                                                  ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { UserController } from './UserController.js';

/**
 * Crea y configura la aplicación Express
 */
export function createApp(userController: UserController): Express {
  const app = express();

  // Middleware para parsear JSON
  app.use(express.json());

  // ═══════════════════════════════════════════════════════════════════════
  // RUTAS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * POST /users - Registrar usuario
   */
  app.post('/users', (req, res) => userController.register(req, res));

  /**
   * GET /health - Health check
   */
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ERROR HANDLING GLOBAL
  // ═══════════════════════════════════════════════════════════════════════
  // Este middleware atrapa errores que NO se manejaron en los controllers
  // (por si acaso algo se escapa del try/catch)

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error no manejado:', err);

    res.status(500).json({
      error: 'InternalServerError',
      message: 'Ocurrió un error inesperado',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
        stack: err.stack,
      }),
    });
  });

  return app;
}
