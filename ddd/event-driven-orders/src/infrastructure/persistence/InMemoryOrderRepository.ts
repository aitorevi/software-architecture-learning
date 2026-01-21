import {
  Order,
  OrderId,
  OrderStatus,
  OrderRepository,
  Email,
  Address,
  Money,
  OrderItem,
} from '../../domain';

interface StoredOrder {
  id: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPriceInCents: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
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

export class InMemoryOrderRepository implements OrderRepository {
  private orders: Map<string, StoredOrder> = new Map();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.value, {
      id: order.id.value,
      customerEmail: order.customerEmail.value,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPriceInCents: item.unitPrice.amountInCents,
      })),
      shippingAddress: order.shippingAddress.toJSON(),
      status: order.status,
      paymentId: order.paymentId,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: null, // Would need to add these getters to Order
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      cancellationReason: null,
    });
  }

  async findById(id: OrderId): Promise<Order | null> {
    const data = this.orders.get(id.value);
    if (!data) {
      return null;
    }
    return this.toDomain(data);
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((o) => o.status === status)
      .map((data) => this.toDomain(data));
  }

  async findByCustomerEmail(email: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((o) => o.customerEmail === email.toLowerCase())
      .map((data) => this.toDomain(data));
  }

  private toDomain(data: StoredOrder): Order {
    return Order.reconstitute({
      id: OrderId.create(data.id),
      customerEmail: Email.create(data.customerEmail),
      items: data.items.map((item) =>
        OrderItem.create({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: Money.fromCents(item.unitPriceInCents),
        })
      ),
      shippingAddress: Address.create(data.shippingAddress),
      status: data.status,
      paymentId: data.paymentId,
      trackingNumber: data.trackingNumber,
      carrier: data.carrier,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      paidAt: data.paidAt,
      shippedAt: data.shippedAt,
      deliveredAt: data.deliveredAt,
      cancelledAt: data.cancelledAt,
      cancellationReason: data.cancellationReason,
    });
  }

  // Helper for getting customer email (used by shipping notification handler)
  async getCustomerEmail(orderId: string): Promise<string | null> {
    const data = this.orders.get(orderId);
    return data?.customerEmail ?? null;
  }

  clear(): void {
    this.orders.clear();
  }
}
