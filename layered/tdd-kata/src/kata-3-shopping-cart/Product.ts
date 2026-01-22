/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🎯 KATA 3: SHOPPING CART - ENTIDAD PRODUCT                               ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 ESTA ES LA PRIMERA ENTIDAD:                                           ║
 * ║     Product representa un producto en nuestro sistema.                    ║
 * ║                                                                           ║
 * ║  💡 NOTA TDD:                                                             ║
 * ║     Esta clase surgió de los tests. No la diseñamos de antemano.         ║
 * ║     Los tests nos dijeron qué propiedades y métodos necesitábamos.       ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Product - Representa un producto
 *
 * Esta es una entidad simple. En TDD, empezamos con lo más simple.
 *
 * ¿Por qué una clase y no solo un objeto?
 * - Podemos añadir validaciones en el constructor
 * - Podemos añadir métodos de negocio si es necesario
 * - Encapsulamos el concepto de "Producto"
 */
export class Product {
  /**
   * ID único del producto
   * En un sistema real, esto vendría de la base de datos
   */
  readonly id: string;

  /**
   * Nombre del producto
   */
  readonly name: string;

  /**
   * Precio unitario del producto
   * Siempre debe ser >= 0
   */
  readonly price: number;

  constructor(id: string, name: string, price: number) {
    // VALIDACIONES: El dominio se protege a sí mismo
    if (!id || id.trim() === '') {
      throw new Error('El ID del producto no puede estar vacío');
    }

    if (!name || name.trim() === '') {
      throw new Error('El nombre del producto no puede estar vacío');
    }

    if (price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    this.id = id;
    this.name = name;
    this.price = price;
  }

  /**
   * Calcula el precio para una cantidad específica
   *
   * Este método surgió durante el desarrollo.
   * Los tests nos mostraron que necesitábamos calcular
   * el total de múltiples unidades del mismo producto.
   */
  calculateTotal(quantity: number): number {
    if (quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }

    return this.price * quantity;
  }
}

/**
 * El Profe Millo dice: "Fíjate que Product es inmutable
 * (todos los campos son readonly). Esto es intencional.
 * Un producto no cambia de precio o nombre después de crearse.
 * Si necesitas un precio diferente, creas un nuevo Product.
 * Esto hace el código más predecible y fácil de testear."
 */
