import {
  OrderId,
  OrderRepository,
  OrderNotFoundError,
  EventBus,
} from '../../domain';

export interface ShipOrderCommand {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  estimatedDeliveryDays: number;
}

export class ShipOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ShipOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(
      OrderId.create(command.orderId)
    );

    if (!order) {
      throw new OrderNotFoundError(command.orderId);
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(
      estimatedDelivery.getDate() + command.estimatedDeliveryDays
    );

    order.markAsShipped(
      command.trackingNumber,
      command.carrier,
      estimatedDelivery
    );

    await this.orderRepository.save(order);
    await this.eventBus.publishAll(order.pullDomainEvents());
  }
}
