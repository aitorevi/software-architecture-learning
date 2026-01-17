/**
 * EVENT-DRIVEN EXAMPLE - Main Application Entry Point
 *
 * This is the composition root where we wire together:
 * - Domain events and event bus
 * - Event handlers (subscribers)
 * - Use cases (publishers)
 *
 * EVENT-DRIVEN KEY CONCEPT:
 * Notice how we register event handlers at startup.
 * When events are published, the event bus routes them to handlers.
 * Publishers and subscribers are completely decoupled!
 */

import express from 'express';

// Infrastructure
import { InMemoryEventBus } from './infrastructure/event-bus/InMemoryEventBus';
import { InMemoryOrderRepository } from './infrastructure/persistence/InMemoryOrderRepository';
import { OrderController } from './infrastructure/api/OrderController';

// Use Cases
import {
  CreateOrderUseCase,
  ProcessPaymentUseCase,
  ShipOrderUseCase,
} from './application';

// Event Handlers
import {
  SendOrderConfirmationHandler,
  ReserveInventoryOnOrderCreatedHandler,
  ConfirmInventoryOnPaymentHandler,
  SendShippingNotificationHandler,
  EmailService,
  InventoryService,
} from './application';

// Mock services for demonstration
const mockEmailService: EmailService = {
  async sendEmail(to: string, subject: string, _body: string): Promise<void> {
    console.log(`[MockEmail] Would send to ${to}: "${subject}"`);
  },
};

const mockInventoryService: InventoryService = {
  async reserveItems(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<void> {
    console.log(`[MockInventory] Would reserve:`, items);
  },
  async confirmReservation(orderId: string): Promise<void> {
    console.log(`[MockInventory] Would confirm reservation for ${orderId}`);
  },
  async releaseReservation(orderId: string): Promise<void> {
    console.log(`[MockInventory] Would release reservation for ${orderId}`);
  },
};

function createApp() {
  const app = express();
  app.use(express.json());

  // === Infrastructure ===
  const eventBus = new InMemoryEventBus();
  const orderRepository = new InMemoryOrderRepository();

  // === Event Handlers ===
  // These react to domain events without the publishers knowing about them

  // 1. Send confirmation email when order is created
  const confirmationHandler = new SendOrderConfirmationHandler(mockEmailService);
  eventBus.subscribe('order.created', (event) =>
    confirmationHandler.handle(event as any)
  );

  // 2. Reserve inventory when order is created
  const reserveInventoryHandler = new ReserveInventoryOnOrderCreatedHandler(
    mockInventoryService
  );
  eventBus.subscribe('order.created', (event) =>
    reserveInventoryHandler.handle(event as any)
  );

  // 3. Confirm inventory when payment is received
  const confirmInventoryHandler = new ConfirmInventoryOnPaymentHandler(
    mockInventoryService
  );
  eventBus.subscribe('order.payment_received', (event) =>
    confirmInventoryHandler.handle(event as any)
  );

  // 4. Send shipping notification when order ships
  const shippingNotificationHandler = new SendShippingNotificationHandler(
    mockEmailService
  );
  eventBus.subscribe(
    'order.shipped',
    shippingNotificationHandler.createHandler(async (orderId) => {
      const email = await orderRepository.getCustomerEmail(orderId);
      return email || 'unknown@example.com';
    })
  );

  console.log('[Setup] Registered event handlers:');
  console.log('  - order.created → SendOrderConfirmation');
  console.log('  - order.created → ReserveInventory');
  console.log('  - order.payment_received → ConfirmInventory');
  console.log('  - order.shipped → SendShippingNotification');

  // === Use Cases ===
  const createOrderUseCase = new CreateOrderUseCase(orderRepository, eventBus);
  const processPaymentUseCase = new ProcessPaymentUseCase(
    orderRepository,
    eventBus
  );
  const shipOrderUseCase = new ShipOrderUseCase(orderRepository, eventBus);

  // === Controller ===
  const orderController = new OrderController(
    createOrderUseCase,
    processPaymentUseCase,
    shipOrderUseCase
  );

  app.use('/api/orders', orderController.router);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', architecture: 'event-driven' });
  });

  return app;
}

// Start server
const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         Order System - Event-Driven Architecture              ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                       ║
║                                                               ║
║  Event-Driven Concept:                                        ║
║    Domain Events → Event Bus → Event Handlers                 ║
║                                                               ║
║  Event Flow Example:                                          ║
║    1. POST /api/orders        → OrderCreatedEvent             ║
║       → Send confirmation email                               ║
║       → Reserve inventory                                     ║
║                                                               ║
║    2. POST /api/orders/:id/pay → PaymentReceivedEvent         ║
║       → Confirm inventory reservation                         ║
║                                                               ║
║    3. POST /api/orders/:id/ship → OrderShippedEvent           ║
║       → Send shipping notification                            ║
║                                                               ║
║  API Endpoints:                                               ║
║    POST /api/orders           Create an order                 ║
║    POST /api/orders/:id/pay   Process payment                 ║
║    POST /api/orders/:id/ship  Ship order                      ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export { createApp };
