import { GetProductQuery, GetProductBySkuQuery } from './GetProductQuery';
import { ListProductsQuery } from './ListProductsQuery';
import { GetLowStockQuery, GetOutOfStockQuery } from './GetLowStockQuery';
import { GetInventoryStatisticsQuery, GetTotalInventoryValueQuery } from './GetInventoryStatisticsQuery';

export {
  GetProductQuery,
  GetProductBySkuQuery,
  createGetProductQuery,
  createGetProductBySkuQuery,
} from './GetProductQuery';

export {
  ListProductsQuery,
  createListProductsQuery,
} from './ListProductsQuery';

export {
  GetLowStockQuery,
  GetOutOfStockQuery,
  createGetLowStockQuery,
  createGetOutOfStockQuery,
} from './GetLowStockQuery';

export {
  GetInventoryStatisticsQuery,
  GetTotalInventoryValueQuery,
  createGetInventoryStatisticsQuery,
  createGetTotalInventoryValueQuery,
} from './GetInventoryStatisticsQuery';

/**
 * Union type of all queries
 */
export type Query =
  | GetProductQuery
  | GetProductBySkuQuery
  | ListProductsQuery
  | GetLowStockQuery
  | GetOutOfStockQuery
  | GetInventoryStatisticsQuery
  | GetTotalInventoryValueQuery;
