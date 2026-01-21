import { BaseIntegrationEvent } from './IntegrationEvent';

/**
 * Integration events published by the Shipping context
 */

export class ShipmentCreatedIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'shipping.shipment.created';
  readonly sourceContext = 'shipping';

  constructor(
    public readonly shipmentId: string,
    public readonly orderId: string,
    public readonly trackingNumber: string
  ) {
    super();
  }
}

export class ShipmentShippedIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'shipping.shipment.shipped';
  readonly sourceContext = 'shipping';

  constructor(
    public readonly shipmentId: string,
    public readonly orderId: string,
    public readonly carrier: string,
    public readonly trackingNumber: string,
    public readonly estimatedDelivery: string
  ) {
    super();
  }
}

export class ShipmentDeliveredIntegrationEvent extends BaseIntegrationEvent {
  readonly eventType = 'shipping.shipment.delivered';
  readonly sourceContext = 'shipping';

  constructor(
    public readonly shipmentId: string,
    public readonly orderId: string,
    public readonly deliveredAt: string
  ) {
    super();
  }
}
