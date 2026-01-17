import { ProductReadRepository, InventoryStatistics } from '../../../domain';
import {
  GetInventoryStatisticsQuery,
  GetTotalInventoryValueQuery,
} from '../GetInventoryStatisticsQuery';

export class GetInventoryStatisticsHandler {
  constructor(private readonly readRepository: ProductReadRepository) {}

  async handle(_query: GetInventoryStatisticsQuery): Promise<InventoryStatistics> {
    return this.readRepository.getStatistics();
  }
}

export class GetTotalInventoryValueHandler {
  constructor(private readonly readRepository: ProductReadRepository) {}

  async handle(
    _query: GetTotalInventoryValueQuery
  ): Promise<{ totalInCents: number; currency: string }> {
    return this.readRepository.getTotalInventoryValue();
  }
}
