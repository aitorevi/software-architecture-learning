import { v4 as uuidv4 } from 'uuid';
import {
  Order,
  OrderId,
  Email,
  Address,
  Money,
  EventBus,
  OrderRepository,
} from '../../domain';

/**
 * EVENT-DRIVEN EXAMPLE - Create Order Use Case
 *
 * EVENT-DRIVEN KEY CONCEPT:
 * After persisting the order, we publish all domain events.
 * This triggers any registered event handlers (email, inventory, etc.)
 *
 * The use case doesn't know or care what happens when events are published.
 * It just publishes and moves on. This is loose coupling!
 */

export interface CreateOrderCommand {
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPriceInCents: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface CreateOrderResult {
  orderId: string;
  total: number;
  status: string;
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateOrderCommand): Promise<CreateOrderResult> {
    // Create the order (domain validation happens here)
    const order = Order.create({
      id: OrderId.create(uuidv4()),
      customerEmail: Email.create(command.customerEmail),
      items: command.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Money.fromCents(item.unitPriceInCents),
      })),
      shippingAddress: Address.create(command.shippingAddress),
    });

    // Persist the order
    await this.orderRepository.save(order);

    // Publish domain events (triggers event handlers)
    const events = order.pullDomainEvents();
    await this.eventBus.publishAll(events);

    return {
      orderId: order.id.value,
      total: order.total.amountInCents,
      status: order.status,
    };
  }
}
