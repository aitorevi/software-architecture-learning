import { PaymentStrategy, PaymentDetails, PaymentResult } from './PaymentStrategy.js';
import { Money } from '../value-objects/Money.js';

/**
 * ESTRATEGIA CONCRETA: Pago con PayPal
 *
 * Implementa el algoritmo específico para procesar pagos con PayPal.
 * - Comisión: 3.4% + 0.35 EUR (más cara que tarjeta)
 * - Simula OAuth y validación de cuenta PayPal
 * - Tiempo de procesamiento: puede tener más latencia
 */
export class PayPalStrategy implements PaymentStrategy {
  readonly name = 'PayPal';

  private readonly PERCENTAGE_FEE = 0.034; // 3.4%
  private readonly FIXED_FEE = 0.35; // 0.35 EUR

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    console.log(`[${this.name}] Processing payment for order ${details.orderId}`);

    if (!this.validatePaymentDetails(details)) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid payment details',
        processedAt: new Date()
      };
    }

    // Simular autenticación OAuth con PayPal
    await this.simulateOAuthFlow();

    // Simular llamada a API de PayPal
    await this.simulateExternalCall();

    const fee = this.calculateFee(details.amount);

    // PayPal tiene tasa de éxito ligeramente menor (85%)
    const isApproved = Math.random() > 0.15;

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
        message: 'PayPal payment failed - insufficient funds or account issue',
        processedAt: new Date(),
        fee
      };
    }
  }

  validatePaymentDetails(details: PaymentDetails): boolean {
    if (details.amount.amount <= 0) {
      return false;
    }

    if (!details.customerEmail || !details.customerEmail.includes('@')) {
      return false;
    }

    // PayPal requiere email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(details.customerEmail)) {
      return false;
    }

    return true;
  }

  calculateFee(amount: Money): Money {
    const percentageFee = amount.amount * this.PERCENTAGE_FEE;
    const totalFee = percentageFee + this.FIXED_FEE;
    return Money.create(totalFee, amount.currency);
  }

  private async simulateOAuthFlow(): Promise<void> {
    // Simular flujo de autenticación (50-150ms)
    const delay = Math.random() * 100 + 50;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async simulateExternalCall(): Promise<void> {
    // PayPal puede ser más lento (200-500ms)
    const delay = Math.random() * 300 + 200;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateTransactionId(): string {
    return `PP-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }
}
