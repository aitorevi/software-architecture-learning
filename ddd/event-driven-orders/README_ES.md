# Ejemplo Event-Driven - Sistema de Pedidos

Sistema de gestión de pedidos que demuestra **Arquitectura Dirigida por Eventos** con eventos de dominio y bus de eventos.

## ¿Qué es la Arquitectura Dirigida por Eventos?

La Arquitectura Dirigida por Eventos (EDA) usa eventos para disparar y comunicar entre servicios y componentes desacoplados.

```
┌─────────────────────────────────────────────────────────────────────┐
│                Arquitectura Dirigida por Eventos                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│     ┌─────────────┐                                                 │
│     │   Pedido    │                                                 │
│     │   Creado    │ ──────────┐                                     │
│     └─────────────┘           │                                     │
│                               ▼                                     │
│                        ┌─────────────┐                              │
│                        │ Bus Eventos │                              │
│                        └──────┬──────┘                              │
│                               │                                     │
│              ┌────────────────┼────────────────┐                    │
│              │                │                │                    │
│              ▼                ▼                ▼                    │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│     │   Enviar    │  │  Reservar   │  │ Actualizar  │              │
│     │   Email     │  │  Inventario │  │  Analytics  │              │
│     └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                     │
│   ¡Los publicadores no conocen a los suscriptores!                  │
│   Fácil añadir nuevos handlers sin cambiar código existente.        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Conceptos Clave

### Eventos de Dominio

Los eventos representan cosas que **ocurrieron** en el dominio:

```typescript
// Los eventos se nombran en pasado
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

### Bus de Eventos

El bus de eventos enruta eventos a los handlers:

```typescript
interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
}
```

### Manejadores de Eventos

Los handlers reaccionan a eventos:

```typescript
class SendOrderConfirmationHandler {
  async handle(event: OrderCreatedEvent) {
    await this.emailService.sendEmail(
      event.customerEmail,
      'Confirmación de Pedido',
      `¡Tu pedido ${event.orderId} ha sido recibido!`
    );
  }
}
```

## Flujo de Eventos

```
1. Cliente hace pedido
   └─→ CreateOrderUseCase
       └─→ Order.create()
           └─→ OrderCreatedEvent emitido
               └─→ EventBus.publish()
                   ├─→ SendOrderConfirmationHandler (email)
                   └─→ ReserveInventoryHandler (inventario)

2. Pago recibido
   └─→ ProcessPaymentUseCase
       └─→ Order.markAsPaid()
           └─→ PaymentReceivedEvent emitido
               └─→ EventBus.publish()
                   └─→ ConfirmInventoryHandler

3. Pedido enviado
   └─→ ShipOrderUseCase
       └─→ Order.markAsShipped()
           └─→ OrderShippedEvent emitido
               └─→ EventBus.publish()
                   └─→ SendShippingNotificationHandler
```

## Beneficios

### 1. **Bajo Acoplamiento**
Los publicadores no conocen a los suscriptores.

### 2. **Responsabilidad Única**
Cada handler hace una cosa bien.

### 3. **Extensibilidad**
¿Necesitas enviar SMS cuando se envía un pedido? Añade un handler. Sin cambios al Order.

### 4. **Rastro de Auditoría**
Los eventos forman un log natural de lo que ocurrió.

## Endpoints de la API

```bash
# Crear pedido
POST /api/orders

# Procesar pago
POST /api/orders/:id/pay

# Enviar pedido
POST /api/orders/:id/ship
```

## Comenzar

```bash
npm install
npm run dev
npm test
```

## Proyectos Relacionados

- **library-system**: Arquitectura hexagonal básica
- **vertical-slicing-example**: Organización por funcionalidades
- **cqrs-example**: Patrón CQRS
- **bounded-contexts-example**: Múltiples bounded contexts
