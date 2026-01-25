import { PaymentProcessor } from '../../domain/services/PaymentProcessor.js';
import { CreditCardStrategy } from '../../domain/strategies/CreditCardStrategy.js';
import { PayPalStrategy } from '../../domain/strategies/PayPalStrategy.js';
import { CryptoStrategy } from '../../domain/strategies/CryptoStrategy.js';
import { BankTransferStrategy } from '../../domain/strategies/BankTransferStrategy.js';
import { PaymentStrategy } from '../../domain/strategies/PaymentStrategy.js';
import { Money } from '../../domain/value-objects/Money.js';
import { ProcessPaymentDTO, PaymentResponseDTO } from '../dtos/PaymentDTO.js';
import { CreateOrderUseCase } from './CreateOrderUseCase.js';

/**
 * Caso de Uso: Pagar Orden
 *
 * AQUÍ VEMOS EL PATRÓN STRATEGY EN ACCIÓN
 *
 * Este caso de uso:
 * 1. Recibe el método de pago deseado
 * 2. Selecciona la estrategia apropiada
 * 3. Usa PaymentProcessor (contexto) para procesar el pago
 * 4. Actualiza el estado de la orden
 *
 * Lo importante: El código de este caso de uso NO cambia cuando
 * añadimos nuevos métodos de pago. Solo añadimos una nueva estrategia.
 */
export class PayOrderUseCase {
  private strategies: Map<string, PaymentStrategy>;

  constructor(private orderRepository: CreateOrderUseCase) {
    // Registrar estrategias disponibles
    this.strategies = new Map<string, PaymentStrategy>([
      ['creditcard', new CreditCardStrategy()],
      ['paypal', new PayPalStrategy()],
      ['crypto', new CryptoStrategy()],
      ['banktransfer', new BankTransferStrategy()]
    ]);
  }

  async execute(dto: ProcessPaymentDTO): Promise<PaymentResponseDTO> {
    // 1. Obtener la orden
    const order = this.orderRepository.getOrder(dto.orderId);
    if (!order) {
      throw new Error(`Order ${dto.orderId} not found`);
    }

    // 2. Verificar que la orden está pendiente
    if (!order.isPending()) {
      throw new Error(`Order ${dto.orderId} is not pending. Current status: ${order.status}`);
    }

    // 3. Seleccionar estrategia basada en el método de pago
    const strategy = this.strategies.get(dto.paymentMethod.toLowerCase());
    if (!strategy) {
      throw new Error(`Payment method ${dto.paymentMethod} not supported`);
    }

    // 4. Crear el procesador con la estrategia seleccionada
    const processor = new PaymentProcessor(strategy);

    // 5. Preparar detalles del pago
    const total = order.calculateTotal();
    const paymentDetails = {
      orderId: dto.orderId,
      amount: total,
      customerEmail: dto.customerEmail
    };

    // 6. Procesar el pago (delegando a la estrategia)
    console.log(`\n=== Processing payment for order ${dto.orderId} ===`);
    console.log(`Amount: ${total.toString()}`);
    console.log(`Method: ${dto.paymentMethod}`);

    const result = await processor.processPayment(paymentDetails);

    // 7. Actualizar el estado de la orden según el resultado
    if (result.success) {
      order.markAsPaid(strategy.name);
      this.orderRepository.updateOrder(order);
      console.log(`Order ${dto.orderId} marked as PAID`);
    } else {
      order.markAsFailed();
      this.orderRepository.updateOrder(order);
      console.log(`Order ${dto.orderId} marked as FAILED`);
    }

    console.log(`=== Payment processing complete ===\n`);

    // 8. Retornar respuesta
    return {
      success: result.success,
      transactionId: result.transactionId,
      message: result.message,
      processedAt: result.processedAt.toISOString(),
      fee: result.fee ? {
        amount: result.fee.amount,
        currency: result.fee.currency
      } : undefined,
      orderId: dto.orderId,
      paymentMethod: strategy.name
    };
  }

  /**
   * Método auxiliar para comparar comisiones de diferentes estrategias
   * Demuestra cómo el patrón permite comparar algoritmos fácilmente
   */
  comparePaymentFees(amount: number, currency: string = 'EUR'): Record<string, number> {
    const money = Money.create(amount, currency);
    const fees: Record<string, number> = {};

    this.strategies.forEach((strategy, name) => {
      const fee = strategy.calculateFee(money);
      fees[name] = fee.amount;
    });

    return fees;
  }
}
