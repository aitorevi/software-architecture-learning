/**
 * SearchCriteria - Criterios de Búsqueda
 *
 * Este DTO encapsula todos los posibles criterios de búsqueda
 * que un usuario puede proporcionar.
 *
 * Mira tú, es como un "query object" que el caso de uso
 * traducirá a especificaciones concretas.
 */

export interface SearchCriteria {
  /**
   * Filtrar por categoría
   */
  category?: string;

  /**
   * Precio máximo
   */
  maxPrice?: number;

  /**
   * Precio mínimo
   */
  minPrice?: number;

  /**
   * Solo productos en stock
   */
  inStock?: boolean;

  /**
   * Texto que debe contener el nombre
   */
  name?: string;

  /**
   * Tag que debe tener el producto
   */
  tag?: string;

  /**
   * Stock mínimo requerido
   */
  minStock?: number;
}
