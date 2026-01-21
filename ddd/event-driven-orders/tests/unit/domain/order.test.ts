import { describe, it, expect } from 'vitest';
import {
  Order,
  OrderId,
  Email,
  Address,
  Money,
  OrderStatus,
  OrderCreatedEvent,
  PaymentReceivedEvent,
  OrderShippedEvent,
  OrderValidationError,
} from '../../../src/domain';

describe('Order Entity', () => {
  const createTestOrder = () => {
    return Order.create({
      id: OrderId.create('order-1'),
      customerEmail: Email.create('test@example.com'),
      items: [
        {
          productId: 'prod-1',
          productName: 'Widget',
          quantity: 2,
          unitPrice: Money.fromCents(1000),
        },
      ],
      shippingAddress: Address.create({
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      }),
    });
  };

  describe('create', () => {
    it('should create an order with valid data', () => {
      const order = createTestOrder();

      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.customerEmail.value).toBe('test@example.com');
      expect(order.items).toHaveLength(1);
      expect(order.total.amountInCents).toBe(2000); // 2 * 1000
    });

    it('should emit OrderCreatedEvent', () => {
      const order = createTestOrder();
      const events = order.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(OrderCreatedEvent);
      expect((events[0] as OrderCreatedEvent).customerEmail).toBe(
        'test@example.com'
      );
    });

    it('should throw error for empty items', () => {
      expect(() =>
        Order.create({
          id: OrderId.create('order-1'),
          customerEmail: Email.create('test@example.com'),
          items: [],
          shippingAddress: Address.create({
            street: '123 Main St',
            city: 'Madrid',
            postalCode: '28001',
            country: 'ES',
          }),
        })
      ).toThrow(OrderValidationError);
    });
  });

  describe('markAsPaid', () => {
    it('should transition to PAID status', () => {
      const order = createTestOrder();
      order.pullDomainEvents(); // Clear creation event

      order.markAsPaid('pay-123', 'credit_card');

      expect(order.status).toBe(OrderStatus.PAID);
      expect(order.paymentId).toBe('pay-123');
    });

    it('should emit PaymentReceivedEvent', () => {
      const order = createTestOrder();
      order.pullDomainEvents();

      order.markAsPaid('pay-123', 'credit_card');
      const events = order.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PaymentReceivedEvent);
    });

    it('should not allow paying twice', () => {
      const order = createTestOrder();
      order.markAsPaid('pay-123', 'credit_card');

      expect(() => order.markAsPaid('pay-456', 'credit_card')).toThrow();
    });
  });

  describe('markAsShipped', () => {
    it('should transition to SHIPPED status', () => {
      const order = createTestOrder();
      order.markAsPaid('pay-123', 'credit_card');
      order.pullDomainEvents();

      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

      order.markAsShipped('TRK-123', 'DHL', estimatedDelivery);

      expect(order.status).toBe(OrderStatus.SHIPPED);
      expect(order.trackingNumber).toBe('TRK-123');
    });

    it('should emit OrderShippedEvent', () => {
      const order = createTestOrder();
      order.markAsPaid('pay-123', 'credit_card');
      order.pullDomainEvents();

      const estimatedDelivery = new Date();
      order.markAsShipped('TRK-123', 'DHL', estimatedDelivery);
      const events = order.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(OrderShippedEvent);
    });

    it('should not allow shipping unpaid order', () => {
      const order = createTestOrder();

      expect(() =>
        order.markAsShipped('TRK-123', 'DHL', new Date())
      ).toThrow();
    });
  });

  describe('cancel', () => {
    it('should allow cancelling pending order', () => {
      const order = createTestOrder();
      order.pullDomainEvents();

      order.cancel('Customer request');

      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(order.isCancelled).toBe(true);
    });

    it('should not allow cancelling shipped order', () => {
      const order = createTestOrder();
      order.markAsPaid('pay-123', 'credit_card');
      order.markAsShipped('TRK-123', 'DHL', new Date());

      expect(() => order.cancel('Changed mind')).toThrow();
    });
  });
});
