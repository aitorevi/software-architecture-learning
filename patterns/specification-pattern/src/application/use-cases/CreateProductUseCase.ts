/**
 * CreateProductUseCase - Crear un Producto
 *
 * Caso de uso simple para crear y guardar un producto.
 */

import { Product } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { ProductDTO, ProductDTOMapper } from '../dtos/ProductDTO.js';

export interface CreateProductCommand {
  name: string;
  price: number;
  category: string;
  stock: number;
  tags: string[];
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<ProductDTO> {
    // Crear la entidad de dominio
    const product = Product.create({
      name: command.name,
      price: command.price,
      category: command.category,
      stock: command.stock,
      tags: command.tags,
    });

    // Guardar en el repositorio
    await this.productRepository.save(product);

    // Devolver DTO
    return ProductDTOMapper.fromDomain(product);
  }
}
