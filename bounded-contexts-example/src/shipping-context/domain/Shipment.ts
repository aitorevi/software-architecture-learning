/**
 * SHIPPING CONTEXT - Shipment Entity
 *
 * BOUNDED CONTEXTS KEY CONCEPT:
 * Shipping has its OWN model focused on logistics.
 * It doesn't care about product prices or customer details.
 * It only needs: what to ship, where to ship, tracking.
 *
 * Notice:
 * - No Money/prices (Shipping doesn't handle payments)
 * - No Product details (just references for packing slip)
 * - Focus on delivery logistics
 */

export enum ShipmentStatus {
  PENDING = 'PENDING', // Waiting for items to be packed
  READY = 'READY', // Packed and ready to ship
  SHIPPED = 'SHIPPED', // In transit
  DELIVERED = 'DELIVERED',
}

export interface ShipmentItem {
  productId: string;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ShipmentProps {
  id: string;
  orderId: string; // Reference to Sales order
  items: ShipmentItem[];
  address: ShippingAddress;
  status: ShipmentStatus;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
}

export class Shipment {
  private constructor(private props: ShipmentProps) {}

  /**
   * Creates a shipment from an order placed event.
   * This is typically called by an event handler.
   */
  static createFromOrder(params: {
    id: string;
    orderId: string;
    items: ShipmentItem[];
    address: ShippingAddress;
  }): Shipment {
    return new Shipment({
      id: params.id,
      orderId: params.orderId,
      items: params.items,
      address: params.address,
      status: ShipmentStatus.PENDING,
      trackingNumber: null,
      carrier: null,
      shippedAt: null,
      deliveredAt: null,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ShipmentProps): Shipment {
    return new Shipment(props);
  }

  get id(): string {
    return this.props.id;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get items(): readonly ShipmentItem[] {
    return this.props.items;
  }

  get address(): ShippingAddress {
    return this.props.address;
  }

  get status(): ShipmentStatus {
    return this.props.status;
  }

  get trackingNumber(): string | null {
    return this.props.trackingNumber;
  }

  get carrier(): string | null {
    return this.props.carrier;
  }

  markAsReady(): void {
    if (this.props.status !== ShipmentStatus.PENDING) {
      throw new Error('Shipment is not pending');
    }
    this.props.status = ShipmentStatus.READY;
  }

  ship(trackingNumber: string, carrier: string): void {
    if (this.props.status !== ShipmentStatus.READY) {
      throw new Error('Shipment is not ready');
    }
    this.props.status = ShipmentStatus.SHIPPED;
    this.props.trackingNumber = trackingNumber;
    this.props.carrier = carrier;
    this.props.shippedAt = new Date();
  }

  markAsDelivered(): void {
    if (this.props.status !== ShipmentStatus.SHIPPED) {
      throw new Error('Shipment is not shipped');
    }
    this.props.status = ShipmentStatus.DELIVERED;
    this.props.deliveredAt = new Date();
  }
}

export interface ShipmentRepository {
  save(shipment: Shipment): Promise<void>;
  findById(id: string): Promise<Shipment | null>;
  findByOrderId(orderId: string): Promise<Shipment | null>;
  findPending(): Promise<Shipment[]>;
}
