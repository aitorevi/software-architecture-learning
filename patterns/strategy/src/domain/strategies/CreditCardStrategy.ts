import { PaymentStrategy, PaymentDetails, PaymentResult } from './PaymentStrategy.js';
import { Money } from '../value-objects/Money.js';

/**
 * ESTRATEGIA CONCRETA: Pago con Tarjeta de Crédito
 *
 * Implementa el algoritmo específico para procesar pagos con tarjeta.
 * - Comisión: 2.9% + 0.30 EUR
 * - Simula validación con proveedor externo
 * - Tiempo de procesamiento: instantáneo
 */
export class CreditCardStrategy implements PaymentStrategy {
  readonly name = 'CreditCard';

  private readonly PERCENTAGE_FEE = 0.029; // 2.9%
  private readonly FIXED_FEE = 0.30; // 0.30 EUR

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    console.log(`[${this.name}] Processing payment for order ${details.orderId}`);

    // Simular validación
    if (!this.validatePaymentDetails(details)) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid payment details',
        processedAt: new Date()
      };
    }

    // Simular llamada a pasarela de pago (Stripe, PayPal, etc.)
    await this.simulateExternalCall();

    // Calcular comisión
    const fee = this.calculateFee(details.amount);

    // Simular aprobación (90% de éxito)
    const isApproved = Math.random() > 0.1;

    if (isApproved) {
      const transactionId = this.generateTransactionId();

      return {
        success: true,
        transactionId,
        message: `Payment processed successfully via ${this.name}`,
        processedAt: new Date(),
        fee
      };
    } else {
      return {
        success: false,
        transactionId: '',
        message: 'Payment declined by card issuer',
        processedAt: new Date(),
        fee
      };
    }
  }

  validatePaymentDetails(details: PaymentDetails): boolean {
    // Validaciones básicas
    if (details.amount.amount <= 0) {
      return false;
    }

    if (!details.customerEmail || !details.customerEmail.includes('@')) {
      return false;
    }

    return true;
  }

  calculateFee(amount: Money): Money {
    const percentageFee = amount.amount * this.PERCENTAGE_FEE;
    const totalFee = percentageFee + this.FIXED_FEE;
    return Money.create(totalFee, amount.currency);
  }

  private async simulateExternalCall(): Promise<void> {
    // Simular latencia de red (100-300ms)
    const delay = Math.random() * 200 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateTransactionId(): string {
    return `CC-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }
}
