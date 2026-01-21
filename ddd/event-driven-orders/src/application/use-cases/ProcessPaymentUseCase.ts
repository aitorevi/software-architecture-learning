import {
  OrderId,
  OrderRepository,
  OrderNotFoundError,
  EventBus,
} from '../../domain';

export interface ProcessPaymentCommand {
  orderId: string;
  paymentId: string;
  paymentMethod: string;
}

export class ProcessPaymentUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<void> {
    const order = await this.orderRepository.findById(
      OrderId.create(command.orderId)
    );

    if (!order) {
      throw new OrderNotFoundError(command.orderId);
    }

    // Mark as paid (domain validates state transition)
    order.markAsPaid(command.paymentId, command.paymentMethod);

    // Persist
    await this.orderRepository.save(order);

    // Publish events (PaymentReceivedEvent)
    await this.eventBus.publishAll(order.pullDomainEvents());
  }
}
