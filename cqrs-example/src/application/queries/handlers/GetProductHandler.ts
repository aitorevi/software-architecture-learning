import { ProductReadRepository, ProductReadModel } from '../../../domain';
import { GetProductQuery, GetProductBySkuQuery } from '../GetProductQuery';

/**
 * CQRS EXAMPLE - Get Product Query Handler
 *
 * CQRS KEY CONCEPT:
 * Query handlers read from the READ MODEL, not from the domain entities.
 * They return DTOs directly from the read repository.
 *
 * Benefits:
 * - No entity instantiation overhead
 * - Data is already in the right shape
 * - Can use optimized read indexes
 * - Queries are fast and simple
 */

export class GetProductHandler {
  constructor(private readonly readRepository: ProductReadRepository) {}

  async handle(query: GetProductQuery): Promise<ProductReadModel | null> {
    return this.readRepository.findById(query.productId);
  }
}

export class GetProductBySkuHandler {
  constructor(private readonly readRepository: ProductReadRepository) {}

  async handle(query: GetProductBySkuQuery): Promise<ProductReadModel | null> {
    return this.readRepository.findBySku(query.sku);
  }
}
