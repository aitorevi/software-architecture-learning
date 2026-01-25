import { Money } from '../value-objects/Money.js';

/**
 * PATRÓN STRATEGY - Interface
 *
 * Define el contrato que todas las estrategias de pago deben cumplir.
 * Esto permite intercambiar estrategias en tiempo de ejecución sin cambiar
 * el código que las usa.
 *
 * El cliente (PaymentProcessor) no sabe qué estrategia específica está usando,
 * solo sabe que puede llamar a processPayment().
 */

export interface PaymentDetails {
  orderId: string;
  amount: Money;
  customerEmail: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
  processedAt: Date;
  fee?: Money;
}

export interface PaymentStrategy {
  /**
   * Nombre de la estrategia (para logging y registro)
   */
  readonly name: string;

  /**
   * Procesa el pago usando esta estrategia específica
   */
  processPayment(details: PaymentDetails): Promise<PaymentResult>;

  /**
   * Valida que los detalles de pago son correctos para esta estrategia
   */
  validatePaymentDetails(details: PaymentDetails): boolean;

  /**
   * Calcula la comisión aplicada por esta estrategia
   */
  calculateFee(amount: Money): Money;
}
