/**
 * Tests del Caso de Uso SearchProductsUseCase
 *
 * Aquí testeamos la lógica de búsqueda con especificaciones
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Product } from '../../src/domain/entities/Product.js';
import { InMemoryProductRepository } from '../../src/infrastructure/persistence/InMemoryProductRepository.js';
import { SearchProductsUseCase } from '../../src/application/use-cases/SearchProductsUseCase.js';

describe('SearchProductsUseCase', () => {
  let repository: InMemoryProductRepository;
  let useCase: SearchProductsUseCase;

  beforeEach(async () => {
    repository = new InMemoryProductRepository();
    useCase = new SearchProductsUseCase(repository);

    // Seed con productos de prueba
    const products = [
      new Product({
        id: '1',
        name: 'iPhone 15 Pro',
        price: 1199,
        category: 'electronics',
        stock: 50,
        tags: ['apple', 'smartphone', '5G'],
      }),
      new Product({
        id: '2',
        name: 'Samsung Galaxy S24',
        price: 899,
        category: 'electronics',
        stock: 30,
        tags: ['samsung', 'smartphone', 'android'],
      }),
      new Product({
        id: '3',
        name: 'Mesa de oficina',
        price: 250,
        category: 'furniture',
        stock: 0,
        tags: ['office', 'wood'],
      }),
      new Product({
        id: '4',
        name: 'Silla ergonómica',
        price: 350,
        category: 'furniture',
        stock: 15,
        tags: ['office', 'ergonomic'],
      }),
      new Product({
        id: '5',
        name: 'MacBook Pro',
        price: 2499,
        category: 'electronics',
        stock: 20,
        tags: ['apple', 'laptop', 'premium'],
      }),
    ];

    for (const product of products) {
      await repository.save(product);
    }
  });

  it('should return all products when no criteria provided', async () => {
    const results = await useCase.execute({});

    expect(results).toHaveLength(5);
  });

  it('should filter by category', async () => {
    const results = await useCase.execute({
      category: 'electronics',
    });

    expect(results).toHaveLength(3);
    expect(results.every(p => p.category === 'electronics')).toBe(true);
  });

  it('should filter by max price', async () => {
    const results = await useCase.execute({
      maxPrice: 1000,
    });

    expect(results).toHaveLength(3); // Samsung (899), Mesa (250), Silla (350)
    expect(results.every(p => p.price < 1000)).toBe(true);
  });

  it('should filter by in stock', async () => {
    const results = await useCase.execute({
      inStock: true,
    });

    expect(results).toHaveLength(4); // Todos menos la mesa
    expect(results.every(p => p.stock > 0)).toBe(true);
  });

  it('should filter by name contains', async () => {
    const results = await useCase.execute({
      name: 'Pro',
    });

    expect(results).toHaveLength(2); // iPhone Pro, MacBook Pro
    expect(results.every(p => p.name.includes('Pro'))).toBe(true);
  });

  it('should filter by tag', async () => {
    const results = await useCase.execute({
      tag: 'smartphone',
    });

    expect(results).toHaveLength(2); // iPhone, Samsung
  });

  it('should combine multiple filters with AND logic', async () => {
    const results = await useCase.execute({
      category: 'electronics',
      maxPrice: 1000,
      inStock: true,
    });

    expect(results).toHaveLength(1); // Solo Samsung (899, electronics, in stock)
    expect(results[0].name).toBe('Samsung Galaxy S24');
  });

  it('should return empty array when no products match', async () => {
    const results = await useCase.execute({
      category: 'electronics',
      minPrice: 5000, // No hay productos tan caros
    });

    expect(results).toHaveLength(0);
  });

  it('should filter by min and max price range', async () => {
    const results = await useCase.execute({
      minPrice: 300,
      maxPrice: 1000,
    });

    expect(results).toHaveLength(2); // Silla (350), Samsung (899)
    expect(results.every(p => p.price > 300 && p.price < 1000)).toBe(true);
  });

  it('should filter by category and tag', async () => {
    const results = await useCase.execute({
      category: 'electronics',
      tag: 'apple',
    });

    expect(results).toHaveLength(2); // iPhone, MacBook
    expect(results.every(p => p.category === 'electronics')).toBe(true);
    expect(results.every(p => p.tags.includes('apple'))).toBe(true);
  });

  it('should filter by minimum stock', async () => {
    const results = await useCase.execute({
      minStock: 20,
    });

    expect(results).toHaveLength(3); // iPhone (50), Samsung (30), MacBook (20)
    expect(results.every(p => p.stock >= 20)).toBe(true);
  });

  it('should handle complex search: affordable electronics in stock', async () => {
    const results = await useCase.execute({
      category: 'electronics',
      maxPrice: 1200,
      inStock: true,
    });

    expect(results).toHaveLength(2); // iPhone (1199), Samsung (899)
  });
});
