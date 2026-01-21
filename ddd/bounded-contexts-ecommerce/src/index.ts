/**
 * BOUNDED CONTEXTS EXAMPLE - Main Application Entry Point
 *
 * This example demonstrates multiple bounded contexts:
 *
 * 1. CATALOG CONTEXT - Product management
 *    - Creates and manages product information
 *    - Publishes ProductCreated events
 *
 * 2. SALES CONTEXT - Order management
 *    - Places orders using ProductCatalog ACL
 *    - Publishes OrderPlaced events
 *
 * 3. SHIPPING CONTEXT - Shipment management
 *    - Listens to OrderPlaced events
 *    - Creates shipments in its own domain model
 *
 * KEY CONCEPTS DEMONSTRATED:
 * - Each context has its OWN domain model
 * - Contexts communicate via Integration Events
 * - Anti-Corruption Layer (ProductCatalog in Sales)
 * - Shared Kernel (minimal - just Money)
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Money } from './shared/kernel';
import { InMemoryIntegrationEventBus } from './shared/events/InMemoryIntegrationEventBus';

// Catalog Context
import { Product, ProductRepository } from './catalog-context/domain';
import { CreateProductUseCase } from './catalog-context/application';

// Sales Context
import { Order, OrderRepository, ProductCatalog, ProductInfo } from './sales-context/domain';
import { PlaceOrderUseCase } from './sales-context/application';

// Shipping Context
import { Shipment, ShipmentRepository } from './shipping-context/domain';
import { CreateShipmentOnOrderPlacedHandler } from './shipping-context/application';

// === In-Memory Repositories ===

class InMemoryCatalogProductRepository implements ProductRepository {
  private products = new Map<string, Product>();

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (p) => p.category === category
    );
  }
}

class InMemorySalesOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (o) => o.customerId === customerId
    );
  }
}

class InMemoryShipmentRepository implements ShipmentRepository {
  private shipments = new Map<string, Shipment>();

  async save(shipment: Shipment): Promise<void> {
    this.shipments.set(shipment.id, shipment);
  }

  async findById(id: string): Promise<Shipment | null> {
    return this.shipments.get(id) ?? null;
  }

  async findByOrderId(orderId: string): Promise<Shipment | null> {
    return (
      Array.from(this.shipments.values()).find((s) => s.orderId === orderId) ??
      null
    );
  }

  async findPending(): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter(
      (s) => s.status === 'PENDING'
    );
  }
}

// === Anti-Corruption Layer: ProductCatalog Adapter ===

class ProductCatalogAdapter implements ProductCatalog {
  constructor(private readonly catalogRepository: ProductRepository) {}

  async getProduct(productId: string): Promise<ProductInfo | null> {
    const product = await this.catalogRepository.findById(productId);
    if (!product) return null;

    // Translate from Catalog's Product to Sales' ProductInfo
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      isAvailable: product.isActive,
    };
  }

  async areProductsAvailable(
    productIds: string[]
  ): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();
    for (const id of productIds) {
      const product = await this.catalogRepository.findById(id);
      result.set(id, product?.isActive ?? false);
    }
    return result;
  }

  async getPrices(productIds: string[]): Promise<Map<string, Money>> {
    const result = new Map<string, Money>();
    for (const id of productIds) {
      const product = await this.catalogRepository.findById(id);
      if (product) {
        result.set(id, product.price);
      }
    }
    return result;
  }
}

function createApp() {
  const app = express();
  app.use(express.json());

  // === Infrastructure ===
  const eventBus = new InMemoryIntegrationEventBus();

  // === Catalog Context ===
  const catalogRepository = new InMemoryCatalogProductRepository();
  const createProductUseCase = new CreateProductUseCase(
    catalogRepository,
    eventBus
  );

  // === Sales Context ===
  const orderRepository = new InMemorySalesOrderRepository();
  const productCatalog = new ProductCatalogAdapter(catalogRepository);
  const placeOrderUseCase = new PlaceOrderUseCase(
    orderRepository,
    productCatalog,
    eventBus
  );

  // === Shipping Context ===
  const shipmentRepository = new InMemoryShipmentRepository();
  const createShipmentHandler = new CreateShipmentOnOrderPlacedHandler(
    shipmentRepository,
    eventBus
  );

  // === Wire up event handlers ===
  eventBus.subscribe('sales.order.placed', (event) =>
    createShipmentHandler.handle(event as any)
  );

  // === API Routes ===

  // Catalog endpoints
  app.post('/api/catalog/products', async (req, res) => {
    try {
      const result = await createProductUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.get('/api/catalog/products', async (_req, res) => {
    const products = await catalogRepository.findAll();
    res.json({
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price.amountInCents,
        category: p.category,
      })),
    });
  });

  // Sales endpoints
  app.post('/api/sales/orders', async (req, res) => {
    try {
      const result = await placeOrderUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', architecture: 'bounded-contexts' });
  });

  return app;
}

// Start server only when run directly (not imported in tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║      E-Commerce - Bounded Contexts Architecture               ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                       ║
║                                                               ║
║  Bounded Contexts:                                            ║
║    CATALOG  → Product management                              ║
║    SALES    → Order management (uses ProductCatalog ACL)      ║
║    SHIPPING → Shipment management (listens to order events)   ║
║                                                               ║
║  Communication:                                               ║
║    Catalog ──ProductCreated──▶ (no listeners yet)             ║
║    Sales ────OrderPlaced────▶ Shipping (creates shipment)     ║
║                                                               ║
║  API Endpoints:                                               ║
║    POST /api/catalog/products   Create a product              ║
║    GET  /api/catalog/products   List products                 ║
║    POST /api/sales/orders       Place an order                ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}

export { createApp };

// Re-export domain types for testing
export { Product } from './catalog-context/domain';
export { Order, OrderStatus } from './sales-context/domain';
export { Shipment, ShipmentStatus } from './shipping-context/domain';
export { Money } from './shared/kernel';
