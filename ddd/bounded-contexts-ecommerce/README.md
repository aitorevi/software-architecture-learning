# Bounded Contexts Example - E-Commerce

An e-commerce system demonstrating **multiple Bounded Contexts** communicating via integration events.

## What are Bounded Contexts?

Bounded Contexts are explicit boundaries within a domain where a particular domain model applies. Each context has its own ubiquitous language and domain model.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Bounded Contexts                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│   │     CATALOG     │    │      SALES      │    │   SHIPPING    │  │
│   │                 │    │                 │    │               │  │
│   │  Product:       │    │  Order:         │    │  Shipment:    │  │
│   │  - name         │    │  - items        │    │  - items      │  │
│   │  - description  │    │  - total        │    │  - address    │  │
│   │  - price        │    │  - status       │    │  - tracking   │  │
│   │  - category     │    │                 │    │               │  │
│   │                 │    │  OrderItem:     │    │  (No prices!) │  │
│   │  (No inventory!)│    │  - productId    │    │               │  │
│   │                 │    │  - price (copy) │    │               │  │
│   └────────┬────────┘    └────────┬────────┘    └───────┬───────┘  │
│            │                      │                      │          │
│            ▼                      ▼                      ▼          │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │              Integration Event Bus                          │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   Same "Product" concept, different meanings in each context!       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Concepts

### 1. Each Context Has Its Own Model

**Catalog's Product:**
```typescript
// Focus: Display and search
interface Product {
  name: string;
  description: string;
  price: Money;
  category: string;
}
```

**Sales' OrderItem:**
```typescript
// Focus: Commercial transaction
interface OrderItem {
  productId: string;  // Just a reference!
  productName: string; // Cached at order time
  unitPrice: Money;    // Captured at order time
}
```

**Shipping's ShipmentItem:**
```typescript
// Focus: Logistics
interface ShipmentItem {
  productId: string;
  quantity: number;
  // No price! Shipping doesn't care about money
}
```

### 2. Integration Events for Communication

Contexts communicate via events, not direct calls:

```typescript
// Sales publishes when order is placed
class OrderPlacedIntegrationEvent {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: Address;
}

// Shipping listens and creates its own Shipment
class CreateShipmentOnOrderPlacedHandler {
  handle(event: OrderPlacedIntegrationEvent) {
    // Translate to Shipping's domain model
    const shipment = Shipment.createFromOrder({...});
  }
}
```

### 3. Anti-Corruption Layer (ACL)

When Sales needs product info, it doesn't import Catalog's domain:

```typescript
// Sales defines its OWN interface for what it needs
interface ProductCatalog {
  getProduct(id: string): Promise<ProductInfo>;
}

// ProductInfo is Sales' view, not Catalog's Product
interface ProductInfo {
  id: string;
  name: string;
  price: Money;
  isAvailable: boolean;
  // No category, description - Sales doesn't need them
}

// Adapter translates between contexts
class ProductCatalogAdapter implements ProductCatalog {
  async getProduct(id: string): Promise<ProductInfo> {
    const product = await this.catalogRepo.findById(id);
    // Translate Catalog → Sales
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      isAvailable: product.isActive,
    };
  }
}
```

### 4. Minimal Shared Kernel

Only truly universal types are shared:

```typescript
// shared/kernel/Money.ts - Used by multiple contexts
class Money {
  amountInCents: number;
  currency: string;
}

// Integration events use primitives, not domain objects!
class OrderPlacedIntegrationEvent {
  totalInCents: number;  // Not Money!
}
```

## Project Structure

```
bounded-contexts-example/
├── src/
│   ├── catalog-context/        # Product catalog
│   │   ├── domain/
│   │   │   └── Product.ts
│   │   └── application/
│   │       └── CreateProductUseCase.ts
│   │
│   ├── sales-context/          # Order management
│   │   ├── domain/
│   │   │   ├── Order.ts
│   │   │   └── ProductCatalog.ts  # ACL interface
│   │   └── application/
│   │       └── PlaceOrderUseCase.ts
│   │
│   ├── shipping-context/       # Shipment management
│   │   ├── domain/
│   │   │   └── Shipment.ts
│   │   └── application/
│   │       └── CreateShipmentOnOrderPlacedHandler.ts
│   │
│   └── shared/
│       ├── events/             # Integration events
│       │   ├── CatalogEvents.ts
│       │   ├── SalesEvents.ts
│       │   └── ShippingEvents.ts
│       └── kernel/             # Minimal shared types
│           └── Money.ts
```

## Context Map

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   CATALOG   │         │    SALES    │         │  SHIPPING   │
│  (Upstream) │◀───ACL──│  (Core)     │───Event─▶│ (Downstream)│
└─────────────┘         └─────────────┘         └─────────────┘

Relationships:
- Sales uses Catalog via Anti-Corruption Layer
- Shipping subscribes to Sales' OrderPlaced events
- Each context can evolve independently
```

## When to Use Bounded Contexts

### Good for:
- Large teams (each team owns a context)
- Different domain experts for different areas
- Parts that might become microservices
- Areas with different change rates

### Watch out for:
- Overhead for small systems
- Cross-context transactions are hard
- Eventual consistency challenges
- More code to maintain

## API Endpoints

```bash
# Catalog: Create a product
POST /api/catalog/products
{
  "name": "Widget",
  "description": "A useful widget",
  "priceInCents": 1999,
  "category": "Tools"
}

# Catalog: List products
GET /api/catalog/products

# Sales: Place an order
POST /api/sales/orders
{
  "customerId": "cust-123",
  "items": [
    { "productId": "PRODUCT_ID", "quantity": 2 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Madrid",
    "postalCode": "28001",
    "country": "ES"
  }
}
```

## Getting Started

```bash
npm install
npm run dev
npm test
```

## Example Flow

```bash
# 1. Create a product in Catalog
curl -X POST http://localhost:3000/api/catalog/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Widget", "priceInCents": 1999, "category": "Tools"}'

# 2. Place an order in Sales (automatically creates Shipment!)
curl -X POST http://localhost:3000/api/sales/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-1",
    "items": [{"productId": "PRODUCT_ID", "quantity": 2}],
    "shippingAddress": {"street": "123 Main", "city": "Madrid", "postalCode": "28001", "country": "ES"}
  }'
```

## Related Projects

- **library-system**: Basic hexagonal architecture
- **vertical-slicing-example**: Feature-based organization
- **cqrs-example**: CQRS pattern
- **event-driven-example**: Event-driven architecture
