import { describe, it, expect } from 'vitest';
import { Product, Money } from '../../../src';

/**
 * CATALOG CONTEXT - Product Tests
 *
 * These tests demonstrate the Catalog context's model of a Product:
 * - Focus on display information (name, description, category)
 * - Has price (important for catalog browsing)
 * - Can be discontinued
 */
describe('Catalog Context - Product', () => {
  const validPrice = Money.fromCents(1999, 'EUR');

  describe('create', () => {
    it('should create a product with valid data', () => {
      const product = Product.create({
        id: 'prod-1',
        name: 'Laptop',
        description: 'A powerful laptop',
        price: validPrice,
        category: 'Electronics',
      });

      expect(product.id).toBe('prod-1');
      expect(product.name).toBe('Laptop');
      expect(product.description).toBe('A powerful laptop');
      expect(product.price.amountInCents).toBe(1999);
      expect(product.category).toBe('Electronics');
      expect(product.isActive).toBe(true);
    });

    it('should trim product name and description', () => {
      const product = Product.create({
        id: 'prod-1',
        name: '  Laptop  ',
        description: '  Description  ',
        price: validPrice,
        category: 'Electronics',
      });

      expect(product.name).toBe('Laptop');
      expect(product.description).toBe('Description');
    });

    it('should reject empty product name', () => {
      expect(() =>
        Product.create({
          id: 'prod-1',
          name: '',
          description: 'Description',
          price: validPrice,
          category: 'Electronics',
        })
      ).toThrow('Product name is required');
    });

    it('should reject whitespace-only product name', () => {
      expect(() =>
        Product.create({
          id: 'prod-1',
          name: '   ',
          description: 'Description',
          price: validPrice,
          category: 'Electronics',
        })
      ).toThrow('Product name is required');
    });
  });

  describe('updatePrice', () => {
    it('should update the product price', () => {
      const product = Product.create({
        id: 'prod-1',
        name: 'Laptop',
        description: 'Description',
        price: validPrice,
        category: 'Electronics',
      });

      const newPrice = Money.fromCents(2499, 'EUR');
      product.updatePrice(newPrice);

      expect(product.price.amountInCents).toBe(2499);
    });
  });

  describe('discontinue', () => {
    it('should mark product as inactive', () => {
      const product = Product.create({
        id: 'prod-1',
        name: 'Laptop',
        description: 'Description',
        price: validPrice,
        category: 'Electronics',
      });

      expect(product.isActive).toBe(true);

      product.discontinue();

      expect(product.isActive).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute product from stored data', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const product = Product.reconstitute({
        id: 'prod-1',
        name: 'Laptop',
        description: 'Description',
        price: validPrice,
        category: 'Electronics',
        isActive: false,
        createdAt,
        updatedAt,
      });

      expect(product.id).toBe('prod-1');
      expect(product.isActive).toBe(false);
      expect(product.createdAt).toBe(createdAt);
      expect(product.updatedAt).toBe(updatedAt);
    });
  });
});
