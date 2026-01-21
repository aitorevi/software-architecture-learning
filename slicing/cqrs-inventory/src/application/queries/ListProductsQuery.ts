/**
 * CQRS EXAMPLE - List Products Query
 *
 * Supports filtering, sorting, and pagination.
 * All parameters are optional.
 */

export interface ListProductsQuery {
  readonly type: 'ListProducts';
  readonly search?: string;
  readonly lowStockOnly?: boolean;
  readonly outOfStockOnly?: boolean;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly sortBy?: 'name' | 'quantity' | 'price' | 'createdAt';
  readonly sortOrder?: 'asc' | 'desc';
  readonly limit?: number;
  readonly offset?: number;
}

export function createListProductsQuery(
  params?: Omit<ListProductsQuery, 'type'>
): ListProductsQuery {
  return {
    type: 'ListProducts',
    ...params,
  };
}
