# CQRS Example - Inventory System

An inventory management system demonstrating **CQRS (Command Query Responsibility Segregation)** pattern.

## What is CQRS?

CQRS separates read and write operations into different models:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CQRS Architecture                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         ┌───────────┐                               │
│                         │    API    │                               │
│                         └─────┬─────┘                               │
│                               │                                     │
│              ┌────────────────┴────────────────┐                    │
│              │                                 │                    │
│              ▼                                 ▼                    │
│      ┌───────────────┐                ┌───────────────┐            │
│      │   Commands    │                │    Queries    │            │
│      │ (POST/PUT/DEL)│                │     (GET)     │            │
│      └───────┬───────┘                └───────┬───────┘            │
│              │                                 │                    │
│              ▼                                 ▼                    │
│      ┌───────────────┐                ┌───────────────┐            │
│      │    Domain     │                │   Read Model  │            │
│      │   Entities    │                │    (DTOs)     │            │
│      └───────┬───────┘                └───────┬───────┘            │
│              │                                 │                    │
│              ▼                                 ▼                    │
│      ┌───────────────┐                ┌───────────────┐            │
│      │    Write      │   ──Events──▶  │     Read      │            │
│      │  Repository   │                │  Repository   │            │
│      └───────────────┘                └───────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Concepts

### Commands (Write Side)

Commands represent **intentions to change** the system:

```typescript
// Commands are named imperatively
interface AddProductCommand {
  type: 'AddProduct';
  sku: string;
  name: string;
  initialQuantity: number;
  priceInCents: number;
}

// Handlers process commands through domain entities
class AddProductHandler {
  async handle(command: AddProductCommand) {
    const product = Product.create({...});  // Domain logic
    await this.writeRepository.save(product);  // Persist
    return { productId: product.id };  // Minimal response
  }
}
```

### Queries (Read Side)

Queries represent **requests for data**:

```typescript
// Queries are named descriptively
interface GetProductQuery {
  type: 'GetProduct';
  productId: string;
}

// Handlers read directly from optimized storage
class GetProductHandler {
  async handle(query: GetProductQuery) {
    // No domain entities! Direct DTO from read storage
    return this.readRepository.findById(query.productId);
  }
}
```

### Separate Data Models

| Aspect | Write Model | Read Model |
|--------|-------------|------------|
| **Purpose** | Business logic & invariants | Fast queries & display |
| **Structure** | Rich entities with behavior | Flat DTOs |
| **Optimization** | Consistency & validation | Query performance |
| **Storage** | Normalized (often relational) | Denormalized (can be NoSQL) |

## Project Structure

```
cqrs-example/
├── src/
│   ├── domain/
│   │   ├── entities/           # Write model (Product)
│   │   ├── value-objects/      # ProductId, Quantity, Money, Sku
│   │   ├── events/             # Domain events
│   │   └── repositories/
│   │       ├── ProductWriteRepository.ts  # Write side port
│   │       └── ProductReadRepository.ts   # Read side port
│   │
│   ├── application/
│   │   ├── commands/           # Command definitions
│   │   │   ├── AddProductCommand.ts
│   │   │   ├── UpdateStockCommand.ts
│   │   │   └── handlers/       # Command handlers
│   │   │
│   │   └── queries/            # Query definitions
│   │       ├── GetProductQuery.ts
│   │       ├── ListProductsQuery.ts
│   │       └── handlers/       # Query handlers
│   │
│   └── infrastructure/
│       ├── persistence/
│       │   ├── write/          # Write repository implementation
│       │   └── read/           # Read repository implementation
│       └── api/
│           └── InventoryController.ts
```

## Benefits of CQRS

### 1. **Optimized Read Performance**
Read models can be denormalized, pre-computed, and indexed specifically for queries.

### 2. **Scalability**
Read and write sides can scale independently:
- Heavy reads? Scale the read side
- Complex writes? Scale the write side

### 3. **Simpler Models**
Each side focuses on one concern:
- Write: Business rules and consistency
- Read: Query flexibility and speed

### 4. **Different Technologies**
You can use the best tool for each job:
- Write: PostgreSQL with strong consistency
- Read: Elasticsearch for full-text search

## When to Use CQRS

### Good candidates:
- Systems with very different read/write patterns
- High read-to-write ratios
- Complex queries that are expensive on normalized data
- Need for multiple read projections
- Microservices needing different data views

### Avoid when:
- Simple CRUD operations
- Read and write patterns are similar
- Small scale with no performance concerns
- Team unfamiliar with the pattern

## API Endpoints

### Commands (Write Operations)

```bash
# Add a new product
POST /api/inventory/products
{
  "sku": "ABC-12345",
  "name": "Widget",
  "initialQuantity": 100,
  "priceInCents": 1999
}

# Increase stock
POST /api/inventory/products/:id/increase-stock
{ "quantity": 50, "reason": "Shipment received" }

# Decrease stock
POST /api/inventory/products/:id/decrease-stock
{ "quantity": 10, "reason": "Sold" }

# Update price
PUT /api/inventory/products/:id/price
{ "priceInCents": 2499 }

# Remove product
DELETE /api/inventory/products/:id
```

### Queries (Read Operations)

```bash
# List products with filtering
GET /api/inventory/products?search=widget&lowStockOnly=true

# Get product by ID
GET /api/inventory/products/:id

# Get product by SKU
GET /api/inventory/products/sku/ABC-12345

# Get low stock alerts
GET /api/inventory/products/low-stock

# Get out of stock products
GET /api/inventory/products/out-of-stock

# Get inventory statistics
GET /api/inventory/statistics
```

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Example Usage

```bash
# Add a product
curl -X POST http://localhost:3000/api/inventory/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "WDG-00001",
    "name": "Super Widget",
    "initialQuantity": 100,
    "priceInCents": 1999,
    "lowStockThreshold": 20
  }'

# Decrease stock (sale)
curl -X POST http://localhost:3000/api/inventory/products/PRODUCT_ID/decrease-stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5, "reason": "Sold to customer"}'

# Query low stock
curl http://localhost:3000/api/inventory/products/low-stock

# Get statistics
curl http://localhost:3000/api/inventory/statistics
```

## Related Projects

- **library-system**: Basic hexagonal architecture
- **vertical-slicing-example**: Feature-based organization
- **event-driven-example**: Event-driven architecture
- **bounded-contexts-example**: Multiple bounded contexts
