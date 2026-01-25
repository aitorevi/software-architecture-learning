/**
 * Index - Punto de Entrada de la Aplicación
 *
 * Aquí es donde componemos todas las piezas:
 * 1. Crear repositorio
 * 2. Crear casos de uso
 * 3. Crear controlador
 * 4. Configurar Express
 * 5. Arrancar servidor
 */

import express from 'express';
import { InMemoryProductRepository } from './persistence/InMemoryProductRepository.js';
import { CreateProductUseCase } from '../application/use-cases/CreateProductUseCase.js';
import { SearchProductsUseCase } from '../application/use-cases/SearchProductsUseCase.js';
import { ProductController } from './http/ProductController.js';
import { createRouter } from './http/routes.js';

// Composición de dependencias (Dependency Injection manual)
const productRepository = new InMemoryProductRepository();
const createProductUseCase = new CreateProductUseCase(productRepository);
const searchProductsUseCase = new SearchProductsUseCase(productRepository);
const productController = new ProductController(
  createProductUseCase,
  searchProductsUseCase
);

// Configurar Express
const app = express();
app.use(express.json());

// Registrar rutas
const router = createRouter(productController);
app.use('/', router);

// Página de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: '🎯 Specification Pattern API',
    endpoints: {
      'POST /products': 'Create a product',
      'GET /products': 'Get all products',
      'GET /products/search': 'Search products with specifications',
    },
    examples: {
      createProduct: {
        method: 'POST',
        url: '/products',
        body: {
          name: 'iPhone 15 Pro',
          price: 1199,
          category: 'electronics',
          stock: 50,
          tags: ['apple', 'smartphone', '5G'],
        },
      },
      search: {
        method: 'GET',
        url: '/products/search?category=electronics&inStock=true&maxPrice=1000',
      },
    },
  });
});

// Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║         🎯 SPECIFICATION PATTERN API                             ║
║                                                                  ║
║         Server running on http://localhost:${PORT}                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

Available endpoints:
  POST   /products           → Create a product
  GET    /products/search    → Search products with specifications
  GET    /products           → Get all products

Query parameters for /products/search:
  ?category=electronics      → Filter by category
  ?maxPrice=1000            → Maximum price
  ?minPrice=100             → Minimum price
  ?inStock=true             → Only products in stock
  ?name=iPhone              → Name contains text
  ?tag=smartphone           → Has specific tag
  ?minStock=10              → Minimum stock quantity

Examples:
  # Create a product
  curl -X POST http://localhost:${PORT}/products \\
    -H "Content-Type: application/json" \\
    -d '{"name":"iPhone 15","price":1199,"category":"electronics","stock":50,"tags":["apple","smartphone"]}'

  # Search: electronics in stock with price < 1000
  curl "http://localhost:${PORT}/products/search?category=electronics&inStock=true&maxPrice=1000"

¡Venga, a darle caña con las especificaciones! 🚀
  `);
});
