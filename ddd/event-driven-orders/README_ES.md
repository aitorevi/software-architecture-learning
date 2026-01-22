# Sistema de Pedidos Event-Driven - Ejemplo Práctico

> **Tutorial by el Profe Millo**
> _"Es como el sistema de mensajería de WhatsApp: cuando pasa algo importante, se manda un mensaje y quien esté interesado lo escucha y reacciona."_

Sistema de gestión de pedidos que demuestra **Arquitectura Dirigida por Eventos** con eventos de dominio y bus de eventos.

## ¿Qué vas a aprender?

Este proyecto te enseña:

1. Qué son los **Eventos de Dominio** y por qué existen
2. Qué es un **Event Bus** y cómo funciona
3. Cómo crear **Event Handlers** desacoplados
4. Cómo el **Aggregate** emite eventos
5. Las ventajas de **Event-Driven Architecture**

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
       │                                   │    emits: OrderCreatedEvent
       ▼                                   ▼
┌─────────────────────────┐         ┌──────────────┐
│ ¿Qué hacer ahora?       │         │  EVENT BUS   │
│ - Enviar email          │         └──────┬───────┘
│ - Actualizar inventario │                │
│ - Crear envío           │                │ pub OrderCreatedEvent
│                         │                │
│ TODO EN UN SOLO LUGAR   │         ┌──────┴───────────────────┐
│ (Acoplado)              │         │                          │
└─────────────────────────┘         ▼                          ▼
                              ┌─────────────┐          ┌───────────────┐
                              │SendEmail    │          │UpdateInventory│
                              │Handler      │          │Handler        │
                              └─────────────┘          └───────────────┘

                              Handlers desacoplados
                              Cada uno hace UNA cosa
```

## ¿Por qué Event-Driven?

### El Problema Sin Eventos

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
    const order = Order.create({...});
    await this.orderRepo.save(order);
    await this.emailService.sendOrderConfirmation(order);
    await this.inventoryService.decreaseStock(order.items);
    await this.shippingService.createShipment(order);
    await this.analyticsService.trackOrderCreated(order);
    // ¿Y si quiero añadir notificaciones push?
    // → Tengo que modificar ESTE caso de uso
  }
}
```

**Problemas**:
1. **Alto acoplamiento**: CreateOrderUseCase conoce email, inventory, shipping, analytics
2. **Difícil de testear**: Necesitas mockear todo
3. **Difícil de extender**: Añadir nueva acción → modificar el caso de uso

### La Solución: Eventos

```typescript
// ✅ Desacoplado - Solo crea el pedido
export class CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: CreateOrderCommand) {
    const order = Order.create({...});
    await this.orderRepo.save(order);

    // Publicar eventos - handlers reaccionan independientemente
    const events = order.pullDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    return { orderId: order.id.value };
  }
}

// Handlers separados
class SendOrderConfirmationHandler {
  async handle(event: OrderCreatedEvent) {
    await emailService.send({ to: event.customerEmail, ... });
  }
}

class UpdateInventoryHandler {
  async handle(event: OrderCreatedEvent) {
    for (const item of event.items) {
      await inventoryService.decreaseStock(item.productId, item.quantity);
    }
  }
}
```

**Ventajas**:
- ✅ **Desacoplamiento**: CreateOrderUseCase no conoce handlers
- ✅ **Fácil testear**: Testas el caso de uso sin mockear handlers
- ✅ **Fácil extender**: Nuevo handler → solo añades el handler, no tocas el caso de uso
- ✅ **Single Responsibility**: Cada handler hace UNA cosa

## Estructura del Proyecto

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
│   │   └── OrderEvents.ts        # OrderCreatedEvent, OrderPaidEvent, etc
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

### 1. Eventos de Dominio

Los eventos capturan **hechos que han ocurrido** en el dominio.

```typescript
export class OrderCreatedEvent implements DomainEvent {
  readonly eventName = 'order.created';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly orderId: string,
    public readonly customerEmail: string,
    public readonly totalAmount: number,
    public readonly shippingAddress: Address,
    public readonly items: OrderItem[]
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
```

**Características de los eventos**:
- Siempre en **pasado**: `OrderCreated`, no `CreateOrder`
- **Inmutables**: representan algo que YA pasó
- Contienen **toda la info necesaria** para reaccionar
- Tienen **ID único** y **timestamp**

### 2. Event Bus

El Event Bus es el "cartero" que entrega eventos a los handlers.

```typescript
// Puerto (domain)
export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
}

// Adaptador (infrastructure)
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
      await handler.handle(event);
    }
  }
}
```

### 3. Event Handlers

Los handlers reaccionan cuando se publica un evento.

```typescript
export class SendOrderConfirmationHandler implements EventHandler {
  async handle(event: DomainEvent): Promise<void> {
    if (event.eventName !== 'order.created') return;
    const orderEvent = event as OrderCreatedEvent;

    console.log(`📧 Enviando confirmación a ${orderEvent.customerEmail}`);
    // En producción, usarías un servicio de email real
  }
}
```

### 4. Aggregate Emitiendo Eventos

El Aggregate Root emite eventos cuando su estado cambia.

```typescript
export class Order {
  private domainEvents: DomainEvent[] = [];

  static create(params: CreateOrderParams): Order {
    const order = new Order({...});

    // Emitir evento
    order.addDomainEvent(new OrderCreatedEvent(
      params.id.value,
      params.customerEmail.value,
      order.calculateTotal(),
      params.shippingAddress,
      params.items
    ));

    return order;
  }

  processPayment(amount: Money, paymentMethod: string): void {
    this.status = OrderStatus.PAID;
    this.addDomainEvent(new OrderPaidEvent(this.id.value, amount.amountInCents, paymentMethod));
  }

  ship(trackingNumber: string, carrier: string): void {
    this.status = OrderStatus.SHIPPED;
    this.addDomainEvent(new OrderShippedEvent(this.id.value, trackingNumber, carrier));
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
```

## Flujo Completo de un Pedido

```
1. Cliente hace POST /orders
   ↓
2. OrderController recibe la petición
   ↓
3. OrderController llama CreateOrderUseCase
   ↓
4. CreateOrderUseCase:
   a. Crea Order (domain)
   b. Order.create() emite OrderCreatedEvent
   c. Guarda order en repository
   d. Publica OrderCreatedEvent en EventBus
   ↓
5. EventBus notifica a TODOS los handlers suscritos:
   ├─→ SendOrderConfirmationHandler (envía email)
   └─→ UpdateInventoryHandler (reduce stock)
   ↓
6. Cliente recibe respuesta HTTP:
   { "success": true, "orderId": "order-123" }
```

## Instalación y Uso

```bash
npm install
npm run dev      # Servidor en http://localhost:3000
npm test         # Ejecutar tests
npm run build    # Compilar para producción
```

## Endpoints de la API

| Método | Endpoint | Descripción | Eventos emitidos |
|--------|----------|-------------|------------------|
| POST | `/api/orders` | Crear pedido | `OrderCreatedEvent` |
| POST | `/api/orders/:id/pay` | Procesar pago | `OrderPaidEvent` |
| POST | `/api/orders/:id/ship` | Enviar pedido | `OrderShippedEvent` |

## Ejemplos de Uso

```bash
# Crear pedido (dispara: email + inventario)
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

# Pagar (dispara: confirmación de inventario)
curl -X POST http://localhost:3000/api/orders/ORDER_ID/pay \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "pay-123", "paymentMethod": "credit_card"}'

# Enviar (dispara: notificación de envío)
curl -X POST http://localhost:3000/api/orders/ORDER_ID/ship \
  -H "Content-Type: application/json" \
  -d '{"trackingNumber": "TRK-123", "carrier": "Correos"}'
```

## Ventajas de Event-Driven

### 1. Desacoplamiento
Los componentes no se conocen entre sí. Solo conocen eventos.

### 2. Fácil Extender
Añadir nueva funcionalidad sin tocar código existente:

```typescript
// ¿Quieres añadir notificaciones push?
// → Solo creas un nuevo handler
class SendPushNotificationHandler implements EventHandler {
  async handle(event: DomainEvent) {
    if (event.eventName !== 'order.created') return;
    // Enviar push notification
  }
}

// Lo registras en el bootstrap
eventBus.subscribe('order.created', new SendPushNotificationHandler());

// ¡Listo! CreateOrderUseCase no cambia.
```

### 3. Auditoría y Debugging
Los eventos son un log de todo lo que ha pasado:

```
12:00:00 - OrderCreatedEvent { orderId: '123', ... }
12:00:01 - OrderPaidEvent { orderId: '123', amount: 5000 }
12:30:00 - OrderShippedEvent { orderId: '123', tracking: 'ABC123' }
```

## Cuándo Usar Event-Driven

### ✅ USA Event-Driven cuando:
- **Múltiples reacciones** a una acción
- **Componentes desacoplados**: No quieres que A conozca a B
- **Auditoría**: Necesitas log de todo lo que pasa
- **Microservicios**: Comunicación entre servicios
- **Workflows complejos**: Procesos con múltiples pasos

### ❌ NO uses Event-Driven cuando:
- **Flujo simple**: A llama B directamente está bien
- **Necesitas respuesta inmediata**: Los eventos son fire-and-forget
- **Proyecto pequeño**: Complejidad > beneficio

## Ejercicios Propuestos

### Nivel 1 - Básico
1. **Añadir un nuevo handler:** `SendSMSHandler` que envíe SMS cuando se envía el pedido
2. **Loguear todos los eventos:** Crear un `LoggingHandler` que guarde todos los eventos en un archivo

### Nivel 2 - Intermedio
3. **Añadir un nuevo evento:** `OrderCancelledEvent` cuando se cancela un pedido
4. **Implementar compensación:** Si falla el inventario, emitir evento de compensación

### Nivel 3 - Avanzado
5. **Event Sourcing:** Reconstruir el estado del pedido a partir de sus eventos
6. **Event Store:** Persistir todos los eventos en una base de datos

---

## Ruta de Aprendizaje Completada

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

---

## Proyectos Relacionados

- **[Repository Pattern](../../layered/repository-pattern)**: Patrón Repository básico
- **[Controller-Service](../../layered/controller-service)**: Controller y Service básicos
- **[Library System](../../hexagonal/library-system)**: Arquitectura Hexagonal
- **[Vertical Slicing](../../slicing/vertical-slicing-tasks)**: Organización por features

---

## El Profe Millo dice...

> "Recuerda, mi niño: usa eventos para desacoplar componentes y permitir que múltiples cosas reaccionen a un hecho. Si solo una cosa reacciona, probablemente no necesitas eventos."

¡Felicidades por completar la ruta de aprendizaje! Ahora entiendes los patrones fundamentales de arquitectura de software.
