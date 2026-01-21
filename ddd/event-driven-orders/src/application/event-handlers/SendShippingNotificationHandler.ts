import { OrderShippedEvent } from '../../domain';
import { EmailService } from './SendOrderConfirmationHandler';

/**
 * EVENT-DRIVEN EXAMPLE - Send Shipping Notification Handler
 *
 * Sends an email when an order is shipped with tracking information.
 */

export class SendShippingNotificationHandler {
  constructor(private readonly emailService: EmailService) {}

  // We need the customer email, which isn't in the event.
  // In a real system, you'd either:
  // 1. Include it in the event
  // 2. Look it up from a read model
  // 3. Store it in an event-sourced projection
  // For simplicity, we'll pass it during registration.

  createHandler(getCustomerEmail: (orderId: string) => Promise<string>) {
    return async (event: OrderShippedEvent): Promise<void> => {
      const email = await getCustomerEmail(event.orderId);

      const body = `
Your order has shipped!

Order ID: ${event.orderId}
Carrier: ${event.carrier}
Tracking Number: ${event.trackingNumber}

Estimated Delivery: ${event.estimatedDelivery.toLocaleDateString()}

Track your package: https://track.example.com/${event.trackingNumber}
      `.trim();

      await this.emailService.sendEmail(
        email,
        `Your Order Has Shipped - ${event.orderId}`,
        body
      );

      console.log(`[EMAIL] Sent shipping notification to ${email}`);
    };
  }
}
