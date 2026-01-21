# Inventario con CQRS - Guía Pedagógica 📦

Buenas, mi niño. Aquí vamos a aprender sobre **CQRS** (Command Query Responsibility Segregation), que viene siendo separar las escrituras de las lecturas. Es como tener dos puertas en una tienda: una para entrar (comandos/escrituras) y otra para salir (queries/lecturas).

## ¿Qué es CQRS?

CQRS significa **separar los modelos de escritura y lectura**. En lugar de usar las mismas entidades y repositorios para todo, tienes:

- **Modelo de Escritura** (Write Model): Optimizado para validar y ejecutar comandos
- **Modelo de Lectura** (Read Model): Optimizado para consultas rápidas

```
TRADICIONAL (Un solo modelo)          CQRS (Dos modelos separados)

┌─────────────────────┐              ┌───────────────────────────┐
│                     │              │      WRITE SIDE           │
│   Controller        │              │  ┌──────────────────┐     │
│         │           │              │  │  Commands        │     │
│         ▼           │              │  │  • AddProduct    │     │
│   ┌──────────┐      │              │  │  • UpdateStock   │     │
│   │ Use Case │      │              │  └────────┬─────────┘     │
│   └────┬─────┘      │              │           │               │
│        │            │              │           ▼               │
│        ▼            │              │  ┌──────────────────┐     │
│   ┌──────────┐      │              │  │  Write Model     │     │
│   │ Product  │      │              │  │  (Product entity)│     │
│   │ Entity   │      │              │  │  + validación    │     │
│   └────┬─────┘      │              │  │  + eventos       │     │
│        │            │              │  └────────┬─────────┘     │
│        ▼            │              │           │               │
│   ┌──────────┐      │              │           ▼               │
│   │ProductDB │      │              │  ┌──────────────────┐     │
│   └──────────┘      │              │  │ Write Repository │     │
│                     │              │  └──────────────────┘     │
│ El mismo modelo     │              └───────────────────────────┘
│ para TODO           │
│                     │              ┌───────────────────────────┐
│                     │              │      READ SIDE            │
│                     │              │  ┌──────────────────┐     │
│                     │              │  │  Queries         │     │
│                     │              │  │  • ListProducts  │     │
│                     │              │  │  • GetLowStock   │     │
│                     │              │  └────────┬─────────┘     │
│                     │              │           │               │
│                     │              │           ▼               │
│                     │              │  ┌──────────────────┐     │
│                     │              │  │  Read Model      │     │
│                     │              │  │  (DTO optimizado)│     │
│                     │              │  │  solo lectura    │     │
│                     │              │  └────────┬─────────┘     │
│                     │              │           │               │
│                     │              │           ▼               │
│                     │              │  ┌──────────────────┐     │
│                     │              │  │ Read Repository  │     │
│                     │              │  └──────────────────┘     │
│                     │              └───────────────────────────┘
└─────────────────────┘
```

## ¿Por qué CQRS?

### El Problema Sin CQRS

Imagínate que tienes una entidad `Product` con toda la lógica de negocio:

```typescript
// Modelo tradicional - hace de todo
class Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  price: Money;
  category: Category;
  supplier: Supplier;
  reviews: Review[];
  images: Image[];
  // ... 20 propiedades más

  // Métodos de negocio
  increaseStock(amount: number) { /* validación compleja */ }
  decreaseStock(amount: number) { /* validación compleja */ }
  updatePrice(price: Money) { /* validación compleja */ }

  // Métodos para queries???
  isLowStock(): boolean { ... }
  calculateAverageRating(): number { ... }
}

// Problema 1: Para mostrar una lista de productos necesitas cargar TODO
async function listProducts() {
  const products = await productRepository.findAll();
  // Cargas reviews, images, supplier, category...
  // ¡Solo querías mostrar nombre y precio!
}

// Problema 2: Las queries complejas son difíciles
async function getProductsLowStockByCategory(category: string) {
  const products = await productRepository.findAll();
  // Filtrar en memoria... lento!
  return products
    .filter(p => p.category.name === category)
    .filter(p => p.isLowStock())
    .map(p => ({ name: p.name, stock: p.quantity }));
}
```

### La Solución: CQRS

Con CQRS, separas las preocupaciones:

```typescript
// WRITE MODEL - Para comandos
class Product {
  // Solo propiedades necesarias para validación
  id: ProductId;
  sku: Sku;
  quantity: Quantity;
  price: Money;
  lowStockThreshold: number;

  // Métodos de negocio con validación
  increaseStock(amount: Quantity, reason: string): void {
    // Validaciones
    if (amount.isNegative()) throw new Error();

    this.quantity = this.quantity.add(amount);
    this.emit(new StockIncreasedEvent(...));
  }

  decreaseStock(amount: Quantity, reason: string): void {
    // Validaciones
    if (this.quantity.isLessThan(amount)) {
      throw new InsufficientStockError();
    }

    this.quantity = this.quantity.subtract(amount);
    this.emit(new StockDecreasedEvent(...));
  }
}

// READ MODEL - Para queries (puede ser diferente!)
interface ProductListDTO {
  id: string;
  sku: string;
  name: string;
  priceDisplay: string;  // Ya formateado: "€15.99"
  stockLevel: 'low' | 'ok' | 'high';  // Pre-calculado
  imageUrl: string;
}

interface ProductDetailDTO {
  id: string;
  sku: string;
  name: string;
  description: string;
  priceDisplay: string;
  stock: number;
  averageRating: number;  // Pre-calculado
  images: string[];
  category: { id: string; name: string };
}

// Queries optimizadas
class ProductReadRepository {
  async findAllForList(): Promise<ProductListDTO[]> {
    // Query SQL optimizada que solo trae lo necesario
    return db.query(`
      SELECT
        id, sku, name,
        CONCAT('€', price/100) as priceDisplay,
        CASE
          WHEN quantity <= low_stock_threshold THEN 'low'
          WHEN quantity < 50 THEN 'ok'
          ELSE 'high'
        END as stockLevel,
        primary_image_url as imageUrl
      FROM products
      ORDER BY name
    `);
  }

  async findLowStockByCategory(category: string): Promise<ProductListDTO[]> {
    // Query optimizada en BD
    return db.query(`
      SELECT ...
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE c.name = ? AND p.quantity <= p.low_stock_threshold
    `, [category]);
  }
}
```

### Ventajas de CQRS

1. **Escrituras optimizadas**:
   - El write model tiene SOLO la lógica de negocio
   - Sin campos innecesarios para escritura
   - Validación fuerte

2. **Lecturas optimizadas**:
   - El read model está pre-calculado y desnormalizado
   - Queries rápidas
   - Diferentes DTOs para diferentes vistas

3. **Escalabilidad**:
   - Puedes escalar writes y reads independientemente
   - Más reads que writes → escala solo el read side

4. **Flexibilidad**:
   - El read model puede estar en una BD diferente (ej: Elastic para búsquedas)
   - Puedes tener múltiples read models para diferentes propósitos

## Estructura del Proyecto CQRS

```
src/
├── domain/                       # El WRITE MODEL
│   ├── entities/
│   │   └── Product.ts            # Entidad con lógica de negocio
│   ├── value-objects/
│   │   ├── ProductId.ts
│   │   ├── Sku.ts
│   │   ├── Quantity.ts
│   │   └── Money.ts
│   ├── events/
│   │   ├── ProductAddedEvent.ts
│   │   ├── StockIncreasedEvent.ts
│   │   └── StockDecreasedEvent.ts
│   └── repositories/
│       ├── ProductWriteRepository.ts  # Interface para escribir
│       └── ProductReadRepository.ts   # Interface para leer
│
├── application/
│   ├── commands/                 # WRITE SIDE (modifican estado)
│   │   ├── AddProductCommand.ts
│   │   ├── UpdateStockCommand.ts
│   │   ├── UpdatePriceCommand.ts
│   │   └── handlers/
│   │       ├── AddProductHandler.ts
│   │       ├── UpdateStockHandler.ts
│   │       └── UpdatePriceHandler.ts
│   │
│   └── queries/                  # READ SIDE (solo consultan)
│       ├── ListProductsQuery.ts
│       ├── GetProductQuery.ts
│       ├── GetLowStockQuery.ts
│       └── handlers/
│           ├── ListProductsHandler.ts
│           ├── GetProductHandler.ts
│           └── GetLowStockHandler.ts
│
└── infrastructure/
    ├── persistence/
    │   ├── write/                # Write Repository
    │   │   └── InMemoryProductWriteRepository.ts
    │   └── read/                 # Read Repository
    │       └── InMemoryProductReadRepository.ts
    └── api/
        └── InventoryController.ts
```

## Comandos vs Queries

### Comandos (Commands)

Los comandos **modifican el estado** del sistema.

```typescript
// commands/AddProductCommand.ts
export interface AddProductCommand {
  sku: string;
  name: string;
  description: string;
  initialQuantity: number;
  priceInCents: number;
  currency?: string;
  lowStockThreshold?: number;
}

// commands/handlers/AddProductHandler.ts
export class AddProductHandler {
  constructor(
    private readonly writeRepository: ProductWriteRepository
  ) {}

  async handle(command: AddProductCommand): Promise<{ productId: string }> {
    // 1. Validar
    const sku = Sku.create(command.sku);
    const exists = await this.writeRepository.existsBySku(sku);
    if (exists) {
      throw new ProductValidationError('SKU already exists');
    }

    // 2. Crear entidad (lógica de dominio)
    const product = Product.create({
      id: ProductId.create(uuid()),
      sku,
      name: command.name,
      description: command.description,
      initialQuantity: Quantity.create(command.initialQuantity),
      price: Money.fromCents(command.priceInCents, command.currency ?? 'EUR'),
      lowStockThreshold: command.lowStockThreshold,
    });

    // 3. Guardar
    await this.writeRepository.save(product);

    // 4. Retornar solo el ID (no toda la entidad)
    return { productId: product.id.value };
  }
}
```

**Características de los comandos**:
- Verbos imperativos: `AddProduct`, `UpdateStock`, `RemoveProduct`
- Modifican el estado
- Retornan poco (a menudo solo un ID)
- Usan el **Write Repository**
- Validan reglas de negocio
- Emiten eventos de dominio

### Queries (Consultas)

Las queries **NO modifican** el estado, solo leen.

```typescript
// queries/ListProductsQuery.ts
export interface ListProductsQuery {
  search?: string;
  lowStockOnly?: boolean;
  outOfStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'stock';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// queries/handlers/ListProductsHandler.ts
export class ListProductsHandler {
  constructor(
    private readonly readRepository: ProductReadRepository
  ) {}

  async handle(query: ListProductsQuery): Promise<PaginatedProducts> {
    // Solo delega al read repository
    // NO hay lógica de negocio
    return this.readRepository.findAll({
      search: query.search,
      lowStockOnly: query.lowStockOnly,
      outOfStockOnly: query.outOfStockOnly,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
```

**Características de las queries**:
- Sustantivos: `ListProducts`, `GetProduct`, `GetLowStock`
- NO modifican estado
- Retornan DTOs (no entidades)
- Usan el **Read Repository**
- Sin validación de negocio (solo validación de input)
- NO emiten eventos

## Write Model vs Read Model

### Write Model (Modelo de Escritura)

El write model es la entidad de dominio con toda la lógica de negocio.

```typescript
// domain/entities/Product.ts
export class Product {
  // Value Objects para validación fuerte
  private id: ProductId;
  private sku: Sku;
  private quantity: Quantity;
  private price: Money;

  // Métodos de negocio
  increaseStock(amount: Quantity, reason: string): void {
    // VALIDACIÓN
    this.quantity = this.quantity.add(amount);

    // EVENTO
    this.addDomainEvent(
      new StockIncreasedEvent(
        this.id.value,
        amount.value,
        this.quantity.value,
        reason
      )
    );
  }

  decreaseStock(amount: Quantity, reason: string): void {
    // VALIDACIÓN - lanzará error si no hay suficiente stock
    this.quantity = this.quantity.subtract(amount);

    // EVENTO
    this.addDomainEvent(new StockDecreasedEvent(...));

    // EVENTO CONDICIONAL - si ahora estamos en bajo stock
    if (this.isLowStock()) {
      this.addDomainEvent(new LowStockAlertEvent(...));
    }
  }

  updatePrice(newPrice: Money): void {
    const oldPrice = this.price;
    this.price = newPrice;

    this.addDomainEvent(
      new ProductPriceUpdatedEvent(
        this.id.value,
        oldPrice.amountInCents,
        newPrice.amountInCents
      )
    );
  }
}
```

**Características del Write Model**:
- Entidades ricas con comportamiento
- Value Objects para validación
- Emite eventos de dominio
- Protege invariantes
- Usa para: AddProduct, UpdateStock, UpdatePrice

### Read Model (Modelo de Lectura)

El read model son DTOs optimizados para diferentes vistas.

```typescript
// domain/repositories/ProductReadRepository.ts
export interface ProductDTO {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantityInStock: number;
  priceInCents: number;
  currency: string;
  isLowStock: boolean;
  isOutOfStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListDTO {
  id: string;
  sku: string;
  name: string;
  quantityInStock: number;
  priceDisplay: string;  // "€15.99"
  stockStatus: 'ok' | 'low' | 'out';
}

export interface LowStockProduct {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  threshold: number;
  shortage: number;  // Pre-calculado: threshold - currentStock
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  averageStockLevel: number;
}
```

**Características del Read Model**:
- DTOs planos (Plain Old Objects)
- Datos pre-calculados
- Desnormalizados (puede tener datos duplicados)
- Optimizados para cada vista
- Sin lógica de negocio
- Usa para: ListProducts, GetProduct, GetLowStock, GetStatistics

## Write Repository vs Read Repository

### Write Repository

El write repository trabaja con **entidades de dominio**.

```typescript
// domain/repositories/ProductWriteRepository.ts
export interface ProductWriteRepository {
  save(product: Product): Promise<void>;
  findById(id: ProductId): Promise<Product | null>;
  existsBySku(sku: Sku): Promise<boolean>;
  delete(id: ProductId): Promise<void>;
}

// infrastructure/persistence/write/InMemoryProductWriteRepository.ts
export class InMemoryProductWriteRepository implements ProductWriteRepository {
  private products = new Map<string, ProductProps>();

  async save(product: Product): Promise<void> {
    // Guardar propiedades (no la entidad directa)
    this.products.set(product.id.value, {
      id: product.id,
      sku: product.sku,
      name: product.name,
      // ... todas las props
    });
  }

  async findById(id: ProductId): Promise<Product | null> {
    const props = this.products.get(id.value);
    if (!props) return null;

    // Reconstituir entidad
    return Product.reconstitute(props);
  }
}
```

### Read Repository

El read repository retorna **DTOs**, no entidades.

```typescript
// domain/repositories/ProductReadRepository.ts
export interface ProductReadRepository {
  findAll(filters: {
    search?: string;
    lowStockOnly?: boolean;
    outOfStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'stock';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<PaginatedProducts>;

  findById(id: string): Promise<ProductDTO | null>;
  findLowStock(threshold?: number): Promise<LowStockProduct[]>;
  getStatistics(): Promise<InventoryStats>;
}

// infrastructure/persistence/read/InMemoryProductReadRepository.ts
export class InMemoryProductReadRepository implements ProductReadRepository {
  private products = new Map<string, ProductDTO>();

  async findAll(filters): Promise<PaginatedProducts> {
    let products = Array.from(this.products.values());

    // Filtrar
    if (filters.search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.lowStockOnly) {
      products = products.filter(p => p.isLowStock);
    }

    // Ordenar
    if (filters.sortBy === 'name') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Paginar
    const total = products.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 20;
    products = products.slice(offset, offset + limit);

    return {
      products,
      total,
      limit,
      offset,
    };
  }

  async getStatistics(): Promise<InventoryStats> {
    const products = Array.from(this.products.values());

    return {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + p.priceInCents, 0),
      lowStockCount: products.filter(p => p.isLowStock).length,
      outOfStockCount: products.filter(p => p.isOutOfStock).length,
      averageStockLevel: products.reduce((sum, p) => sum + p.quantityInStock, 0) / products.length,
    };
  }
}
```

## Sincronización Write → Read

Un punto clave: ¿cómo sincronizas el write model con el read model?

### Opción 1: Sincronización en el Handler (Simple)

```typescript
export class AddProductHandler {
  constructor(
    private readonly writeRepo: ProductWriteRepository,
    private readonly readRepo: ProductReadRepository
  ) {}

  async handle(command: AddProductCommand): Promise<{ productId: string }> {
    // 1. Crear en write model
    const product = Product.create({...});
    await this.writeRepo.save(product);

    // 2. Actualizar read model inmediatamente
    await this.readRepo.save({
      id: product.id.value,
      sku: product.sku.value,
      name: product.name,
      quantityInStock: product.quantity.value,
      priceInCents: product.price.amountInCents,
      isLowStock: product.isLowStock(),
      isOutOfStock: product.isOutOfStock(),
      // ...
    });

    return { productId: product.id.value };
  }
}
```

**Ventajas**:
- Simple
- Consistencia inmediata

**Desventajas**:
- Acoplamiento entre write y read
- Si falla el read, rollback del write?

### Opción 2: Sincronización por Eventos (Avanzado)

```typescript
// Handler solo escribe
export class AddProductHandler {
  constructor(private readonly writeRepo: ProductWriteRepository) {}

  async handle(command: AddProductCommand): Promise<{ productId: string }> {
    const product = Product.create({...});
    await this.writeRepo.save(product);

    // Los eventos se publicarán automáticamente
    const events = product.pullDomainEvents();
    // [ProductAddedEvent]

    return { productId: product.id.value };
  }
}

// Event handler actualiza el read model
export class ProductAddedEventHandler {
  constructor(private readonly readRepo: ProductReadRepository) {}

  async handle(event: ProductAddedEvent): Promise<void> {
    await this.readRepo.save({
      id: event.productId,
      sku: event.sku,
      name: event.name,
      quantityInStock: event.initialQuantity,
      // ...
    });
  }
}
```

**Ventajas**:
- Desacoplamiento total
- El read model puede estar en otra BD
- Múltiples read models pueden escuchar el mismo evento

**Desventajas**:
- Eventual consistency (el read model se actualiza después)
- Más complejo

## Ejemplos de Uso

### Comando: Añadir Producto

```bash
curl -X POST http://localhost:3000/api/inventory/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "LAPTOP-001",
    "name": "MacBook Pro 16",
    "description": "Laptop profesional",
    "initialQuantity": 10,
    "priceInCents": 299900,
    "currency": "EUR",
    "lowStockThreshold": 5
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "productId": "prod-abc-123"
  }
}
```

### Comando: Aumentar Stock

```bash
curl -X PATCH http://localhost:3000/api/inventory/products/prod-abc-123/stock/increase \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 20,
    "reason": "Received shipment"
  }'
```

### Query: Listar Productos

```bash
curl "http://localhost:3000/api/inventory/products?lowStockOnly=true&sortBy=name&limit=10"
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-abc-123",
        "sku": "LAPTOP-001",
        "name": "MacBook Pro 16",
        "quantityInStock": 4,
        "priceDisplay": "€2,999.00",
        "stockStatus": "low"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

### Query: Estadísticas de Inventario

```bash
curl http://localhost:3000/api/inventory/statistics
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "totalProducts": 42,
    "totalValue": 1256789,
    "lowStockCount": 5,
    "outOfStockCount": 2,
    "averageStockLevel": 34.2
  }
}
```

## Cuándo Usar CQRS

### ✅ USA CQRS cuando:

1. **Queries complejas**: Necesitas agregaciones, joins, búsquedas fulltext
2. **Diferentes modelos para read/write**: Los datos que escribes son muy diferentes de los que lees
3. **Alta carga de lectura**: 90% reads, 10% writes
4. **Necesitas escalar reads independientemente**: Más replicas de read que de write
5. **Diferentes BDs para read/write**: Ej: PostgreSQL para writes, Elasticsearch para reads
6. **Event sourcing**: CQRS es casi obligatorio con Event Sourcing

### ❌ NO uses CQRS cuando:

1. **CRUD simple**: Solo creas, lees, actualizas y borras sin lógica compleja
2. **Pocas queries**: Siempre lees lo mismo de la misma forma
3. **Proyecto pequeño**: Complejidad > beneficio
4. **Empezando**: Añádelo después si lo necesitas

## Errores Comunes

### 1. Poner lógica de negocio en queries

```typescript
// ❌ MALO
export class ListProductsHandler {
  async handle(query: ListProductsQuery) {
    const products = await this.readRepo.findAll();

    // ¡Lógica de negocio en la query!
    for (const product of products) {
      if (product.quantityInStock < 10) {
        await this.sendLowStockAlert(product);
      }
    }

    return products;
  }
}

// ✅ BUENO - Las queries solo leen
export class ListProductsHandler {
  async handle(query: ListProductsQuery) {
    return this.readRepo.findAll(query);
  }
}

// La lógica va en un command handler o event handler
```

### 2. Retornar entidades desde queries

```typescript
// ❌ MALO
export class GetProductHandler {
  async handle(query: GetProductQuery): Promise<Product> {
    return this.writeRepo.findById(query.productId);
    // Retornas la entidad de dominio!
  }
}

// ✅ BUENO
export class GetProductHandler {
  async handle(query: GetProductQuery): Promise<ProductDTO> {
    return this.readRepo.findById(query.productId);
    // Retornas un DTO
  }
}
```

### 3. Usar el write model para queries

```typescript
// ❌ MALO
export class ListProductsHandler {
  constructor(
    private readonly writeRepo: ProductWriteRepository  // ¡Wrong repo!
  ) {}
}

// ✅ BUENO
export class ListProductsHandler {
  constructor(
    private readonly readRepo: ProductReadRepository  // Read repo
  ) {}
}
```

## Próximos Pasos

Una vez domines CQRS, puedes explorar:

1. **[event-driven-example](../event-driven-example)** - Comunicación asíncrona con eventos
2. **[bounded-contexts-example](../bounded-contexts-example)** - CQRS en múltiples contextos
3. **Event Sourcing** - Guardar eventos en lugar de estado (tema avanzado)

## Resumen

CQRS = **Separar writes de reads**

```
Commands (Write):
- Modifican estado
- Validan reglas de negocio
- Emiten eventos
- Usan Write Repository
- Retornan poco (ID)

Queries (Read):
- NO modifican estado
- Sin validación de negocio
- Sin eventos
- Usan Read Repository
- Retornan DTOs optimizados
```

Recuerda, mi niño: **CQRS no es todo o nada. Puedes aplicarlo solo donde aporta valor**.

¿Te quedó clarito o le damos otra vuelta? 🚀
