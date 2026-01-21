import { Money } from '../../shared/kernel';

/**
 * CATALOG CONTEXT - Product Entity
 *
 * BOUNDED CONTEXTS KEY CONCEPT:
 * This Product is specific to the CATALOG context.
 * It focuses on product information for browsing/display.
 *
 * The Sales context has its OWN concept of "Product" (OrderItem)
 * The Shipping context doesn't care about products at all!
 *
 * Same term, different meanings in different contexts.
 * This is the essence of Bounded Contexts.
 */

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Money;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private constructor(private props: ProductProps) {}

  static create(params: {
    id: string;
    name: string;
    description: string;
    price: Money;
    category: string;
  }): Product {
    if (!params.name || params.name.trim() === '') {
      throw new Error('Product name is required');
    }

    const now = new Date();
    return new Product({
      id: params.id,
      name: params.name.trim(),
      description: params.description?.trim() ?? '',
      price: params.price,
      category: params.category,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get price(): Money {
    return this.props.price;
  }

  get category(): string {
    return this.props.category;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updatePrice(newPrice: Money): void {
    this.props.price = newPrice;
    this.props.updatedAt = new Date();
  }

  discontinue(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }
}

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
}
