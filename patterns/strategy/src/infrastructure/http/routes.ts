import { Router } from 'express';
import { PaymentController } from './PaymentController.js';

export function createRouter(controller: PaymentController): Router {
  const router = Router();

  // Health check
  router.get('/health', (req, res) => controller.healthCheck(req, res));

  // Orders
  router.post('/orders', (req, res) => controller.createOrder(req, res));

  // Payments
  router.post('/payments', (req, res) => controller.processPayment(req, res));
  router.get('/payments/compare-fees', (req, res) => controller.compareFees(req, res));

  return router;
}
