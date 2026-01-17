import { v4 as uuidv4 } from 'uuid';
import {
  Product,
  ProductId,
  Sku,
  Quantity,
  Money,
  ProductWriteRepository,
  ProductValidationError,
} from '../../../domain';
import { AddProductCommand } from '../AddProductCommand';

/**
 * CQRS EXAMPLE - Add Product Command Handler
 *
 * CQRS KEY CONCEPT:
 * Command handlers are the "write side" of the application.
 * They:
 * 1. Receive a command
 * 2. Load the aggregate (if needed)
 * 3. Execute business logic via the aggregate
 * 4. Persist changes
 * 5. Return a simple result (often just the ID)
 *
 * Handlers should:
 * - Be focused on one command
 * - Delegate business logic to the domain
 * - Not contain query logic
 */

export interface AddProductResult {
  productId: string;
}

export class AddProductHandler {
  constructor(private readonly productRepository: ProductWriteRepository) {}

  async handle(command: AddProductCommand): Promise<AddProductResult> {
    // Check if SKU already exists
    const sku = Sku.create(command.sku);
    const existingProduct = await this.productRepository.existsBySku(sku);
    if (existingProduct) {
      throw new ProductValidationError(
        `Product with SKU ${command.sku} already exists`
      );
    }

    // Create the product (domain validates and emits events)
    const product = Product.create({
      id: ProductId.create(uuidv4()),
      sku,
      name: command.name,
      description: command.description,
      initialQuantity: Quantity.create(command.initialQuantity),
      price: Money.fromCents(command.priceInCents, command.currency ?? 'EUR'),
      lowStockThreshold: command.lowStockThreshold,
    });

    // Persist
    await this.productRepository.save(product);

    return { productId: product.id.value };
  }
}
