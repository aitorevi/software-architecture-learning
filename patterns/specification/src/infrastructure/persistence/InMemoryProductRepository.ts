/**
 * InMemoryProductRepository - Adaptador de Persistencia
 *
 * Implementa el puerto ProductRepository usando un array en memoria.
 *
 * Mira tú lo simple que es aplicar las especificaciones:
 * solo usamos el método isSatisfiedBy para filtrar.
 */

import { Product } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { Specification } from '../../domain/specifications/Specification.js';

export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [];

  async save(product: Product): Promise<void> {
    // Buscar si ya existe (por ID)
    const index = this.products.findIndex(p => p.id === product.id);

    if (index !== -1) {
      // Actualizar
      this.products[index] = product;
    } else {
      // Crear
      this.products.push(product);
    }
  }

  /**
   * Aquí está la magia del patrón, mi niño:
   * Si hay especificación, filtramos con isSatisfiedBy.
   * Si no, devolvemos todo.
   */
  async findAll(specification?: Specification<Product>): Promise<Product[]> {
    if (!specification) {
      return [...this.products];
    }

    // Aplicar la especificación a cada producto
    return this.products.filter(product =>
      specification.isSatisfiedBy(product)
    );
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.find(p => p.id === id);
    return product || null;
  }

  async clear(): Promise<void> {
    this.products = [];
  }

  // Método helper para debugging
  getAll(): Product[] {
    return [...this.products];
  }
}
