/**
 * ProductDTO - Data Transfer Object
 *
 * Objeto plano para transferir datos entre capas.
 * NO tiene lógica de negocio, solo datos.
 */

import { Product } from '../../domain/entities/Product.js';

export interface ProductDTO {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  tags: string[];
}

/**
 * Funciones de conversión entre Product (dominio) y ProductDTO (transporte)
 */
export class ProductDTOMapper {
  static fromDomain(product: Product): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      tags: product.tags,
    };
  }

  static toDomain(dto: ProductDTO): Product {
    return new Product({
      id: dto.id,
      name: dto.name,
      price: dto.price,
      category: dto.category,
      stock: dto.stock,
      tags: dto.tags,
    });
  }
}
