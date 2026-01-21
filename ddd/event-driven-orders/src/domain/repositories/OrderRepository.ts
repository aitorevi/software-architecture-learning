import { Order, OrderStatus } from '../entities';
import { OrderId } from '../value-objects';

/**
 * OrderRepository - Port for order persistence
 */
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  findByCustomerEmail(email: string): Promise<Order[]>;
}
