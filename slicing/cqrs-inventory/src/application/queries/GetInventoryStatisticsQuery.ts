/**
 * CQRS EXAMPLE - Get Inventory Statistics Query
 *
 * Returns aggregate statistics about the inventory.
 * This is a good example of a query that would be expensive
 * on the write model but cheap on an optimized read model.
 */

export interface GetInventoryStatisticsQuery {
  readonly type: 'GetInventoryStatistics';
}

export interface GetTotalInventoryValueQuery {
  readonly type: 'GetTotalInventoryValue';
}

export function createGetInventoryStatisticsQuery(): GetInventoryStatisticsQuery {
  return { type: 'GetInventoryStatistics' };
}

export function createGetTotalInventoryValueQuery(): GetTotalInventoryValueQuery {
  return { type: 'GetTotalInventoryValue' };
}
