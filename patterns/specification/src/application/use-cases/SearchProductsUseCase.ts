/**
 * SearchProductsUseCase - Buscar Productos con Especificaciones
 *
 * Este es el caso de uso más interesante, mi niño.
 * Aquí ves cómo se construyen especificaciones dinámicamente
 * según los criterios de búsqueda del usuario.
 *
 * La magia: cada criterio se traduce a una especificación concreta,
 * y luego se combinan con AND para crear una especificación compuesta.
 */

import { Product } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { Specification } from '../../domain/specifications/Specification.js';
import {
  InStockSpecification,
  PriceLessThanSpecification,
  PriceGreaterThanSpecification,
  CategorySpecification,
  NameContainsSpecification,
  HasTagSpecification,
  MinStockSpecification,
} from '../../domain/specifications/ProductSpecs.js';
import { ProductDTO, ProductDTOMapper } from '../dtos/ProductDTO.js';
import { SearchCriteria } from '../dtos/SearchCriteria.js';

export class SearchProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(criteria: SearchCriteria): Promise<ProductDTO[]> {
    // Construir especificación compuesta dinámicamente
    const specification = this.buildSpecification(criteria);

    // Consultar repositorio con la especificación
    const products = await this.productRepository.findAll(specification);

    // Convertir a DTOs
    return products.map(ProductDTOMapper.fromDomain);
  }

  /**
   * Construye una especificación compuesta a partir de los criterios
   *
   * Mira tú cómo cada criterio se traduce a una especificación,
   * y luego se combinan con AND.
   */
  private buildSpecification(criteria: SearchCriteria): Specification<Product> | undefined {
    let spec: Specification<Product> | undefined = undefined;

    // Filtro por categoría
    if (criteria.category) {
      const categorySpec = new CategorySpecification(criteria.category);
      spec = spec ? spec.and(categorySpec) : categorySpec;
    }

    // Filtro por precio máximo
    if (criteria.maxPrice !== undefined) {
      const maxPriceSpec = new PriceLessThanSpecification(criteria.maxPrice);
      spec = spec ? spec.and(maxPriceSpec) : maxPriceSpec;
    }

    // Filtro por precio mínimo
    if (criteria.minPrice !== undefined) {
      const minPriceSpec = new PriceGreaterThanSpecification(criteria.minPrice);
      spec = spec ? spec.and(minPriceSpec) : minPriceSpec;
    }

    // Filtro por stock disponible
    if (criteria.inStock) {
      const inStockSpec = new InStockSpecification();
      spec = spec ? spec.and(inStockSpec) : inStockSpec;
    }

    // Filtro por nombre
    if (criteria.name) {
      const nameSpec = new NameContainsSpecification(criteria.name);
      spec = spec ? spec.and(nameSpec) : nameSpec;
    }

    // Filtro por tag
    if (criteria.tag) {
      const tagSpec = new HasTagSpecification(criteria.tag);
      spec = spec ? spec.and(tagSpec) : tagSpec;
    }

    // Filtro por stock mínimo
    if (criteria.minStock !== undefined) {
      const minStockSpec = new MinStockSpecification(criteria.minStock);
      spec = spec ? spec.and(minStockSpec) : minStockSpec;
    }

    return spec;
  }
}
