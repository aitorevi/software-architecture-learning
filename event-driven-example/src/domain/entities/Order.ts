import { OrderId, Money, Email, Address } from '../value-objects';
import { OrderItem, OrderItemProps } from './OrderItem';
import {
  DomainEvent,
  OrderCreatedEvent,
  PaymentReceivedEvent,
  OrderShippedEvent,
  OrderDeliveredEvent,
  OrderCancelledEvent,
} from '../events';

/**
 * EVENT-DRIVEN EXAMPLE - Order Entity
 *
 * EVENT-DRIVEN KEY CONCEPT:
 * The Order entity emits domain events as state changes.
 * These events are collected and published AFTER the transaction.
 *
 * Benefits:
 * - Side effects (email, notifications) happen via events
 * - Order doesn't need to know about email service, inventory, etc.
 * - Easy to add new reactions without changing Order
 */

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface OrderProps {
  id: OrderId;
  customerEmail: Email;
  items: OrderItem[];
  shippingAddress: Address;
  status: OrderStatus;
  paymentId: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
}

export class Order {
  private readonly domainEvents: DomainEvent[] = [];
  private props: Omit<OrderProps, 'id'>;

  private constructor(
    private readonly _id: OrderId,
    props: Omit<OrderProps, 'id'>
  ) {
    this.props = props;
  }

  // === Factory Methods ===

  /**
   * Creates a new order and emits OrderCreatedEvent
   */
  static create(params: {
    id: OrderId;
    customerEmail: Email;
    items: OrderItemProps[];
    shippingAddress: Address;
  }): Order {
    if (params.items.length === 0) {
      throw new OrderValidationError('Order must have at least one item');
    }

    const orderItems = params.items.map((item) =>
      OrderItem.create({
        ...item,
        unitPrice: Money.fromCents(item.unitPrice.amountInCents),
      })
    );

    const now = new Date();
    const order = new Order(params.id, {
      customerEmail: params.customerEmail,
      items: orderItems,
      shippingAddress: params.shippingAddress,
      status: OrderStatus.PENDING,
      paymentId: null,
      trackingNumber: null,
      carrier: null,
      createdAt: now,
      updatedAt: now,
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      cancellationReason: null,
    });

    // Emit creation event
    order.addDomainEvent(
      new OrderCreatedEvent(
        params.id.value,
        params.customerEmail.value,
        orderItems.map((i) => i.toJSON()),
        order.total.amountInCents,
        params.shippingAddress.toJSON()
      )
    );

    return order;
  }

  static reconstitute(props: OrderProps): Order {
    return new Order(props.id, {
      customerEmail: props.customerEmail,
      items: props.items,
      shippingAddress: props.shippingAddress,
      status: props.status,
      paymentId: props.paymentId,
      trackingNumber: props.trackingNumber,
      carrier: props.carrier,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      paidAt: props.paidAt,
      shippedAt: props.shippedAt,
      deliveredAt: props.deliveredAt,
      cancelledAt: props.cancelledAt,
      cancellationReason: props.cancellationReason,
    });
  }

  // === Getters ===

  get id(): OrderId {
    return this._id;
  }

  get customerEmail(): Email {
    return this.props.customerEmail;
  }

  get items(): readonly OrderItem[] {
    return this.props.items;
  }

  get shippingAddress(): Address {
    return this.props.shippingAddress;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get paymentId(): string | null {
    return this.props.paymentId;
  }

  get trackingNumber(): string | null {
    return this.props.trackingNumber;
  }

  get carrier(): string | null {
    return this.props.carrier;
  }

  get total(): Money {
    return this.props.items.reduce(
      (sum, item) => sum.add(item.totalPrice),
      Money.zero()
    );
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isPending(): boolean {
    return this.props.status === OrderStatus.PENDING;
  }

  get isPaid(): boolean {
    return [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(
      this.props.status
    );
  }

  get isCancelled(): boolean {
    return this.props.status === OrderStatus.CANCELLED;
  }

  // === Behavior Methods ===

  /**
   * Records that payment has been received.
   * Emits PaymentReceivedEvent.
   */
  markAsPaid(paymentId: string, paymentMethod: string): void {
    if (this.props.status !== OrderStatus.PENDING) {
      throw new OrderValidationError(
        `Cannot mark as paid: order is ${this.props.status}`
      );
    }

    this.props.status = OrderStatus.PAID;
    this.props.paymentId = paymentId;
    this.props.paidAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new PaymentReceivedEvent(
        this._id.value,
        paymentId,
        this.total.amountInCents,
        paymentMethod
      )
    );
  }

  /**
   * Records that the order has been shipped.
   * Emits OrderShippedEvent.
   */
  markAsShipped(
    trackingNumber: string,
    carrier: string,
    estimatedDelivery: Date
  ): void {
    if (this.props.status !== OrderStatus.PAID) {
      throw new OrderValidationError(
        `Cannot ship: order is ${this.props.status}`
      );
    }

    this.props.status = OrderStatus.SHIPPED;
    this.props.trackingNumber = trackingNumber;
    this.props.carrier = carrier;
    this.props.shippedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new OrderShippedEvent(
        this._id.value,
        trackingNumber,
        carrier,
        estimatedDelivery
      )
    );
  }

  /**
   * Records that the order has been delivered.
   * Emits OrderDeliveredEvent.
   */
  markAsDelivered(): void {
    if (this.props.status !== OrderStatus.SHIPPED) {
      throw new OrderValidationError(
        `Cannot mark as delivered: order is ${this.props.status}`
      );
    }

    this.props.status = OrderStatus.DELIVERED;
    this.props.deliveredAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new OrderDeliveredEvent(this._id.value, this.props.deliveredAt)
    );
  }

  /**
   * Cancels the order.
   * Emits OrderCancelledEvent.
   */
  cancel(reason: string): void {
    if (
      this.props.status === OrderStatus.SHIPPED ||
      this.props.status === OrderStatus.DELIVERED
    ) {
      throw new OrderValidationError(
        `Cannot cancel: order is already ${this.props.status}`
      );
    }
    if (this.props.status === OrderStatus.CANCELLED) {
      throw new OrderValidationError('Order is already cancelled');
    }

    const refundAmount = this.isPaid ? this.total.amountInCents : 0;

    this.props.status = OrderStatus.CANCELLED;
    this.props.cancelledAt = new Date();
    this.props.cancellationReason = reason;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new OrderCancelledEvent(this._id.value, reason, refundAmount)
    );
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

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
    this.name = 'OrderNotFoundError';
  }
}
