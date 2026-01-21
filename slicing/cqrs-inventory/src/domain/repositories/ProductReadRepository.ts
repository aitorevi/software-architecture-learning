/**
 * CQRS EXAMPLE - Product Read Repository (Port)
 *
 * CQRS KEY CONCEPT:
 * This repository is for the READ MODEL (queries).
 * It returns DTOs/projections optimized for display, not domain entities.
 *
 * Key differences from Write Repository:
 *
 * 1. Returns DTOs, not entities
 *    - Read model doesn't need behavior methods
 *    - DTOs are flat, easy to serialize
 *    - Can include computed fields
 *
 * 2. Optimized for queries
 *    - Supports filtering, sorting, pagination
 *    - Can have denormalized data for faster queries
 *    - Multiple "views" of the same data
 *
 * 3. Eventually consistent
 *    - Updated asynchronously via events (in some implementations)
 *    - May lag behind the write model slightly
 *    - That's OK for reads!
 */

/**
 * ProductReadModel - DTO for product queries
 *
 * This is NOT the domain entity. It's a read-optimized projection
 * that can have:
 * - Computed fields (like isLowStock, totalValue)
 * - Denormalized data (like categoryName instead of categoryId)
 * - Formatted data (like formatted price string)
 */
export interface ProductReadModel {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  priceInCents: number;
  currency: string;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  totalValueInCents: number; // quantity * price
  createdAt: string;
  updatedAt: string;
}

/**
 * ProductSummary - Lightweight projection for lists
 */
export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  priceInCents: number;
  isLowStock: boolean;
}

/**
 * Query parameters for filtering products
 */
export interface ProductQueryParams {
  search?: string;
  lowStockOnly?: boolean;
  outOfStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'quantity' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Paginated result for product lists
 */
export interface PaginatedProducts {
  items: ProductSummary[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * ProductReadRepository - Interface for read operations
 *
 * All methods return DTOs, not domain entities.
 * This is the query side of CQRS.
 */
export interface ProductReadRepository {
  /**
   * Gets a single product's read model by ID.
   */
  findById(id: string): Promise<ProductReadModel | null>;

  /**
   * Gets a single product's read model by SKU.
   */
  findBySku(sku: string): Promise<ProductReadModel | null>;

  /**
   * Lists products with optional filtering and pagination.
   */
  findAll(params?: ProductQueryParams): Promise<PaginatedProducts>;

  /**
   * Gets all products with low stock (for alerts/reports).
   */
  findLowStock(): Promise<ProductSummary[]>;

  /**
   * Gets all products that are out of stock.
   */
  findOutOfStock(): Promise<ProductSummary[]>;

  /**
   * Gets the total inventory value (sum of quantity * price for all products).
   */
  getTotalInventoryValue(): Promise<{ totalInCents: number; currency: string }>;

  /**
   * Gets inventory statistics (total products, low stock count, etc.)
   */
  getStatistics(): Promise<InventoryStatistics>;
}

export interface InventoryStatistics {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValueInCents: number;
  currency: string;
}
