import { BaseDomainEvent } from './DomainEvent';
import { AddressProps } from '../value-objects';

/**
 * EVENT-DRIVEN EXAMPLE - Order Domain Events
 *
 * EVENT-DRIVEN KEY CONCEPT:
 * These events describe things that happened in the Order lifecycle.
 * Other parts of the system can subscribe to these events and react.
 *
 * Event Flow Example:
 * 1. OrderCreated → Send confirmation email
 * 2. PaymentReceived → Update order status, notify warehouse
 * 3. OrderShipped → Send shipping notification to customer
 *
 * Benefits:
 * - Loose coupling: Order doesn't know about Email or Warehouse
 * - Extensibility: Add new handlers without changing Order
 * - Audit trail: Events are a record of what happened
 */

export class OrderCreatedEvent extends BaseDomainEvent {
  readonly eventName = 'order.created';

  constructor(
    public readonly orderId: string,
    public readonly customerEmail: string,
    public readonly items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPriceInCents: number;
    }>,
    public readonly totalInCents: number,
    public readonly shippingAddress: AddressProps
  ) {
    super();
  }

  get aggregateId(): string {
    return this.orderId;
  }

  protected getPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId,
      customerEmail: this.customerEmail,
      items: this.items,
      totalInCents: this.totalInCents,
      shippingAddress: this.shippingAddress,
    };
  }
}

export class PaymentReceivedEvent extends BaseDomainEvent {
  readonly eventName = 'order.payment_received';

  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
    public readonly amountInCents: number,
    public readonly paymentMethod: string
  ) {
    super();
  }

  get aggregateId(): string {
    return this.orderId;
  }

  protected getPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId,
      paymentId: this.paymentId,
      amountInCents: this.amountInCents,
      paymentMethod: this.paymentMethod,
    };
  }
}

export class OrderShippedEvent extends BaseDomainEvent {
  readonly eventName = 'order.shipped';

  constructor(
    public readonly orderId: string,
    public readonly trackingNumber: string,
    public readonly carrier: string,
    public readonly estimatedDelivery: Date
  ) {
    super();
  }

  get aggregateId(): string {
    return this.orderId;
  }

  protected getPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId,
      trackingNumber: this.trackingNumber,
      carrier: this.carrier,
      estimatedDelivery: this.estimatedDelivery.toISOString(),
    };
  }
}

export class OrderDeliveredEvent extends BaseDomainEvent {
  readonly eventName = 'order.delivered';

  constructor(
    public readonly orderId: string,
    public readonly deliveredAt: Date
  ) {
    super();
  }

  get aggregateId(): string {
    return this.orderId;
  }

  protected getPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId,
      deliveredAt: this.deliveredAt.toISOString(),
    };
  }
}

export class OrderCancelledEvent extends BaseDomainEvent {
  readonly eventName = 'order.cancelled';

  constructor(
    public readonly orderId: string,
    public readonly reason: string,
    public readonly refundAmountInCents: number
  ) {
    super();
  }

  get aggregateId(): string {
    return this.orderId;
  }

  protected getPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId,
      reason: this.reason,
      refundAmountInCents: this.refundAmountInCents,
    };
  }
}
