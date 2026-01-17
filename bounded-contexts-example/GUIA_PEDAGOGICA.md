# E-Commerce con Bounded Contexts - Guía Pedagógica 🛒

Buenas, mi niño. Ahora vamos a aprender sobre **Bounded Contexts** (Contextos Delimitados), que es el concepto más importante de **Domain-Driven Design**. Es como tener barrios en una ciudad: cada barrio tiene sus propias reglas, su propia gente, su propio lenguaje, pero todos forman parte de la misma ciudad.

## ¿Qué es un Bounded Context?

Un Bounded Context es una **frontera lingüística y conceptual** dentro de la cual un modelo de dominio tiene un significado específico. Fuera de esa frontera, las mismas palabras pueden significar cosas diferentes.

Imagínate que tienes un e-commerce. La palabra "Product" significa cosas diferentes según dónde estés:

```
┌─────────────────────────────────────────────────────────────┐
│                    E-COMMERCE SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  CATALOG        │  │  SALES          │  │  SHIPPING   │ │
│  │  CONTEXT        │  │  CONTEXT        │  │  CONTEXT    │ │
│  │                 │  │                 │  │             │ │
│  │  Product:       │  │  Product:       │  │  Product:   │ │
│  │  - name         │  │  - price        │  │  - weight   │ │
│  │  - description  │  │  - stock        │  │  - size     │ │
│  │  - images       │  │  - discount     │  │  - fragile? │ │
│  │  - specs        │  │                 │  │             │ │
│  │                 │  │                 │  │             │ │
│  │  "Product" =    │  │  "Product" =    │  │  "Product" =│ │
│  │  Info para      │  │  Info para      │  │  Info para  │ │
│  │  cliente        │  │  venta          │  │  envío      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ¡La MISMA palabra, DIFERENTES significados en cada contexto!│
└─────────────────────────────────────────────────────────────┘
```

## ¿Por qué Bounded Contexts?

### El Problema Sin Bounded Contexts

Imagínate que intentas tener un solo modelo de `Product` para todo:

```typescript
// ❌ MALO - Un modelo gigante para todo
class Product {
  // Catálogo necesita:
  id: string;
  name: string;
  description: string;
  longDescription: string;
  images: Image[];
  specifications: Specification[];
  category: Category;
  tags: Tag[];
  relatedProducts: Product[];

  // Ventas necesita:
  price: Money;
  discount: Discount;
  stock: number;
  lowStockThreshold: number;
  availableForSale: boolean;
  taxRate: number;

  // Shipping necesita:
  weight: Weight;
  dimensions: Dimensions;
  fragile: boolean;
  requiresSpecialHandling: boolean;
  shippingRestrictions: ShippingRestriction[];

  // Analytics necesita:
  viewCount: number;
  conversionRate: number;
  averageRating: number;
  salesHistory: Sale[];

  // ... ¡50 propiedades más!
}
```

**Problemas**:
1. **Modelo gigante**: Nadie entiende qué hace qué
2. **Acoplamiento**: Cambiar algo para ventas afecta al catálogo
3. **Conflictos**: El equipo de catálogo y el de ventas pelean por el mismo código
4. **Ineficiencia**: Cargas TODO cuando solo necesitas el precio

### La Solución: Bounded Contexts

Separa en contextos independientes:

```typescript
// ✅ BUENO - Modelos separados por contexto

// catalog-context/domain/Product.ts
class CatalogProduct {
  id: ProductId;
  name: string;
  description: string;
  images: Image[];
  specifications: Specification[];

  // Solo lo que el catálogo necesita
}

// sales-context/domain/Product.ts
class SalesProduct {
  id: ProductId;
  price: Money;
  stock: Quantity;
  availableForSale: boolean;

  // Solo lo que ventas necesita
}

// shipping-context/domain/Shipment.ts
class Shipment {
  id: ShipmentId;
  items: ShipmentItem[];  // Solo peso, tamaño

  // Shipping NO tiene un modelo de Product
  // Tiene ShipmentItem con solo lo necesario
}
```

Cada contexto tiene:
- Su propio modelo
- Su propia base de datos (opcional)
- Su propio equipo
- Su propio lenguaje ubicuo

## Estructura del Proyecto

```
src/
├── catalog-context/            # CONTEXTO: Catálogo de productos
│   ├── domain/
│   │   └── Product.ts          # Modelo de producto para catálogo
│   ├── application/
│   │   └── CreateProductUseCase.ts
│   └── infrastructure/
│       └── InMemoryCatalogRepository.ts
│
├── sales-context/              # CONTEXTO: Ventas
│   ├── domain/
│   │   ├── Order.ts
│   │   └── ProductCatalog.ts   # Interface anti-corruption layer
│   ├── application/
│   │   └── PlaceOrderUseCase.ts
│   └── infrastructure/
│
├── shipping-context/           # CONTEXTO: Envíos
│   ├── domain/
│   │   └── Shipment.ts
│   ├── application/
│   │   └── CreateShipmentOnOrderPlacedHandler.ts
│   └── infrastructure/
│
└── shared/                     # Compartido entre contextos
    ├── events/                 # Integration Events (entre contextos)
    │   ├── CatalogEvents.ts    # ProductCreatedEvent
    │   ├── SalesEvents.ts      # OrderPlacedEvent
    │   └── ShippingEvents.ts   # ShipmentCreatedEvent
    └── kernel/
        └── Money.ts            # Value objects realmente compartidos
```

## Comunicación entre Contextos

Los contextos se comunican de 3 formas:

### 1. Shared Kernel (Núcleo Compartido)

Conceptos que TODOS los contextos comparten.

```typescript
// shared/kernel/Money.ts
export class Money {
  constructor(
    readonly amountInCents: number,
    readonly currency: string
  ) {}
}

// Usado en:
// - catalog-context: Product tiene price: Money
// - sales-context: Order tiene total: Money
// - shipping-context: Shipment puede tener shippingCost: Money
```

**¿Qué va en Shared Kernel?**
- ✅ Value Objects universales (Money, Date, Email)
- ✅ Tipos primitivos del negocio
- ❌ Entidades (cada contexto tiene las suyas)
- ❌ Lógica de negocio específica

### 2. Integration Events (Eventos de Integración)

Los contextos se notifican cambios mediante eventos.

```typescript
// shared/events/CatalogEvents.ts
export class ProductCreatedEvent implements IntegrationEvent {
  readonly eventName = 'catalog.product_created';

  constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly priceInCents: number,
    public readonly stock: number
  ) {}
}

// shared/events/SalesEvents.ts
export class OrderPlacedEvent implements IntegrationEvent {
  readonly eventName = 'sales.order_placed';

  constructor(
    public readonly orderId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
    }>,
    public readonly shippingAddress: Address
  ) {}
}

// shared/events/ShippingEvents.ts
export class ShipmentCreatedEvent implements IntegrationEvent {
  readonly eventName = 'shipping.shipment_created';

  constructor(
    public readonly shipmentId: string,
    public readonly orderId: string,
    public readonly trackingNumber: string
  ) {}
}
```

**Flujo con Integration Events**:

```
1. CATALOG CONTEXT crea producto
   ↓
2. Emite ProductCreatedEvent
   ↓
3. SALES CONTEXT escucha
   ↓
4. Sales crea su propia copia del producto
   (con solo price y stock, no description/images)

===

1. SALES CONTEXT crea pedido
   ↓
2. Emite OrderPlacedEvent
   ↓
3. SHIPPING CONTEXT escucha
   ↓
4. Shipping crea envío automáticamente
```

### 3. Anti-Corruption Layer (Capa Anticorrupción)

Cuando un contexto necesita datos de otro, usa una interfaz que lo aísla.

```typescript
// sales-context/domain/ProductCatalog.ts (ACL)
export interface ProductCatalog {
  findProduct(productId: string): Promise<{
    id: string;
    name: string;
    priceInCents: number;
    available: boolean;
  } | null>;
}

// sales-context/infrastructure/CatalogProductCatalogAdapter.ts
export class CatalogProductCatalogAdapter implements ProductCatalog {
  constructor(
    private readonly catalogHttpClient: HttpClient  // Llama a Catalog API
  ) {}

  async findProduct(productId: string) {
    // Llama al Catalog Context (puede ser HTTP, gRPC, etc.)
    const response = await this.catalogHttpClient.get(
      `/api/catalog/products/${productId}`
    );

    // Traduce del modelo de Catalog al modelo de Sales
    return {
      id: response.id,
      name: response.name,
      priceInCents: response.price.amountInCents,
      available: response.stock > 0,
      // NO expone description, images, etc.
    };
  }
}

// sales-context/application/PlaceOrderUseCase.ts
export class PlaceOrderUseCase {
  constructor(
    private readonly productCatalog: ProductCatalog  // Interface, no implementación
  ) {}

  async execute(command: PlaceOrderCommand) {
    for (const item of command.items) {
      // Consulta Catalog vía ACL
      const product = await this.productCatalog.findProduct(item.productId);
      if (!product || !product.available) {
        throw new ProductNotAvailableError(item.productId);
      }
    }

    // Crear pedido...
  }
}
```

**¿Por qué ACL?**
- Sales NO importa clases de Catalog
- Si Catalog cambia su API, solo cambias el Adapter
- Sales define QUÉ necesita (la interface)
- Catalog NO controla cómo Sales lo usa

## Ejemplo Completo: Crear Producto y Comprar

Vamos a ver el flujo completo:

### Paso 1: Crear Producto en Catalog

```bash
POST /api/catalog/products
{
  "name": "MacBook Pro 16",
  "description": "Laptop profesional",
  "priceInCents": 299900,
  "stock": 10,
  "specs": {
    "cpu": "M3 Max",
    "ram": "32GB"
  }
}
```

**Catalog Context**:
```typescript
// 1. CreateProductUseCase
const product = CatalogProduct.create({
  name: command.name,
  description: command.description,
  price: Money.fromCents(command.priceInCents),
  // ... specs, images, etc
});

await catalogRepo.save(product);

// 2. Emitir Integration Event
await eventBus.publish(
  new ProductCreatedEvent(
    product.id,
    product.name,
    command.priceInCents,
    command.stock
  )
);
```

**Sales Context escucha**:
```typescript
// CreateProductInSalesHandler
export class CreateProductInSalesHandler {
  async handle(event: ProductCreatedEvent) {
    // Sales crea SU PROPIA copia del producto
    const salesProduct = SalesProduct.create({
      id: ProductId.create(event.productId),
      name: event.name,  // Solo nombre, precio, stock
      price: Money.fromCents(event.priceInCents),
      stock: Quantity.create(event.stock),
    });

    await salesRepo.save(salesProduct);
  }
}
```

### Paso 2: Comprar Producto

```bash
POST /api/sales/orders
{
  "customerId": "customer-123",
  "items": [
    {
      "productId": "prod-abc",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "Calle Mayor 1",
    "city": "Las Palmas",
    "postalCode": "35001",
    "country": "España"
  }
}
```

**Sales Context**:
```typescript
// PlaceOrderUseCase
export class PlaceOrderUseCase {
  async execute(command: PlaceOrderCommand) {
    // 1. Validar productos (usa su propia copia)
    for (const item of command.items) {
      const product = await salesRepo.findProduct(item.productId);
      if (!product || !product.isAvailable()) {
        throw new ProductNotAvailableError();
      }
    }

    // 2. Crear pedido
    const order = Order.create({
      customerId: command.customerId,
      items: command.items,
      shippingAddress: command.shippingAddress,
    });

    await orderRepo.save(order);

    // 3. Emitir Integration Event
    await eventBus.publish(
      new OrderPlacedEvent(
        order.id,
        order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        order.shippingAddress
      )
    );
  }
}
```

**Shipping Context escucha**:
```typescript
// CreateShipmentOnOrderPlacedHandler
export class CreateShipmentOnOrderPlacedHandler {
  async handle(event: OrderPlacedEvent) {
    // Shipping crea envío automáticamente
    const shipment = Shipment.create({
      orderId: event.orderId,
      items: event.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        // Shipping NO conoce el producto completo
        // Solo lo necesario para enviar
      })),
      address: event.shippingAddress,
    });

    await shipmentRepo.save(shipment);

    // Emitir evento
    await eventBus.publish(
      new ShipmentCreatedEvent(
        shipment.id,
        event.orderId,
        shipment.trackingNumber
      )
    );
  }
}
```

## Ventajas de Bounded Contexts

### 1. Equipos Autónomos

Cada equipo es dueño de su contexto:

```
Equipo Catalog:
- Trabaja en catalog-context/
- Define su propio Product
- Despliega independientemente

Equipo Sales:
- Trabaja en sales-context/
- Define su propio Product
- Despliega independientemente

Equipo Shipping:
- Trabaja en shipping-context/
- NO tiene Product, tiene ShipmentItem
- Despliega independientemente
```

### 2. Modelos Especializados

Cada contexto tiene el modelo óptimo para su propósito:

```typescript
// Catalog necesita marketing info
class CatalogProduct {
  name: string;
  description: string;
  longDescription: string;
  images: Image[];
  specifications: Specification[];
  relatedProducts: ProductId[];
  tags: Tag[];
}

// Sales solo necesita pricing/stock
class SalesProduct {
  price: Money;
  stock: Quantity;
  availableForSale: boolean;
}

// Shipping solo necesita physical info
class ShipmentItem {
  productId: string;
  quantity: number;
  weight: Weight;
  dimensions: Dimensions;
}
```

### 3. Desacoplamiento

Los contextos se comunican solo vía eventos:

```
Catalog → ProductCreatedEvent → Sales
Sales → OrderPlacedEvent → Shipping
Shipping → ShipmentCreatedEvent → Notifications
```

Si Catalog cambia internamente, Sales no se entera.

### 4. Escalabilidad

Cada contexto puede:
- Tener su propia base de datos
- Escalar independientemente
- Usar diferentes tecnologías
- Convertirse en microservicio

## Patrones de Integración

### Shared Database (No Recomendado)

```
❌ Catalog y Sales comparten la misma tabla "products"

Problemas:
- Acoplamiento fuerte
- Schema rígido
- Conflictos de equipo
```

### Database per Context (Recomendado)

```
✅ Cada contexto tiene su propia BD

catalog_db:
  - products (con description, images, specs)

sales_db:
  - products (solo price, stock)
  - orders

shipping_db:
  - shipments
```

### Event-Driven Integration (Recomendado)

```
✅ Comunicación asíncrona vía eventos

Catalog publica ProductCreatedEvent
  ↓
Sales escucha y crea su copia
  ↓
Eventual consistency
```

## Errores Comunes

### 1. Demasiados Contextos

```typescript
// ❌ MALO - Contexto por cada entidad
user-context/
product-context/
order-context/
payment-context/
shipping-context/
notification-context/
analytics-context/
// ... 20 contextos más

// ✅ BUENO - Contextos por capacidad de negocio
catalog-context/  (Productos, categorías, specs)
sales-context/    (Orders, payments)
shipping-context/ (Shipments, carriers)
```

**Regla**: Si dos conceptos cambian juntos, van en el mismo contexto.

### 2. Shared Kernel Gigante

```typescript
// ❌ MALO - Poner todo en shared
shared/
  User.ts
  Product.ts
  Order.ts
  Shipment.ts
  // ... todo

// ✅ BUENO - Solo lo verdaderamente universal
shared/
  kernel/
    Money.ts
    Email.ts
    Address.ts  (si TODOS lo usan igual)
```

### 3. Llamadas Síncronas entre Contextos

```typescript
// ❌ MALO - Sales llama directamente a Catalog
class PlaceOrderUseCase {
  async execute(command) {
    for (const item of command.items) {
      // Llamada síncrona a Catalog Context
      const product = await catalogContext.getProduct(item.productId);
      // Acoplamiento fuerte!
    }
  }
}

// ✅ BUENO - Sales tiene su propia copia
class PlaceOrderUseCase {
  async execute(command) {
    for (const item of command.items) {
      // Consulta su propia BD
      const product = await salesRepo.findProduct(item.productId);
      // Desacoplado!
    }
  }
}
```

### 4. No Usar Anti-Corruption Layer

```typescript
// ❌ MALO - Importar directamente de otro contexto
import { CatalogProduct } from '../../catalog-context/domain/Product';

class SalesProduct {
  constructor(private catalogProduct: CatalogProduct) {}
  // ¡Acoplado al modelo de Catalog!
}

// ✅ BUENO - Interface en Sales, Adapter para traducir
interface ProductCatalog {
  findProduct(id: string): Promise<ProductInfo>;
}

class SalesProduct {
  constructor(private productInfo: ProductInfo) {}
  // Desacoplado de Catalog
}
```

## Cuándo Usar Bounded Contexts

### ✅ USA Bounded Contexts cuando:

1. **Sistema grande**: Múltiples equipos, muchas features
2. **Dominios complejos**: E-commerce, Banking, Healthcare
3. **Diferentes ritmos de cambio**: Catalog cambia mucho, Shipping poco
4. **Diferentes tecnologías**: Catalog en PostgreSQL, Sales en MongoDB
5. **Preparando microservicios**: Cada contexto puede ser un servicio

### ❌ NO uses Bounded Contexts cuando:

1. **Sistema pequeño**: < 5 entidades, 1 equipo
2. **CRUD simple**: Solo crear/leer/actualizar/borrar
3. **Dominio trivial**: No hay complejidad que justifique separación
4. **Empezando**: Añádelo cuando lo necesites

## Resumen

Bounded Contexts = **Fronteras lingüísticas y conceptuales**

```
E-Commerce:
├── Catalog Context (Product = Marketing info)
├── Sales Context (Product = Price/Stock)
└── Shipping Context (No Product, solo ShipmentItem)

Comunicación:
- Shared Kernel (Money, Email)
- Integration Events (ProductCreated, OrderPlaced)
- Anti-Corruption Layer (Interface + Adapter)

Cada contexto:
- Modelo propio
- BD propia (opcional)
- Equipo propio
- Lenguaje ubicuo propio
```

**Ventajas**:
- Equipos autónomos
- Modelos especializados
- Desacoplamiento
- Escalabilidad

**Cuándo**:
- Sistemas grandes
- Múltiples equipos
- Dominios complejos

Recuerda, mi niño: **los bounded contexts son como barrios en una ciudad. Cada uno tiene sus reglas, pero todos forman parte del mismo sistema**.

¿Te quedó clarito o le damos otra vuelta? 🚀
