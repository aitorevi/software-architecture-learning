/**
 * Especificaciones Concretas para Product
 *
 * Cada una encapsula UNA regla de negocio específica.
 * Son pequeñas, simples, testeables y reutilizables.
 *
 * Mira tú, esto es lo bonito del patrón: cada especificación hace una cosa y la hace bien.
 */

import { Product } from '../entities/Product.js';
import { CompositeSpecification } from './Specification.js';

/**
 * InStockSpecification
 *
 * Verifica que un producto tenga stock disponible (stock > 0)
 */
export class InStockSpecification extends CompositeSpecification<Product> {
  isSatisfiedBy(product: Product): boolean {
    return product.stock > 0;
  }
}

/**
 * PriceLessThanSpecification
 *
 * Verifica que el precio del producto sea menor que un máximo dado
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
 * PriceGreaterThanSpecification
 *
 * Verifica que el precio del producto sea mayor que un mínimo dado
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
 * CategorySpecification
 *
 * Verifica que el producto pertenezca a una categoría específica
 * (case-insensitive)
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
 * NameContainsSpecification
 *
 * Verifica que el nombre del producto contenga un texto específico
 * (case-insensitive)
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
 * HasTagSpecification
 *
 * Verifica que el producto tenga un tag específico
 * (case-insensitive)
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
 * MinStockSpecification
 *
 * Verifica que el producto tenga al menos una cantidad mínima de stock
 * Útil para productos premium que requieren stock mínimo
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
 * AllProductsSpecification
 *
 * Especificación que siempre se cumple.
 * Útil como caso base cuando no hay filtros aplicados.
 */
export class AllProductsSpecification extends CompositeSpecification<Product> {
  isSatisfiedBy(product: Product): boolean {
    return true;
  }
}
