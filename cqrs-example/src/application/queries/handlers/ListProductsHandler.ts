import { ProductReadRepository, PaginatedProducts } from '../../../domain';
import { ListProductsQuery } from '../ListProductsQuery';

export class ListProductsHandler {
  constructor(private readonly readRepository: ProductReadRepository) {}

  async handle(query: ListProductsQuery): Promise<PaginatedProducts> {
    return this.readRepository.findAll({
      search: query.search,
      lowStockOnly: query.lowStockOnly,
      outOfStockOnly: query.outOfStockOnly,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
