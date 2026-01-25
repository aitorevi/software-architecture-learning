/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 4 DE 6: SALES EVENTS - LOS EVENTOS CONCRETOS
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Ahora viene lo bueno, mi niño! Ya entendiste la teoría de Integration
 * Events. Ahora vemos EVENTOS REALES que el Sales Context publica.
 *
 * 🎯 ¿QUÉ ESTAMOS VIENDO AQUÍ?
 *
 * Este archivo define los eventos concretos que Sales Context publica
 * cuando pasan cosas importantes en su dominio.
 *
 * 💡 RECUERDA (de IntegrationEvent.ts):
 *
 *   Integration Event = Mensaje que cruza fronteras entre contextos
 *
 * Aquí definimos 3 eventos:
 *   1. OrderPlacedIntegrationEvent → "Se creó un pedido"
 *   2. OrderPaidIntegrationEvent → "Se pagó un pedido"
 *   3. OrderCancelledIntegrationEvent → "Se canceló un pedido"
 *
 * 🏗️ PATRÓN OBSERVADOR A LO GRANDE:
 *
 * Piensa en esto como el patrón Observer (suscriptor/publicador) pero
 * a nivel de ARQUITECTURA, no solo dentro de una clase.
 *
 *   Sales Context (Publisher):
 *     "Oye, pasó esto..." 📢
 *     await eventBus.publish(new OrderPlacedEvent(...))
 *
 *   Shipping Context (Subscriber):
 *     "Vale, yo reacciono creando un envío" 📦
 *     eventBus.subscribe('sales.order.placed', createShipmentHandler)
 *
 *   Inventory Context (Subscriber):
 *     "Vale, yo reacciono decrementando stock" 📉
 *     eventBus.subscribe('sales.order.placed', decrementStockHandler)
 *
 * Fíjate: Sales NO SABE quién está escuchando. ¡Desacoplamiento total!
 *
 * 🎨 EJEMPLO MENTAL - Continuando con el Restaurante:
 *
 * Estos eventos son como las "comandas" del restaurante:
 *
 *   SALA publica: "Mesa 5 - Pedido confirmado: 2 Paellas"
 *     ↓
 *     ├─→ COCINA escucha: "Vale, voy a cocinarlas"
 *     ├─→ ALMACÉN escucha: "Vale, marco ingredientes como reservados"
 *     └─→ CONTABILIDAD escucha: "Vale, registro la venta"
 *
 *   SALA publica: "Mesa 5 - Pedido pagado"
 *     ↓
 *     ├─→ CAJA escucha: "Vale, cierro la cuenta"
 *     └─→ CONTABILIDAD escucha: "Vale, confirmo el ingreso"
 *
 *   SALA publica: "Mesa 5 - Pedido cancelado (cliente se fue)"
 *     ↓
 *     ├─→ COCINA escucha: "Vale, paro de cocinar"
 *     └─→ ALMACÉN escucha: "Vale, libero los ingredientes"
 *
 * Cada evento comunica un HECHO que ya pasó (pasado verbal).
 *
 * 📋 ESTRUCTURA DE UN INTEGRATION EVENT:
 *
 * Todos heredan de BaseIntegrationEvent, lo que les da:
 *   ✅ eventId (generado automáticamente con UUID)
 *   ✅ occurredOn (timestamp ISO automático)
 *
 * Cada evento define:
 *   ✅ eventType: string único que identifica el tipo de evento
 *   ✅ sourceContext: de qué contexto viene
 *   ✅ Datos primitivos específicos del evento (no objetos del dominio!)
 *
 * 🔒 REGLA DE ORO - SOLO PRIMITIVOS:
 *
 * Integration Events NUNCA contienen:
 *   ❌ Entidades del dominio (Order, Product)
 *   ❌ Value Objects (Money, Address)
 *   ❌ Referencias a objetos
 *
 * Solo contienen:
 *   ✅ Primitivos: string, number, boolean
 *   ✅ Arrays de primitivos
 *   ✅ Objetos planos con primitivos
 *
 * ¿Por qué? Porque estos eventos:
 *   - Se serializan a JSON
 *   - Viajan por red (HTTP, RabbitMQ, Kafka)
 *   - Se almacenan en Event Store
 *   - Pueden ser consumidos por otros lenguajes/tecnologías
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de ver los eventos que Sales publica, ve a:
 *   → ../../shipping-context/application/CreateShipmentOnOrderPlacedHandler.ts
 *   (ver cómo otro contexto REACCIONA a estos eventos)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { BaseIntegrationEvent } from './IntegrationEvent';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📦 OrderPlacedIntegrationEvent - "Se creó un pedido"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este es EL EVENTO MÁS IMPORTANTE del Sales Context.
 *
 * Se publica cuando un pedido se crea exitosamente.
 *
 * 💡 ¿CUÁNDO SE PUBLICA?
 *
 * En PlaceOrderUseCase, después de:
 *   1. Validar productos (que existan, estén activos)
 *   2. Crear la entidad Order
 *   3. Guardar en el OrderRepository
 *   4. → AQUÍ se publica el evento
 *
 * 🎯 ¿QUIÉN LO ESCUCHA?
 *
 * Típicamente:
 *   - Shipping Context → Crear envío
 *   - Inventory Context → Decrementar stock
 *   - Notification Context → Enviar email de confirmación
 *   - Analytics Context → Registrar conversión
 *
 * 📊 DATOS QUE INCLUYE:
 *
 *   orderId: string
 *     → Identificador del pedido (para relacionar en otros contextos)
 *
 *   customerId: string
 *     → Quién hizo el pedido (por si Shipping/Notification necesitan info)
 *
 *   items: Array<{productId, quantity, unitPriceInCents}>
 *     → QUÉ se pidió
 *     → Fíjate: Solo IDs y primitivos, NO entidades Product/OrderItem
 *     → Precio en CENTAVOS (number) en vez de Money (objeto)
 *
 *   totalInCents: number
 *     → Total del pedido en centavos (primitivo)
 *     → Otros contextos pueden necesitar saber el monto
 *
 *   shippingAddress: {...}
 *     → DÓNDE enviar
 *     → Shipping Context necesita esto para crear el envío
 *     → Objeto plano con strings (serializable)
 *
 * 💡 IMPORTANTE - SNAPSHOT EN EL EVENTO:
 *
 * Fíjate que incluimos unitPriceInCents en cada item.
 * ¿Por qué? Porque estamos compartiendo el precio EN EL MOMENTO DEL PEDIDO.
 *
 * Si mañana el precio cambia en Catalog Context, el evento sigue siendo
 * histórico: "Este pedido se hizo a ESTE precio".
 *
 * 🔄 IDEMPOTENCIA:
 *
 * Los handlers que consuman este evento deben ser IDEMPOTENTES.
 * ¿Qué significa? Que si el evento se procesa 2 veces (red, retry),
 * el resultado debe ser el mismo.
 *
 * Usa eventId para detectar duplicados:
 *   if (processedEvents.includes(event.eventId)) return;
 */
export class OrderPlacedIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'sales.order.placed';
  readonly sourceContext = 'sales';

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
      unitPriceInCents: number;
    }>,
    public readonly totalInCents: number,
    public readonly shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    }
  ) {
    super();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💰 OrderPaidIntegrationEvent - "Se pagó un pedido"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este evento se publica cuando un pedido PENDIENTE se marca como PAGADO.
 *
 * 💡 ¿CUÁNDO SE PUBLICA?
 *
 * Después de que el servicio de pagos confirme el pago:
 *   1. Payment Gateway confirma el pago
 *   2. order.markAsPaid() (método de la entidad)
 *   3. orderRepository.save(order)
 *   4. → AQUÍ se publica el evento
 *
 * 🎯 ¿QUIÉN LO ESCUCHA?
 *
 * Típicamente:
 *   - Shipping Context → Iniciar preparación del envío
 *   - Accounting Context → Registrar ingreso
 *   - Notification Context → Enviar email "Pago confirmado"
 *   - Loyalty Context → Sumar puntos de fidelidad
 *
 * 📊 DATOS QUE INCLUYE:
 *
 *   orderId: string
 *     → El pedido que fue pagado
 *
 *   paidAt: string
 *     → Cuándo se pagó (ISO timestamp)
 *     → String (no Date) para serialización
 *
 * 💡 NOTA - EVENTO LIGERO:
 *
 * Este evento es MINIMALISTA. Solo comunica el hecho: "Pedido X fue pagado".
 *
 * Si otros contextos necesitan más info (monto, método de pago, etc.),
 * pueden:
 *   1. Consultar Sales Context vía API (sincrónico)
 *   2. Haber guardado info de OrderPlacedEvent anterior (asincrónico)
 *
 * Esto es NORMAL en Event-Driven Architecture: los eventos no siempre
 * llevan todos los datos. A veces solo avisan "pasó esto".
 */
export class OrderPaidIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'sales.order.paid';
  readonly sourceContext = 'sales';

  constructor(
    public readonly orderId: string,
    public readonly paidAt: string
  ) {
    super();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ❌ OrderCancelledIntegrationEvent - "Se canceló un pedido"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este evento se publica cuando un pedido se cancela.
 *
 * 💡 ¿CUÁNDO SE PUBLICA?
 *
 * Cuando el cliente o el sistema cancela un pedido:
 *   1. order.cancel(reason)
 *   2. orderRepository.save(order)
 *   3. → AQUÍ se publica el evento
 *
 * IMPORTANTE: Solo se pueden cancelar pedidos PENDING (no pagados).
 * Si el pedido ya está pagado, necesitarías un proceso de REEMBOLSO
 * (otro Use Case, otro evento: OrderRefundedEvent).
 *
 * 🎯 ¿QUIÉN LO ESCUCHA?
 *
 * Típicamente:
 *   - Shipping Context → Cancelar envío si ya se creó
 *   - Inventory Context → Liberar stock reservado
 *   - Notification Context → Enviar email "Pedido cancelado"
 *   - Analytics Context → Registrar conversión perdida
 *
 * 📊 DATOS QUE INCLUYE:
 *
 *   orderId: string
 *     → El pedido que fue cancelado
 *
 *   reason: string
 *     → Por qué se canceló
 *     → Ejemplos:
 *       - "Customer requested cancellation"
 *       - "Payment timeout"
 *       - "Product out of stock"
 *     → Útil para analytics y auditoría
 *
 * 💡 COMPENSACIÓN - PATRÓN SAGA:
 *
 * Este evento es clave en SAGAS (transacciones distribuidas).
 *
 * ESCENARIO:
 *   1. OrderPlacedEvent → Inventory decrementa stock
 *   2. OrderPlacedEvent → Shipping crea envío
 *   3. ¡Pago falla!
 *   4. OrderCancelledEvent → Inventory REINCREMENTA stock (compensación)
 *   5. OrderCancelledEvent → Shipping CANCELA envío (compensación)
 *
 * Esto se llama COMPENSATING TRANSACTION: deshacer lo hecho.
 *
 * Como no hay transacciones ACID entre contextos, usamos eventos
 * para "deshacer" acciones de forma eventual.
 */
export class OrderCancelledIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'sales.order.cancelled';
  readonly sourceContext = 'sales';

  constructor(
    public readonly orderId: string,
    public readonly reason: string
  ) {
    super();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎯 RESUMEN - LOS 3 EVENTOS DEL SALES CONTEXT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ EVENTO                    │ CUÁNDO                             │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ OrderPlacedEvent          │ Pedido creado exitosamente         │
 * │ OrderPaidEvent            │ Pedido marcado como pagado         │
 * │ OrderCancelledEvent       │ Pedido cancelado                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 💡 FLUJO TÍPICO:
 *
 *   Flujo Exitoso:
 *   OrderPlacedEvent → OrderPaidEvent → (Shipping lo maneja)
 *
 *   Flujo Cancelado:
 *   OrderPlacedEvent → OrderCancelledEvent → (Inventory compensa)
 *
 * 🔗 VENTAJAS DE ESTA ARQUITECTURA:
 *
 *   ✅ Desacoplamiento: Sales no conoce a Shipping/Inventory
 *   ✅ Escalabilidad: Cada contexto se escala independientemente
 *   ✅ Resilencia: Si Shipping cae, Sales sigue funcionando
 *   ✅ Evolución: Puedes agregar nuevos contextos sin tocar Sales
 *   ✅ Auditoría: Los eventos forman un EVENT LOG (historia)
 *
 * 📖 AHORA VE A:
 *
 *   → ../../shipping-context/application/CreateShipmentOnOrderPlacedHandler.ts
 *
 *   Para ver cómo Shipping Context REACCIONA al OrderPlacedEvent.
 *   ¡Ahí es donde se cierra el círculo!
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
