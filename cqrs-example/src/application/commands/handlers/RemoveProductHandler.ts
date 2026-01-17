import {
  ProductId,
  ProductWriteRepository,
  ProductNotFoundError,
} from '../../../domain';
import { RemoveProductCommand } from '../RemoveProductCommand';

export class RemoveProductHandler {
  constructor(private readonly productRepository: ProductWriteRepository) {}

  async handle(command: RemoveProductCommand): Promise<void> {
    const productId = ProductId.create(command.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundError(command.productId);
    }

    await this.productRepository.delete(productId);
  }
}
