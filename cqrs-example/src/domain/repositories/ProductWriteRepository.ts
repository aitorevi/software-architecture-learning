import { Product } from '../entities';
import { ProductId, Sku } from '../value-objects';

/**
 * CQRS EXAMPLE - Product Write Repository (Port)
 *
 * CQRS KEY CONCEPT:
 * This repository is for the WRITE MODEL only.
 * It's used by commands to load and persist aggregates.
 *
 * Notice what it does NOT have:
 * - Complex queries (those go to the read side)
 * - Filtering, sorting, pagination (read side concerns)
 * - Projections or custom data shapes (read side)
 *
 * It only has:
 * - Save (persist the aggregate)
 * - FindById (load the aggregate for modification)
 * - FindBySku (find by business key)
 * - Delete (remove the aggregate)
 *
 * This keeps the write repository simple and focused on
 * aggregate operations.
 */
export interface ProductWriteRepository {
  /**
   * Persists a product (create or update).
   * Also responsible for publishing domain events if needed.
   */
  save(product: Product): Promise<void>;

  /**
   * Finds a product by its ID for modification.
   * Returns the full aggregate with all data needed for business operations.
   */
  findById(id: ProductId): Promise<Product | null>;

  /**
   * Finds a product by its SKU (business key).
   */
  findBySku(sku: Sku): Promise<Product | null>;

  /**
   * Checks if a SKU is already in use.
   */
  existsBySku(sku: Sku): Promise<boolean>;

  /**
   * Removes a product from the system.
   */
  delete(id: ProductId): Promise<void>;
}
