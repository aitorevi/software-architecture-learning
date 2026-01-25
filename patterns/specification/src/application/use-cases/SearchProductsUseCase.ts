/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 4 DE 6: CASO DE USO - CONSTRUCCIÓN DINÁMICA
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Aquí está la MAGIA del patrón, mi niño!
 *
 * 🎯 PROPÓSITO:
 *
 * Este caso de uso recibe criterios de búsqueda del usuario y los traduce
 * a especificaciones que se pueden ejecutar.
 *
 * 💡 CONSTRUCCIÓN DINÁMICA:
 *
 * Imagina que el usuario quiere filtrar por:
 *   - Categoría: "electronics"
 *   - Precio máximo: 500
 *   - En stock: true
 *
 * Este caso de uso construye:
 *   CategorySpec('electronics')
 *     .and(PriceLessThan(500))
 *     .and(InStock())
 *
 * 🏗️ FLUJO COMPLETO:
 *
 * 1. Controller recibe HTTP request con query params
 *    ↓
 * 2. Controller crea SearchCriteria (DTO)
 *    ↓
 * 3. → SearchProductsUseCase.execute(criteria) ← ESTAMOS AQUÍ
 *    ↓
 * 4. buildSpecification() traduce criteria → Specification
 *    ↓
 * 5. Repository ejecuta la especificación
 *    ↓
 * 6. Devolvemos ProductDTO[] al controller
 *
 * 🔗 RELACIÓN CON EL README:
 *
 * Esto implementa README_ES.md líneas 346-391
 * "Uso en Casos de Uso"
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de ver cómo se CONSTRUYEN las specs, ve a:
 *   → InMemoryProductRepository.ts (ver cómo se EJECUTAN)
 *
 * ═══════════════════════════════════════════════════════════════════════════
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

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🎬 MÉTODO PRINCIPAL - Ejecutar la Búsqueda
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Este es el punto de entrada al caso de uso.
   *
   * 📝 FLUJO:
   *   1. Construir especificación a partir de criterios
   *   2. Consultar repositorio con la especificación
   *   3. Convertir entidades de dominio → DTOs
   *   4. Devolver DTOs
   *
   * 💡 SEPARACIÓN DE RESPONSABILIDADES:
   *   - Este método orquesta (coordina)
   *   - buildSpecification() hace la lógica compleja
   *   - Repository ejecuta la consulta
   *   - DTOMapper hace la conversión
   */
  async execute(criteria: SearchCriteria): Promise<ProductDTO[]> {
    // 1. Construir especificación compuesta dinámicamente
    const specification = this.buildSpecification(criteria);

    // 2. Consultar repositorio con la especificación
    const products = await this.productRepository.findAll(specification);

    // 3. Convertir entidades de dominio a DTOs para la capa de presentación
    return products.map(ProductDTOMapper.fromDomain);
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🏗️ CONSTRUCCIÓN DINÁMICA - La Magia del Patrón
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Aquí es donde el Specification Pattern BRILLA, mi niño.
   *
   * 🎯 OBJETIVO:
   *
   * Traducir los criterios opcionales del usuario a una especificación
   * compuesta que puede tener cualquier combinación de filtros.
   *
   * 💡 PATRÓN DE CONSTRUCCIÓN:
   *
   * Para cada criterio que el usuario proporciona:
   *   1. Crear una especificación concreta
   *   2. Si ya hay especificación previa, combinar con AND
   *   3. Si es la primera, establecerla como base
   *
   * 🔍 EJEMPLO PASO A PASO:
   *
   * Usuario busca: { category: 'electronics', maxPrice: 500, inStock: true }
   *
   *   Paso 1: spec = CategorySpec('electronics')
   *   Paso 2: spec = CategorySpec('electronics').and(PriceLessThan(500))
   *   Paso 3: spec = CategorySpec('electronics')
   *                    .and(PriceLessThan(500))
   *                    .and(InStock())
   *
   * Resultado: Una especificación compuesta que verifica las 3 reglas.
   *
   * 🎨 FLEXIBILIDAD:
   *
   * - Sin filtros → spec = undefined → repository devuelve todos
   * - 1 filtro → spec = simple
   * - N filtros → spec = compuesta con N-1 ANDs
   *
   * 🔗 OPERADOR TERNARIO:
   *
   *   spec = spec ? spec.and(newSpec) : newSpec;
   *
   * Significa: "Si ya hay spec, combínala; si no, usa la nueva"
   *
   * ═══════════════════════════════════════════════════════════════════════
   */
  private buildSpecification(criteria: SearchCriteria): Specification<Product> | undefined {
    let spec: Specification<Product> | undefined = undefined;

    // ─────────────────────────────────────────────────────────────────────
    // Filtro por categoría
    // ─────────────────────────────────────────────────────────────────────
    if (criteria.category) {
      const categorySpec = new CategorySpecification(criteria.category);
      // Primera spec o combinar con la existente
      spec = spec ? spec.and(categorySpec) : categorySpec;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Filtro por precio máximo
    // ─────────────────────────────────────────────────────────────────────
    if (criteria.maxPrice !== undefined) {
      const maxPriceSpec = new PriceLessThanSpecification(criteria.maxPrice);
      spec = spec ? spec.and(maxPriceSpec) : maxPriceSpec;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Filtro por precio mínimo
    // ─────────────────────────────────────────────────────────────────────
    if (criteria.minPrice !== undefined) {
      const minPriceSpec = new PriceGreaterThanSpecification(criteria.minPrice);
      spec = spec ? spec.and(minPriceSpec) : minPriceSpec;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Filtro por stock disponible
    // ─────────────────────────────────────────────────────────────────────
    if (criteria.inStock) {
      const inStockSpec = new InStockSpecification();
      spec = spec ? spec.and(inStockSpec) : inStockSpec;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Filtro por nombre (búsqueda de texto)
    // ─────────────────────────────────────────────────────────────────────
    if (criteria.name) {
      const nameSpec = new NameContainsSpecification(criteria.name);
      spec = spec ? spec.and(nameSpec) : nameSpec;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Filtro por tag
    // ─────────────────────────────────────────────────────────────────────
    if (criteria.tag) {
      const tagSpec = new HasTagSpecification(criteria.tag);
      spec = spec ? spec.and(tagSpec) : tagSpec;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Filtro por stock mínimo
    // ─────────────────────────────────────────────────────────────────────
    if (criteria.minStock !== undefined) {
      const minStockSpec = new MinStockSpecification(criteria.minStock);
      spec = spec ? spec.and(minStockSpec) : minStockSpec;
    }

    // Si no hay filtros, spec será undefined y el repository devolverá todo
    return spec;
  }
}
