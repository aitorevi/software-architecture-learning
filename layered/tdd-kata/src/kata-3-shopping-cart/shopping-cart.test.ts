/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🎯 TESTS KATA 3: SHOPPING CART                                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • TDD con múltiples entidades (Product, ShoppingCart)                 ║
 * ║     • Tests de integración entre clases                                   ║
 * ║     • Cómo testear lógica de negocio compleja                             ║
 * ║     • El diseño emerge de los tests (diseño evolutivo)                    ║
 * ║                                                                           ║
 * ║  💡 PARA PRACTICAR TDD:                                                   ║
 * ║     1. Borra Product.ts y ShoppingCart.ts                                 ║
 * ║     2. Ejecuta: npm run test:watch                                        ║
 * ║     3. Implementa test por test                                           ║
 * ║     4. Observa cómo emergen las clases y métodos                          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { Product } from './Product';
import { ShoppingCart } from './ShoppingCart';

/**
 * ============================================
 * PARTE 1: TESTS DE PRODUCT
 * ============================================
 *
 * Empezamos por la clase más simple: Product.
 * En TDD, siempre empezamos por los building blocks más simples.
 */

/**
 * TEST 1: Crear un producto válido
 *
 * Este test define la estructura básica de Product.
 */
test('Product: creates a product with valid data', () => {
  // ARRANGE & ACT
  const product = new Product('1', 'Laptop', 1000);

  // ASSERT
  assert.strictEqual(product.id, '1');
  assert.strictEqual(product.name, 'Laptop');
  assert.strictEqual(product.price, 1000);
});

/**
 * TESTS DE VALIDACIÓN: Product
 *
 * Estos tests nos obligan a añadir validaciones en el constructor.
 */
test('Product: rejects empty id', () => {
  assert.throws(
    () => new Product('', 'Laptop', 1000),
    /El ID del producto no puede estar vacío/
  );
});

test('Product: rejects empty name', () => {
  assert.throws(
    () => new Product('1', '', 1000),
    /El nombre del producto no puede estar vacío/
  );
});

test('Product: rejects negative price', () => {
  assert.throws(
    () => new Product('1', 'Laptop', -100),
    /El precio no puede ser negativo/
  );
});

/**
 * TEST: Calcular total para múltiples unidades
 *
 * Este test nos hizo añadir el método calculateTotal().
 */
test('Product: calculates total for quantity', () => {
  const product = new Product('1', 'Mouse', 25);

  assert.strictEqual(product.calculateTotal(1), 25);
  assert.strictEqual(product.calculateTotal(3), 75);
  assert.strictEqual(product.calculateTotal(10), 250);
});

test('Product: rejects negative quantity', () => {
  const product = new Product('1', 'Mouse', 25);

  assert.throws(
    () => product.calculateTotal(-1),
    /La cantidad no puede ser negativa/
  );
});

/**
 * ============================================
 * PARTE 2: TESTS DE SHOPPING CART
 * ============================================
 *
 * Ahora que tenemos Product, construimos ShoppingCart.
 * Cada test añade funcionalidad nueva.
 */

/**
 * TEST 1: Carrito vacío
 *
 * El caso más simple: un carrito recién creado.
 */
test('ShoppingCart: starts empty', () => {
  const cart = new ShoppingCart();

  assert.strictEqual(cart.isEmpty(), true);
  assert.strictEqual(cart.itemCount, 0);
  assert.strictEqual(cart.getTotal(), 0);
});

/**
 * TEST 2: Añadir un producto
 *
 * Este test nos obliga a implementar addProduct().
 */
test('ShoppingCart: adds a product', () => {
  // ARRANGE
  const cart = new ShoppingCart();
  const product = new Product('1', 'Laptop', 1000);

  // ACT
  cart.addProduct(product);

  // ASSERT
  assert.strictEqual(cart.isEmpty(), false);
  assert.strictEqual(cart.itemCount, 1);
});

/**
 * TEST 3: Calcular total con un producto
 */
test('ShoppingCart: calculates total with one product', () => {
  const cart = new ShoppingCart();
  const product = new Product('1', 'Laptop', 1000);

  cart.addProduct(product);

  assert.strictEqual(cart.getTotal(), 1000);
});

/**
 * TEST 4: Añadir múltiples productos
 */
test('ShoppingCart: adds multiple products', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);
  const mouse = new Product('2', 'Mouse', 25);

  cart.addProduct(laptop);
  cart.addProduct(mouse);

  assert.strictEqual(cart.itemCount, 2);
  assert.strictEqual(cart.getTotal(), 1025);
});

/**
 * TEST 5: Añadir el mismo producto dos veces
 *
 * Este test es CLAVE. Nos obliga a decidir:
 * ¿Duplicamos el item o incrementamos la cantidad?
 *
 * Decidimos: incrementar cantidad.
 * Esta decisión surgió del test, no de diseño previo.
 */
test('ShoppingCart: increments quantity when adding same product twice', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);

  cart.addProduct(laptop);
  cart.addProduct(laptop);

  assert.strictEqual(cart.itemCount, 1); // Solo 1 item distinto
  assert.strictEqual(cart.totalUnits, 2); // Pero 2 unidades
  assert.strictEqual(cart.getTotal(), 2000); // Precio x 2
});

/**
 * TEST 6: Añadir producto con cantidad específica
 */
test('ShoppingCart: adds product with specific quantity', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);

  cart.addProduct(laptop, 3);

  assert.strictEqual(cart.itemCount, 1);
  assert.strictEqual(cart.totalUnits, 3);
  assert.strictEqual(cart.getTotal(), 3000);
});

/**
 * TEST 7: No permitir cantidad <= 0
 */
test('ShoppingCart: rejects zero quantity', () => {
  const cart = new ShoppingCart();
  const product = new Product('1', 'Laptop', 1000);

  assert.throws(
    () => cart.addProduct(product, 0),
    /La cantidad debe ser mayor que 0/
  );
});

/**
 * TEST 8: Eliminar un producto
 *
 * Este test nos obliga a implementar removeProduct().
 */
test('ShoppingCart: removes a product', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);
  const mouse = new Product('2', 'Mouse', 25);

  cart.addProduct(laptop);
  cart.addProduct(mouse);
  cart.removeProduct('1');

  assert.strictEqual(cart.itemCount, 1);
  assert.strictEqual(cart.getTotal(), 25);
});

/**
 * TEST 9: Error al eliminar producto que no existe
 */
test('ShoppingCart: rejects removing non-existent product', () => {
  const cart = new ShoppingCart();

  assert.throws(
    () => cart.removeProduct('999'),
    /El producto no está en el carrito/
  );
});

/**
 * TEST 10: Actualizar cantidad de un producto
 *
 * Este test nos hizo crear updateQuantity().
 */
test('ShoppingCart: updates quantity of a product', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);

  cart.addProduct(laptop, 2);
  cart.updateQuantity('1', 5);

  assert.strictEqual(cart.totalUnits, 5);
  assert.strictEqual(cart.getTotal(), 5000);
});

/**
 * TEST 11: Actualizar cantidad a 0 elimina el producto
 */
test('ShoppingCart: removes product when quantity reaches zero', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);

  cart.addProduct(laptop);
  cart.updateQuantity('1', 0);

  assert.strictEqual(cart.isEmpty(), true);
});

/**
 * TEST 12: Error al actualizar producto que no existe
 */
test('ShoppingCart: rejects updating non-existent product', () => {
  const cart = new ShoppingCart();

  assert.throws(
    () => cart.updateQuantity('999', 5),
    /El producto no está en el carrito/
  );
});

/**
 * TEST 13: Vaciar el carrito
 */
test('ShoppingCart: clears all items', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);
  const mouse = new Product('2', 'Mouse', 25);

  cart.addProduct(laptop);
  cart.addProduct(mouse);
  cart.clear();

  assert.strictEqual(cart.isEmpty(), true);
  assert.strictEqual(cart.getTotal(), 0);
});

/**
 * TEST 14: Obtener items del carrito
 */
test('ShoppingCart: lists all items in cart', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);
  const mouse = new Product('2', 'Mouse', 25);

  cart.addProduct(laptop, 2);
  cart.addProduct(mouse, 1);

  const items = cart.getItems();

  assert.strictEqual(items.length, 2);
  assert.strictEqual(items[0].product.id, '1');
  assert.strictEqual(items[0].quantity, 2);
  assert.strictEqual(items[1].product.id, '2');
  assert.strictEqual(items[1].quantity, 1);
});

/**
 * TEST 15: Obtener un item específico
 */
test('ShoppingCart: finds specific item by product id', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);

  cart.addProduct(laptop, 3);

  const item = cart.getItem('1');

  assert.ok(item);
  assert.strictEqual(item.product.id, '1');
  assert.strictEqual(item.quantity, 3);
});

test('ShoppingCart: finds nothing for non-existent item', () => {
  const cart = new ShoppingCart();

  const item = cart.getItem('999');

  assert.strictEqual(item, undefined);
});

/**
 * ============================================
 * PARTE 3: LÓGICA DE NEGOCIO - DESCUENTOS
 * ============================================
 *
 * Estos tests añaden funcionalidad de descuentos.
 */

/**
 * TEST 16: Aplicar descuento porcentual
 */
test('ShoppingCart: applies percentage discount', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);

  cart.addProduct(laptop);

  // 10% de descuento
  const totalWithDiscount = cart.getTotalWithDiscount(10);

  assert.strictEqual(totalWithDiscount, 900);
});

test('ShoppingCart: calculates discount with multiple products', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);
  const mouse = new Product('2', 'Mouse', 100);

  cart.addProduct(laptop);
  cart.addProduct(mouse);

  // 20% de descuento sobre 1100 = 880
  const totalWithDiscount = cart.getTotalWithDiscount(20);

  assert.strictEqual(totalWithDiscount, 880);
});

/**
 * TEST 17: Validar porcentaje de descuento
 */
test('ShoppingCart: rejects negative discount', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);

  cart.addProduct(laptop);

  assert.throws(
    () => cart.getTotalWithDiscount(-10),
    /El porcentaje debe estar entre 0 y 100/
  );
});

test('ShoppingCart: rejects discount over one hundred percent', () => {
  const cart = new ShoppingCart();
  const laptop = new Product('1', 'Laptop', 1000);

  cart.addProduct(laptop);

  assert.throws(
    () => cart.getTotalWithDiscount(150),
    /El porcentaje debe estar entre 0 y 100/
  );
});

/**
 * ============================================
 * TESTS DE CASOS COMPLEJOS
 * ============================================
 *
 * Estos tests verifican escenarios más elaborados.
 */

/**
 * TEST 18: Escenario complejo - múltiples operaciones
 */
test('ShoppingCart: handles complex scenario with multiple operations', () => {
  const cart = new ShoppingCart();

  // Añadir productos
  const laptop = new Product('1', 'Laptop', 1000);
  const mouse = new Product('2', 'Mouse', 25);
  const keyboard = new Product('3', 'Keyboard', 75);

  cart.addProduct(laptop, 2); // 2000
  cart.addProduct(mouse, 3); // 75
  cart.addProduct(keyboard, 1); // 75

  // Total: 2150
  assert.strictEqual(cart.getTotal(), 2150);

  // Actualizar cantidad de mouse
  cart.updateQuantity('2', 5); // Ahora 5 mouses

  // Nuevo total: 2000 + 125 + 75 = 2200
  assert.strictEqual(cart.getTotal(), 2200);

  // Eliminar keyboard
  cart.removeProduct('3');

  // Nuevo total: 2000 + 125 = 2125
  assert.strictEqual(cart.getTotal(), 2125);

  // Aplicar 10% descuento
  const finalTotal = cart.getTotalWithDiscount(10);

  // 2125 - 10% = 1912.5
  assert.strictEqual(finalTotal, 1912.5);
});

/**
 * ============================================
 * REFLEXIÓN SOBRE ESTOS TESTS:
 * ============================================
 *
 * ¿Te diste cuenta del proceso?
 *
 * 1. Empezamos con Product (la clase más simple)
 * 2. Validaciones de Product (tests de errores)
 * 3. Carrito vacío (el caso más simple de ShoppingCart)
 * 4. Añadir un producto
 * 5. Añadir múltiples productos
 * 6. El mismo producto dos veces (decisión de diseño importante)
 * 7. Eliminar productos
 * 8. Actualizar cantidades
 * 9. Descuentos (nueva funcionalidad)
 * 10. Casos complejos (escenarios reales)
 *
 * Este es el FLUJO NATURAL de TDD en un proyecto real:
 * - Empiezas simple
 * - Añades funcionalidad gradualmente
 * - Cada test te guía en qué hacer
 * - El diseño EMERGE de los tests
 *
 * El Profe Millo dice: "Fíjate que NO diseñamos ShoppingCart
 * de antemano con todos sus métodos. Los métodos SURGIERON
 * porque los tests los necesitaban. Ese es el poder del TDD:
 * solo escribes código que realmente necesitas."
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DE LOS TESTS DE SHOPPING CART                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has visto:                                                               ║
 * ║  • TDD con múltiples clases (Product, ShoppingCart)                       ║
 * ║  • Tests de integración (clases que interactúan)                          ║
 * ║  • Validaciones de negocio extensivas                                     ║
 * ║  • Cómo el diseño emerge (CartItem, métodos, etc.)                        ║
 * ║  • Tests de escenarios complejos                                          ║
 * ║  • Progresión: simple → complejo                                          ║
 * ║                                                                           ║
 * ║  🎉 ¡FELICIDADES!                                                         ║
 * ║     Has completado las 3 katas de TDD.                                    ║
 * ║     Ahora entiendes el ciclo Red-Green-Refactor de verdad.               ║
 * ║                                                                           ║
 * ║  🎯 EJERCICIO FINAL:                                                      ║
 * ║     Borra ShoppingCart.ts y Product.ts.                                   ║
 * ║     Reimpleméntalos desde cero siguiendo estos tests.                     ║
 * ║     Observa cómo el diseño emerge naturalmente.                           ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE PASO:                                                       ║
 * ║     Aplica TDD a proyectos reales en este repositorio:                    ║
 * ║     - repository-pattern (TDD + arquitectura en capas)                    ║
 * ║     - controller-service (TDD + APIs HTTP)                                ║
 * ║     - library-system (TDD + hexagonal)                                    ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
