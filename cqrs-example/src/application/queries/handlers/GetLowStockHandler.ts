import { ProductReadRepository, ProductSummary } from '../../../domain';
import { GetLowStockQuery, GetOutOfStockQuery } from '../GetLowStockQuery';

export class GetLowStockHandler {
  constructor(private readonly readRepository: ProductReadRepository) {}

  async handle(_query: GetLowStockQuery): Promise<ProductSummary[]> {
    return this.readRepository.findLowStock();
  }
}

export class GetOutOfStockHandler {
  constructor(private readonly readRepository: ProductReadRepository) {}

  async handle(_query: GetOutOfStockQuery): Promise<ProductSummary[]> {
    return this.readRepository.findOutOfStock();
  }
}
