import { Router, Request, Response } from 'express';
import {
  CreateOrderUseCase,
  ProcessPaymentUseCase,
  ShipOrderUseCase,
} from '../../application';
import { OrderValidationError, OrderNotFoundError } from '../../domain';

export class OrderController {
  public readonly router: Router;

  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly shipOrderUseCase: ShipOrderUseCase
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/', this.createOrder.bind(this));
    this.router.post('/:id/pay', this.processPayment.bind(this));
    this.router.post('/:id/ship', this.shipOrder.bind(this));
  }

  private async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createOrderUseCase.execute({
        customerEmail: req.body.customerEmail,
        items: req.body.items,
        shippingAddress: req.body.shippingAddress,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async processPayment(req: Request, res: Response): Promise<void> {
    try {
      await this.processPaymentUseCase.execute({
        orderId: req.params.id,
        paymentId: req.body.paymentId,
        paymentMethod: req.body.paymentMethod,
      });
      res.json({ success: true });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async shipOrder(req: Request, res: Response): Promise<void> {
    try {
      await this.shipOrderUseCase.execute({
        orderId: req.params.id,
        trackingNumber: req.body.trackingNumber,
        carrier: req.body.carrier,
        estimatedDeliveryDays: req.body.estimatedDeliveryDays || 5,
      });
      res.json({ success: true });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof OrderValidationError) {
      res.status(400).json({ success: false, error: error.message });
    } else if (error instanceof OrderNotFoundError) {
      res.status(404).json({ success: false, error: error.message });
    } else if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
