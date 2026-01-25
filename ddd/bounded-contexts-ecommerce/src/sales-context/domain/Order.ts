/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 2 DE 6: SALES CONTEXT - ORDER
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Ahora la cosa se pone interesante, mi niño! Acabas de ver Product en
 * Catalog Context. Ahora estás en el SALES CONTEXT, y aquí NO existe Product.
 *
 * 🎯 EL CONCEPTO CLAVE: DIFERENTES MODELOS
 *
 * Pregunta: ¿Cómo puede Sales hacer un pedido sin importar Product?
 *
 * Respuesta: Sales tiene su PROPIO modelo del "producto" → OrderItem
 *
 * 💡 ANTI-CORRUPTION LAYER (Capa Anti-Corrupción)
 *
 * Fíjate en OrderItem:
 *   - productId: string  ← Referencia por ID, no por entidad
 *   - productName: string ← COPIA el nombre en el momento del pedido
 *   - unitPrice: Money ← COPIA el precio en el momento del pedido
 *
 * ¿Por qué copiar en vez de referenciar?
 *
 *   ESCENARIO REAL:
 *   1. Cliente compra "Laptop Pro" a 999€
 *   2. Se crea la orden con ese nombre y precio
 *   3. Mañana el producto cambia de nombre a "Laptop Ultra"
 *   4. Mañana el precio sube a 1299€
 *
 *   ¿Qué debe mostrar la orden del cliente?
 *   → "Laptop Pro" a 999€ (lo que compró) ✅
 *   NO "Laptop Ultra" a 1299€ (lo actual) ❌
 *
 * Esto se llama DESNORMALIZACIÓN INTENCIONAL.
 * Los datos se copian para mantener la HISTORIA del pedido.
 *
 * 🏗️ ESTE ES EL SALES CONTEXT:
 *
 * En el contexto de Ventas, lo importante es:
 *   - Pedidos de clientes
 *   - Precios en el momento de la compra
 *   - Estado de pago
 *   - Dirección de envío
 *
 * Lo que NO le importa a Sales:
 *   ❌ Descripción detallada del producto (eso es de Catalog)
 *   ❌ Peso y dimensiones (eso es de Shipping)
 *   ❌ Imágenes del producto (eso es de Catalog)
 *
 * 🎨 EJEMPLO MENTAL - Continuando con el Restaurante:
 *
 *   SALA (Service Context) toma un pedido:
 *     "Mesa 5: 2 Paellas, 1 Vino"
 *     Precio: 45€ (fijado en ese momento)
 *
 *   Aunque COCINA cambie la receta de la paella mañana,
 *   el ticket de la Mesa 5 sigue siendo "2 Paellas a 45€".
 *
 *   NO va a buscar a Cocina preguntando "¿cuánto cuesta la paella HOY?"
 *   Eso sería ACOPLAMIENTO entre contextos. ❌
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de entender cómo Sales modela pedidos sin Product, ve a:
 *   → ../../shared/events/IntegrationEvent.ts (ver comunicación entre contextos)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Money } from '../../shared/kernel';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 OrderStatus - Estados del Pedido
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ciclo de vida de un pedido en Sales Context:
 *
 *   PENDING → PAID → (envío...)
 *       ↓
 *   CANCELLED
 *
 * Fíjate que NO hay estado "SHIPPED". ¿Por qué?
 * Porque el envío NO es responsabilidad de Sales, es de Shipping Context.
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛒 OrderItem - El "Producto" visto desde Sales
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * AQUÍ ESTÁ LA MAGIA:
 *
 * Sales NO importa `Product` de Catalog Context.
 * Sales tiene su PROPIO concepto: OrderItem.
 *
 * OrderItem contiene SOLO lo que Sales necesita para su trabajo:
 *   ✅ productId - Para saber qué producto (referencia, no entidad)
 *   ✅ productName - COPIA en el momento de la orden (histórico)
 *   ✅ quantity - Cuántos pidió el cliente
 *   ✅ unitPrice - COPIA del precio en ese momento (histórico)
 *
 * Lo que NO tiene (porque no lo necesita):
 *   ❌ description - No necesita la descripción completa
 *   ❌ category - No le interesa la categoría
 *   ❌ isActive - Ya se validó antes de crear la orden
 *
 * 💡 IMPORTANTE - Snapshot Pattern:
 *
 * Los datos se capturan como un "snapshot" (foto) en el momento
 * de crear la orden. Así la orden es INMUTABLE e HISTÓRICA.
 */
export interface OrderItem {
  productId: string;        // Referencia: "del producto X"
  productName: string;      // Snapshot: "que se llamaba Y"
  quantity: number;         // Cantidad: "pedí Z unidades"
  unitPrice: Money;         // Snapshot: "a precio P por unidad"
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📋 OrderProps - Propiedades del Pedido
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Un Order (pedido) en Sales Context incluye:
 *   - Quién lo hizo (customerId)
 *   - Qué pidió (items[])
 *   - Dónde enviarlo (shippingAddress)
 *   - Estado de pago (status, paidAt)
 *
 * Fíjate: shippingAddress está aquí como VALUE OBJECT inline.
 * Sales solo necesita la dirección para crear el pedido.
 * Shipping Context tendrá su PROPIO modelo más complejo de direcciones.
 */
export interface OrderProps {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  paidAt: Date | null;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏛️ Order Entity - Aggregate Root del Sales Context
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Esta es la entidad central del Sales Context.
 *
 * Responsabilidades:
 *   ✅ Crear pedidos válidos
 *   ✅ Marcar como pagado
 *   ✅ Cancelar pedidos
 *   ✅ Calcular totales
 *
 * Lo que NO hace (no es su responsabilidad):
 *   ❌ Validar stock (eso lo hace otro servicio)
 *   ❌ Gestionar envíos (eso es Shipping Context)
 *   ❌ Actualizar catálogo (eso es Catalog Context)
 */
export class Order {
  private constructor(private props: OrderProps) {}

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🏭 FACTORY METHOD - Crear Nuevo Pedido
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Cuando un cliente hace un pedido:
   *   1. Llegan los items (con productId, name, price ya capturados)
   *   2. Se valida que tenga al menos 1 item
   *   3. Se crea en estado PENDING
   *
   * IMPORTANTE: Los items llegan YA con productName y unitPrice.
   * ¿Quién los obtuvo? El Use Case (PlaceOrderUseCase).
   * ¿De dónde? Del Catalog Context (vía API o servicio).
   *
   * Pero la entidad Order NO SABE eso. Solo recibe los datos ya preparados.
   */
  static create(params: {
    id: string;
    customerId: string;
    items: OrderItem[];
    shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  }): Order {
    // Regla de negocio: pedido debe tener items
    if (params.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    return new Order({
      id: params.id,
      customerId: params.customerId,
      items: params.items,
      status: OrderStatus.PENDING,
      shippingAddress: params.shippingAddress,
      createdAt: new Date(),
      paidAt: null,
    });
  }

  /**
   * 🔄 RECONSTITUTE - Reconstruir desde BD
   */
  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 📖 GETTERS
  // ═══════════════════════════════════════════════════════════════════════

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get items(): readonly OrderItem[] {
    return this.props.items;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get shippingAddress() {
    return this.props.shippingAddress;
  }

  /**
   * 💰 Calcular total del pedido
   *
   * Suma todos los items: cantidad × precio unitario
   *
   * NOTA: Este precio ya está "congelado" en el momento del pedido.
   * Aunque los precios cambien en Catalog, este total NO cambia.
   */
  get total(): Money {
    return this.props.items.reduce(
      (sum, item) => sum.add(item.unitPrice.multiply(item.quantity)),
      Money.zero()
    );
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🎯 COMPORTAMIENTO DE NEGOCIO
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Marcar pedido como pagado
   *
   * Transición de estado: PENDING → PAID
   *
   * 💡 EVENTO IMPORTANTE:
   * Cuando un pedido se paga, es MUY probable que se emita un
   * Integration Event: "OrderPlacedEvent" o "OrderPaidEvent"
   *
   * Otros contextos (Shipping, Inventory) pueden escuchar ese evento
   * y reaccionar (crear envío, decrementar stock, etc.)
   */
  markAsPaid(): void {
    if (this.props.status !== OrderStatus.PENDING) {
      throw new Error('Order is not pending');
    }
    this.props.status = OrderStatus.PAID;
    this.props.paidAt = new Date();
  }

  /**
   * Cancelar pedido
   *
   * Regla de negocio: NO se puede cancelar un pedido ya pagado.
   * Si ya se pagó, necesitarías un proceso de reembolso (otro Use Case).
   */
  cancel(reason: string): void {
    if (this.props.status === OrderStatus.PAID) {
      throw new Error('Cannot cancel paid order');
    }
    this.props.status = OrderStatus.CANCELLED;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔌 OrderRepository - Puerto del Sales Context
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este repository es específico de Sales Context.
 *
 * Métodos que SÍ tiene:
 *   ✅ findByCustomerId() - Sales necesita "pedidos de este cliente"
 *
 * Métodos que NO tiene:
 *   ❌ findByProductId() - Eso no es una query de negocio de Sales
 *   ❌ findByShippingStatus() - Eso sería de Shipping Context
 *
 * Cada contexto define sus propias queries según SUS necesidades.
 */
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
}
