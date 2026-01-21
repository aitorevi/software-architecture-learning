import {
  ProductReadRepository,
  ProductReadModel,
  ProductSummary,
  ProductQueryParams,
  PaginatedProducts,
  InventoryStatistics,
} from '../../../domain';

/**
 * CQRS EXAMPLE - In-Memory Read Repository
 *
 * CQRS KEY CONCEPT:
 * The read repository is optimized for QUERIES.
 * It stores data in a format that's easy to query and return.
 *
 * In this example, we store pre-computed read models.
 * In a real system, you might:
 * - Use a different database (Elasticsearch, MongoDB)
 * - Have denormalized data for fast queries
 * - Update via event handlers (eventual consistency)
 *
 * Note: This implementation stores the same data as write side,
 * but the interface is completely different - DTOs, not entities.
 */

export class InMemoryProductReadRepository implements ProductReadRepository {
  private products: Map<string, ProductReadModel> = new Map();

  /**
   * In a real CQRS system, this would be updated via event handlers.
   * Here we provide a sync method for simplicity.
   */
  sync(
    data: Array<{
      id: string;
      sku: string;
      name: string;
      description: string;
      quantity: number;
      priceInCents: number;
      currency: string;
      lowStockThreshold: number;
      createdAt: Date;
      updatedAt: Date;
    }>
  ): void {
    this.products.clear();
    for (const item of data) {
      const readModel: ProductReadModel = {
        id: item.id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        priceInCents: item.priceInCents,
        currency: item.currency,
        lowStockThreshold: item.lowStockThreshold,
        isLowStock: item.quantity <= item.lowStockThreshold,
        isOutOfStock: item.quantity === 0,
        totalValueInCents: item.quantity * item.priceInCents,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      };
      this.products.set(item.id, readModel);
    }
  }

  async findById(id: string): Promise<ProductReadModel | null> {
    return this.products.get(id) ?? null;
  }

  async findBySku(sku: string): Promise<ProductReadModel | null> {
    for (const product of this.products.values()) {
      if (product.sku === sku) {
        return product;
      }
    }
    return null;
  }

  async findAll(params?: ProductQueryParams): Promise<PaginatedProducts> {
    let items = Array.from(this.products.values());

    // Apply filters
    if (params?.search) {
      const search = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search)
      );
    }

    if (params?.lowStockOnly) {
      items = items.filter((p) => p.isLowStock);
    }

    if (params?.outOfStockOnly) {
      items = items.filter((p) => p.isOutOfStock);
    }

    if (params?.minPrice !== undefined) {
      items = items.filter((p) => p.priceInCents >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      items = items.filter((p) => p.priceInCents <= params.maxPrice!);
    }

    // Sort
    const sortBy = params?.sortBy ?? 'createdAt';
    const sortOrder = params?.sortOrder ?? 'desc';
    items.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'price':
          comparison = a.priceInCents - b.priceInCents;
          break;
        case 'createdAt':
          comparison = a.createdAt.localeCompare(b.createdAt);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = items.length;
    const limit = params?.limit ?? 20;
    const offset = params?.offset ?? 0;

    // Apply pagination
    items = items.slice(offset, offset + limit);

    // Convert to summaries
    const summaries: ProductSummary[] = items.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      quantity: p.quantity,
      priceInCents: p.priceInCents,
      isLowStock: p.isLowStock,
    }));

    return { items: summaries, total, limit, offset };
  }

  async findLowStock(): Promise<ProductSummary[]> {
    return Array.from(this.products.values())
      .filter((p) => p.isLowStock && !p.isOutOfStock)
      .map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        quantity: p.quantity,
        priceInCents: p.priceInCents,
        isLowStock: p.isLowStock,
      }));
  }

  async findOutOfStock(): Promise<ProductSummary[]> {
    return Array.from(this.products.values())
      .filter((p) => p.isOutOfStock)
      .map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        quantity: p.quantity,
        priceInCents: p.priceInCents,
        isLowStock: p.isLowStock,
      }));
  }

  async getTotalInventoryValue(): Promise<{
    totalInCents: number;
    currency: string;
  }> {
    let total = 0;
    for (const p of this.products.values()) {
      total += p.totalValueInCents;
    }
    return { totalInCents: total, currency: 'EUR' };
  }

  async getStatistics(): Promise<InventoryStatistics> {
    const products = Array.from(this.products.values());
    return {
      totalProducts: products.length,
      totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
      lowStockCount: products.filter((p) => p.isLowStock && !p.isOutOfStock)
        .length,
      outOfStockCount: products.filter((p) => p.isOutOfStock).length,
      totalValueInCents: products.reduce(
        (sum, p) => sum + p.totalValueInCents,
        0
      ),
      currency: 'EUR',
    };
  }

  // Test helpers
  clear(): void {
    this.products.clear();
  }
}
