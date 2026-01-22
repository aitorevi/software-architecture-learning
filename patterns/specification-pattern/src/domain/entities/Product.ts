/**
 * Product - Entidad de Dominio
 *
 * Representa un producto en nuestro catálogo.
 * Esta es la entidad sobre la que aplicaremos las especificaciones.
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
    this._tags = [...props.tags];
  }

  // Getters
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
    return [...this._tags];
  }

  // Métodos de negocio
  isInStock(): boolean {
    return this._stock > 0;
  }

  hasTag(tag: string): boolean {
    return this._tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  // Factory method
  static create(props: Omit<ProductProps, 'id'>): Product {
    return new Product({
      ...props,
      id: crypto.randomUUID(),
    });
  }
}
