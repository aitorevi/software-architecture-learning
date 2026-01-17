import {
  ProductId,
  Money,
  ProductWriteRepository,
  ProductNotFoundError,
} from '../../../domain';
import { UpdatePriceCommand } from '../UpdatePriceCommand';

export class UpdatePriceHandler {
  constructor(private readonly productRepository: ProductWriteRepository) {}

  async handle(command: UpdatePriceCommand): Promise<void> {
    const productId = ProductId.create(command.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundError(command.productId);
    }

    const newPrice = Money.fromCents(
      command.newPriceInCents,
      command.currency ?? 'EUR'
    );

    product.updatePrice(newPrice);

    await this.productRepository.save(product);
  }
}
