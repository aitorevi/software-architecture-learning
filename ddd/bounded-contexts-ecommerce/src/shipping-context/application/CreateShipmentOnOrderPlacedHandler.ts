/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 5 DE 6: REACCIONANDO A EVENTOS - EL HANDLER
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Aquí es donde se cierra el círculo, mi niño! Ya viste:
 *   - Product en Catalog Context (ARCHIVO 1)
 *   - Order en Sales Context (ARCHIVO 2)
 *   - Teoría de Integration Events (ARCHIVO 3)
 *   - Eventos concretos de Sales (ARCHIVO 4)
 *
 * Ahora vemos cómo OTRO CONTEXTO (Shipping) reacciona a esos eventos.
 *
 * 🎯 ¿QUÉ ES UN EVENT HANDLER?
 *
 * Un Event Handler es una función que:
 *   1. ESCUCHA un tipo específico de evento
 *   2. REACCIONA cuando ese evento ocurre
 *   3. EJECUTA lógica de negocio en SU contexto
 *
 * Es como un "observador" en el patrón Observer, pero a nivel de arquitectura.
 *
 * 💡 BOUNDED CONTEXTS EN ACCIÓN:
 *
 * Esto es LO MÁS IMPORTANTE de este archivo:
 *
 *   SALES CONTEXT publica:
 *     → OrderPlacedIntegrationEvent
 *     → "Oye, se creó un pedido con estos datos..."
 *
 *   SHIPPING CONTEXT escucha:
 *     → CreateShipmentOnOrderPlacedHandler.handle(event)
 *     → "Vale, voy a crear un envío en MI modelo"
 *
 * Fíjate en la palabra clave: "en MI modelo"
 *
 * Shipping NO importa Order de Sales.
 * Shipping tiene su PROPIO modelo: Shipment.
 *
 * 🏗️ TRADUCCIÓN ENTRE CONTEXTOS:
 *
 * Este handler es un TRADUCTOR (Anti-Corruption Layer):
 *
 *   Sales dice: "OrderPlacedEvent con items[{productId, quantity, price}]"
 *                ↓
 *   Handler TRADUCE
 *                ↓
 *   Shipping crea: "Shipment con items[{productId, quantity}]"
 *                  (sin price, porque Shipping no necesita precios!)
 *
 * 🎨 EJEMPLO MENTAL - Continuando con el Restaurante:
 *
 *   SALA (Sales Context):
 *     "Mesa 5 hizo un pedido: 2 Paellas a 20€ c/u"
 *     [Publica evento con PRECIO porque eso le importa a Sala]
 *
 *   COCINA (Shipping Context) ESCUCHA:
 *     "Ok, voy a cocinar 2 Paellas"
 *     [Crea tarea de cocina SIN precio, porque no le importa]
 *
 * Cada contexto extrae lo que necesita del evento y descarta el resto.
 *
 * 📊 FLUJO COMPLETO:
 *
 *   1. Cliente hace pedido
 *        ↓
 *   2. PlaceOrderUseCase (Sales) crea Order
 *        ↓
 *   3. PlaceOrderUseCase publica OrderPlacedEvent
 *        ↓ (Event Bus)
 *   4. CreateShipmentHandler (Shipping) escucha el evento ← ESTÁS AQUÍ
 *        ↓
 *   5. Handler crea Shipment en Shipping Context
 *        ↓
 *   6. Handler publica ShipmentCreatedEvent
 *        ↓
 *   7. Otros contextos pueden escuchar ShipmentCreatedEvent...
 *
 * 🔗 DESACOPLAMIENTO TOTAL:
 *
 *   - Sales NO sabe que Shipping existe
 *   - Sales NO llama a Shipping directamente
 *   - Shipping NO importa clases de Sales
 *   - Se comunican SOLO vía eventos (Published Language)
 *
 * Ventajas:
 *   ✅ Puedes cambiar Shipping sin tocar Sales
 *   ✅ Puedes agregar más handlers (Inventory, Notification)
 *   ✅ Puedes deployar Sales y Shipping en servidores separados
 *   ✅ Si Shipping falla, Sales sigue funcionando
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de ver cómo Shipping REACCIONA, ve a:
 *   → ../../sales-context/application/PlaceOrderUseCase.ts
 *   (ver el flujo COMPLETO desde el Use Case que inicia todo)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { v4 as uuidv4 } from 'uuid';
import {
  OrderPlacedIntegrationEvent,
  IntegrationEventBus,
  ShipmentCreatedIntegrationEvent,
} from '../../shared/events';
import { Shipment, ShipmentRepository } from '../domain';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📦 CreateShipmentOnOrderPlacedHandler - Event Handler del Shipping Context
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este handler es parte del SHIPPING CONTEXT.
 *
 * Responsabilidad:
 *   - Escuchar eventos OrderPlacedIntegrationEvent (de Sales)
 *   - Crear un Shipment en el modelo de Shipping
 *   - Publicar ShipmentCreatedIntegrationEvent (para otros contextos)
 *
 * 💡 PATRÓN ANTI-CORRUPTION LAYER (ACL):
 *
 * Este handler actúa como ACL porque:
 *   - Recibe datos del "mundo externo" (Sales Context)
 *   - Los TRADUCE al modelo de Shipping
 *   - Protege el dominio de Shipping de cambios en Sales
 *
 * Si Sales cambia la estructura de OrderPlacedEvent mañana,
 * solo necesitamos actualizar ESTE handler, no todo Shipping Context.
 *
 * 🏗️ ARQUITECTURA - DÓNDE SE USA:
 *
 * En la configuración de la aplicación (ej: main.ts, startup.ts):
 *
 *   const handler = new CreateShipmentOnOrderPlacedHandler(
 *     shipmentRepository,
 *     eventBus
 *   );
 *
 *   eventBus.subscribe(
 *     'sales.order.placed',  ← Tipo de evento que escucha
 *     (event) => handler.handle(event)  ← Función que ejecuta
 *   );
 *
 * Después de esto, CADA VEZ que se publique un OrderPlacedEvent,
 * este handler se ejecutará automáticamente.
 *
 * 🔄 ASINCRONÍA:
 *
 * Este handler se ejecuta de forma ASÍNCRONA:
 *   - Sales publica el evento y sigue su camino
 *   - El Event Bus entrega el evento a este handler
 *   - El handler crea el Shipment en su propio tiempo
 *
 * Esto se llama EVENTUAL CONSISTENCY:
 *   - No es inmediato (como una transacción ACID)
 *   - Pero eventualmente el Shipment se crea
 *
 * 📊 DEPENDENCIAS:
 *
 *   shipmentRepository: ShipmentRepository
 *     → Para guardar el Shipment creado
 *     → Implementación de Hexagonal Architecture (puerto)
 *
 *   eventBus: IntegrationEventBus
 *     → Para publicar ShipmentCreatedEvent
 *     → Continuar la cadena de eventos
 *
 * Fíjate: recibimos INTERFACES (puertos), no implementaciones concretas.
 * Esto es DEPENDENCY INVERSION PRINCIPLE (la D de SOLID).
 */
export class CreateShipmentOnOrderPlacedHandler {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly eventBus: IntegrationEventBus
  ) {}

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🎯 HANDLE - Método Principal del Handler
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Este método se ejecuta cuando el Event Bus entrega un OrderPlacedEvent.
   *
   * FLUJO:
   *   1. Recibir el evento de Sales Context
   *   2. Extraer los datos que Shipping necesita
   *   3. Crear una entidad Shipment (modelo de Shipping)
   *   4. Guardar el Shipment en el repositorio
   *   5. Publicar ShipmentCreatedEvent (para otros contextos)
   *
   * 💡 TRADUCCIÓN DE MODELOS:
   *
   * Observa cómo el evento de Sales se traduce al modelo de Shipping:
   *
   *   Sales dice:
   *     items: [{productId, quantity, unitPriceInCents}]
   *            ↑ incluye precio
   *
   *   Shipping crea:
   *     items: [{productId, quantity}]
   *            ↑ SIN precio (no le importa!)
   *
   * Esto es DESNORMALIZACIÓN INTENCIONAL entre contextos.
   * Cada contexto solo guarda lo que necesita.
   *
   * 🔐 IDEMPOTENCIA:
   *
   * IMPORTANTE: Este handler debería ser IDEMPOTENTE.
   *
   * ¿Qué significa? Que si el evento se procesa 2 veces por error
   * (red, retry, etc.), no debe crear 2 Shipments.
   *
   * SOLUCIÓN (no implementada aquí para simplicidad):
   *   - Antes de crear, verificar si ya existe Shipment para ese orderId
   *   - O usar el eventId para detectar eventos ya procesados
   *   - O usar transacciones idempotentes en la BD
   *
   * Ejemplo:
   *   const existing = await this.shipmentRepository.findByOrderId(event.orderId);
   *   if (existing) return; // Ya procesado
   *
   * ⚠️ MANEJO DE ERRORES:
   *
   * Si este handler falla:
   *   - El evento NO se marca como procesado
   *   - El Event Bus puede reintentar (según configuración)
   *   - O el evento va a una Dead Letter Queue
   *
   * En producción, añadirías:
   *   - Logging para debugging
   *   - Métricas para monitoreo
   *   - Alertas si fallan muchos eventos
   */
  async handle(event: OrderPlacedIntegrationEvent): Promise<void> {
    /**
     * ─────────────────────────────────────────────────────────────────────
     * PASO 1: Traducir del modelo de Sales al modelo de Shipping
     * ─────────────────────────────────────────────────────────────────────
     *
     * Sales nos da items con precio. Shipping no necesita precio.
     * Solo necesitamos productId y quantity para preparar el envío.
     *
     * ANTI-CORRUPTION LAYER en acción:
     *   - Tomamos lo que necesitamos (productId, quantity)
     *   - Descartamos lo que no (unitPriceInCents)
     *
     * Si Sales cambia su modelo mañana (agrega descuentos, impuestos),
     * este mapeo nos protege: solo actualizamos aquí si necesitamos
     * los nuevos campos.
     */
    const shipment = Shipment.createFromOrder({
      id: uuidv4(), // Nuevo ID para Shipment (no es el mismo que Order!)
      orderId: event.orderId, // Referencia al Order (por ID, no por entidad)
      items: event.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        // ← Fíjate: NO incluimos unitPriceInCents
        // Shipping no necesita saber cuánto costó cada producto.
        // Solo necesita saber QUÉ enviar y CUÁNTO de cada cosa.
      })),
      address: event.shippingAddress,
    });

    /**
     * ─────────────────────────────────────────────────────────────────────
     * PASO 2: Persistir el Shipment en el repositorio de Shipping
     * ─────────────────────────────────────────────────────────────────────
     *
     * El Shipment ahora existe en el SHIPPING CONTEXT.
     *
     * Es una entidad SEPARADA de Order:
     *   - Tiene su propio ID
     *   - Tiene su propio ciclo de vida
     *   - Se guarda en su propia tabla/colección
     *   - Puede tener estados propios (pending, shipped, delivered)
     *
     * Relación con Order:
     *   - Solo por ID (orderId: string)
     *   - No hay foreign key en la BD
     *   - Eventual consistency
     *
     * Si necesitas "join" entre Order y Shipment:
     *   - Consulta ambos contextos por separado (2 queries)
     *   - O usa un Read Model (CQRS) que los desnormaliza
     */
    await this.shipmentRepository.save(shipment);

    /**
     * ─────────────────────────────────────────────────────────────────────
     * PASO 3: Publicar nuestro propio Integration Event
     * ─────────────────────────────────────────────────────────────────────
     *
     * Ahora SHIPPING publica un evento: "Se creó un envío"
     *
     * Esto permite:
     *   - Notification Context → Enviar email "Tu pedido se está preparando"
     *   - Tracking Context → Empezar a trackear el envío
     *   - Analytics Context → Registrar tiempo desde pedido hasta envío
     *
     * CADENA DE EVENTOS:
     *   OrderPlacedEvent → ShipmentCreatedEvent → ...
     *
     * Cada contexto publica eventos sobre SU dominio,
     * y otros contextos pueden escuchar y reaccionar.
     *
     * Es como un "efecto dominó" de eventos.
     *
     * NOTA: trackingNumber está vacío por ahora.
     * En un sistema real, lo generarías o lo obtendrías de un
     * servicio de shipping externo (UPS, FedEx, etc.).
     */
    await this.eventBus.publish(
      new ShipmentCreatedIntegrationEvent(
        shipment.id, // ID del shipment (para referencia)
        shipment.orderId, // Relaciona el shipment con el order
        '' // trackingNumber (vacío por ahora, se asigna después)
      )
    );

    /**
     * ─────────────────────────────────────────────────────────────────────
     * PASO 4: Logging (opcional, pero buena práctica)
     * ─────────────────────────────────────────────────────────────────────
     *
     * En producción, querrías logging estructurado:
     *
     *   logger.info('Shipment created from order', {
     *     shipmentId: shipment.id,
     *     orderId: event.orderId,
     *     eventId: event.eventId,
     *     context: 'shipping',
     *   });
     *
     * Esto te permite:
     *   - Debugging (rastrear flujo de eventos)
     *   - Auditoría (quién hizo qué y cuándo)
     *   - Monitoring (detectar problemas)
     */
    console.log(
      `[Shipping] Created shipment ${shipment.id} for order ${event.orderId}`
    );
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎯 RESUMEN - CONCEPTOS CLAVE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. EVENT HANDLER:
 *    - Escucha un tipo de evento
 *    - Ejecuta lógica de negocio cuando el evento ocurre
 *
 * 2. ANTI-CORRUPTION LAYER (ACL):
 *    - Traduce entre el modelo externo (Sales) y el interno (Shipping)
 *    - Protege el dominio de cambios externos
 *
 * 3. EVENTUAL CONSISTENCY:
 *    - Shipping no se crea al mismo tiempo que Order
 *    - Se crea "eventualmente" cuando el handler procesa el evento
 *
 * 4. DESACOPLAMIENTO:
 *    - Sales no conoce a Shipping
 *    - Se comunican solo vía eventos
 *    - Pueden evolucionar independientemente
 *
 * 5. CADENA DE EVENTOS:
 *    - Un evento puede generar otros eventos
 *    - Cada contexto publica eventos sobre SU dominio
 *
 * 🔗 PATRÓN COMPLETO:
 *
 *   ┌──────────────┐
 *   │ SALES        │
 *   │ PlaceOrder   │ → Crea Order
 *   │ Use Case     │ → Publica OrderPlacedEvent
 *   └──────┬───────┘
 *          ↓ (Event Bus)
 *   ┌──────────────┐
 *   │ SHIPPING     │
 *   │ Handler      │ → Escucha OrderPlacedEvent ← ESTÁS AQUÍ
 *   │              │ → Crea Shipment
 *   │              │ → Publica ShipmentCreatedEvent
 *   └──────┬───────┘
 *          ↓ (Event Bus)
 *   ┌──────────────┐
 *   │ NOTIFICATION │
 *   │ Handler      │ → Escucha ShipmentCreatedEvent
 *   │              │ → Envía email al cliente
 *   └──────────────┘
 *
 * 📖 PRÓXIMO Y ÚLTIMO PASO:
 *
 *   → ../../sales-context/application/PlaceOrderUseCase.ts
 *
 *   Para ver el Use Case COMPLETO que inicia todo este flujo.
 *   ¡Es el archivo final que cierra el círculo completo!
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
