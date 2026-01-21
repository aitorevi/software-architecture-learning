import { BaseIntegrationEvent } from './IntegrationEvent';

/**
 * Integration events published by the Sales context
 */

export class OrderPlacedIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'sales.order.placed';
  readonly sourceContext = 'sales';

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
      unitPriceInCents: number;
    }>,
    public readonly totalInCents: number,
    public readonly shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    }
  ) {
    super();
  }
}

export class OrderPaidIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'sales.order.paid';
  readonly sourceContext = 'sales';

  constructor(
    public readonly orderId: string,
    public readonly paidAt: string
  ) {
    super();
  }
}

export class OrderCancelledIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'sales.order.cancelled';
  readonly sourceContext = 'sales';

  constructor(
    public readonly orderId: string,
    public readonly reason: string
  ) {
    super();
  }
}
