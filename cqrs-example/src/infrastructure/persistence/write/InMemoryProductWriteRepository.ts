import {
  Product,
  ProductId,
  Sku,
  Quantity,
  Money,
  ProductProps,
  ProductWriteRepository,
} from '../../../domain';

/**
 * CQRS EXAMPLE - In-Memory Write Repository
 *
 * CQRS KEY CONCEPT:
 * The write repository stores the full aggregate.
 * It's optimized for loading and saving complete entities,
 * not for complex queries.
 *
 * In a real CQRS system with separate databases:
 * - Write side might use PostgreSQL with normalized tables
 * - Read side might use Elasticsearch or MongoDB for fast queries
 *
 * This implementation keeps both in memory for simplicity,
 * but the separation is still clear in the code structure.
 */

interface StoredProduct {
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
}

export class InMemoryProductWriteRepository implements ProductWriteRepository {
  private products: Map<string, StoredProduct> = new Map();

  async save(product: Product): Promise<void> {
    this.products.set(product.id.value, {
      id: product.id.value,
      sku: product.sku.value,
      name: product.name,
      description: product.description,
      quantity: product.quantity.value,
      priceInCents: product.price.amountInCents,
      currency: product.price.currency,
      lowStockThreshold: product.lowStockThreshold,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

  async findById(id: ProductId): Promise<Product | null> {
    const data = this.products.get(id.value);
    if (!data) {
      return null;
    }
    return this.toDomain(data);
  }

  async findBySku(sku: Sku): Promise<Product | null> {
    for (const data of this.products.values()) {
      if (data.sku === sku.value) {
        return this.toDomain(data);
      }
    }
    return null;
  }

  async existsBySku(sku: Sku): Promise<boolean> {
    for (const data of this.products.values()) {
      if (data.sku === sku.value) {
        return true;
      }
    }
    return false;
  }

  async delete(id: ProductId): Promise<void> {
    this.products.delete(id.value);
  }

  private toDomain(data: StoredProduct): Product {
    return Product.reconstitute({
      id: ProductId.create(data.id),
      sku: Sku.create(data.sku),
      name: data.name,
      description: data.description,
      quantity: Quantity.create(data.quantity),
      price: Money.fromCents(data.priceInCents, data.currency),
      lowStockThreshold: data.lowStockThreshold,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  // Test helpers
  clear(): void {
    this.products.clear();
  }

  // Expose for read repository sync (in real system, this would be via events)
  getAll(): StoredProduct[] {
    return Array.from(this.products.values());
  }
}
