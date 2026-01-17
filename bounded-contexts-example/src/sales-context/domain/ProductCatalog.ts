import { Money } from '../../shared/kernel';

/**
 * SALES CONTEXT - Product Catalog Port (Anti-Corruption Layer)
 *
 * BOUNDED CONTEXTS KEY CONCEPT:
 * This is the ANTI-CORRUPTION LAYER (ACL).
 *
 * Instead of depending directly on the Catalog context's domain,
 * we define our OWN interface for what we need from products.
 *
 * Benefits:
 * 1. Sales context is not coupled to Catalog's internal model
 * 2. We only expose what Sales needs (name, price) - no category, description
 * 3. If Catalog changes internally, only the adapter needs to change
 * 4. We can add Sales-specific logic (e.g., caching, validation)
 *
 * The adapter (in infrastructure) translates between contexts.
 */

/**
 * ProductInfo - What Sales needs to know about a product
 *
 * This is NOT the same as Catalog's Product entity!
 * It's a simplified view tailored for Sales needs.
 */
export interface ProductInfo {
  id: string;
  name: string;
  price: Money;
  isAvailable: boolean;
}

/**
 * ProductCatalog - Port for getting product information
 *
 * The Sales context uses this interface to get product data.
 * It doesn't know or care HOW the data is retrieved.
 */
export interface ProductCatalog {
  /**
   * Gets product info for creating an order
   */
  getProduct(productId: string): Promise<ProductInfo | null>;

  /**
   * Checks if products are available for ordering
   */
  areProductsAvailable(productIds: string[]): Promise<Map<string, boolean>>;

  /**
   * Gets current prices for products
   */
  getPrices(productIds: string[]): Promise<Map<string, Money>>;
}
