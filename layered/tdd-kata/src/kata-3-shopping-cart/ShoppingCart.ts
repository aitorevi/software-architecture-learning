/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🎯 KATA 3: SHOPPING CART - ENTIDAD PRINCIPAL                             ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • TDD con múltiples clases que interactúan                            ║
 * ║     • Cómo el diseño emerge de los tests                                  ║
 * ║     • Validaciones de negocio guiadas por tests                           ║
 * ║     • Refactorización en un contexto real                                 ║
 * ║                                                                           ║
 * ║  💡 CONSEJO:                                                              ║
 * ║     No leas todo el código de golpe. Ve a los tests primero.             ║
 * ║     Observa cómo cada método existe porque un test lo pidió.             ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { Product } from './Product.js';

/**
 * CartItem - Representa un producto en el carrito con su cantidad
 *
 * Esta interface surgió durante el desarrollo.
 * Nos dimos cuenta que necesitábamos guardar no solo el producto,
 * sino también cuántas unidades de ese producto hay en el carrito.
 *
 * En TDD, estas decisiones de diseño NO se toman por adelantado.
 * Emergen naturalmente cuando los tests te las piden.
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * ShoppingCart - Carrito de compras
 *
 * Esta clase se desarrolló test por test, método por método.
 * Cada método existe porque un test lo necesitó.
 *
 * El Profe Millo dice: "Así es como funciona TDD en el mundo real.
 * No diseñas toda la clase de antemano. Dejas que los tests te guíen."
 */
export class ShoppingCart {
  /**
   * Items en el carrito
   * Es privado porque nadie de fuera debería modificarlo directamente
   */
  private items: CartItem[] = [];

  /**
   * Añade un producto al carrito
   *
   * Si el producto ya existe, incrementa la cantidad.
   * Si no existe, lo añade con cantidad 1.
   *
   * Este comportamiento surgió de los tests.
   * Primero testeamos añadir un producto.
   * Luego testeamos añadir el mismo producto dos veces.
   * Ese segundo test nos obligó a implementar la lógica de
   * "si ya existe, incrementa cantidad".
   */
  addProduct(product: Product, quantity: number = 1): void {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor que 0');
    }

    // Buscar si el producto ya está en el carrito
    const existingItem = this.items.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      // Si ya existe, incrementar cantidad
      existingItem.quantity += quantity;
    } else {
      // Si no existe, añadirlo
      this.items.push({ product, quantity });
    }
  }

  /**
   * Elimina un producto del carrito completamente
   *
   * Este método surgió cuando escribimos el test de eliminar.
   */
  removeProduct(productId: string): void {
    const index = this.items.findIndex(
      (item) => item.product.id === productId
    );

    if (index === -1) {
      throw new Error('El producto no está en el carrito');
    }

    this.items.splice(index, 1);
  }

  /**
   * Actualiza la cantidad de un producto
   *
   * Este método surgió de un test que quería cambiar la cantidad
   * de un producto sin tener que eliminarlo y volverlo a añadir.
   */
  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }

    if (newQuantity === 0) {
      // Si la cantidad es 0, eliminar el producto
      this.removeProduct(productId);
      return;
    }

    const item = this.items.find((item) => item.product.id === productId);

    if (!item) {
      throw new Error('El producto no está en el carrito');
    }

    item.quantity = newQuantity;
  }

  /**
   * Calcula el total del carrito
   *
   * Este fue uno de los primeros tests: "El total de un carrito vacío es 0"
   * Luego: "El total con un producto"
   * Luego: "El total con múltiples productos"
   *
   * La implementación fue evolucionando con cada test.
   */
  getTotal(): number {
    return this.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  /**
   * Devuelve el número de items distintos en el carrito
   *
   * Nota: Esto cuenta PRODUCTOS distintos, no unidades totales.
   * Si tienes 3 manzanas y 2 peras, itemCount es 2.
   */
  get itemCount(): number {
    return this.items.length;
  }

  /**
   * Devuelve el número total de unidades en el carrito
   *
   * Esto cuenta TODAS las unidades.
   * Si tienes 3 manzanas y 2 peras, totalUnits es 5.
   *
   * Este método surgió cuando un test preguntó:
   * "¿Cómo sé cuántas unidades totales hay?"
   */
  get totalUnits(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Verifica si el carrito está vacío
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Vacía el carrito completamente
   *
   * Este método surgió de un test de "limpiar carrito".
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Devuelve una copia de los items (para no exponer el array interno)
   *
   * Esto es encapsulación: no queremos que alguien modifique
   * this.items directamente desde fuera.
   */
  getItems(): CartItem[] {
    // Devolvemos una copia para evitar modificaciones externas
    return [...this.items];
  }

  /**
   * Obtiene un item específico por ID de producto
   */
  getItem(productId: string): CartItem | undefined {
    return this.items.find((item) => item.product.id === productId);
  }

  /**
   * Aplica un descuento porcentual al total
   *
   * Este método surgió cuando quisimos añadir descuentos.
   * En un sistema real, podrías tener una clase Discount más elaborada.
   *
   * @param percentage - Porcentaje de descuento (0-100)
   * @returns El total con descuento aplicado
   */
  getTotalWithDiscount(percentage: number): number {
    if (percentage < 0 || percentage > 100) {
      throw new Error('El porcentaje debe estar entre 0 y 100');
    }

    const total = this.getTotal();
    const discount = (total * percentage) / 100;

    return total - discount;
  }
}

/**
 * ============================================
 * EJERCICIO PARA TI:
 * ============================================
 *
 * 1. BORRA ShoppingCart.ts y Product.ts
 *
 * 2. Ejecuta: npm run test:watch
 *
 * 3. Ve a tests/shopping-cart.test.ts
 *
 * 4. Implementa los tests UNO POR UNO:
 *    - Empieza con Product (más simple)
 *    - Luego ShoppingCart vacío
 *    - Luego añadir productos
 *    - Luego calcular total
 *    - Etc.
 *
 * 5. Observa cómo el DISEÑO EMERGE de los tests
 *    - No sabías que necesitabas CartItem hasta que un test lo pidió
 *    - No sabías que necesitabas updateQuantity hasta que lo quisiste testear
 *
 * El Profe Millo dice: "Este kata simula desarrollo real.
 * Tienes múltiples clases, lógica de negocio, validaciones.
 * Los tests te guían en cada decisión. Confía en el proceso."
 */

/**
 * ============================================
 * EXTENSIÓN: Más features (para practicar)
 * ============================================
 *
 * Una vez domines lo básico, añade estos features con TDD:
 *
 * 1. Stock limitado
 *    - Product tiene un campo 'stock'
 *    - No puedes añadir al carrito si no hay stock
 *    - Test: addProduct lanza error si quantity > stock
 *
 * 2. Descuentos por cantidad
 *    - Si compras 5+ del mismo producto, 10% descuento
 *    - Test: verify discount is applied automatically
 *
 * 3. Cupones de descuento
 *    - Clase Coupon con código y descuento
 *    - Método applyCoupon(code)
 *    - Test: valid coupon applies discount
 *    - Test: invalid coupon throws error
 *
 * 4. Impuestos
 *    - Método getTotalWithTax(taxRate)
 *    - Test: calculates tax correctly
 *
 * Recuerda: TEST PRIMERO, código después.
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL KATA 3                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • TDD con múltiples clases (Product, ShoppingCart)                       ║
 * ║  • Cómo el diseño emerge (CartItem surgió de los tests)                  ║
 * ║  • Validaciones de negocio guiadas por tests                              ║
 * ║  • Encapsulación (no exponer el array interno)                            ║
 * ║  • Métodos que surgieron de necesidades reales en los tests              ║
 * ║                                                                           ║
 * ║  🎉 ¡FELICIDADES!                                                         ║
 * ║     Has completado las 3 katas. Ahora sabes TDD de verdad.               ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE PASO:                                                       ║
 * ║     Aplica TDD a los otros proyectos del repositorio:                     ║
 * ║     - repository-pattern (TDD + arquitectura)                             ║
 * ║     - controller-service (TDD + HTTP)                                     ║
 * ║     - library-system (TDD + hexagonal)                                    ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
