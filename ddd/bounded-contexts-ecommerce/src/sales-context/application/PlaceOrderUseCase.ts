/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 6 DE 6: EL FLUJO COMPLETO - PLACE ORDER USE CASE
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡ÚLTIMO ARCHIVO, mi niño! Este es el que cierra el círculo completo.
 *
 * Aquí es donde TODO empieza. Este Use Case orquesta el flujo completo
 * de crear un pedido y disparar eventos que otros contextos escuchan.
 *
 * 🎯 RECAPITULACIÓN - LO QUE HEMOS VISTO:
 *
 *   ARCHIVO 1: Product (Catalog Context) - Un producto en el catálogo
 *   ARCHIVO 2: Order (Sales Context) - Un pedido con OrderItems
 *   ARCHIVO 3: IntegrationEvent (teoría) - Comunicación entre contextos
 *   ARCHIVO 4: SalesEvents - Eventos concretos que Sales publica
 *   ARCHIVO 5: CreateShipmentHandler - Shipping reacciona a OrderPlaced
 *   ARCHIVO 6: PlaceOrderUseCase ← ESTÁS AQUÍ (el que inicia todo)
 *
 * 💡 ¿QUÉ ES UN USE CASE?
 *
 * Un Use Case es una ORQUESTACIÓN de lógica de negocio:
 *   - Recibe un comando (PlaceOrderCommand)
 *   - Coordina múltiples actores (entidades, repositorios, servicios)
 *   - Ejecuta el flujo de negocio completo
 *   - Retorna el resultado
 *
 * IMPORTANTE: El Use Case está en la capa de APLICACIÓN, no de DOMINIO.
 *   - Dominio (Order, OrderItem): Reglas de negocio puras
 *   - Aplicación (PlaceOrderUseCase): Orquestación y coordinación
 *
 * 🏗️ FLUJO COMPLETO QUE VERÁS AQUÍ:
 *
 *   1. Cliente envía comando: "Quiero pedir estos productos"
 *        ↓
 *   2. Use Case consulta Catalog (vía ProductCatalog ACL)
 *        ↓
 *   3. Use Case obtiene info de productos (nombre, precio actual)
 *        ↓
 *   4. Use Case crea entidad Order con esos datos
 *        ↓
 *   5. Use Case guarda Order en repositorio
 *        ↓
 *   6. Use Case publica OrderPlacedIntegrationEvent
 *        ↓ (Event Bus)
 *   7. Shipping Context escucha y crea Shipment (ARCHIVO 5)
 *   8. Inventory Context escucha y decrementa stock
 *   9. Notification Context escucha y envía email
 *
 * 🎨 EJEMPLO MENTAL - Continuando con el Restaurante:
 *
 *   SALA (Sales Context) - Tomar Pedido:
 *     1. Cliente dice: "Quiero 2 Paellas y 1 Vino"
 *     2. Camarero consulta CARTA (Catalog): ¿Hay paellas? ¿Cuánto cuestan?
 *     3. Camarero anota el pedido: "Mesa 5: 2 Paellas a 20€, 1 Vino a 5€"
 *     4. Camarero guarda la comanda en su libreta
 *     5. Camarero grita a COCINA: "¡Mesa 5! 2 Paellas, 1 Vino"
 *        ↓
 *     6. COCINA escucha y empieza a cocinar (CreateShipmentHandler)
 *     7. ALMACÉN escucha y marca ingredientes (DecrementStockHandler)
 *     8. CAJA escucha y prepara la cuenta (CreateInvoiceHandler)
 *
 * 🔗 ARQUITECTURA - BOUNDED CONTEXTS EN ACCIÓN:
 *
 * Este Use Case es el EPICENTRO de la comunicación entre contextos:
 *
 *   ┌─────────────────┐
 *   │ CATALOG CONTEXT │
 *   │ ProductCatalog  │ ← Consultado para obtener info de productos
 *   └────────┬────────┘
 *            ↓ (vía ACL)
 *   ┌─────────────────┐
 *   │ SALES CONTEXT   │
 *   │ PlaceOrderUseCase│ ← ESTÁS AQUÍ (orquestador)
 *   │ Order           │ ← Crea la entidad
 *   │ OrderRepository │ ← Persiste
 *   └────────┬────────┘
 *            ↓ (publica evento)
 *   ┌────────┴────────┬──────────────────┐
 *   │                 │                  │
 *   ↓                 ↓                  ↓
 * ┌───────────┐ ┌──────────────┐ ┌──────────────┐
 * │ SHIPPING  │ │ INVENTORY    │ │ NOTIFICATION │
 * │ Context   │ │ Context      │ │ Context      │
 * └───────────┘ └──────────────┘ └──────────────┘
 *
 * Fíjate: Sales NO llama directamente a Shipping/Inventory/Notification.
 * Solo publica un evento. Desacoplamiento total.
 *
 * 📖 ESTE ES EL ÚLTIMO ARCHIVO:
 *
 * Después de leer este, tendrás una comprensión COMPLETA de:
 *   ✅ Bounded Contexts (diferentes modelos para diferentes contextos)
 *   ✅ Integration Events (comunicación entre contextos)
 *   ✅ Anti-Corruption Layer (traducción entre modelos)
 *   ✅ Event-Driven Architecture (reacción a eventos)
 *   ✅ Eventual Consistency (no todo es inmediato)
 *   ✅ Use Cases (orquestación de lógica de negocio)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { v4 as uuidv4 } from 'uuid';
import {
  IntegrationEventBus,
  OrderPlacedIntegrationEvent,
} from '../../shared/events';
import { Order, OrderRepository, ProductCatalog } from '../domain';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📝 PlaceOrderCommand - El Comando de Entrada
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este es el DTO (Data Transfer Object) que llega desde la capa externa
 * (HTTP controller, GraphQL resolver, CLI, etc.)
 *
 * Representa la INTENCIÓN del usuario:
 *   "Quiero hacer un pedido de estos productos a esta dirección"
 *
 * 💡 IMPORTANTE - DATOS PRIMITIVOS:
 *
 * Fíjate que items NO contiene:
 *   ❌ productName (no lo sabe el cliente)
 *   ❌ unitPrice (no lo sabe el cliente)
 *
 * Solo contiene:
 *   ✅ productId (el cliente sabe QUÉ quiere)
 *   ✅ quantity (el cliente sabe CUÁNTO quiere)
 *
 * El Use Case será responsable de:
 *   1. Consultar Catalog para obtener productName y price
 *   2. Validar que los productos existan y estén disponibles
 *   3. Capturar el precio ACTUAL (snapshot)
 *
 * 🔒 VALIDACIONES:
 *
 * Este comando podría (y debería) tener validaciones:
 *   - customerId no vacío
 *   - items no vacío
 *   - quantity > 0
 *   - shippingAddress válida
 *
 * En un sistema real, usarías un validation library (Zod, Joi, class-validator)
 * o Value Objects para validar estos datos ANTES de llegar al Use Case.
 */
export interface PlaceOrderCommand {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎯 PlaceOrderUseCase - El Orquestador del Flujo
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este Use Case coordina el proceso completo de crear un pedido.
 *
 * Responsabilidades:
 *   1. Validar que los productos existan (vía ProductCatalog)
 *   2. Capturar precio actual de cada producto (snapshot)
 *   3. Crear entidad Order con datos validados
 *   4. Persistir Order en repositorio
 *   5. Publicar OrderPlacedIntegrationEvent
 *
 * Lo que NO hace (no es su responsabilidad):
 *   ❌ Crear envío (eso es Shipping Context)
 *   ❌ Decrementar stock (eso es Inventory Context)
 *   ❌ Enviar emails (eso es Notification Context)
 *
 * 📊 DEPENDENCIAS (PUERTOS):
 *
 * Este Use Case depende de INTERFACES, no implementaciones:
 *
 *   orderRepository: OrderRepository
 *     → Puerto para persistencia de Orders
 *     → Podría ser InMemory, Postgres, MongoDB, etc.
 *
 *   productCatalog: ProductCatalog
 *     → Puerto (ACL) para consultar productos del Catalog Context
 *     → Podría ser API HTTP, gRPC, evento, in-memory, etc.
 *
 *   eventBus: IntegrationEventBus
 *     → Puerto para publicar eventos
 *     → Podría ser in-memory, RabbitMQ, Kafka, etc.
 *
 * Esto es DEPENDENCY INVERSION PRINCIPLE (SOLID):
 *   - El Use Case (alto nivel) NO depende de implementaciones (bajo nivel)
 *   - Ambos dependen de abstracciones (interfaces/puertos)
 *
 * 🏗️ HEXAGONAL ARCHITECTURE:
 *
 * Este Use Case está en el CORE (dominio + aplicación).
 * Usa PUERTOS para comunicarse con el mundo exterior.
 *
 *     ┌─────────────────────────────────────┐
 *     │         CORE (Sales Context)        │
 *     │  ┌──────────────────────────────┐   │
 *     │  │   PlaceOrderUseCase          │   │
 *     │  │   (Application Layer)        │   │
 *     │  └──────────────────────────────┘   │
 *     │           ↓         ↓         ↓     │
 *     │  ┌─────┐ ┌──────┐ ┌────────┐       │
 *     │  │Order│ │Repo  │ │EventBus│       │
 *     │  │     │ │Port  │ │Port    │       │
 *     │  └─────┘ └──────┘ └────────┘       │
 *     └─────────────────────────────────────┘
 *                 ↓
 *     ┌─────────────────────────────────────┐
 *     │         ADAPTERS (Infra)            │
 *     │  PostgresOrderRepo                  │
 *     │  RabbitMQEventBus                   │
 *     │  HttpProductCatalog                 │
 *     └─────────────────────────────────────┘
 */
export class PlaceOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productCatalog: ProductCatalog,
    private readonly eventBus: IntegrationEventBus
  ) {}

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🚀 EXECUTE - El Método Principal del Use Case
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Este método ejecuta el flujo completo de crear un pedido.
   *
   * FLUJO DETALLADO:
   *   1. Recibir comando del controller
   *   2. Para cada item del pedido:
   *      a. Consultar Catalog (vía ProductCatalog ACL)
   *      b. Validar que producto exista
   *      c. Validar que producto esté disponible
   *      d. Capturar nombre y precio ACTUAL
   *   3. Crear entidad Order con datos capturados
   *   4. Guardar Order en repositorio
   *   5. Publicar OrderPlacedIntegrationEvent
   *   6. Retornar orderId al cliente
   *
   * 💡 SNAPSHOT PATTERN EN ACCIÓN:
   *
   * Mira cómo capturamos el precio ACTUAL del producto:
   *
   *   const product = await this.productCatalog.getProduct(productId);
   *   unitPrice: product.price  ← Capturamos precio EN ESTE MOMENTO
   *
   * Mañana el precio puede cambiar en Catalog Context, pero este Order
   * mantendrá el precio histórico: "lo que costaba cuando lo compraste".
   *
   * 🔒 TRANSACCIONALIDAD:
   *
   * En un sistema real, querrías que esto sea transaccional:
   *   - Si falla guardar Order → rollback
   *   - Si falla publicar evento → ¿qué hacer?
   *
   * PATRÓN OUTBOX:
   *   - Guardar Order Y evento en la MISMA transacción
   *   - Un proceso separado lee eventos de la BD y los publica
   *   - Garantiza que el evento SIEMPRE se publica
   *
   * PATRÓN EVENT SOURCING:
   *   - No guardar estado, guardar eventos
   *   - El Order se reconstruye desde eventos
   *   - Los eventos son la fuente de verdad
   *
   * (Aquí usamos el enfoque simple por didáctica)
   *
   * ⚠️ MANEJO DE ERRORES:
   *
   * Este código puede lanzar excepciones:
   *   - Product not found (producto no existe)
   *   - Product not available (producto inactivo)
   *   - Validation errors (orden inválida)
   *
   * En producción, querrías:
   *   - Result<T, E> en vez de excepciones
   *   - Errores de dominio específicos (ProductNotFoundError)
   *   - Logging y monitoreo
   */
  async execute(command: PlaceOrderCommand): Promise<{ orderId: string }> {
    /**
     * ─────────────────────────────────────────────────────────────────────
     * PASO 1: Consultar Catalog y Construir OrderItems
     * ─────────────────────────────────────────────────────────────────────
     *
     * Aquí es donde ocurre la magia de BOUNDED CONTEXTS:
     *
     * Sales Context necesita info de productos, pero NO importa Product
     * de Catalog Context. En su lugar, usa ProductCatalog (ACL).
     *
     * ProductCatalog es un PUERTO (interface) que define:
     *   - getProduct(id): Obtener info básica de un producto
     *
     * La IMPLEMENTACIÓN de ProductCatalog podría:
     *   - Hacer HTTP call a Catalog API (microservicios separados)
     *   - Consultar tabla compartida en BD (monolito modular)
     *   - Leer de un Read Model (CQRS)
     *   - Consultar caché (Redis)
     *
     * Sales NO SABE cuál implementación se usa. ¡Desacoplamiento!
     *
     * 💡 ANTI-CORRUPTION LAYER (ACL):
     *
     * ProductCatalog actúa como ACL porque:
     *   - Sales no depende directamente de Catalog
     *   - ProductCatalog TRADUCE entre modelos
     *   - Si Catalog cambia, solo actualizamos el ACL
     *
     * 🔄 ASINCRONÍA:
     *
     * Usamos Promise.all para paralelizar consultas:
     *   - Todas las consultas a Catalog se hacen en paralelo
     *   - Más eficiente que consultas secuenciales
     *
     * Alternativa (más avanzada):
     *   - Cache de productos en Sales (eventual consistency)
     *   - Eventos de Catalog actualizan el cache
     *   - No hay consultas síncronas
     */
    const orderItems = await Promise.all(
      command.items.map(async (item) => {
        // Consultar Catalog vía ACL
        const product = await this.productCatalog.getProduct(item.productId);

        // Validar que el producto exista
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // Validar que el producto esté disponible
        if (!product.isAvailable) {
          throw new Error(`Product not available: ${item.productId}`);
        }

        // Construir OrderItem con datos capturados
        // IMPORTANTE: Estamos haciendo un SNAPSHOT
        //   - productName: nombre AHORA
        //   - unitPrice: precio AHORA
        // Aunque Catalog cambie mañana, este Order mantiene estos valores.
        return {
          productId: product.id,
          productName: product.name, // ← Snapshot del nombre
          quantity: item.quantity,
          unitPrice: product.price, // ← Snapshot del precio (Money VO)
        };
      })
    );

    /**
     * ─────────────────────────────────────────────────────────────────────
     * PASO 2: Crear la Entidad Order
     * ─────────────────────────────────────────────────────────────────────
     *
     * Ahora que tenemos todos los datos validados y capturados,
     * creamos la entidad Order.
     *
     * IMPORTANTE: Usamos Order.create() (factory method), NO `new Order()`
     *
     * ¿Por qué?
     *   - Order.create() ejecuta validaciones de negocio
     *   - Garantiza invariantes (ej: "debe tener al menos 1 item")
     *   - Establece estado inicial correcto (PENDING)
     *   - Fail Fast: si algo está mal, falla AHORA
     *
     * 💡 DOMINIO RICO:
     *
     * La entidad Order tiene lógica de negocio:
     *   - Validación (items no vacío)
     *   - Cálculo (total del pedido)
     *   - Comportamiento (markAsPaid, cancel)
     *
     * No es un "anemic domain model" (solo getters/setters).
     * Es un modelo RICO con reglas de negocio.
     */
    const order = Order.create({
      id: uuidv4(), // Generar nuevo ID
      customerId: command.customerId,
      items: orderItems, // OrderItems con precios capturados
      shippingAddress: command.shippingAddress,
    });

    /**
     * ─────────────────────────────────────────────────────────────────────
     * PASO 3: Persistir el Order
     * ─────────────────────────────────────────────────────────────────────
     *
     * Guardamos el Order usando el repositorio (puerto).
     *
     * El repositorio ABSTRAE la persistencia:
     *   - Podría ser Postgres, MongoDB, InMemory, etc.
     *   - El Use Case NO LO SABE
     *   - Solo conoce la interfaz OrderRepository
     *
     * HEXAGONAL ARCHITECTURE:
     *   - orderRepository es un PUERTO (interface)
     *   - PostgresOrderRepository es un ADAPTADOR (implementación)
     *   - El core NO depende del adaptador
     *
     * 🔄 TRANSACCIÓN:
     *
     * await orderRepository.save(order);
     *
     * En producción, esto debería ser transaccional con el evento:
     *   - O se guarda el Order Y se publica el evento
     *   - O no se hace nada (atomicidad)
     *
     * PATRÓN OUTBOX:
     *   tx.begin()
     *   await orderRepository.save(order, tx)
     *   await outboxRepository.save(event, tx) // Guardar evento en BD
     *   tx.commit()
     *   // Worker lee outbox y publica al Event Bus
     */
    await this.orderRepository.save(order);

    /**
     * ─────────────────────────────────────────────────────────────────────
     * PASO 4: Publicar Integration Event
     * ─────────────────────────────────────────────────────────────────────
     *
     * ¡AQUÍ ES DONDE EMPIEZA LA MAGIA DE BOUNDED CONTEXTS!
     *
     * Sales publica OrderPlacedIntegrationEvent:
     *   "Oye mundo, se creó un pedido con estos datos..."
     *
     * ¿Quién escucha?
     *   - Shipping Context → Crea Shipment (ARCHIVO 5)
     *   - Inventory Context → Decrementa stock
     *   - Notification Context → Envía email
     *   - Analytics Context → Registra conversión
     *
     * Sales NO SABE quién escucha. Solo publica.
     *
     * 💡 PUBLISHED LANGUAGE:
     *
     * El evento es el "contrato" entre contextos:
     *   - eventType: 'sales.order.placed'
     *   - Datos primitivos (string, number)
     *   - Versionado (si cambia estructura, nuevo eventType)
     *
     * 🔄 ASINCRONÍA:
     *
     * La publicación del evento es ASÍNCRONA:
     *   - Sales publica y sigue adelante
     *   - Otros contextos procesan cuando pueden
     *   - Eventual consistency
     *
     * IMPORTANTE: Los handlers pueden fallar.
     * ¿Qué pasa si Shipping falla al crear Shipment?
     *   - El Order ya está creado (no rollback)
     *   - El evento se reintenta (según configuración del Event Bus)
     *   - O va a Dead Letter Queue para análisis manual
     *
     * 📊 DATOS DEL EVENTO:
     *
     * Fíjate en la TRANSFORMACIÓN:
     *   - Order tiene unitPrice como Money (Value Object)
     *   - Evento tiene unitPriceInCents como number (primitivo)
     *
     * ¿Por qué?
     *   - Money es un concepto de Sales Context
     *   - Otros contextos no conocen Money
     *   - Los eventos usan primitivos (serializables)
     */
    await this.eventBus.publish(
      new OrderPlacedIntegrationEvent(
        order.id, // ID del pedido creado
        order.customerId, // Cliente que hizo el pedido
        orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceInCents: item.unitPrice.amountInCents, // Money → number
        })),
        order.total.amountInCents, // Total en centavos (primitivo)
        order.shippingAddress // Dirección para Shipping Context
      )
    );

    /**
     * ─────────────────────────────────────────────────────────────────────
     * PASO 5: Retornar Resultado
     * ─────────────────────────────────────────────────────────────────────
     *
     * Retornamos el orderId al cliente.
     *
     * El cliente puede usar este ID para:
     *   - Consultar estado del pedido
     *   - Pagar el pedido
     *   - Rastrear el envío
     *
     * 💡 CQRS:
     *
     * En un sistema CQRS:
     *   - Este Use Case es un COMMAND (escribe)
     *   - Para leer el Order, usarías un QUERY separado
     *   - Write Model ≠ Read Model
     *
     * Ejemplo:
     *   Command: PlaceOrderUseCase → escribe en OrderRepository
     *   Query: GetOrderByIdQuery → lee de OrderReadModel
     */
    return { orderId: order.id };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎓 RESUMEN FINAL - TODO EL VIAJE DE 6 ARCHIVOS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡FELICIDADES! Completaste el tour completo de Bounded Contexts.
 *
 * Recapitulación de los 6 archivos:
 *
 *   📚 ARCHIVO 1: Product (Catalog Context)
 *      → Producto visto desde Catálogo: nombre, precio, descripción
 *
 *   📚 ARCHIVO 2: Order (Sales Context)
 *      → Pedido con OrderItems (NO Product)
 *      → Snapshot de precios (histórico)
 *      → Anti-Corruption Layer
 *
 *   📚 ARCHIVO 3: IntegrationEvent (teoría)
 *      → Comunicación entre contextos
 *      → Domain Events vs Integration Events
 *      → Pub/Sub pattern
 *
 *   📚 ARCHIVO 4: SalesEvents (eventos concretos)
 *      → OrderPlacedEvent, OrderPaidEvent, OrderCancelledEvent
 *      → Solo primitivos (serializables)
 *      → Idempotencia
 *
 *   📚 ARCHIVO 5: CreateShipmentHandler (reacción)
 *      → Shipping escucha OrderPlacedEvent
 *      → Crea Shipment (su propio modelo)
 *      → Publica ShipmentCreatedEvent
 *
 *   📚 ARCHIVO 6: PlaceOrderUseCase ← ACABAS DE TERMINAR
 *      → Orquesta el flujo completo
 *      → Consulta Catalog vía ACL
 *      → Crea Order
 *      → Publica evento
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    FLUJO COMPLETO                                   │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ 1. Cliente → PlaceOrderCommand                                      │
 * │ 2. PlaceOrderUseCase → Consulta ProductCatalog (ACL)               │
 * │ 3. PlaceOrderUseCase → Crea Order con precios capturados           │
 * │ 4. PlaceOrderUseCase → Guarda Order                                │
 * │ 5. PlaceOrderUseCase → Publica OrderPlacedEvent                    │
 * │ 6. Event Bus → Entrega evento a handlers suscritos                 │
 * │ 7. CreateShipmentHandler → Crea Shipment                           │
 * │ 8. CreateShipmentHandler → Publica ShipmentCreatedEvent            │
 * │ 9. ... cadena de eventos continúa ...                              │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🎯 CONCEPTOS CLAVE QUE DOMINASTE:
 *
 *   ✅ BOUNDED CONTEXTS
 *      → Fronteras conceptuales
 *      → Mismo concepto, diferentes modelos
 *      → Lenguaje ubicuo por contexto
 *
 *   ✅ INTEGRATION EVENTS
 *      → Comunicación asíncrona entre contextos
 *      → Pub/Sub pattern
 *      → Eventual consistency
 *
 *   ✅ ANTI-CORRUPTION LAYER (ACL)
 *      → ProductCatalog traduce entre contextos
 *      → Handlers traducen eventos a modelos propios
 *      → Protección contra cambios externos
 *
 *   ✅ SNAPSHOT PATTERN
 *      → Capturar datos en un momento específico
 *      → Datos históricos vs actuales
 *      → Desnormalización intencional
 *
 *   ✅ HEXAGONAL ARCHITECTURE
 *      → Puertos (interfaces)
 *      → Adaptadores (implementaciones)
 *      → Dependency Inversion
 *
 *   ✅ USE CASES
 *      → Orquestación de lógica de negocio
 *      → Capa de aplicación vs dominio
 *      → Coordinación de actores
 *
 * 🏆 SIGUIENTE NIVEL:
 *
 * Ahora que dominas Bounded Contexts, puedes explorar:
 *   - Event Sourcing (eventos como fuente de verdad)
 *   - CQRS (separar lectura de escritura)
 *   - Saga Pattern (transacciones distribuidas)
 *   - Domain Events (eventos internos del dominio)
 *   - Context Mapping (relaciones entre contextos)
 *
 * 💡 REGLA DE ORO:
 *
 *   "Cada contexto es un mundo independiente.
 *    Los contextos se comunican vía eventos, no código compartido.
 *    Respeta las fronteras. Traduce en la frontera."
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Enhorabuena, mi niño! Ya entiendes Bounded Contexts a nivel profesional.
 *
 * -- El Profe Millo
 *    "Los contextos son como islas. Los eventos son los barcos que
 *     transportan mensajes entre ellas."
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
