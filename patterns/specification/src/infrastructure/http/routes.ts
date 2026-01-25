/**
 * Routes - Configuración de Rutas Express
 */

import { Router } from 'express';
import { ProductController } from './ProductController.js';

export function createRouter(productController: ProductController): Router {
  const router = Router();

  // POST /products - Crear producto
  router.post('/products', (req, res) =>
    productController.createProduct(req, res)
  );

  // GET /products/search - Buscar con especificaciones
  router.get('/products/search', (req, res) =>
    productController.searchProducts(req, res)
  );

  // GET /products - Todos los productos
  router.get('/products', (req, res) =>
    productController.getAllProducts(req, res)
  );

  return router;
}
