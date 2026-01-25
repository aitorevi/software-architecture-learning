import { Order, OrderItem } from '../../domain/entities/Order.js';
import { Money } from '../../domain/value-objects/Money.js';
import { CreateOrderDTO, OrderResponseDTO } from '../dtos/CreateOrderDTO.js';

/**
 * Caso de Uso: Crear Orden
 *
 * Responsabilidades:
 * - Validar datos de entrada
 * - Crear la entidad Order
 * - Guardar en repositorio (simulado en memoria)
 * - Retornar DTO de respuesta
 */
export class CreateOrderUseCase {
  // En un caso real, inyectaríamos un OrderRepository
  private orders: Map<string, Order> = new Map();

  async execute(dto: CreateOrderDTO): Promise<OrderResponseDTO> {
    // Validaciones
    if (!dto.customerId || dto.customerId.trim().length === 0) {
      throw new Error('Customer ID is required');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Convertir DTOs a entidades del dominio
    const orderItems: OrderItem[] = dto.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Money.create(item.unitPrice)
    }));

    // Crear orden
    const order = new Order({
      customerId: dto.customerId,
      items: orderItems
    });

    // Guardar (en memoria)
    this.orders.set(order.id.value, order);

    // Convertir a DTO de respuesta
    const total = order.calculateTotal();

    return {
      id: order.id.value,
      customerId: order.customerId,
      items: dto.items,
      total: total.amount,
      currency: total.currency,
      status: order.status,
      createdAt: order.createdAt.toISOString()
    };
  }

  // Método auxiliar para obtener una orden (usado por PayOrderUseCase)
  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  // Método auxiliar para actualizar una orden
  updateOrder(order: Order): void {
    this.orders.set(order.id.value, order);
  }
}
