import { describe, it, expect, beforeEach } from 'vitest';
import {
  Product,
  ProductId,
  Sku,
  Quantity,
  Money,
  ProductValidationError,
  ProductAddedEvent,
  StockIncreasedEvent,
  StockDecreasedEvent,
  LowStockAlertEvent,
} from '../../../src/domain';

describe('Product Entity', () => {
  describe('create', () => {
    it('should create a product with valid data', () => {
      const product = Product.create({
        id: ProductId.create('prod-1'),
        sku: Sku.create('ABC-12345'),
        name: 'Test Product',
        initialQuantity: Quantity.create(100),
        price: Money.fromCents(1999, 'EUR'),
      });

      expect(product.name).toBe('Test Product');
      expect(product.sku.value).toBe('ABC-12345');
      expect(product.quantity.value).toBe(100);
      expect(product.price.amountInCents).toBe(1999);
    });

    it('should emit ProductAddedEvent when created', () => {
      const product = Product.create({
        id: ProductId.create('prod-1'),
        sku: Sku.create('ABC-12345'),
        name: 'Test Product',
        initialQuantity: Quantity.create(100),
        price: Money.fromCents(1999, 'EUR'),
      });

      const events = product.pullDomainEvents();
      expect(events.some((e) => e instanceof ProductAddedEvent)).toBe(true);
    });

    it('should emit LowStockAlertEvent if initial quantity is below threshold', () => {
      const product = Product.create({
        id: ProductId.create('prod-1'),
        sku: Sku.create('ABC-12345'),
        name: 'Test Product',
        initialQuantity: Quantity.create(5),
        price: Money.fromCents(1999, 'EUR'),
        lowStockThreshold: 10,
      });

      const events = product.pullDomainEvents();
      expect(events.some((e) => e instanceof LowStockAlertEvent)).toBe(true);
    });

    it('should throw error for empty name', () => {
      expect(() =>
        Product.create({
          id: ProductId.create('prod-1'),
          sku: Sku.create('ABC-12345'),
          name: '',
          initialQuantity: Quantity.create(100),
          price: Money.fromCents(1999, 'EUR'),
        })
      ).toThrow(ProductValidationError);
    });
  });

  describe('stock operations', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create({
        id: ProductId.create('prod-1'),
        sku: Sku.create('ABC-12345'),
        name: 'Test Product',
        initialQuantity: Quantity.create(50),
        price: Money.fromCents(1999, 'EUR'),
        lowStockThreshold: 10,
      });
      product.pullDomainEvents(); // Clear creation events
    });

    it('should increase stock', () => {
      product.increaseStock(Quantity.create(20), 'Received shipment');
      expect(product.quantity.value).toBe(70);

      const events = product.pullDomainEvents();
      expect(events.some((e) => e instanceof StockIncreasedEvent)).toBe(true);
    });

    it('should decrease stock', () => {
      product.decreaseStock(Quantity.create(30), 'Sold');
      expect(product.quantity.value).toBe(20);

      const events = product.pullDomainEvents();
      expect(events.some((e) => e instanceof StockDecreasedEvent)).toBe(true);
    });

    it('should emit LowStockAlertEvent when dropping to low stock', () => {
      product.decreaseStock(Quantity.create(45), 'Sold');
      expect(product.quantity.value).toBe(5);
      expect(product.isLowStock()).toBe(true);

      const events = product.pullDomainEvents();
      expect(events.some((e) => e instanceof LowStockAlertEvent)).toBe(true);
    });

    it('should throw error when decreasing below zero', () => {
      expect(() =>
        product.decreaseStock(Quantity.create(100), 'Too much')
      ).toThrow();
    });
  });
});

describe('Value Objects', () => {
  describe('Quantity', () => {
    it('should create a valid quantity', () => {
      const qty = Quantity.create(10);
      expect(qty.value).toBe(10);
    });

    it('should throw error for negative quantity', () => {
      expect(() => Quantity.create(-1)).toThrow();
    });

    it('should add quantities', () => {
      const a = Quantity.create(10);
      const b = Quantity.create(5);
      const result = a.add(b);
      expect(result.value).toBe(15);
    });
  });

  describe('Money', () => {
    it('should create money from cents', () => {
      const money = Money.fromCents(1999, 'EUR');
      expect(money.amountInCents).toBe(1999);
      expect(money.amount).toBe(19.99);
      expect(money.currency).toBe('EUR');
    });

    it('should create money from amount', () => {
      const money = Money.fromAmount(19.99, 'EUR');
      expect(money.amountInCents).toBe(1999);
    });
  });

  describe('Sku', () => {
    it('should create a valid SKU', () => {
      const sku = Sku.create('ABC-12345');
      expect(sku.value).toBe('ABC-12345');
    });

    it('should throw error for invalid SKU format', () => {
      expect(() => Sku.create('invalid')).toThrow();
      expect(() => Sku.create('AB-12345')).toThrow();
      expect(() => Sku.create('ABC-1234')).toThrow();
    });
  });
});
