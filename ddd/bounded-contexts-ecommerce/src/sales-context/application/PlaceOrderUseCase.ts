import { v4 as uuidv4 } from 'uuid';
import {
  IntegrationEventBus,
  OrderPlacedIntegrationEvent,
} from '../../shared/events';
import { Order, OrderRepository, ProductCatalog } from '../domain';

/**
 * SALES CONTEXT - Place Order Use Case
 *
 * BOUNDED CONTEXTS KEY CONCEPT:
 * This use case:
 * 1. Uses the ProductCatalog ACL to get product info
 * 2. Creates the order in Sales context's terms
 * 3. Publishes integration event for other contexts (Shipping)
 */

export interface PlaceOrderCommand {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export class PlaceOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productCatalog: ProductCatalog,
    private readonly eventBus: IntegrationEventBus
  ) {}

  async execute(command: PlaceOrderCommand): Promise<{ orderId: string }> {
    // Get product info from Catalog via ACL
    const orderItems = await Promise.all(
      command.items.map(async (item) => {
        const product = await this.productCatalog.getProduct(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (!product.isAvailable) {
          throw new Error(`Product not available: ${item.productId}`);
        }

        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price, // Capture current price
        };
      })
    );

    // Create order in Sales terms
    const order = Order.create({
      id: uuidv4(),
      customerId: command.customerId,
      items: orderItems,
      shippingAddress: command.shippingAddress,
    });

    await this.orderRepository.save(order);

    // Publish integration event for Shipping context
    await this.eventBus.publish(
      new OrderPlacedIntegrationEvent(
        order.id,
        order.customerId,
        orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceInCents: item.unitPrice.amountInCents,
        })),
        order.total.amountInCents,
        order.shippingAddress
      )
    );

    return { orderId: order.id };
  }
}
