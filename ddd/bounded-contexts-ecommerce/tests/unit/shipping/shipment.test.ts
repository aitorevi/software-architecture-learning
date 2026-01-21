import { describe, it, expect } from 'vitest';
import { Shipment, ShipmentStatus } from '../../../src';

/**
 * SHIPPING CONTEXT - Shipment Tests
 *
 * These tests demonstrate the Shipping context's model:
 * - Focus on LOGISTICS, not commerce
 * - NO prices anywhere (shipping doesn't care about money)
 * - Only references: orderId, productId
 * - State machine: PENDING -> READY -> SHIPPED -> DELIVERED
 */
describe('Shipping Context - Shipment', () => {
  const validAddress = {
    street: '123 Main St',
    city: 'Madrid',
    postalCode: '28001',
    country: 'Spain',
  };

  const createShipmentItems = () => [
    { productId: 'prod-1', quantity: 2 },
    { productId: 'prod-2', quantity: 1 },
  ];

  describe('createFromOrder', () => {
    it('should create a pending shipment', () => {
      const shipment = Shipment.createFromOrder({
        id: 'ship-1',
        orderId: 'order-1',
        items: createShipmentItems(),
        address: validAddress,
      });

      expect(shipment.id).toBe('ship-1');
      expect(shipment.orderId).toBe('order-1');
      expect(shipment.status).toBe(ShipmentStatus.PENDING);
      expect(shipment.trackingNumber).toBeNull();
      expect(shipment.carrier).toBeNull();
    });

    it('should only have quantity, no prices', () => {
      const items = createShipmentItems();
      const shipment = Shipment.createFromOrder({
        id: 'ship-1',
        orderId: 'order-1',
        items,
        address: validAddress,
      });

      // Notice: ShipmentItem has NO unitPrice or productName
      // Shipping context doesn't care about commerce details
      expect(shipment.items[0]).toHaveProperty('productId');
      expect(shipment.items[0]).toHaveProperty('quantity');
      expect(shipment.items[0]).not.toHaveProperty('unitPrice');
      expect(shipment.items[0]).not.toHaveProperty('productName');
    });
  });

  describe('markAsReady', () => {
    it('should transition from PENDING to READY', () => {
      const shipment = Shipment.createFromOrder({
        id: 'ship-1',
        orderId: 'order-1',
        items: createShipmentItems(),
        address: validAddress,
      });

      shipment.markAsReady();

      expect(shipment.status).toBe(ShipmentStatus.READY);
    });

    it('should reject if not pending', () => {
      const shipment = Shipment.createFromOrder({
        id: 'ship-1',
        orderId: 'order-1',
        items: createShipmentItems(),
        address: validAddress,
      });

      shipment.markAsReady();

      expect(() => shipment.markAsReady()).toThrow('Shipment is not pending');
    });
  });

  describe('ship', () => {
    it('should transition from READY to SHIPPED with tracking', () => {
      const shipment = Shipment.createFromOrder({
        id: 'ship-1',
        orderId: 'order-1',
        items: createShipmentItems(),
        address: validAddress,
      });

      shipment.markAsReady();
      shipment.ship('TRACK123', 'DHL');

      expect(shipment.status).toBe(ShipmentStatus.SHIPPED);
      expect(shipment.trackingNumber).toBe('TRACK123');
      expect(shipment.carrier).toBe('DHL');
    });

    it('should reject if not ready', () => {
      const shipment = Shipment.createFromOrder({
        id: 'ship-1',
        orderId: 'order-1',
        items: createShipmentItems(),
        address: validAddress,
      });

      expect(() => shipment.ship('TRACK123', 'DHL')).toThrow('Shipment is not ready');
    });
  });

  describe('markAsDelivered', () => {
    it('should transition from SHIPPED to DELIVERED', () => {
      const shipment = Shipment.createFromOrder({
        id: 'ship-1',
        orderId: 'order-1',
        items: createShipmentItems(),
        address: validAddress,
      });

      shipment.markAsReady();
      shipment.ship('TRACK123', 'DHL');
      shipment.markAsDelivered();

      expect(shipment.status).toBe(ShipmentStatus.DELIVERED);
    });

    it('should reject if not shipped', () => {
      const shipment = Shipment.createFromOrder({
        id: 'ship-1',
        orderId: 'order-1',
        items: createShipmentItems(),
        address: validAddress,
      });

      shipment.markAsReady();

      expect(() => shipment.markAsDelivered()).toThrow('Shipment is not shipped');
    });
  });

  describe('state machine', () => {
    it('should enforce correct transitions: PENDING -> READY -> SHIPPED -> DELIVERED', () => {
      const shipment = Shipment.createFromOrder({
        id: 'ship-1',
        orderId: 'order-1',
        items: createShipmentItems(),
        address: validAddress,
      });

      expect(shipment.status).toBe(ShipmentStatus.PENDING);

      shipment.markAsReady();
      expect(shipment.status).toBe(ShipmentStatus.READY);

      shipment.ship('TRACK123', 'UPS');
      expect(shipment.status).toBe(ShipmentStatus.SHIPPED);

      shipment.markAsDelivered();
      expect(shipment.status).toBe(ShipmentStatus.DELIVERED);
    });
  });
});
