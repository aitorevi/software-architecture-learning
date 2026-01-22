/**
 * ProductController - Adaptador HTTP (REST)
 *
 * Traduce peticiones HTTP a comandos/queries de casos de uso,
 * y respuestas de casos de uso a respuestas HTTP.
 */

import { Request, Response } from 'express';
import { CreateProductUseCase } from '../../application/use-cases/CreateProductUseCase.js';
import { SearchProductsUseCase } from '../../application/use-cases/SearchProductsUseCase.js';
import { SearchCriteria } from '../../application/dtos/SearchCriteria.js';

export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase
  ) {}

  /**
   * POST /products
   * Crear un nuevo producto
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, price, category, stock, tags } = req.body;

      // Validación básica
      if (!name || price === undefined || !category || stock === undefined || !tags) {
        res.status(400).json({
          error: 'Missing required fields: name, price, category, stock, tags',
        });
        return;
      }

      const product = await this.createProductUseCase.execute({
        name,
        price,
        category,
        stock,
        tags,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /products/search
   * Buscar productos con especificaciones
   *
   * Query params:
   * - category: filtrar por categoría
   * - maxPrice: precio máximo
   * - minPrice: precio mínimo
   * - inStock: solo productos en stock (true/false)
   * - name: texto que debe contener el nombre
   * - tag: tag que debe tener el producto
   * - minStock: stock mínimo requerido
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      // Construir criterios desde query params
      const criteria: SearchCriteria = {
        category: req.query.category as string | undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        inStock: req.query.inStock === 'true' ? true : undefined,
        name: req.query.name as string | undefined,
        tag: req.query.tag as string | undefined,
        minStock: req.query.minStock ? Number(req.query.minStock) : undefined,
      };

      const products = await this.searchProductsUseCase.execute(criteria);

      res.status(200).json({
        count: products.length,
        products,
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /products
   * Obtener todos los productos (sin filtros)
   */
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.searchProductsUseCase.execute({});

      res.status(200).json({
        count: products.length,
        products,
      });
    } catch (error) {
      console.error('Error getting all products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
