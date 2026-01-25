import { PaymentStrategy, PaymentDetails, PaymentResult } from './PaymentStrategy.js';
import { Money } from '../value-objects/Money.js';

/**
 * ESTRATEGIA CONCRETA: Pago con Criptomonedas
 *
 * Implementa el algoritmo específico para procesar pagos con crypto.
 * - Comisión: 1% (más barata, pero más lenta)
 * - Simula confirmación en blockchain
 * - Tiempo de procesamiento: variable (confirmaciones de red)
 */
export class CryptoStrategy implements PaymentStrategy {
  readonly name = 'Crypto';

  private readonly PERCENTAGE_FEE = 0.01; // 1%
  private readonly MIN_CONFIRMATIONS = 3;

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

    // Simular envío de transacción a blockchain
    const txHash = await this.submitToBlockchain(details);

    // Simular confirmaciones (puede tomar tiempo)
    const confirmed = await this.waitForConfirmations(txHash);

    const fee = this.calculateFee(details.amount);

    if (confirmed) {
      return {
        success: true,
        transactionId: txHash,
        message: `Payment processed successfully via ${this.name} with ${this.MIN_CONFIRMATIONS} confirmations`,
        processedAt: new Date(),
        fee
      };
    } else {
      return {
        success: false,
        transactionId: txHash,
        message: 'Blockchain transaction failed or timeout',
        processedAt: new Date(),
        fee
      };
    }
  }

  validatePaymentDetails(details: PaymentDetails): boolean {
    if (details.amount.amount <= 0) {
      return false;
    }

    // Crypto tiene mínimo de transacción
    if (details.amount.amount < 10) {
      console.log('[Crypto] Transaction amount too low (minimum 10 EUR)');
      return false;
    }

    return true;
  }

  calculateFee(amount: Money): Money {
    // Fee más bajo que otras opciones
    const fee = amount.amount * this.PERCENTAGE_FEE;
    return Money.create(fee, amount.currency);
  }

  private async submitToBlockchain(details: PaymentDetails): Promise<string> {
    // Simular envío a red blockchain
    console.log(`[${this.name}] Submitting transaction to blockchain...`);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generar hash de transacción
    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    console.log(`[${this.name}] Transaction hash: ${txHash}`);

    return txHash;
  }

  private async waitForConfirmations(txHash: string): Promise<boolean> {
    console.log(`[${this.name}] Waiting for ${this.MIN_CONFIRMATIONS} confirmations...`);

    // Simular confirmaciones de bloques (cada una toma tiempo)
    for (let i = 1; i <= this.MIN_CONFIRMATIONS; i++) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms por confirmación
      console.log(`[${this.name}] Confirmation ${i}/${this.MIN_CONFIRMATIONS}`);

      // Pequeña probabilidad de fallo en cada confirmación
      if (Math.random() < 0.05) {
        console.log(`[${this.name}] Confirmation failed`);
        return false;
      }
    }

    console.log(`[${this.name}] Transaction confirmed!`);
    return true;
  }

  private generateTransactionId(): string {
    return `CRYPTO-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }
}
