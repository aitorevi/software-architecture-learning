import { Money } from '../../shared/kernel';

/**
 * SALES CONTEXT - Order Entity
 *
 * BOUNDED CONTEXTS KEY CONCEPT:
 * This Order is specific to the SALES context.
 * It focuses on the commercial transaction.
 *
 * Note: We don't import Product from Catalog!
 * Instead, we have our own OrderItem with the info we need.
 * This is called an ANTI-CORRUPTION LAYER.
 */

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  productId: string; // Reference by ID, not by entity
  productName: string; // Cached at order time
  quantity: number;
  unitPrice: Money; // Captured at order time (price might change later)
}

export interface OrderProps {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  paidAt: Date | null;
}

export class Order {
  private constructor(private props: OrderProps) {}

  static create(params: {
    id: string;
    customerId: string;
    items: OrderItem[];
    shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  }): Order {
    if (params.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    return new Order({
      id: params.id,
      customerId: params.customerId,
      items: params.items,
      status: OrderStatus.PENDING,
      shippingAddress: params.shippingAddress,
      createdAt: new Date(),
      paidAt: null,
    });
  }

  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get items(): readonly OrderItem[] {
    return this.props.items;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get shippingAddress() {
    return this.props.shippingAddress;
  }

  get total(): Money {
    return this.props.items.reduce(
      (sum, item) => sum.add(item.unitPrice.multiply(item.quantity)),
      Money.zero()
    );
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  markAsPaid(): void {
    if (this.props.status !== OrderStatus.PENDING) {
      throw new Error('Order is not pending');
    }
    this.props.status = OrderStatus.PAID;
    this.props.paidAt = new Date();
  }

  cancel(reason: string): void {
    if (this.props.status === OrderStatus.PAID) {
      throw new Error('Cannot cancel paid order');
    }
    this.props.status = OrderStatus.CANCELLED;
  }
}

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
}
