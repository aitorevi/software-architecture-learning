import { OrderCreatedEvent } from '../../domain';

/**
 * EVENT-DRIVEN EXAMPLE - Send Order Confirmation Handler
 *
 * EVENT-DRIVEN KEY CONCEPT:
 * This handler reacts to OrderCreatedEvent by sending a confirmation email.
 *
 * Benefits of event handlers:
 * 1. Loose coupling: Order doesn't know about email
 * 2. Single Responsibility: This handler only sends emails
 * 3. Easy testing: Test handler in isolation
 * 4. Extensibility: Add more handlers without changing Order
 *
 * In production, this would call an email service.
 * Here we just log for demonstration.
 */

export interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export class SendOrderConfirmationHandler {
  constructor(private readonly emailService: EmailService) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    const itemsList = event.items
      .map(
        (item) =>
          `- ${item.productName} x${item.quantity} @ ${(item.unitPriceInCents / 100).toFixed(2)} EUR`
      )
      .join('\n');

    const body = `
Thank you for your order!

Order ID: ${event.orderId}

Items:
${itemsList}

Total: ${(event.totalInCents / 100).toFixed(2)} EUR

Shipping to:
${event.shippingAddress.street}
${event.shippingAddress.postalCode} ${event.shippingAddress.city}
${event.shippingAddress.country}

We will notify you when your order ships.
    `.trim();

    await this.emailService.sendEmail(
      event.customerEmail,
      `Order Confirmation - ${event.orderId}`,
      body
    );

    console.log(`[EMAIL] Sent order confirmation to ${event.customerEmail}`);
  }
}
