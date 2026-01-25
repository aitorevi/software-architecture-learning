/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 6 DE 6: CONTROLLER - PUNTO DE ENTRADA HTTP
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Último archivo, mi niño! Aquí cierra el círculo.
 *
 * 🎯 PROPÓSITO:
 *
 * El controller es el ADAPTADOR entre el mundo HTTP y tu aplicación.
 * Traduce requests HTTP → DTOs → Use Cases → DTOs → responses HTTP
 *
 * 💡 CAPA DE INFRAESTRUCTURA:
 *
 * Este controller está en la capa de infraestructura (adaptador HTTP).
 * No conoce especificaciones ni lógica de negocio.
 *
 * Su único trabajo:
 *   1. Recibir HTTP request
 *   2. Extraer y validar parámetros
 *   3. Crear DTOs
 *   4. Llamar al caso de uso
 *   5. Devolver HTTP response
 *
 * 🏗️ FLUJO COMPLETO (DE HTTP A ESPECIFICACIONES):
 *
 *   HTTP GET /products?category=electronics&maxPrice=500
 *        ↓
 *   ProductController.searchProducts() ← ESTAMOS AQUÍ
 *        ↓
 *   Extraer query params → SearchCriteria DTO
 *        ↓
 *   SearchProductsUseCase.execute(criteria)
 *        ↓
 *   buildSpecification(criteria) → CategorySpec.and(PriceLessThan)
 *        ↓
 *   Repository.findAll(specification)
 *        ↓
 *   products.filter(p => spec.isSatisfiedBy(p))
 *        ↓
 *   Devolver ProductDTO[]
 *        ↓
 *   HTTP 200 OK con JSON
 *
 * 🔗 RELACIÓN CON EL README:
 *
 * Este es el punto de entrada que completa el flujo completo del patrón.
 * Lee README_ES.md líneas 440-488 para ver casos de uso reales.
 *
 * 🎓 ¡FELICIDADES!
 *
 * Has completado el recorrido por los 6 archivos clave del patrón.
 * Ahora entiendes:
 *   1. La base (Specification interface)
 *   2. Las reglas concretas (ProductSpecs)
 *   3. La entidad (Product)
 *   4. La construcción dinámica (SearchProductsUseCase)
 *   5. La ejecución (InMemoryProductRepository)
 *   6. El punto de entrada (ProductController)
 *
 * 📖 SIGUIENTE PASO:
 *
 * Ejecuta el servidor y prueba las búsquedas:
 *   npm run dev
 *   curl "http://localhost:3000/products?category=electronics&maxPrice=500"
 *
 * O ve a los tests:
 *   → tests/domain/specifications.test.ts
 *   → tests/application/search-products.test.ts
 *
 * ═══════════════════════════════════════════════════════════════════════════
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
   * ═══════════════════════════════════════════════════════════════════════
   * 🔍 GET /products/search - Búsqueda con Especificaciones
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Este endpoint es el punto de entrada para búsquedas complejas.
   *
   * 📝 QUERY PARAMS DISPONIBLES:
   *
   * - category: string    → CategorySpecification
   * - maxPrice: number    → PriceLessThanSpecification
   * - minPrice: number    → PriceGreaterThanSpecification
   * - inStock: boolean    → InStockSpecification
   * - name: string        → NameContainsSpecification
   * - tag: string         → HasTagSpecification
   * - minStock: number    → MinStockSpecification
   *
   * 💡 FLEXIBILIDAD:
   *
   * El usuario puede combinar cualquier número de filtros:
   *   - Solo 1: /products?category=electronics
   *   - Varios: /products?category=electronics&maxPrice=500&inStock=true
   *   - Ninguno: /products (devuelve todos)
   *
   * 🎨 EJEMPLOS DE USO:
   *
   *   # Electrónicos baratos
   *   GET /products?category=electronics&maxPrice=500
   *
   *   # Productos en stock con búsqueda de texto
   *   GET /products?inStock=true&name=laptop
   *
   *   # Productos premium (precio > 1000) con stock mínimo
   *   GET /products?minPrice=1000&minStock=10
   *
   * 🏗️ FLUJO INTERNO:
   *
   *   1. Extraer query params del request
   *   2. Crear SearchCriteria DTO (validación y transformación)
   *   3. Pasar al caso de uso
   *   4. El caso de uso construye especificaciones
   *   5. El repositorio ejecuta las especificaciones
   *   6. Devolver resultados como JSON
   *
   * ═══════════════════════════════════════════════════════════════════════
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      // ─────────────────────────────────────────────────────────────────
      // PASO 1: Traducir query params → SearchCriteria DTO
      // ─────────────────────────────────────────────────────────────────
      const criteria: SearchCriteria = {
        category: req.query.category as string | undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        inStock: req.query.inStock === 'true' ? true : undefined,
        name: req.query.name as string | undefined,
        tag: req.query.tag as string | undefined,
        minStock: req.query.minStock ? Number(req.query.minStock) : undefined,
      };

      // ─────────────────────────────────────────────────────────────────
      // PASO 2: Ejecutar caso de uso
      // ─────────────────────────────────────────────────────────────────
      const products = await this.searchProductsUseCase.execute(criteria);

      // ─────────────────────────────────────────────────────────────────
      // PASO 3: Devolver respuesta HTTP 200 OK
      // ─────────────────────────────────────────────────────────────────
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
