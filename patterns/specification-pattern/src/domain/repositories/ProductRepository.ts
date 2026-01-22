/**
 * ProductRepository - Puerto (Interface)
 *
 * Define las operaciones que el dominio necesita para persistir productos.
 * Nota cómo acepta un Specification<Product> opcional para filtrar.
 *
 * Esto es clave: el dominio define el puerto, la infra lo implementa.
 */

import { Product } from '../entities/Product.js';
import { Specification } from '../specifications/Specification.js';

export interface ProductRepository {
  /**
   * Guarda un producto
   */
  save(product: Product): Promise<void>;

  /**
   * Encuentra todos los productos que cumplan la especificación.
   * Si no se proporciona especificación, devuelve todos.
   */
  findAll(specification?: Specification<Product>): Promise<Product[]>;

  /**
   * Encuentra un producto por ID
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Borra todos los productos (útil para tests)
   */
  clear(): Promise<void>;
}
