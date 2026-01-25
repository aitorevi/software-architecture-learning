import { Request, Response } from 'express';
import { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase.js';
import { PayOrderUseCase } from '../../application/use-cases/PayOrderUseCase.js';
import { CreateOrderDTO } from '../../application/dtos/CreateOrderDTO.js';
import { ProcessPaymentDTO } from '../../application/dtos/PaymentDTO.js';

/**
 * Controlador HTTP para gestionar órdenes y pagos
 *
 * Expone endpoints REST para:
 * - Crear órdenes
 * - Procesar pagos con diferentes estrategias
 * - Comparar comisiones
 */
export class PaymentController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private payOrderUseCase: PayOrderUseCase
  ) {}

  /**
   * POST /orders
   * Crear una nueva orden
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateOrderDTO = req.body;

      const result = await this.createOrderUseCase.execute(dto);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /payments
   * Procesar pago de una orden
   *
   * Body: {
   *   orderId: string,
   *   paymentMethod: 'creditcard' | 'paypal' | 'crypto' | 'banktransfer',
   *   customerEmail: string
   * }
   */
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const dto: ProcessPaymentDTO = req.body;

      const result = await this.payOrderUseCase.execute(dto);

      const statusCode = result.success ? 200 : 400;

      res.status(statusCode).json({
        success: result.success,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /payments/compare-fees?amount=100
   * Comparar comisiones de todas las estrategias para un monto dado
   */
  async compareFees(req: Request, res: Response): Promise<void> {
    try {
      const amount = parseFloat(req.query.amount as string);

      if (isNaN(amount) || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount parameter'
        });
        return;
      }

      const fees = this.payOrderUseCase.comparePaymentFees(amount);

      // Ordenar por comisión (de menor a mayor)
      const sorted = Object.entries(fees)
        .sort(([, a], [, b]) => a - b)
        .map(([method, fee]) => ({
          method,
          fee,
          percentage: ((fee / amount) * 100).toFixed(2) + '%'
        }));

      res.status(200).json({
        success: true,
        data: {
          amount,
          currency: 'EUR',
          fees: sorted
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /health
   * Health check
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Payment service is running',
      timestamp: new Date().toISOString(),
      strategies: ['creditcard', 'paypal', 'crypto', 'banktransfer']
    });
  }
}
