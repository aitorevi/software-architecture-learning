/**
 * CQRS EXAMPLE - Get Product Query
 *
 * CQRS KEY CONCEPT:
 * Queries are objects that represent a REQUEST for data.
 * They are named descriptively: "GetProduct", "ListProducts", "GetLowStock"
 *
 * Queries:
 * - Describe WHAT data is needed
 * - Contain parameters for filtering/options
 * - Don't change system state
 * - Always return data (never fail with business errors)
 * - Can return different shapes based on needs (DTO, summary, etc.)
 *
 * In CQRS, queries go directly to the read model,
 * bypassing the domain entities entirely.
 */

export interface GetProductQuery {
  readonly type: 'GetProduct';
  readonly productId: string;
}

export interface GetProductBySkuQuery {
  readonly type: 'GetProductBySku';
  readonly sku: string;
}

export function createGetProductQuery(productId: string): GetProductQuery {
  return {
    type: 'GetProduct',
    productId,
  };
}

export function createGetProductBySkuQuery(sku: string): GetProductBySkuQuery {
  return {
    type: 'GetProductBySku',
    sku,
  };
}
