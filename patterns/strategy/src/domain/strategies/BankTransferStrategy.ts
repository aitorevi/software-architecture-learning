import { PaymentStrategy, PaymentDetails, PaymentResult } from './PaymentStrategy.js';
import { Money } from '../value-objects/Money.js';

/**
 * ESTRATEGIA CONCRETA: Transferencia Bancaria
 *
 * Implementa el algoritmo específico para procesar transferencias bancarias.
 * - Comisión: Fija de 1 EUR (la más predecible)
 * - No instantáneo: requiere procesamiento manual
 * - Ideal para montos grandes
 */
export class BankTransferStrategy implements PaymentStrategy {
  readonly name = 'BankTransfer';

  private readonly FIXED_FEE = 1.00; // 1 EUR fijo
  private readonly MIN_AMOUNT = 50; // Mínimo 50 EUR

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    console.log(`[${this.name}] Processing payment for order ${details.orderId}`);

    if (!this.validatePaymentDetails(details)) {
      return {
        success: false,
        transactionId: '',
        message: 'Invalid payment details - check minimum amount',
        processedAt: new Date()
      };
    }

    // Simular generación de referencia bancaria
    const reference = this.generateBankReference(details.orderId);
    console.log(`[${this.name}] Bank reference: ${reference}`);

    // Simular verificación bancaria
    await this.simulateBankVerification();

    const fee = this.calculateFee(details.amount);

    // Alta tasa de éxito para transferencias (95%)
    const isApproved = Math.random() > 0.05;

    if (isApproved) {
      const transactionId = this.generateTransactionId();

      return {
        success: true,
        transactionId,
        message: `Bank transfer initiated successfully. Reference: ${reference}. Processing may take 1-3 business days.`,
        processedAt: new Date(),
        fee
      };
    } else {
      return {
        success: false,
        transactionId: '',
        message: 'Bank transfer rejected - verify account details',
        processedAt: new Date(),
        fee
      };
    }
  }

  validatePaymentDetails(details: PaymentDetails): boolean {
    // Verificar monto mínimo
    if (details.amount.amount < this.MIN_AMOUNT) {
      console.log(`[${this.name}] Amount too low (minimum ${this.MIN_AMOUNT} EUR)`);
      return false;
    }

    if (!details.customerEmail || !details.customerEmail.includes('@')) {
      return false;
    }

    return true;
  }

  calculateFee(amount: Money): Money {
    // Fee fijo independiente del monto
    // Ventajoso para pagos grandes
    return Money.create(this.FIXED_FEE, amount.currency);
  }

  private generateBankReference(orderId: string): string {
    // Generar referencia bancaria única
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REF-${timestamp}-${random}`;
  }

  private async simulateBankVerification(): Promise<void> {
    // Las transferencias bancarias son más lentas
    console.log(`[${this.name}] Verifying with banking system...`);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  private generateTransactionId(): string {
    return `BANK-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }
}
