import { PaymentReceivedEvent, OrderCreatedEvent } from '../../domain';

/**
 * EVENT-DRIVEN EXAMPLE - Update Inventory Handler
 *
 * This handler reacts to PaymentReceivedEvent by reserving inventory.
 *
 * In a real system, this would call an inventory service to:
 * - Reserve items when order is created
 * - Confirm reservation when payment is received
 * - Release reservation if order is cancelled
 */

export interface InventoryService {
  reserveItems(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<void>;
  confirmReservation(orderId: string): Promise<void>;
  releaseReservation(orderId: string): Promise<void>;
}

// Store order items temporarily (in real system, this would be in a database)
const orderItems = new Map<
  string,
  Array<{ productId: string; quantity: number }>
>();

export class ReserveInventoryOnOrderCreatedHandler {
  constructor(private readonly inventoryService: InventoryService) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    const items = event.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    // Store for later confirmation
    orderItems.set(event.orderId, items);

    // Reserve inventory
    await this.inventoryService.reserveItems(items);

    console.log(
      `[INVENTORY] Reserved items for order ${event.orderId}:`,
      items.map((i) => `${i.productId} x${i.quantity}`).join(', ')
    );
  }
}

export class ConfirmInventoryOnPaymentHandler {
  constructor(private readonly inventoryService: InventoryService) {}

  async handle(event: PaymentReceivedEvent): Promise<void> {
    await this.inventoryService.confirmReservation(event.orderId);

    console.log(`[INVENTORY] Confirmed reservation for order ${event.orderId}`);
  }
}
