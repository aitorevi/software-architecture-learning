import express from 'express';
import { createRouter } from './http/routes.js';
import { PaymentController } from './http/PaymentController.js';
import { CreateOrderUseCase } from '../application/use-cases/CreateOrderUseCase.js';
import { PayOrderUseCase } from '../application/use-cases/PayOrderUseCase.js';

/**
 * PUNTO DE ENTRADA - Configuración del servidor
 *
 * Aquí montamos toda la aplicación:
 * 1. Creamos las instancias de casos de uso
 * 2. Inyectamos dependencias
 * 3. Configuramos Express
 * 4. Levantamos el servidor
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Instanciar casos de uso
const createOrderUseCase = new CreateOrderUseCase();
const payOrderUseCase = new PayOrderUseCase(createOrderUseCase);

// Instanciar controlador
const controller = new PaymentController(createOrderUseCase, payOrderUseCase);

// Configurar rutas
const router = createRouter(controller);
app.use('/api', router);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Strategy Pattern - Payment Service');
  console.log('='.repeat(60));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  POST http://localhost:${PORT}/api/orders`);
  console.log(`  POST http://localhost:${PORT}/api/payments`);
  console.log(`  GET  http://localhost:${PORT}/api/payments/compare-fees?amount=100`);
  console.log('\nPayment strategies available:');
  console.log('  - creditcard (2.9% + 0.30 EUR)');
  console.log('  - paypal (3.4% + 0.35 EUR)');
  console.log('  - crypto (1%)');
  console.log('  - banktransfer (1 EUR flat)');
  console.log('='.repeat(60) + '\n');
});

export default app;
