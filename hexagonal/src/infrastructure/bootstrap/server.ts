import express, { Application, Request, Response, NextFunction } from 'express';
import { createContainerFromEnv, Container } from './container';

/**
 * Library System Server
 *
 * Punto de entrada de la aplicación.
 * Aquí se configura Express y se montan las rutas.
 */

function createApp(container: Container): Application {
  const app = express();

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/books', container.bookController.router);
  app.use('/api/users', container.userController.router);
  app.use('/api/loans', container.loanController.router);

  // API Documentation
  app.get('/api', (_req: Request, res: Response) => {
    res.json({
      name: 'Library System API',
      version: '1.0.0',
      endpoints: {
        books: {
          'POST /api/books': 'Register a new book',
          'GET /api/books/available': 'List available books',
        },
        users: {
          'POST /api/users': 'Register a new user',
          'GET /api/users/:userId/loans': 'Get user loan history',
        },
        loans: {
          'POST /api/loans': 'Create a new loan',
          'POST /api/loans/return': 'Return a book',
        },
      },
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

  return app;
}

async function main(): Promise<void> {
  const port = parseInt(process.env.PORT ?? '3000', 10);

  console.log('Starting Library System...');
  console.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`Persistence: ${process.env.PERSISTENCE_TYPE ?? 'memory'}`);

  // Crear contenedor de dependencias
  const container = createContainerFromEnv();

  // Crear aplicación Express
  const app = createApp(container);

  // Iniciar servidor
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`API docs at http://localhost:${port}/api`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      console.log('HTTP server closed');
      await container.shutdown();
      console.log('Database connections closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Run if this is the main module
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { createApp };
