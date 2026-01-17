import { ProductId, Quantity, Money, Sku } from '../value-objects';
import {
  DomainEvent,
  ProductAddedEvent,
  StockIncreasedEvent,
  StockDecreasedEvent,
  LowStockAlertEvent,
  ProductPriceUpdatedEvent,
} from '../events';

/**
 * CQRS EXAMPLE - Product Entity (Write Model)
 *
 * CQRS KEY CONCEPT:
 * This is the WRITE MODEL - optimized for business operations and invariants.
 * It contains all the business rules and emits events when state changes.
 *
 * The READ MODEL (in infrastructure/persistence/read) is separate and
 * optimized for queries. It can have a completely different structure!
 *
 * Write Model responsibilities:
 * - Enforce business rules (invariants)
 * - Emit domain events
 * - Maintain consistency
 *
 * What it does NOT do:
 * - Optimize for specific queries
 * - Contain data only needed for display
 */

export interface ProductProps {
  id: ProductId;
  sku: Sku;
  name: string;
  description: string;
  quantity: Quantity;
  price: Money;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private readonly domainEvents: DomainEvent[] = [];
  private props: Omit<ProductProps, 'id'>;

  private constructor(
    private readonly _id: ProductId,
    props: Omit<ProductProps, 'id'>
  ) {
    this.props = props;
  }

  // === Factory Methods ===

  /**
   * Creates a new product in the inventory.
   * Use this when adding a product for the first time.
   */
  static create(params: {
    id: ProductId;
    sku: Sku;
    name: string;
    description?: string;
    initialQuantity: Quantity;
    price: Money;
    lowStockThreshold?: number;
  }): Product {
    Product.validateName(params.name);

    const now = new Date();
    const product = new Product(params.id, {
      sku: params.sku,
      name: params.name.trim(),
      description: params.description?.trim() ?? '',
      quantity: params.initialQuantity,
      price: params.price,
      lowStockThreshold: params.lowStockThreshold ?? 10,
      createdAt: now,
      updatedAt: now,
    });

    product.addDomainEvent(
      new ProductAddedEvent(
        params.id.value,
        params.sku.value,
        params.name,
        params.initialQuantity.value,
        params.price.amountInCents
      )
    );

    // Check if initial stock is already low
    if (product.isLowStock()) {
      product.addDomainEvent(
        new LowStockAlertEvent(
          params.id.value,
          params.sku.value,
          params.initialQuantity.value,
          product.props.lowStockThreshold
        )
      );
    }

    return product;
  }

  /**
   * Reconstitutes a product from persistence.
   * Does not emit events.
   */
  static reconstitute(props: ProductProps): Product {
    return new Product(props.id, {
      sku: props.sku,
      name: props.name,
      description: props.description,
      quantity: props.quantity,
      price: props.price,
      lowStockThreshold: props.lowStockThreshold,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  // === Validation ===

  private static validateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new ProductValidationError('Product name cannot be empty');
    }
    if (name.length > 200) {
      throw new ProductValidationError(
        'Product name must be at most 200 characters'
      );
    }
  }

  // === Getters ===

  get id(): ProductId {
    return this._id;
  }

  get sku(): Sku {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get price(): Money {
    return this.props.price;
  }

  get lowStockThreshold(): number {
    return this.props.lowStockThreshold;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // === Business Logic ===

  /**
   * Checks if the product is at or below the low stock threshold.
   */
  isLowStock(): boolean {
    return this.props.quantity.isLessThanOrEqual(this.props.lowStockThreshold);
  }

  /**
   * Checks if the product is out of stock.
   */
  isOutOfStock(): boolean {
    return this.props.quantity.isZero();
  }

  /**
   * Increases the stock quantity (e.g., received shipment).
   */
  increaseStock(amount: Quantity, reason: string): void {
    const wasLowStock = this.isLowStock();

    this.props.quantity = this.props.quantity.add(amount);
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new StockIncreasedEvent(
        this._id.value,
        amount.value,
        this.props.quantity.value,
        reason
      )
    );

    // If we were at low stock and now we're not, that's good!
    // (In a real system, you might emit a "StockReplenishedEvent")
  }

  /**
   * Decreases the stock quantity (e.g., sale, damage, adjustment).
   */
  decreaseStock(amount: Quantity, reason: string): void {
    const wasLowStock = this.isLowStock();

    // This will throw if we don't have enough stock
    this.props.quantity = this.props.quantity.subtract(amount);
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new StockDecreasedEvent(
        this._id.value,
        amount.value,
        this.props.quantity.value,
        reason
      )
    );

    // Emit alert if we just dropped to low stock
    if (!wasLowStock && this.isLowStock()) {
      this.addDomainEvent(
        new LowStockAlertEvent(
          this._id.value,
          this.props.sku.value,
          this.props.quantity.value,
          this.props.lowStockThreshold
        )
      );
    }
  }

  /**
   * Updates the product price.
   */
  updatePrice(newPrice: Money): void {
    if (this.props.price.equals(newPrice)) {
      return; // No change
    }

    const oldPrice = this.props.price;
    this.props.price = newPrice;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new ProductPriceUpdatedEvent(
        this._id.value,
        oldPrice.amountInCents,
        newPrice.amountInCents
      )
    );
  }

  /**
   * Updates the low stock threshold.
   */
  setLowStockThreshold(threshold: number): void {
    if (threshold < 0) {
      throw new ProductValidationError(
        'Low stock threshold cannot be negative'
      );
    }
    this.props.lowStockThreshold = threshold;
    this.props.updatedAt = new Date();
  }

  // === Domain Events ===

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}

// === Exceptions ===

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductValidationError';
  }
}

export class ProductNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Product not found: ${identifier}`);
    this.name = 'ProductNotFoundError';
  }
}

export class InsufficientStockError extends Error {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Insufficient stock for product ${productId}: requested ${requested}, available ${available}`
    );
    this.name = 'InsufficientStockError';
  }
}
