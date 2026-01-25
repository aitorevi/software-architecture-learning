/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 5 DE 6: REPOSITORIO - EJECUCIÓN DE ESPECIFICACIONES
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Aquí vemos lo SIMPLE que es ejecutar especificaciones, mi niño!
 *
 * 🎯 PROPÓSITO:
 *
 * Este repositorio implementa el puerto (interface) ProductRepository
 * usando un array en memoria como mecanismo de persistencia.
 *
 * 💡 CAPA DE INFRAESTRUCTURA:
 *
 * Este adaptador está en la capa de INFRAESTRUCTURA.
 * No conoce detalles de negocio, solo sabe:
 *   1. Guardar productos
 *   2. Aplicar especificaciones para filtrar
 *   3. Buscar por ID
 *
 * 🔌 ARQUITECTURA HEXAGONAL:
 *
 *   Domain (centro) → define ProductRepository (puerto)
 *   Infrastructure (exterior) → implementa el puerto (adaptador)
 *
 * Podrías crear SqlProductRepository, MongoProductRepository, etc.
 * sin tocar el dominio. Solo cambiando la implementación.
 *
 * 🎨 SIMPLICIDAD DEL PATRÓN:
 *
 * Mira tú lo fácil que es aplicar especificaciones:
 *   products.filter(product => spec.isSatisfiedBy(product))
 *
 * El repositorio NO SABE qué reglas de negocio se están aplicando.
 * Solo ejecuta el método isSatisfiedBy().
 *
 * 🔗 RELACIÓN CON EL README:
 *
 * Esto implementa README_ES.md líneas 396-410
 * "Implementación en el Repositorio - In-Memory"
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de ver cómo se ejecutan las specs, ve a:
 *   → ProductController.ts (ver el punto de entrada HTTP)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Product } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { Specification } from '../../domain/specifications/Specification.js';

export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [];

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 💾 GUARDAR - Crear o Actualizar
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Implementación simple de upsert (update or insert):
   *   - Si el producto ya existe (mismo ID) → actualizar
   *   - Si no existe → añadir al array
   */
  async save(product: Product): Promise<void> {
    const index = this.products.findIndex(p => p.id === product.id);

    if (index !== -1) {
      // Actualizar existente
      this.products[index] = product;
    } else {
      // Crear nuevo
      this.products.push(product);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🔍 FINDALL - LA MAGIA DEL PATRÓN EN ACCIÓN
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Este es el método más importante del repositorio.
   *
   * 🎯 FUNCIONAMIENTO:
   *
   * 1. Sin especificación → devuelve TODOS los productos
   * 2. Con especificación → filtra usando isSatisfiedBy()
   *
   * 💡 SIMPLICIDAD:
   *
   * El repositorio NO SABE:
   *   - Qué reglas de negocio se están aplicando
   *   - Cómo se construyó la especificación
   *   - Cuántas especificaciones están combinadas
   *
   * El repositorio SOLO SABE:
   *   - Llamar a specification.isSatisfiedBy(product)
   *   - Filtrar según el resultado (true/false)
   *
   * 🎨 EJEMPLO MENTAL:
   *
   * Imagina que la especificación es:
   *   CategorySpec('electronics')
   *     .and(PriceLessThan(500))
   *     .and(InStock())
   *
   * Para cada producto, el repositorio hace:
   *   if (specification.isSatisfiedBy(product)) → lo incluye
   *
   * Internamente, la especificación evalúa:
   *   category === 'electronics' && price < 500 && stock > 0
   *
   * Pero el repositorio NO LO SABE. Solo llama al método.
   *
   * 🏗️ ALTERNATIVA PARA SQL:
   *
   * En un SqlProductRepository, harías:
   *   - Traducir la especificación a WHERE clause
   *   - Ejecutar query SQL con el WHERE construido
   *   - Aprovechar índices de BD
   *
   * Mismo patrón, diferente implementación.
   *
   * ═══════════════════════════════════════════════════════════════════════
   */
  async findAll(specification?: Specification<Product>): Promise<Product[]> {
    // Caso 1: Sin especificación → devolver todo
    if (!specification) {
      return [...this.products]; // Copia defensiva
    }

    // Caso 2: Con especificación → filtrar
    // Mira qué simple: solo un .filter() con isSatisfiedBy()
    return this.products.filter(product =>
      specification.isSatisfiedBy(product)
    );
  }

  /**
   * 🔍 Buscar por ID (método auxiliar)
   */
  async findById(id: string): Promise<Product | null> {
    const product = this.products.find(p => p.id === id);
    return product || null;
  }

  /**
   * 🗑️ Limpiar todos los productos (útil para tests)
   */
  async clear(): Promise<void> {
    this.products = [];
  }

  /**
   * 📋 Obtener todos sin filtrar (helper para debugging)
   */
  getAll(): Product[] {
    return [...this.products];
  }
}
