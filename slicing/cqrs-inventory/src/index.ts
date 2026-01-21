/**
 * CQRS EXAMPLE - Main Application Entry Point
 *
 * This is the composition root where we wire together:
 * - Write repository (for commands)
 * - Read repository (for queries)
 * - Command handlers
 * - Query handlers
 * - Controller
 *
 * CQRS KEY CONCEPT:
 * Notice how commands and queries have completely separate data paths:
 * - Commands → Write Repository → Domain Entities
 * - Queries → Read Repository → DTOs directly
 *
 * In a production system, you might have:
 * - Different databases for write and read
 * - Event handlers that sync read model from write events
 * - Message queues for async processing
 */

import express from 'express';

// Repositories
import { InMemoryProductWriteRepository } from './infrastructure/persistence/write/InMemoryProductWriteRepository';
import { InMemoryProductReadRepository } from './infrastructure/persistence/read/InMemoryProductReadRepository';

// Command Handlers
import {
  AddProductHandler,
  IncreaseStockHandler,
  DecreaseStockHandler,
  UpdatePriceHandler,
  RemoveProductHandler,
} from './application';

// Query Handlers
import {
  GetProductHandler,
  GetProductBySkuHandler,
  ListProductsHandler,
  GetLowStockHandler,
  GetOutOfStockHandler,
  GetInventoryStatisticsHandler,
} from './application';

// Controller
import { InventoryController } from './infrastructure/api/InventoryController';

function createApp() {
  const app = express();
  app.use(express.json());

  // === REPOSITORIES ===
  const writeRepository = new InMemoryProductWriteRepository();
  const readRepository = new InMemoryProductReadRepository();

  /**
   * SYNC MECHANISM
   *
   * In this example, we sync the read model after each command.
   * In a real CQRS system, you would:
   * 1. Emit domain events from the write side
   * 2. Have event handlers update the read side asynchronously
   * 3. Accept eventual consistency between read and write
   *
   * This simple sync demonstrates the concept while keeping the example straightforward.
   */
  const syncReadModel = () => {
    readRepository.sync(writeRepository.getAll());
  };

  // === COMMAND HANDLERS ===
  const addProductHandler = new AddProductHandler(writeRepository);
  const increaseStockHandler = new IncreaseStockHandler(writeRepository);
  const decreaseStockHandler = new DecreaseStockHandler(writeRepository);
  const updatePriceHandler = new UpdatePriceHandler(writeRepository);
  const removeProductHandler = new RemoveProductHandler(writeRepository);

  // === QUERY HANDLERS ===
  const getProductHandler = new GetProductHandler(readRepository);
  const getProductBySkuHandler = new GetProductBySkuHandler(readRepository);
  const listProductsHandler = new ListProductsHandler(readRepository);
  const getLowStockHandler = new GetLowStockHandler(readRepository);
  const getOutOfStockHandler = new GetOutOfStockHandler(readRepository);
  const getStatisticsHandler = new GetInventoryStatisticsHandler(readRepository);

  // === CONTROLLER ===
  const controller = new InventoryController(
    addProductHandler,
    increaseStockHandler,
    decreaseStockHandler,
    updatePriceHandler,
    removeProductHandler,
    getProductHandler,
    getProductBySkuHandler,
    listProductsHandler,
    getLowStockHandler,
    getOutOfStockHandler,
    getStatisticsHandler
  );

  // Middleware to sync read model after write operations
  app.use('/api/inventory', (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Sync after successful write operations
      if (['POST', 'PUT', 'DELETE'].includes(req.method) && body.success) {
        syncReadModel();
      }
      return originalJson(body);
    };
    next();
  });

  app.use('/api/inventory', controller.router);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', architecture: 'cqrs' });
  });

  return app;
}

// Start server
const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         Inventory System - CQRS Architecture                  ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                       ║
║                                                               ║
║  CQRS Concept:                                                ║
║    Commands (Write) → Domain Entities → Write Repository      ║
║    Queries (Read)   → Read Repository  → DTOs directly        ║
║                                                               ║
║  Command Endpoints (POST/PUT/DELETE):                         ║
║    POST   /api/inventory/products                             ║
║    POST   /api/inventory/products/:id/increase-stock          ║
║    POST   /api/inventory/products/:id/decrease-stock          ║
║    PUT    /api/inventory/products/:id/price                   ║
║    DELETE /api/inventory/products/:id                         ║
║                                                               ║
║  Query Endpoints (GET):                                       ║
║    GET    /api/inventory/products                             ║
║    GET    /api/inventory/products/:id                         ║
║    GET    /api/inventory/products/sku/:sku                    ║
║    GET    /api/inventory/products/low-stock                   ║
║    GET    /api/inventory/products/out-of-stock                ║
║    GET    /api/inventory/statistics                           ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export { createApp };
