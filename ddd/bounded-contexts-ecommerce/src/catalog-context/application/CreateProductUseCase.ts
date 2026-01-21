import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../shared/kernel';
import {
  IntegrationEventBus,
  ProductCreatedIntegrationEvent,
} from '../../shared/events';
import { Product, ProductRepository } from '../domain';

/**
 * CATALOG CONTEXT - Create Product Use Case
 *
 * BOUNDED CONTEXTS KEY CONCEPT:
 * After creating the product, we publish an INTEGRATION EVENT.
 * This notifies other contexts (Sales, Shipping) about the new product.
 *
 * Other contexts can choose to:
 * - Listen and update their local data (Sales might cache product prices)
 * - Ignore it (Shipping doesn't care about new products)
 */

export interface CreateProductCommand {
  name: string;
  description: string;
  priceInCents: number;
  category: string;
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventBus: IntegrationEventBus
  ) {}

  async execute(command: CreateProductCommand): Promise<{ productId: string }> {
    const product = Product.create({
      id: uuidv4(),
      name: command.name,
      description: command.description,
      price: Money.fromCents(command.priceInCents),
      category: command.category,
    });

    await this.productRepository.save(product);

    // Publish integration event for other contexts
    await this.eventBus.publish(
      new ProductCreatedIntegrationEvent(
        product.id,
        product.name,
        product.price.amountInCents,
        product.price.currency
      )
    );

    return { productId: product.id };
  }
}
