import { describe, it, expect } from 'vitest';
import { Order, OrderStatus, Money } from '../../../src';

/**
 * SALES CONTEXT - Order Tests
 *
 * These tests demonstrate the Sales context's model:
 * - Order focuses on commercial transaction
 * - OrderItem caches product info (name, price) at order time
 * - Uses productId reference, NOT Product entity from Catalog
 * - This is the Anti-Corruption Layer in action
 */
describe('Sales Context - Order', () => {
  const validAddress = {
    street: '123 Main St',
    city: 'Madrid',
    postalCode: '28001',
    country: 'Spain',
  };

  const createOrderItem = (productId: string, quantity: number, priceInCents: number) => ({
    productId,
    productName: `Product ${productId}`,
    quantity,
    unitPrice: Money.fromCents(priceInCents, 'EUR'),
  });

  describe('create', () => {
    it('should create an order with items', () => {
      const items = [
        createOrderItem('prod-1', 2, 1000),
        createOrderItem('prod-2', 1, 2000),
      ];

      const order = Order.create({
        id: 'order-1',
        customerId: 'customer-1',
        items,
        shippingAddress: validAddress,
      });

      expect(order.id).toBe('order-1');
      expect(order.customerId).toBe('customer-1');
      expect(order.items).toHaveLength(2);
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('should reject order with no items', () => {
      expect(() =>
        Order.create({
          id: 'order-1',
          customerId: 'customer-1',
          items: [],
          shippingAddress: validAddress,
        })
      ).toThrow('Order must have at least one item');
    });

    it('should cache product info in OrderItem', () => {
      const items = [createOrderItem('prod-1', 2, 1500)];

      const order = Order.create({
        id: 'order-1',
        customerId: 'customer-1',
        items,
        shippingAddress: validAddress,
      });

      const item = order.items[0];
      expect(item.productId).toBe('prod-1');
      expect(item.productName).toBe('Product prod-1');
      expect(item.unitPrice.amountInCents).toBe(1500);
    });
  });

  describe('total', () => {
    it('should calculate total from items', () => {
      const items = [
        createOrderItem('prod-1', 2, 1000), // 2 x 10€ = 20€
        createOrderItem('prod-2', 1, 2000), // 1 x 20€ = 20€
      ];

      const order = Order.create({
        id: 'order-1',
        customerId: 'customer-1',
        items,
        shippingAddress: validAddress,
      });

      expect(order.total.amountInCents).toBe(4000); // 40€
    });
  });

  describe('markAsPaid', () => {
    it('should transition from PENDING to PAID', () => {
      const items = [createOrderItem('prod-1', 1, 1000)];
      const order = Order.create({
        id: 'order-1',
        customerId: 'customer-1',
        items,
        shippingAddress: validAddress,
      });

      expect(order.status).toBe(OrderStatus.PENDING);

      order.markAsPaid();

      expect(order.status).toBe(OrderStatus.PAID);
    });

    it('should reject if order is not pending', () => {
      const items = [createOrderItem('prod-1', 1, 1000)];
      const order = Order.create({
        id: 'order-1',
        customerId: 'customer-1',
        items,
        shippingAddress: validAddress,
      });

      order.markAsPaid();

      expect(() => order.markAsPaid()).toThrow('Order is not pending');
    });
  });

  describe('cancel', () => {
    it('should cancel pending order', () => {
      const items = [createOrderItem('prod-1', 1, 1000)];
      const order = Order.create({
        id: 'order-1',
        customerId: 'customer-1',
        items,
        shippingAddress: validAddress,
      });

      order.cancel('Customer request');

      expect(order.status).toBe(OrderStatus.CANCELLED);
    });

    it('should reject cancelling paid order', () => {
      const items = [createOrderItem('prod-1', 1, 1000)];
      const order = Order.create({
        id: 'order-1',
        customerId: 'customer-1',
        items,
        shippingAddress: validAddress,
      });

      order.markAsPaid();

      expect(() => order.cancel('Customer request')).toThrow('Cannot cancel paid order');
    });
  });
});
