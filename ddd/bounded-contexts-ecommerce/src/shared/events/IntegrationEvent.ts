/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 3 DE 6: INTEGRATION EVENTS - LA COMUNICACIÓN ENTRE CONTEXTOS
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Ahora viene LO MÁS IMPORTANTE de Bounded Contexts, mi niño!
 *
 * Ya viste que:
 *   - Catalog Context tiene Product
 *   - Sales Context tiene Order (con OrderItem, NO Product)
 *
 * Pregunta: ¿Cómo se comunican estos contextos SIN acoplarse?
 *
 * Respuesta: INTEGRATION EVENTS (Eventos de Integración)
 *
 * 🎯 ¿QUÉ SON LOS INTEGRATION EVENTS?
 *
 * Son MENSAJES que un contexto PUBLICA cuando algo importante pasa,
 * y otros contextos pueden ESCUCHAR y reaccionar.
 *
 * Analogía de WhatsApp:
 *   Sales Context: "¡Oye! Se hizo un pedido" 📱 (publica evento)
 *   Shipping Context: *lo ve* "Vale, voy a preparar el envío" 📦
 *   Inventory Context: *lo ve* "Vale, voy a decrementar stock" 📉
 *
 * 💡 DIFERENCIA: Domain Events vs Integration Events
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ DOMAIN EVENTS (Eventos de Dominio)                             │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ - INTERNOS a un Bounded Context                                │
 * │ - Usan lenguaje del dominio de ESE contexto                    │
 * │ - Pueden contener objetos ricos (entidades, VOs)               │
 * │ - No salen del contexto                                        │
 * │                                                                 │
 * │ Ejemplo (dentro de Sales Context):                             │
 * │   OrderCreatedEvent(order: Order) ← entidad completa           │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ INTEGRATION EVENTS (Eventos de Integración)                    │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ - CRUZAN fronteras entre Bounded Contexts                      │
 * │ - Usan lenguaje NEUTRAL/compartido                            │
 * │ - Solo primitivos (string, number, boolean) ← SERIALIZABLES    │
 * │ - Forman el "Published Language" entre contextos               │
 * │                                                                 │
 * │ Ejemplo (de Sales a otros contextos):                          │
 * │   OrderPlacedEvent {                                           │
 * │     orderId: string,        ← primitivo                        │
 * │     customerId: string,     ← primitivo                        │
 * │     totalAmount: number,    ← primitivo                        │
 * │     items: [...],           ← solo datos, no objetos          │
 * │   }                                                            │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 🏗️ ARQUITECTURA DE COMUNICACIÓN:
 *
 *   ┌──────────────────┐
 *   │  SALES CONTEXT   │
 *   │                  │
 *   │  Order.markAsPaid()
 *   │       ↓          │
 *   │  Publica:        │
 *   │  OrderPlacedEvent│
 *   └────────┬─────────┘
 *            │
 *            ↓ (Event Bus)
 *   ┌────────┴─────────┬──────────────────┐
 *   │                  │                  │
 *   ↓                  ↓                  ↓
 * ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
 * │ SHIPPING    │ │ INVENTORY    │ │ NOTIFICATION │
 * │ "Crear      │ │ "Decrementar"│ │ "Enviar      │
 * │  envío"     │ │  stock       │ │  email"      │
 * └─────────────┘ └──────────────┘ └──────────────┘
 *
 * Fíjate: Sales NO SABE quién escucha el evento. ¡Desacoplamiento total!
 *
 * 🎨 EJEMPLO MENTAL - Continuando con el Restaurante:
 *
 * SALA publica evento: "Mesa 5 pidió 2 Paellas"
 *
 * Quien lo escucha:
 *   - COCINA: "Vale, voy a cocinar 2 paellas"
 *   - ALMACÉN: "Vale, marco ingredientes como usados"
 *   - CONTABILIDAD: "Vale, registro la venta"
 *
 * SALA NO SABE que estos 3 están escuchando. Simplemente publica.
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de entender la teoría de Integration Events, ve a:
 *   → ./SalesEvents.ts (ver eventos concretos del Sales Context)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📨 IntegrationEvent - Contrato Base
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Todo Integration Event debe tener:
 *
 * ✅ eventId: Identificador único del evento (para idempotencia)
 * ✅ occurredOn: Cuándo pasó (timestamp ISO para serialización)
 * ✅ eventType: Tipo de evento ("order.placed", "product.created", etc.)
 * ✅ sourceContext: Qué contexto lo publicó ("sales", "catalog", etc.)
 *
 * 💡 ¿Por qué string en vez de Date?
 *
 * Porque los eventos cruzan fronteras:
 *   - Se serializan a JSON
 *   - Viajan por red (HTTP, Message Queue)
 *   - Se almacenan en Event Store
 *
 * Date no se serializa bien a JSON. ISO string sí.
 */
export interface IntegrationEvent {
  readonly eventId: string;
  readonly occurredOn: string; // ISO string for serialization
  readonly eventType: string;
  readonly sourceContext: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏭 BaseIntegrationEvent - Clase Base Abstracta
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Clase conveniente que implementa la lógica común:
 *   - Generar eventId automáticamente
 *   - Capturar occurredOn automáticamente
 *
 * Las subclases solo necesitan definir:
 *   - eventType: el tipo específico del evento
 *   - sourceContext: de qué contexto viene
 *   - Propiedades adicionales con los datos del evento
 *
 * Ejemplo de uso (ver SalesEvents.ts):
 *
 *   class OrderPlacedEvent extends BaseIntegrationEvent {
 *     readonly eventType = 'sales.order.placed';
 *     readonly sourceContext = 'sales';
 *
 *     constructor(
 *       public orderId: string,
 *       public customerId: string,
 *       public totalAmount: number
 *     ) {
 *       super(); // Genera eventId y occurredOn
 *     }
 *   }
 */
export abstract class BaseIntegrationEvent implements IntegrationEvent {
  readonly eventId: string;
  readonly occurredOn: string;
  abstract readonly eventType: string;
  abstract readonly sourceContext: string;

  constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date().toISOString();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎯 IntegrationEventHandler - Manejador de Eventos
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tipo que define cómo se MANEJA un evento.
 *
 * Un handler:
 *   - Recibe el evento
 *   - Realiza alguna acción (crear envío, actualizar stock, etc.)
 *   - Retorna Promise (puede ser asíncrono)
 *
 * Ejemplo:
 *
 *   const createShipmentHandler: IntegrationEventHandler<OrderPlacedEvent> =
 *     async (event) => {
 *       // Shipping Context reacciona al pedido
 *       const shipment = Shipment.create({
 *         orderId: event.orderId,
 *         address: event.shippingAddress
 *       });
 *       await shipmentRepository.save(shipment);
 *     };
 */
export type IntegrationEventHandler<T extends IntegrationEvent> = (
  event: T
) => Promise<void>;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🚌 IntegrationEventBus - El "Bus" de Eventos
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * El Event Bus es el INTERMEDIARIO entre contextos:
 *   - Permite PUBLICAR eventos
 *   - Permite SUSCRIBIRSE a eventos
 *
 * 💡 PATRÓN PUBLISH-SUBSCRIBE (Pub/Sub):
 *
 * Publisher (Sales):
 *   await eventBus.publish(new OrderPlacedEvent(...));
 *   // Sales no sabe quién escucha
 *
 * Subscriber (Shipping):
 *   eventBus.subscribe('sales.order.placed', createShipmentHandler);
 *   // Shipping se registra para escuchar
 *
 * 🏗️ IMPLEMENTACIONES POSIBLES:
 *
 * - In-Memory (para desarrollo/tests) → InMemoryIntegrationEventBus
 * - RabbitMQ (para producción) → RabbitMQIntegrationEventBus
 * - Kafka (para producción) → KafkaIntegrationEventBus
 * - AWS EventBridge → AwsEventBridgeIntegrationEventBus
 *
 * Todas implementan esta interface. El dominio no sabe cuál se usa.
 */
export interface IntegrationEventBus {
  /**
   * Publicar un evento
   *
   * El contexto que publica NO conoce a los suscriptores.
   * Solo "grita al aire" y quien quiera que escucha.
   */
  publish(event: IntegrationEvent): Promise<void>;

  /**
   * Suscribirse a un tipo de evento
   *
   * Cuando se publique un evento de este tipo,
   * se llamará al handler proporcionado.
   *
   * @param eventType - Tipo de evento ('sales.order.placed')
   * @param handler - Función que maneja el evento
   */
  subscribe<T extends IntegrationEvent>(
    eventType: string,
    handler: IntegrationEventHandler<T>
  ): void;
}
