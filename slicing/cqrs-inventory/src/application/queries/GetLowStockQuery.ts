/**
 * CQRS EXAMPLE - Get Low Stock Query
 *
 * Specialized query for inventory alerts.
 * Returns all products at or below their low stock threshold.
 */

export interface GetLowStockQuery {
  readonly type: 'GetLowStock';
}

export interface GetOutOfStockQuery {
  readonly type: 'GetOutOfStock';
}

export function createGetLowStockQuery(): GetLowStockQuery {
  return { type: 'GetLowStock' };
}

export function createGetOutOfStockQuery(): GetOutOfStockQuery {
  return { type: 'GetOutOfStock' };
}
