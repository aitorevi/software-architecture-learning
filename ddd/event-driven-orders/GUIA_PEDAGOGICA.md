# Sistema de Pedidos Event-Driven - Guía Pedagógica 📨

Buenas, mi niño. Ahora vamos a aprender sobre **Arquitectura Dirigida por Eventos** (Event-Driven Architecture). Es como el sistema de mensajería de WhatsApp: cuando pasa algo importante, se manda un mensaje y quien esté interesado lo escucha y reacciona.

## ¿Qué es Event-Driven Architecture?

En lugar de que los componentes se llamen directamente entre sí, **se comunican mediante eventos**. Cuando pasa algo importante, se publica un evento. Otros componentes que estén interesados lo escuchan y reaccionan.

```
LLAMADA DIRECTA (Tradicional)       EVENT-DRIVEN (Con Eventos)

┌──────────────┐                    ┌──────────────┐
│CreateOrder   │                    │CreateOrder   │
│UseCase       │                    │UseCase       │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │ 1. Crear pedido                   │ 1. Crear pedido
       │                                   │
       ▼                                   ▼
┌──────────────┐                    ┌──────────────┐
│   Order      │                    │   Order      │
│  (Aggregate) │                    │  (Aggregate) │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │ 2. order.place()                  │ 2. order.place()
       │                                   │    emits: OrderPlacedEvent
       ▼                                   ▼
┌─────────────────────────┐         ┌──────────────┐
│ ¿Qué hacer ahora?       │         │  EVENT BUS   │
│ - Enviar email          │         └──────┬───────┘
│ - Actualizar inventario │                │
│ - Crear envío           │                │ pub OrderPlacedEvent
│                         │                │
│ TODO EN UN SOLO LUGAR   │         ┌──────┴───────────────────┐
│ (Acoplado)              │         │                          │
└─────────────────────────┘         ▼                          ▼
                              ┌─────────────┐          ┌──────────────┐
                              │SendEmail    │          │UpdateInventory│
                              │Handler      │          │Handler        │
                              └─────────────┘          └───────────────┘
                                                              │
                                                              ▼
                                                       ┌──────────────┐
                                                       │CreateShipment│
                                                       │Handler       │
                                                       └──────────────┘

                              Handlers desacoplados
                              Cada uno hace UNA cosa
```

## ¿Por qué Event-Driven?

### El Problema Sin Eventos

Imagínate que tienes un caso de uso para crear pedidos:

```typescript
// ❌ Acoplado - Todo en el mismo lugar
export class CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private emailService: EmailService,
    private inventoryService: InventoryService,
    private shippingService: ShippingService,
    private analyticsService: AnalyticsService
  ) {}

  async execute(command: CreateOrderCommand) {
    // 1. Crear pedido
    const order = Order.create({...});
    await this.orderRepo.save(order);

    // 2. Enviar email confirmación
    await this.emailService.sendOrderConfirmation(order);

    // 3. Actualizar inventario
    await this.inventoryService.decreaseStock(order.items);

    // 4. Crear envío
    await this.shippingService.createShipment(order);

    // 5. Track analytics
    await this.analyticsService.trackOrderCreated(order);

    // ¿Y si falla el email? ¿Rollback?
    // ¿Y si falla el envío?
    // ¿Y si quiero añadir notificaciones push?
    //   → Tengo que modificar ESTE caso de uso
  }
}
```

**Problemas**:
1. **Alto acoplamiento**: CreateOrderUseCase conoce email, inventory, shipping, analytics
2. **Difícil de testear**: Necesitas mockear todo
3. **Difícil de extender**: Añadir nueva acción → modificar el caso de uso
4. **Transaccionalidad compleja**: ¿Qué haces si falla un paso?

### La Solución: Eventos

Con eventos, el caso de uso solo crea el pedido y emite un evento. Los demás reaccionan:

```typescript
// ✅ Desacoplado - Solo crea el pedido
export class CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: CreateOrderCommand) {
    // 1. Crear pedido (domain lógica)
    const order = Order.create({...});

    // 2. Guardar
    await this.orderRepo.save(order);

    // 3. Publicar eventos
    const events = order.pullDomainEvents();
    // [OrderPlacedEvent, OrderItemsAddedEvent]

    for (const event of events) {
      await this.eventBus.publish(event);
    }

    return { orderId: order.id.value };
  }
}

// Handlers separados que escuchan el evento
export class SendOrderConfirmationHandler {
  async handle(event: OrderPlacedEvent) {
    await emailService.send({
      to: event.customerEmail,
      subject: 'Pedido confirmado',
      // ...
    });
  }
}

export class UpdateInventoryHandler {
  async handle(event: OrderPlacedEvent) {
    for (const item of event.items) {
      await inventoryService.decreaseStock(item.productId, item.quantity);
    }
  }
}

export class CreateShipmentHandler {
  async handle(event: OrderPlacedEvent) {
    await shippingService.createShipment({
      orderId: event.orderId,
      address: event.shippingAddress,
      // ...
    });
  }
}
```

**Ventajas**:
- ✅ **Desacoplamiento**: CreateOrderUseCase no conoce handlers
- ✅ **Fácil testear**: Testas el caso de uso sin mockear handlers
- ✅ **Fácil extender**: Nuevo handler → solo añades el handler, no tocas el caso de uso
- ✅ **Single Responsibility**: Cada handler hace UNA cosa

## Estructura del Proyecto Event-Driven

```
src/
├── domain/
│   ├── entities/
│   │   ├── Order.ts              # Aggregate que emite eventos
│   │   └── OrderItem.ts
│   ├── value-objects/
│   │   ├── OrderId.ts
│   │   ├── Email.ts
│   │   ├── Address.ts
│   │   └── Money.ts
│   ├── events/
│   │   ├── DomainEvent.ts        # Interface base
│   │   ├── EventBus.ts           # Puerto para publicar eventos
│   │   └── OrderEvents.ts        # OrderPlacedEvent, OrderPaidEvent, etc
│   └── repositories/
│       └── OrderRepository.ts
│
├── application/
│   ├── use-cases/
│   │   ├── CreateOrderUseCase.ts      # Crea order → emite evento
│   │   ├── ProcessPaymentUseCase.ts   # Paga order → emite evento
│   │   └── ShipOrderUseCase.ts        # Envía order → emite evento
│   │
│   └── event-handlers/                # Reaccionan a eventos
│       ├── SendOrderConfirmationHandler.ts
│       ├── UpdateInventoryHandler.ts
│       └── SendShippingNotificationHandler.ts
│
└── infrastructure/
    ├── persistence/
    │   └── InMemoryOrderRepository.ts
    ├── event-bus/
    │   └── InMemoryEventBus.ts        # Implementación del bus
    └── api/
        └── OrderController.ts
```

## Conceptos Clave

### 1. Domain Events (Eventos de Dominio)

Los eventos capturan **hechos que han ocurrido** en el dominio.

```typescript
// domain/events/OrderEvents.ts
export class OrderPlacedEvent implements DomainEvent {
  readonly eventName = 'order.placed';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly orderId: string,
    public readonly customerEmail: string,
    public readonly totalAmount: number,
    public readonly shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    },
    public readonly items: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
    }>
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}

export class OrderPaidEvent implements DomainEvent {
  readonly eventName = 'order.paid';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly orderId: string,
    public readonly amount: number,
    public readonly paymentMethod: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}

export class OrderShippedEvent implements DomainEvent {
  readonly eventName = 'order.shipped';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly orderId: string,
    public readonly trackingNumber: string,
    public readonly shippingCarrier: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
```

**Características de los eventos**:
- Siempre en **pasado**: `OrderPlaced`, no `PlaceOrder`
- **Inmutables**: representan algo que YA pasó
- Contienen **toda la info necesaria** para reaccionar
- Tienen **ID único** y **timestamp**

### 2. Event Bus (Bus de Eventos)

El Event Bus es el "cartero" que entrega eventos a los handlers.

```typescript
// domain/events/EventBus.ts (Puerto)
export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
}

export interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}

// infrastructure/event-bus/InMemoryEventBus.ts (Adaptador)
export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, EventHandler[]>();

  subscribe(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? [];

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        // Log error pero no detiene otros handlers
        console.error(`Error in handler for ${event.eventName}:`, error);
      }
    }
  }
}
```

### 3. Event Handlers (Manejadores de Eventos)

Los handlers reaccionan cuando se publica un evento.

```typescript
// application/event-handlers/SendOrderConfirmationHandler.ts
export class SendOrderConfirmationHandler implements EventHandler {
  async handle(event: DomainEvent): Promise<void> {
    // Type guard
    if (event.eventName !== 'order.placed') return;

    const orderEvent = event as OrderPlacedEvent;

    console.log(`📧 Enviando confirmación de pedido a ${orderEvent.customerEmail}`);

    // En producción, usarías un servicio de email real
    await this.emailService.send({
      to: orderEvent.customerEmail,
      subject: `Pedido #${orderEvent.orderId} confirmado`,
      body: `
        Gracias por tu pedido.
        Total: €${(orderEvent.totalAmount / 100).toFixed(2)}
        Dirección de envío: ${orderEvent.shippingAddress.street}, ${orderEvent.shippingAddress.city}
      `
    });

    console.log(`✅ Email enviado a ${orderEvent.customerEmail}`);
  }
}

// application/event-handlers/UpdateInventoryHandler.ts
export class UpdateInventoryHandler implements EventHandler {
  async handle(event: DomainEvent): Promise<void> {
    if (event.eventName !== 'order.placed') return;

    const orderEvent = event as OrderPlacedEvent;

    console.log(`📦 Actualizando inventario para pedido ${orderEvent.orderId}`);

    for (const item of orderEvent.items) {
      // En producción, llamarías a un servicio de inventario
      console.log(`  - Reduciendo stock de ${item.name}: ${item.quantity} unidades`);
    }

    console.log(`✅ Inventario actualizado`);
  }
}

// application/event-handlers/SendShippingNotificationHandler.ts
export class SendShippingNotificationHandler implements EventHandler {
  async handle(event: DomainEvent): Promise<void> {
    if (event.eventName !== 'order.shipped') return;

    const shippedEvent = event as OrderShippedEvent;

    console.log(`🚚 Enviando notificación de envío para pedido ${shippedEvent.orderId}`);
    console.log(`   Tracking: ${shippedEvent.trackingNumber}`);
    console.log(`   Transportista: ${shippedEvent.shippingCarrier}`);

    // Enviar email, SMS, push notification, etc.

    console.log(`✅ Notificación de envío enviada`);
  }
}
```

### 4. Aggregate Emitiendo Eventos

El Aggregate Root emite eventos cuando su estado cambia.

```typescript
// domain/entities/Order.ts
export class Order {
  private domainEvents: DomainEvent[] = [];

  static create(params: {
    id: OrderId;
    customerEmail: Email;
    shippingAddress: Address;
    items: OrderItem[];
  }): Order {
    // Validaciones...

    const order = new Order({...});

    // Emitir evento
    order.addDomainEvent(
      new OrderPlacedEvent(
        params.id.value,
        params.customerEmail.value,
        order.calculateTotal(),
        {
          street: params.shippingAddress.street,
          city: params.shippingAddress.city,
          postalCode: params.shippingAddress.postalCode,
          country: params.shippingAddress.country,
        },
        params.items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice.amountInCents,
        }))
      )
    );

    return order;
  }

  processPayment(amount: Money, paymentMethod: string): void {
    if (!this.isPending()) {
      throw new OrderError('Order must be pending to process payment');
    }

    this.status = OrderStatus.PAID;
    this.paidAt = new Date();

    this.addDomainEvent(
      new OrderPaidEvent(
        this.id.value,
        amount.amountInCents,
        paymentMethod
      )
    );
  }

  ship(trackingNumber: string, carrier: string): void {
    if (!this.isPaid()) {
      throw new OrderError('Order must be paid before shipping');
    }

    this.status = OrderStatus.SHIPPED;
    this.shippedAt = new Date();

    this.addDomainEvent(
      new OrderShippedEvent(
        this.id.value,
        trackingNumber,
        carrier
      )
    );
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
```

## Flujo Completo de un Pedido

Vamos a ver cómo fluye todo desde que el cliente crea un pedido:

```
1. Cliente hace POST /orders
   ↓
2. OrderController recibe la petición
   ↓
3. OrderController llama CreateOrderUseCase
   ↓
4. CreateOrderUseCase:
   a. Crea Order (domain)
   b. Order.create() emite OrderPlacedEvent
   c. Guarda order en repository
   d. Publica OrderPlacedEvent en EventBus
   ↓
5. EventBus notifica a TODOS los handlers suscritos:
   ┌─────────────────────────────────────┐
   │                                     │
   ▼                                     ▼
SendOrderConfirmationHandler    UpdateInventoryHandler
- Envía email confirmación      - Reduce stock productos
                                 - Si stock bajo → crea alerta

6. Cliente recibe respuesta HTTP:
   { "success": true, "orderId": "order-123" }

7. Más tarde, cliente paga:
   POST /orders/order-123/payment
   ↓
8. ProcessPaymentUseCase:
   a. Carga Order
   b. order.processPayment() → emite OrderPaidEvent
   c. Guarda order
   d. Publica OrderPaidEvent
   ↓
9. Handlers reaccionan:
   - SendPaymentConfirmationHandler
   - PrepareShipmentHandler

10. Admin envía el pedido:
    POST /orders/order-123/ship
    ↓
11. ShipOrderUseCase:
    a. Carga Order
    b. order.ship() → emite OrderShippedEvent
    c. Guarda order
    d. Publica OrderShippedEvent
    ↓
12. Handlers reaccionan:
    - SendShippingNotificationHandler
    - UpdateDeliveryTrackingHandler
```

## Ventajas de Event-Driven

### 1. Desacoplamiento

Los componentes no se conocen entre sí. Solo conocen eventos.

```typescript
// CreateOrderUseCase NO conoce:
// - SendOrderConfirmationHandler
// - UpdateInventoryHandler
// - CreateShipmentHandler

// Solo emite el evento. Los handlers se suscriben solos.
```

### 2. Fácil Extender

Añadir nueva funcionalidad sin tocar código existente:

```typescript
// Quieres añadir notificaciones push?
// → Solo creas un nuevo handler
export class SendPushNotificationHandler implements EventHandler {
  async handle(event: DomainEvent) {
    if (event.eventName !== 'order.placed') return;

    // Enviar push notification
  }
}

// Lo registras en el bootstrap
eventBus.subscribe('order.placed', new SendPushNotificationHandler());

// ¡Listo! CreateOrderUseCase no cambia.
```

### 3. Auditoría y Debugging

Los eventos son un log de todo lo que ha pasado:

```
12:00:00 - OrderPlacedEvent { orderId: '123', ... }
12:00:01 - OrderPaidEvent { orderId: '123', amount: 5000 }
12:30:00 - OrderShippedEvent { orderId: '123', tracking: 'ABC123' }
```

### 4. Eventual Consistency

Los handlers pueden ejecutarse asíncronamente:

```typescript
await this.eventBus.publish(event);
// El event bus puede poner el evento en una cola
// Los handlers lo procesan después
// El cliente no espera
```

## Ejemplos de Uso

### Crear Pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "juan@example.com",
    "shippingAddress": {
      "street": "Calle Mayor 1",
      "city": "Las Palmas",
      "postalCode": "35001",
      "country": "España"
    },
    "items": [
      {
        "productId": "prod-123",
        "name": "Laptop",
        "quantity": 1,
        "unitPriceInCents": 99900
      },
      {
        "productId": "prod-456",
        "name": "Mouse",
        "quantity": 2,
        "unitPriceInCents": 2500
      }
    ]
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "orderId": "order-abc-123"
  }
}
```

**Eventos emitidos**:
- `OrderPlacedEvent`

**Handlers que reaccionan**:
- SendOrderConfirmationHandler → Envía email
- UpdateInventoryHandler → Reduce stock

### Procesar Pago

```bash
curl -X POST http://localhost:3000/api/orders/order-abc-123/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amountInCents": 104900,
    "paymentMethod": "credit_card"
  }'
```

**Eventos emitidos**:
- `OrderPaidEvent`

**Handlers que reaccionan**:
- SendPaymentConfirmationHandler → Envía email de confirmación de pago

### Enviar Pedido

```bash
curl -X POST http://localhost:3000/api/orders/order-abc-123/ship \
  -H "Content-Type: application/json" \
  -d '{
    "trackingNumber": "TRACK-12345",
    "shippingCarrier": "Correos"
  }'
```

**Eventos emitidos**:
- `OrderShippedEvent`

**Handlers que reaccionan**:
- SendShippingNotificationHandler → Envía email con tracking

## Errores Comunes

### 1. Handlers con Efectos Secundarios Peligrosos

```typescript
// ❌ MALO - El handler modifica el aggregate
export class BadHandler implements EventHandler {
  async handle(event: OrderPlacedEvent) {
    // Cargar el order de nuevo
    const order = await orderRepo.findById(event.orderId);

    // MODIFICARLO (¡peligroso!)
    order.markAsProcessed();
    await orderRepo.save(order);

    // Esto puede causar loops infinitos si emite más eventos
  }
}

// ✅ BUENO - El handler solo hace side effects externos
export class GoodHandler implements EventHandler {
  async handle(event: OrderPlacedEvent) {
    // Solo envía email, no modifica el order
    await emailService.send({...});
  }
}
```

### 2. Eventos con Demasiados Datos

```typescript
// ❌ MALO - Evento con toda la entidad
export class BadOrderPlacedEvent {
  constructor(
    public readonly order: Order  // ¡Toda la entidad!
  ) {}
}

// ✅ BUENO - Evento con solo los datos necesarios
export class GoodOrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerEmail: string,
    public readonly totalAmount: number,
    // ... datos primitivos
  ) {}
}
```

### 3. No Manejar Errores en Handlers

```typescript
// ❌ MALO - Si un handler falla, se detiene todo
async publish(event: DomainEvent) {
  for (const handler of handlers) {
    await handler.handle(event);  // Si falla, detiene los demás
  }
}

// ✅ BUENO - Cada handler se ejecuta independientemente
async publish(event: DomainEvent) {
  for (const handler of handlers) {
    try {
      await handler.handle(event);
    } catch (error) {
      console.error(`Handler failed:`, error);
      // Continúa con los demás handlers
    }
  }
}
```

## Cuándo Usar Event-Driven

### ✅ USA Event-Driven cuando:

1. **Múltiples reacciones** a una acción: Crear pedido → email, inventario, shipping, analytics
2. **Componentes desacoplados**: No quieres que A conozca a B
3. **Auditoría**: Necesitas log de todo lo que pasa
4. **Microservicios**: Comunicación entre servicios
5. **Workflows complejos**: Procesos de negocio con múltiples pasos

### ❌ NO uses Event-Driven cuando:

1. **Flujo simple**: A llama B directamente está bien
2. **Necesitas respuesta inmediata**: Los eventos son fire-and-forget
3. **Debugging es crítico**: Los eventos hacen el flujo menos obvio
4. **Proyecto pequeño**: Complejidad > beneficio

## Resumen

Event-Driven = **Comunicación mediante eventos**

```
Componente A hace algo
  ↓
Emite evento
  ↓
Event Bus distribuye
  ↓
Handlers B, C, D reaccionan (independientemente)
```

**Ventajas**:
- Desacoplamiento
- Fácil extender
- Auditoría
- Eventual consistency

**Desventajas**:
- Más complejo
- Debugging más difícil
- No hay respuesta directa

Recuerda, mi niño: **usa eventos para desacoplar componentes y permitir que múltiples cosas reaccionen a un hecho**.

¿Te quedó clarito o le damos otra vuelta? 🚀
