import {
  ProductId,
  Quantity,
  ProductWriteRepository,
  ProductNotFoundError,
} from '../../../domain';
import { IncreaseStockCommand, DecreaseStockCommand } from '../UpdateStockCommand';

/**
 * CQRS EXAMPLE - Stock Update Handlers
 *
 * Separate handlers for increase and decrease, even though they're similar.
 * This makes the code more explicit and allows for different behaviors:
 * - IncreaseStock might trigger notifications
 * - DecreaseStock might check for low stock alerts
 */

export class IncreaseStockHandler {
  constructor(private readonly productRepository: ProductWriteRepository) {}

  async handle(command: IncreaseStockCommand): Promise<void> {
    const productId = ProductId.create(command.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundError(command.productId);
    }

    product.increaseStock(Quantity.create(command.quantity), command.reason);

    await this.productRepository.save(product);
  }
}

export class DecreaseStockHandler {
  constructor(private readonly productRepository: ProductWriteRepository) {}

  async handle(command: DecreaseStockCommand): Promise<void> {
    const productId = ProductId.create(command.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundError(command.productId);
    }

    // This will throw if there's not enough stock
    product.decreaseStock(Quantity.create(command.quantity), command.reason);

    await this.productRepository.save(product);
  }
}
