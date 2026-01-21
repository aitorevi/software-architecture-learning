import { Router, Request, Response } from 'express';
import {
  AddProductHandler,
  IncreaseStockHandler,
  DecreaseStockHandler,
  UpdatePriceHandler,
  RemoveProductHandler,
  GetProductHandler,
  GetProductBySkuHandler,
  ListProductsHandler,
  GetLowStockHandler,
  GetOutOfStockHandler,
  GetInventoryStatisticsHandler,
} from '../../application';
import {
  ProductValidationError,
  ProductNotFoundError,
  QuantityError,
  SkuError,
  MoneyError,
} from '../../domain';

/**
 * CQRS EXAMPLE - Inventory Controller
 *
 * CQRS KEY CONCEPT:
 * The controller separates command and query endpoints:
 *
 * Commands (POST, PUT, DELETE):
 * - Create/modify resources
 * - Return minimal data (often just ID or success)
 * - May take longer (consistency requirements)
 *
 * Queries (GET):
 * - Read-only operations
 * - Return rich data
 * - Should be fast (read-optimized storage)
 */
export class InventoryController {
  public readonly router: Router;

  constructor(
    // Command handlers
    private readonly addProductHandler: AddProductHandler,
    private readonly increaseStockHandler: IncreaseStockHandler,
    private readonly decreaseStockHandler: DecreaseStockHandler,
    private readonly updatePriceHandler: UpdatePriceHandler,
    private readonly removeProductHandler: RemoveProductHandler,
    // Query handlers
    private readonly getProductHandler: GetProductHandler,
    private readonly getProductBySkuHandler: GetProductBySkuHandler,
    private readonly listProductsHandler: ListProductsHandler,
    private readonly getLowStockHandler: GetLowStockHandler,
    private readonly getOutOfStockHandler: GetOutOfStockHandler,
    private readonly getStatisticsHandler: GetInventoryStatisticsHandler
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // === COMMAND ENDPOINTS (Write Operations) ===
    this.router.post('/products', this.addProduct.bind(this));
    this.router.post('/products/:id/increase-stock', this.increaseStock.bind(this));
    this.router.post('/products/:id/decrease-stock', this.decreaseStock.bind(this));
    this.router.put('/products/:id/price', this.updatePrice.bind(this));
    this.router.delete('/products/:id', this.removeProduct.bind(this));

    // === QUERY ENDPOINTS (Read Operations) ===
    this.router.get('/products', this.listProducts.bind(this));
    this.router.get('/products/low-stock', this.getLowStock.bind(this));
    this.router.get('/products/out-of-stock', this.getOutOfStock.bind(this));
    this.router.get('/statistics', this.getStatistics.bind(this));
    this.router.get('/products/sku/:sku', this.getProductBySku.bind(this));
    this.router.get('/products/:id', this.getProduct.bind(this));
  }

  // === COMMAND HANDLERS ===

  private async addProduct(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.addProductHandler.handle({
        type: 'AddProduct',
        sku: req.body.sku,
        name: req.body.name,
        description: req.body.description,
        initialQuantity: req.body.initialQuantity,
        priceInCents: req.body.priceInCents,
        currency: req.body.currency,
        lowStockThreshold: req.body.lowStockThreshold,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async increaseStock(req: Request, res: Response): Promise<void> {
    try {
      await this.increaseStockHandler.handle({
        type: 'IncreaseStock',
        productId: req.params.id,
        quantity: req.body.quantity,
        reason: req.body.reason,
      });
      res.json({ success: true });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async decreaseStock(req: Request, res: Response): Promise<void> {
    try {
      await this.decreaseStockHandler.handle({
        type: 'DecreaseStock',
        productId: req.params.id,
        quantity: req.body.quantity,
        reason: req.body.reason,
      });
      res.json({ success: true });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async updatePrice(req: Request, res: Response): Promise<void> {
    try {
      await this.updatePriceHandler.handle({
        type: 'UpdatePrice',
        productId: req.params.id,
        newPriceInCents: req.body.priceInCents,
        currency: req.body.currency,
      });
      res.json({ success: true });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async removeProduct(req: Request, res: Response): Promise<void> {
    try {
      await this.removeProductHandler.handle({
        type: 'RemoveProduct',
        productId: req.params.id,
      });
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // === QUERY HANDLERS ===

  private async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getProductHandler.handle({
        type: 'GetProduct',
        productId: req.params.id,
      });
      if (!result) {
        res.status(404).json({ success: false, error: 'Product not found' });
        return;
      }
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getProductBySkuHandler.handle({
        type: 'GetProductBySku',
        sku: req.params.sku,
      });
      if (!result) {
        res.status(404).json({ success: false, error: 'Product not found' });
        return;
      }
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listProductsHandler.handle({
        type: 'ListProducts',
        search: req.query.search as string | undefined,
        lowStockOnly: req.query.lowStockOnly === 'true',
        outOfStockOnly: req.query.outOfStockOnly === 'true',
        minPrice: req.query.minPrice
          ? parseInt(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseInt(req.query.maxPrice as string)
          : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset
          ? parseInt(req.query.offset as string)
          : undefined,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getLowStock(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getLowStockHandler.handle({
        type: 'GetLowStock',
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getOutOfStock(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getOutOfStockHandler.handle({
        type: 'GetOutOfStock',
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getStatisticsHandler.handle({
        type: 'GetInventoryStatistics',
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (
      error instanceof ProductValidationError ||
      error instanceof QuantityError ||
      error instanceof SkuError ||
      error instanceof MoneyError
    ) {
      res.status(400).json({ success: false, error: error.message });
    } else if (error instanceof ProductNotFoundError) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
