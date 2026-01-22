# Quickstart - Event-Driven Orders

## 1. Instalar y ejecutar

```bash
cd ddd/event-driven-orders
npm install
npm run dev
```

Deberías ver:

```
Server running on http://localhost:3000

Event handlers registered:
  - SendOrderConfirmationHandler (order.created)
  - UpdateInventoryHandler (order.created)
  - SendShippingNotificationHandler (order.shipped)

Available endpoints:
  POST /api/orders           → Create order
  POST /api/orders/:id/pay   → Process payment
  POST /api/orders/:id/ship  → Ship order
```

## 2. Probar la API

Abre otra terminal y observa los logs del servidor mientras ejecutas:

```bash
# Crear un pedido (dispara: email + inventario)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "cliente@ejemplo.com",
    "items": [
      {"productId": "prod-1", "productName": "Laptop", "quantity": 1, "unitPriceInCents": 99900}
    ],
    "shippingAddress": {
      "street": "Calle Mayor 1",
      "city": "Las Palmas",
      "postalCode": "35001",
      "country": "ES"
    }
  }'

# Observa los logs del servidor:
# → OrderCreatedEvent emitido
# → SendOrderConfirmationHandler ejecutado
# → UpdateInventoryHandler ejecutado
```

```bash
# Pagar el pedido (usa el ID que obtuviste)
curl -X POST http://localhost:3000/api/orders/ORDER_ID/pay \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "pay-123", "paymentMethod": "credit_card"}'

# Enviar el pedido
curl -X POST http://localhost:3000/api/orders/ORDER_ID/ship \
  -H "Content-Type: application/json" \
  -d '{"trackingNumber": "TRK-123456", "carrier": "Correos"}'

# Observa los logs:
# → OrderShippedEvent emitido
# → SendShippingNotificationHandler ejecutado
```

## 3. Ejecutar tests

```bash
npm test
```

## 4. Entender la estructura

```
src/
├── domain/
│   ├── entities/
│   │   └── Order.ts           ← Aggregate que emite eventos
│   ├── events/
│   │   ├── DomainEvent.ts     ← Interface base
│   │   ├── EventBus.ts        ← Puerto (interface)
│   │   └── OrderEvents.ts     ← Eventos específicos
│   └── repositories/
│       └── OrderRepository.ts
│
├── application/
│   ├── use-cases/
│   │   ├── CreateOrderUseCase.ts     ← Crea orden → publica evento
│   │   ├── ProcessPaymentUseCase.ts
│   │   └── ShipOrderUseCase.ts
│   │
│   └── event-handlers/               ← Reaccionan a eventos
│       ├── SendOrderConfirmationHandler.ts
│       ├── UpdateInventoryHandler.ts
│       └── SendShippingNotificationHandler.ts
│
└── infrastructure/
    ├── event-bus/
    │   └── InMemoryEventBus.ts       ← Implementación del bus
    ├── persistence/
    └── api/
```

## 5. Conceptos clave

### Eventos de Dominio

```typescript
// Los eventos representan HECHOS que ya ocurrieron
// Se nombran en PASADO
class OrderCreatedEvent {
  readonly eventName = 'order.created';
  constructor(
    public readonly orderId: string,
    public readonly customerEmail: string,
    public readonly items: OrderItem[]
  ) {}
}
```

### El Aggregate emite eventos

```typescript
class Order {
  static create(params: CreateOrderParams): Order {
    const order = new Order({...});

    // Emite evento cuando se crea
    order.addDomainEvent(new OrderCreatedEvent(...));

    return order;
  }
}
```

### Los Handlers reaccionan

```typescript
class SendOrderConfirmationHandler {
  async handle(event: OrderCreatedEvent) {
    // Enviar email de confirmación
    await emailService.send({
      to: event.customerEmail,
      subject: 'Pedido confirmado'
    });
  }
}
```

### Desacoplamiento total

```
CreateOrderUseCase  →  OrderCreatedEvent  →  EventBus
                                                  │
                           ┌──────────────────────┼──────────────────────┐
                           ▼                      ▼                      ▼
                    SendEmailHandler    UpdateInventoryHandler    [Nuevo Handler]

Los publicadores NO conocen a los suscriptores.
Añadir nuevos handlers = 0 cambios en código existente.
```

## 6. Experimentar

Ideas para practicar:

1. **Crear un nuevo handler:** `SendSMSHandler` que envíe SMS cuando se envía el pedido
2. **Añadir un nuevo evento:** `OrderCancelledEvent` cuando se cancela un pedido
3. **Implementar persistencia de eventos:** Guardar todos los eventos en un log

## 7. Ruta de aprendizaje completada

Has recorrido toda la ruta de aprendizaje:

```
Repository Pattern (Básico)
        ↓
Controller-Service (Básico)
        ↓
Library System / Hexagonal (Intermedio)
        ↓
Vertical Slicing (Intermedio)
        ↓
Event-Driven (Avanzado) ← ESTÁS AQUÍ
```

¡Felicidades! Ahora entiendes los patrones fundamentales de arquitectura de software.
