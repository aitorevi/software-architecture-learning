# Event-Driven Example - Order System

An order management system demonstrating **Event-Driven Architecture** with domain events and an event bus.

## What is Event-Driven Architecture?

Event-Driven Architecture (EDA) uses events to trigger and communicate between decoupled services and components.

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Event-Driven Architecture                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│     ┌─────────────┐                                                 │
│     │   Order     │                                                 │
│     │   Created   │ ──────────┐                                     │
│     └─────────────┘           │                                     │
│                               ▼                                     │
│                        ┌─────────────┐                              │
│                        │  Event Bus  │                              │
│                        └──────┬──────┘                              │
│                               │                                     │
│              ┌────────────────┼────────────────┐                    │
│              │                │                │                    │
│              ▼                ▼                ▼                    │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│     │   Send      │  │   Reserve   │  │   Update    │              │
│     │   Email     │  │  Inventory  │  │  Analytics  │              │
│     └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                     │
│   Publishers don't know about subscribers!                          │
│   Easy to add new handlers without changing existing code.          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Concepts

### Domain Events

Events represent things that **happened** in the domain:

```typescript
// Events are named in past tense
class OrderCreatedEvent {
  readonly eventName = 'order.created';

  constructor(
    public readonly orderId: string,
    public readonly customerEmail: string,
    public readonly items: OrderItem[],
    public readonly totalInCents: number
  ) {}
}
```

### Event Bus

The event bus routes events to handlers:

```typescript
interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
}
```

### Event Handlers

Handlers react to events:

```typescript
class SendOrderConfirmationHandler {
  async handle(event: OrderCreatedEvent) {
    await this.emailService.sendEmail(
      event.customerEmail,
      'Order Confirmation',
      `Your order ${event.orderId} has been received!`
    );
  }
}
```

## Event Flow Example

```
1. Customer places order
   └─→ CreateOrderUseCase
       └─→ Order.create()
           └─→ OrderCreatedEvent emitted
               └─→ EventBus.publish()
                   ├─→ SendOrderConfirmationHandler (email)
                   └─→ ReserveInventoryHandler (inventory)

2. Payment received
   └─→ ProcessPaymentUseCase
       └─→ Order.markAsPaid()
           └─→ PaymentReceivedEvent emitted
               └─→ EventBus.publish()
                   └─→ ConfirmInventoryHandler

3. Order shipped
   └─→ ShipOrderUseCase
       └─→ Order.markAsShipped()
           └─→ OrderShippedEvent emitted
               └─→ EventBus.publish()
                   └─→ SendShippingNotificationHandler
```

## Project Structure

```
event-driven-example/
├── src/
│   ├── domain/
│   │   ├── entities/           # Order, OrderItem
│   │   ├── value-objects/      # OrderId, Money, Email, Address
│   │   ├── events/             # Domain events + EventBus interface
│   │   └── repositories/       # OrderRepository interface
│   │
│   ├── application/
│   │   ├── use-cases/          # CreateOrder, ProcessPayment, ShipOrder
│   │   └── event-handlers/     # Handlers that react to events
│   │       ├── SendOrderConfirmationHandler.ts
│   │       ├── UpdateInventoryHandler.ts
│   │       └── SendShippingNotificationHandler.ts
│   │
│   └── infrastructure/
│       ├── event-bus/          # InMemoryEventBus implementation
│       ├── persistence/        # InMemoryOrderRepository
│       └── api/                # OrderController
```

## Benefits of Event-Driven Architecture

### 1. **Loose Coupling**
Publishers don't know about subscribers. Add new handlers without changing existing code.

### 2. **Single Responsibility**
Each handler does one thing well.

### 3. **Extensibility**
Need to send SMS when order ships? Add a handler. No changes to Order or ShipOrderUseCase.

### 4. **Audit Trail**
Events form a natural audit log of what happened.

### 5. **Async Ready**
Easy to move handlers to async processing (queues, workers).

## When to Use Events

### Good for:
- Side effects (notifications, analytics, sync)
- Cross-module communication
- Audit requirements
- Systems that need to scale independently

### Avoid when:
- Strong consistency is required
- Simple CRUD without side effects
- You need immediate feedback from all handlers

## API Endpoints

```bash
# Create an order
POST /api/orders
{
  "customerEmail": "customer@example.com",
  "items": [
    {
      "productId": "prod-1",
      "productName": "Widget",
      "quantity": 2,
      "unitPriceInCents": 1999
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Madrid",
    "postalCode": "28001",
    "country": "ES"
  }
}

# Process payment
POST /api/orders/:id/pay
{
  "paymentId": "pay-123",
  "paymentMethod": "credit_card"
}

# Ship order
POST /api/orders/:id/ship
{
  "trackingNumber": "TRK-123456",
  "carrier": "DHL",
  "estimatedDeliveryDays": 5
}
```

## Getting Started

```bash
npm install
npm run dev
npm test
```

## Example Usage

```bash
# Create order (triggers: email + inventory reservation)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "customer@example.com",
    "items": [{"productId": "p1", "productName": "Widget", "quantity": 2, "unitPriceInCents": 1000}],
    "shippingAddress": {"street": "123 Main", "city": "Madrid", "postalCode": "28001", "country": "ES"}
  }'

# Pay (triggers: inventory confirmation)
curl -X POST http://localhost:3000/api/orders/ORDER_ID/pay \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "pay-123", "paymentMethod": "credit_card"}'

# Ship (triggers: shipping notification)
curl -X POST http://localhost:3000/api/orders/ORDER_ID/ship \
  -H "Content-Type: application/json" \
  -d '{"trackingNumber": "TRK-123", "carrier": "DHL"}'
```

## Related Projects

- **library-system**: Basic hexagonal architecture
- **vertical-slicing-example**: Feature-based organization
- **cqrs-example**: CQRS pattern
- **bounded-contexts-example**: Multiple bounded contexts
