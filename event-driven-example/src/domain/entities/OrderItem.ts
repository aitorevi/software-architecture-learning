import { Money } from '../value-objects';

/**
 * OrderItem - Value object representing a line item in an order
 */
export interface OrderItemProps {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
}

export class OrderItem {
  private constructor(private readonly props: OrderItemProps) {}

  static create(props: OrderItemProps): OrderItem {
    if (!props.productId) {
      throw new Error('Product ID is required');
    }
    if (!props.productName) {
      throw new Error('Product name is required');
    }
    if (props.quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    return new OrderItem(props);
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  get totalPrice(): Money {
    return this.props.unitPrice.multiply(this.props.quantity);
  }

  toJSON(): {
    productId: string;
    productName: string;
    quantity: number;
    unitPriceInCents: number;
  } {
    return {
      productId: this.props.productId,
      productName: this.props.productName,
      quantity: this.props.quantity,
      unitPriceInCents: this.props.unitPrice.amountInCents,
    };
  }
}
