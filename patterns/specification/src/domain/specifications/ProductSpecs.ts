/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 2 DE 6: ESPECIFICACIONES CONCRETAS
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Buenas de nuevo, mi niño! Aquí es donde el patrón cobra vida.
 *
 * 🎯 QUÉ SON LAS ESPECIFICACIONES CONCRETAS:
 *
 * Cada clase en este archivo encapsula UNA SOLA regla de negocio.
 * Son pequeñas, simples, testeables y reutilizables.
 *
 * 💡 PRINCIPIO SINGLE RESPONSIBILITY:
 *
 * Cada especificación hace UNA cosa y la hace bien:
 *   - InStockSpecification → solo verifica stock
 *   - PriceLessThanSpecification → solo verifica precio
 *   - CategorySpecification → solo verifica categoría
 *
 * 🏗️ ESTRUCTURA DE CADA ESPECIFICACIÓN:
 *
 * 1. Extiende CompositeSpecification<Product>
 * 2. Recibe parámetros en el constructor (si los necesita)
 * 3. Implementa isSatisfiedBy() con su lógica específica
 * 4. Hereda automáticamente and(), or(), not()
 *
 * 🎨 EJEMPLO DE COMPOSICIÓN:
 *
 *   // Cada una es simple
 *   const cheap = new PriceLessThanSpecification(100);
 *   const inStock = new InStockSpecification();
 *   const electronics = new CategorySpecification('electronics');
 *
 *   // Se combinan para crear algo complejo
 *   const affordableElectronics = cheap.and(inStock).and(electronics);
 *
 *   // Uso
 *   if (affordableElectronics.isSatisfiedBy(product)) {
 *     console.log('Este producto cumple todos los criterios');
 *   }
 *
 * 🔗 RELACIÓN CON EL README:
 *
 * Esto implementa README_ES.md líneas 289-344
 * "Especificaciones Concretas"
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de ver estas especificaciones, ve a:
 *   → Product.ts (ver la entidad sobre la que se aplican)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Product } from '../entities/Product.js';
import { CompositeSpecification } from './Specification.js';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📦 InStockSpecification - ¿Hay stock disponible?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🎯 REGLA: El producto debe tener stock mayor a 0
 *
 * 💡 NOTA: Esta es la especificación más simple. No necesita parámetros.
 *
 * 📝 EJEMPLO DE USO:
 *   const inStock = new InStockSpecification();
 *   inStock.isSatisfiedBy(product); // true si product.stock > 0
 *
 * 🔗 COMPOSICIÓN:
 *   const cheapAndInStock = new PriceLessThanSpecification(100)
 *     .and(new InStockSpecification());
 */
export class InStockSpecification extends CompositeSpecification<Product> {
  isSatisfiedBy(product: Product): boolean {
    return product.stock > 0;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💰 PriceLessThanSpecification - ¿Precio por debajo de un máximo?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🎯 REGLA: El precio del producto debe ser menor que maxPrice
 *
 * 💡 PARÁMETROS: Recibe el precio máximo en el constructor
 *
 * 📝 EJEMPLO DE USO:
 *   const cheap = new PriceLessThanSpecification(100);
 *   cheap.isSatisfiedBy(product); // true si product.price < 100
 *
 * 🔗 COMPOSICIÓN:
 *   const affordableElectronics = new PriceLessThanSpecification(500)
 *     .and(new CategorySpecification('electronics'));
 */
export class PriceLessThanSpecification extends CompositeSpecification<Product> {
  constructor(private readonly maxPrice: number) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.price < this.maxPrice;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💎 PriceGreaterThanSpecification - ¿Precio por encima de un mínimo?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🎯 REGLA: El precio del producto debe ser mayor que minPrice
 *
 * 💡 USO COMÚN: Filtrar productos premium
 *
 * 📝 EJEMPLO DE USO:
 *   const premium = new PriceGreaterThanSpecification(1000);
 *   premium.isSatisfiedBy(product); // true si product.price > 1000
 *
 * 🎨 COMBINACIÓN CON NOT:
 *   const notCheap = new PriceLessThanSpecification(100).not();
 *   // Equivalente a PriceGreaterThanOrEqualSpecification(100)
 */
export class PriceGreaterThanSpecification extends CompositeSpecification<Product> {
  constructor(private readonly minPrice: number) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.price > this.minPrice;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏷️ CategorySpecification - ¿Pertenece a esta categoría?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🎯 REGLA: El producto debe pertenecer a la categoría especificada
 *
 * 💡 CASE-INSENSITIVE: "Electronics" === "electronics"
 *
 * 📝 EJEMPLO DE USO:
 *   const electronics = new CategorySpecification('electronics');
 *   electronics.isSatisfiedBy(product); // true si es electrónico
 *
 * 🔗 COMPOSICIÓN CON OR:
 *   const electronicsOrFurniture = new CategorySpecification('electronics')
 *     .or(new CategorySpecification('furniture'));
 */
export class CategorySpecification extends CompositeSpecification<Product> {
  constructor(private readonly category: string) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.category.toLowerCase() === this.category.toLowerCase();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔍 NameContainsSpecification - ¿El nombre contiene este texto?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🎯 REGLA: El nombre del producto debe contener el texto de búsqueda
 *
 * 💡 CASE-INSENSITIVE: Buscar "laptop" encuentra "Gaming Laptop Pro"
 *
 * 📝 EJEMPLO DE USO:
 *   const laptopSearch = new NameContainsSpecification('laptop');
 *   laptopSearch.isSatisfiedBy(product); // true si nombre tiene "laptop"
 *
 * 🎯 CASO DE USO: Implementar búsqueda de texto libre
 */
export class NameContainsSpecification extends CompositeSpecification<Product> {
  constructor(private readonly searchTerm: string) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏷️ HasTagSpecification - ¿Tiene este tag?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🎯 REGLA: El producto debe tener el tag especificado
 *
 * 💡 CASE-INSENSITIVE: "NEW" === "new"
 *
 * 📝 EJEMPLO DE USO:
 *   const newProducts = new HasTagSpecification('new');
 *   newProducts.isSatisfiedBy(product); // true si tiene tag "new"
 *
 * 🔗 COMPOSICIÓN:
 *   const newAndOnSale = new HasTagSpecification('new')
 *     .and(new HasTagSpecification('sale'));
 */
export class HasTagSpecification extends CompositeSpecification<Product> {
  constructor(private readonly tag: string) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.tags.some(t => t.toLowerCase() === this.tag.toLowerCase());
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 MinStockSpecification - ¿Tiene stock mínimo requerido?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🎯 REGLA: El producto debe tener al menos minStock unidades
 *
 * 💡 CASO DE USO: Productos premium que requieren stock mínimo para garantizar
 *    disponibilidad.
 *
 * 📝 EJEMPLO DE USO:
 *   const highAvailability = new MinStockSpecification(10);
 *   highAvailability.isSatisfiedBy(product); // true si stock >= 10
 *
 * 🎯 VALIDACIÓN DE REGLAS DE NEGOCIO:
 *   const premiumRequirements = new PriceGreaterThanSpecification(1000)
 *     .and(new MinStockSpecification(10));
 *   // Productos premium deben tener stock mínimo
 */
export class MinStockSpecification extends CompositeSpecification<Product> {
  constructor(private readonly minStock: number) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.stock >= this.minStock;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ AllProductsSpecification - Siempre se cumple
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🎯 REGLA: Siempre devuelve true (sin filtros)
 *
 * 💡 CASO BASE: Útil cuando no hay filtros aplicados por el usuario
 *
 * 📝 EJEMPLO DE USO:
 *   const spec = criteria.isEmpty()
 *     ? new AllProductsSpecification()
 *     : buildComplexSpecification(criteria);
 *
 * 🎯 PATRÓN NULL OBJECT: Evita tener que comprobar null/undefined
 */
export class AllProductsSpecification extends CompositeSpecification<Product> {
  isSatisfiedBy(product: Product): boolean {
    return true;
  }
}
