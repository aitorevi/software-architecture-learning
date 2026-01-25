/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 3 DE 6: LA ENTIDAD PRODUCT
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Buenas, mi niño! Este es el objeto sobre el que aplicamos las especificaciones.
 *
 * 🎯 QUÉ ES UNA ENTIDAD:
 *
 * Una entidad es un objeto de dominio con identidad única (id).
 * Tiene datos (propiedades) y comportamiento (métodos).
 *
 * 💡 RELACIÓN CON SPECIFICATIONS:
 *
 * Las especificaciones EXAMINAN esta entidad para decidir si cumple reglas:
 *
 *   Specification<Product> → recibe un Product → devuelve boolean
 *
 * 🏗️ ESTRUCTURA:
 *
 * ┌──────────────────────────┐
 * │       Product            │
 * │  - id (readonly)         │ ← Identidad única
 * │  - name                  │ ← NameContainsSpecification
 * │  - price                 │ ← PriceLessThanSpecification
 * │  - category              │ ← CategorySpecification
 * │  - stock                 │ ← InStockSpecification
 * │  - tags                  │ ← HasTagSpecification
 * └──────────────────────────┘
 *
 * 🔒 ENCAPSULACIÓN:
 *
 * Las propiedades son privadas (_name, _price, etc.)
 * Se accede a través de getters públicos (name, price, etc.)
 * Esto protege la integridad de los datos.
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de ver la entidad, ve a:
 *   → SearchProductsUseCase.ts (ver cómo se USAN las especificaciones)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ProductProps {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  tags: string[];
}

export class Product {
  private readonly _id: string;
  private _name: string;
  private _price: number;
  private _category: string;
  private _stock: number;
  private _tags: string[];

  constructor(props: ProductProps) {
    this._id = props.id;
    this._name = props.name;
    this._price = props.price;
    this._category = props.category;
    this._stock = props.stock;
    this._tags = [...props.tags]; // Copia defensiva
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 📖 GETTERS - Acceso Controlado a las Propiedades
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Los getters permiten acceso de solo lectura a las propiedades privadas.
   * Las especificaciones usan estos getters para evaluar reglas:
   *
   *   product.price → PriceLessThanSpecification lo usa
   *   product.stock → InStockSpecification lo usa
   *   product.category → CategorySpecification lo usa
   */

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get price(): number {
    return this._price;
  }

  get category(): string {
    return this._category;
  }

  get stock(): number {
    return this._stock;
  }

  get tags(): string[] {
    // Devuelve una copia para evitar mutaciones externas
    return [...this._tags];
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🎯 MÉTODOS DE NEGOCIO (Opcional)
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Estos métodos encapsulan lógica de negocio dentro de la entidad.
   *
   * 💡 NOTA: Podrías usar estos métodos dentro de especificaciones:
   *
   *   isSatisfiedBy(product: Product): boolean {
   *     return product.isInStock(); // En vez de product.stock > 0
   *   }
   *
   * Ambos enfoques son válidos. Usa el que prefieras según tu dominio.
   */

  isInStock(): boolean {
    return this._stock > 0;
  }

  hasTag(tag: string): boolean {
    return this._tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🏭 FACTORY METHOD - Crear productos sin gestionar IDs
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Este método estático facilita la creación de productos.
   * El ID se genera automáticamente.
   *
   * 📝 EJEMPLO DE USO:
   *
   *   const product = Product.create({
   *     name: 'Laptop',
   *     price: 999,
   *     category: 'electronics',
   *     stock: 10,
   *     tags: ['new', 'featured']
   *   });
   */
  static create(props: Omit<ProductProps, 'id'>): Product {
    return new Product({
      ...props,
      id: crypto.randomUUID(),
    });
  }
}
