/**
 * Tests de Especificaciones
 *
 * Aquí ves una de las grandes ventajas del patrón:
 * cada especificación se testea aislada, sin dependencias.
 */

import { describe, it, expect } from 'vitest';
import { Product } from '../../src/domain/entities/Product.js';
import {
  InStockSpecification,
  PriceLessThanSpecification,
  PriceGreaterThanSpecification,
  CategorySpecification,
  NameContainsSpecification,
  HasTagSpecification,
  MinStockSpecification,
  AllProductsSpecification,
} from '../../src/domain/specifications/ProductSpecs.js';

describe('Specification Pattern - Unit Tests', () => {
  // Helper para crear productos de prueba
  const createProduct = (overrides: Partial<any> = {}) => {
    return new Product({
      id: 'test-id',
      name: 'Test Product',
      price: 100,
      category: 'electronics',
      stock: 10,
      tags: ['test', 'sample'],
      ...overrides,
    });
  };

  describe('InStockSpecification', () => {
    it('should be satisfied by products with stock > 0', () => {
      const product = createProduct({ stock: 10 });
      const spec = new InStockSpecification();

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should not be satisfied by products with stock = 0', () => {
      const product = createProduct({ stock: 0 });
      const spec = new InStockSpecification();

      expect(spec.isSatisfiedBy(product)).toBe(false);
    });
  });

  describe('PriceLessThanSpecification', () => {
    it('should be satisfied when price is less than max', () => {
      const product = createProduct({ price: 50 });
      const spec = new PriceLessThanSpecification(100);

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should not be satisfied when price equals or exceeds max', () => {
      const product1 = createProduct({ price: 100 });
      const product2 = createProduct({ price: 150 });
      const spec = new PriceLessThanSpecification(100);

      expect(spec.isSatisfiedBy(product1)).toBe(false);
      expect(spec.isSatisfiedBy(product2)).toBe(false);
    });
  });

  describe('PriceGreaterThanSpecification', () => {
    it('should be satisfied when price is greater than min', () => {
      const product = createProduct({ price: 150 });
      const spec = new PriceGreaterThanSpecification(100);

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should not be satisfied when price equals or is less than min', () => {
      const product1 = createProduct({ price: 100 });
      const product2 = createProduct({ price: 50 });
      const spec = new PriceGreaterThanSpecification(100);

      expect(spec.isSatisfiedBy(product1)).toBe(false);
      expect(spec.isSatisfiedBy(product2)).toBe(false);
    });
  });

  describe('CategorySpecification', () => {
    it('should be satisfied by products in the same category', () => {
      const product = createProduct({ category: 'electronics' });
      const spec = new CategorySpecification('electronics');

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const product = createProduct({ category: 'Electronics' });
      const spec = new CategorySpecification('electronics');

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should not be satisfied by products in different category', () => {
      const product = createProduct({ category: 'furniture' });
      const spec = new CategorySpecification('electronics');

      expect(spec.isSatisfiedBy(product)).toBe(false);
    });
  });

  describe('NameContainsSpecification', () => {
    it('should be satisfied when name contains the search term', () => {
      const product = createProduct({ name: 'iPhone 15 Pro' });
      const spec = new NameContainsSpecification('iPhone');

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const product = createProduct({ name: 'iPhone 15 Pro' });
      const spec = new NameContainsSpecification('iphone');

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should not be satisfied when name does not contain the term', () => {
      const product = createProduct({ name: 'Samsung Galaxy' });
      const spec = new NameContainsSpecification('iPhone');

      expect(spec.isSatisfiedBy(product)).toBe(false);
    });
  });

  describe('HasTagSpecification', () => {
    it('should be satisfied when product has the tag', () => {
      const product = createProduct({ tags: ['apple', 'smartphone', '5G'] });
      const spec = new HasTagSpecification('smartphone');

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const product = createProduct({ tags: ['Apple', 'Smartphone'] });
      const spec = new HasTagSpecification('smartphone');

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should not be satisfied when product does not have the tag', () => {
      const product = createProduct({ tags: ['samsung', 'budget'] });
      const spec = new HasTagSpecification('premium');

      expect(spec.isSatisfiedBy(product)).toBe(false);
    });
  });

  describe('MinStockSpecification', () => {
    it('should be satisfied when stock meets minimum', () => {
      const product = createProduct({ stock: 20 });
      const spec = new MinStockSpecification(10);

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should be satisfied when stock equals minimum', () => {
      const product = createProduct({ stock: 10 });
      const spec = new MinStockSpecification(10);

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should not be satisfied when stock is below minimum', () => {
      const product = createProduct({ stock: 5 });
      const spec = new MinStockSpecification(10);

      expect(spec.isSatisfiedBy(product)).toBe(false);
    });
  });

  describe('AllProductsSpecification', () => {
    it('should always be satisfied', () => {
      const product1 = createProduct();
      const product2 = createProduct({ stock: 0, price: 999999 });
      const spec = new AllProductsSpecification();

      expect(spec.isSatisfiedBy(product1)).toBe(true);
      expect(spec.isSatisfiedBy(product2)).toBe(true);
    });
  });

  describe('Composite Specifications - AND', () => {
    it('should combine two specifications with AND logic', () => {
      const product = createProduct({
        category: 'electronics',
        price: 50,
        stock: 10,
      });

      const spec = new CategorySpecification('electronics')
        .and(new PriceLessThanSpecification(100))
        .and(new InStockSpecification());

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should not be satisfied if any specification fails', () => {
      const product = createProduct({
        category: 'electronics',
        price: 150, // Falla aquí
        stock: 10,
      });

      const spec = new CategorySpecification('electronics')
        .and(new PriceLessThanSpecification(100))
        .and(new InStockSpecification());

      expect(spec.isSatisfiedBy(product)).toBe(false);
    });
  });

  describe('Composite Specifications - OR', () => {
    it('should be satisfied if at least one specification passes', () => {
      const product = createProduct({
        category: 'furniture',
        price: 50,
      });

      const spec = new CategorySpecification('electronics')
        .or(new PriceLessThanSpecification(100));

      expect(spec.isSatisfiedBy(product)).toBe(true);
    });

    it('should not be satisfied if all specifications fail', () => {
      const product = createProduct({
        category: 'furniture',
        price: 150,
      });

      const spec = new CategorySpecification('electronics')
        .or(new PriceLessThanSpecification(100));

      expect(spec.isSatisfiedBy(product)).toBe(false);
    });
  });

  describe('Composite Specifications - NOT', () => {
    it('should negate a specification', () => {
      const product1 = createProduct({ stock: 0 });
      const product2 = createProduct({ stock: 10 });

      const spec = new InStockSpecification().not();

      expect(spec.isSatisfiedBy(product1)).toBe(true); // No tiene stock = cumple NOT inStock
      expect(spec.isSatisfiedBy(product2)).toBe(false); // Tiene stock = NO cumple NOT inStock
    });
  });

  describe('Complex Composite Specifications', () => {
    it('should handle complex combinations: (electronics OR furniture) AND (price < 500) AND inStock', () => {
      const product1 = createProduct({
        category: 'electronics',
        price: 300,
        stock: 10,
      });

      const product2 = createProduct({
        category: 'furniture',
        price: 400,
        stock: 5,
      });

      const product3 = createProduct({
        category: 'clothing',
        price: 50,
        stock: 20,
      });

      const spec = new CategorySpecification('electronics')
        .or(new CategorySpecification('furniture'))
        .and(new PriceLessThanSpecification(500))
        .and(new InStockSpecification());

      expect(spec.isSatisfiedBy(product1)).toBe(true); // electronics, cheap, in stock
      expect(spec.isSatisfiedBy(product2)).toBe(true); // furniture, cheap, in stock
      expect(spec.isSatisfiedBy(product3)).toBe(false); // clothing (no cumple categoría)
    });

    it('should handle: NOT expensive AND (has tag "premium" OR category "luxury")', () => {
      const product1 = createProduct({
        price: 100,
        category: 'luxury',
        tags: [],
      });

      const product2 = createProduct({
        price: 100,
        category: 'electronics',
        tags: ['premium'],
      });

      const product3 = createProduct({
        price: 2000,
        category: 'luxury',
        tags: ['premium'],
      });

      const expensiveSpec = new PriceGreaterThanSpecification(1000);
      const luxuryOrPremiumSpec = new CategorySpecification('luxury')
        .or(new HasTagSpecification('premium'));

      const spec = expensiveSpec.not().and(luxuryOrPremiumSpec);

      expect(spec.isSatisfiedBy(product1)).toBe(true); // Not expensive, luxury category
      expect(spec.isSatisfiedBy(product2)).toBe(true); // Not expensive, has premium tag
      expect(spec.isSatisfiedBy(product3)).toBe(false); // Expensive (falla NOT)
    });
  });
});
