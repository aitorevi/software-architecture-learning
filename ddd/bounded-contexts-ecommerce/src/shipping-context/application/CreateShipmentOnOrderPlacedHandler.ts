import { v4 as uuidv4 } from 'uuid';
import {
  OrderPlacedIntegrationEvent,
  IntegrationEventBus,
  ShipmentCreatedIntegrationEvent,
} from '../../shared/events';
import { Shipment, ShipmentRepository } from '../domain';

/**
 * SHIPPING CONTEXT - Handle Order Placed Event
 *
 * BOUNDED CONTEXTS KEY CONCEPT:
 * This handler listens to integration events from Sales context.
 * When an order is placed, Shipping creates its OWN Shipment entity.
 *
 * The handler TRANSLATES between contexts:
 * - Takes Sales' OrderPlacedEvent
 * - Creates Shipping's Shipment (different model!)
 * - Publishes Shipping's ShipmentCreatedEvent
 *
 * This is how bounded contexts communicate asynchronously.
 */

export class CreateShipmentOnOrderPlacedHandler {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly eventBus: IntegrationEventBus
  ) {}

  async handle(event: OrderPlacedIntegrationEvent): Promise<void> {
    // Translate from Sales domain to Shipping domain
    const shipment = Shipment.createFromOrder({
      id: uuidv4(),
      orderId: event.orderId,
      items: event.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        // Note: We don't store price - Shipping doesn't care about prices!
      })),
      address: event.shippingAddress,
    });

    await this.shipmentRepository.save(shipment);

    // Publish our own integration event
    await this.eventBus.publish(
      new ShipmentCreatedIntegrationEvent(
        shipment.id,
        shipment.orderId,
        '' // No tracking number yet
      )
    );

    console.log(
      `[Shipping] Created shipment ${shipment.id} for order ${event.orderId}`
    );
  }
}
