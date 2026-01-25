import { OrderId } from '../value-objects/OrderId.js';
import { Money } from '../value-objects/Money.js';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface OrderProps {
  id?: OrderId;
  customerId: string;
  items: OrderItem[];
  status?: OrderStatus;
  paymentMethod?: string;
  createdAt?: Date;
  paidAt?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
}

/**
 * Entidad: Order (Pedido)
 *
 * Representa un pedido de compra en el sistema.
 * Contiene items y gestiona su estado de pago.
 */
export class Order {
  private readonly _id: OrderId;
  private readonly _customerId: string;
  private readonly _items: OrderItem[];
  private _status: OrderStatus;
  private _paymentMethod?: string;
  private readonly _createdAt: Date;
  private _paidAt?: Date;

  constructor(props: OrderProps) {
    this._id = props.id || OrderId.create();
    this._customerId = props.customerId;
    this._items = [...props.items];
    this._status = props.status || OrderStatus.PENDING;
    this._paymentMethod = props.paymentMethod;
    this._createdAt = props.createdAt || new Date();
    this._paidAt = props.paidAt;

    if (this._items.length === 0) {
      throw new Error('Order must have at least one item');
    }
  }

  get id(): OrderId {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get status(): OrderStatus {
    return this._status;
  }

  get paymentMethod(): string | undefined {
    return this._paymentMethod;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get paidAt(): Date | undefined {
    return this._paidAt;
  }

  calculateTotal(): Money {
    if (this._items.length === 0) {
      return Money.create(0);
    }

    return this._items.reduce((total, item) => {
      const itemTotal = item.unitPrice.multiply(item.quantity);
      return total.add(itemTotal);
    }, Money.create(0, this._items[0].unitPrice.currency));
  }

  markAsPaid(paymentMethod: string): void {
    if (this._status === OrderStatus.PAID) {
      throw new Error('Order is already paid');
    }
    if (this._status === OrderStatus.CANCELLED) {
      throw new Error('Cannot pay a cancelled order');
    }

    this._status = OrderStatus.PAID;
    this._paymentMethod = paymentMethod;
    this._paidAt = new Date();
  }

  markAsFailed(): void {
    if (this._status === OrderStatus.PAID) {
      throw new Error('Cannot mark a paid order as failed');
    }

    this._status = OrderStatus.FAILED;
  }

  cancel(): void {
    if (this._status === OrderStatus.PAID) {
      throw new Error('Cannot cancel a paid order');
    }

    this._status = OrderStatus.CANCELLED;
  }

  isPending(): boolean {
    return this._status === OrderStatus.PENDING;
  }

  isPaid(): boolean {
    return this._status === OrderStatus.PAID;
  }
}
