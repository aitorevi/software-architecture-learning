import { PaymentStrategy, PaymentDetails, PaymentResult } from '../strategies/PaymentStrategy.js';

/**
 * CONTEXTO del Patrón Strategy
 *
 * El PaymentProcessor es el "contexto" que usa las estrategias.
 * - No conoce los detalles de cada estrategia
 * - Puede cambiar de estrategia en tiempo de ejecución
 * - Delega el procesamiento a la estrategia actual
 *
 * Este es el poder del patrón: el mismo código funciona con
 * diferentes algoritmos sin necesidad de if/else.
 */
export class PaymentProcessor {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  /**
   * Permite cambiar la estrategia en tiempo de ejecución
   * Esto es lo que hace al patrón tan flexible
   */
  setStrategy(strategy: PaymentStrategy): void {
    console.log(`[PaymentProcessor] Switching strategy to: ${strategy.name}`);
    this.strategy = strategy;
  }

  /**
   * Procesa el pago usando la estrategia actual
   * El cliente no necesita saber qué estrategia se está usando
   */
  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    console.log(`[PaymentProcessor] Processing payment using ${this.strategy.name}`);

    // Validar antes de procesar
    if (!this.strategy.validatePaymentDetails(details)) {
      return {
        success: false,
        transactionId: '',
        message: `Validation failed for ${this.strategy.name}`,
        processedAt: new Date()
      };
    }

    // Delegar a la estrategia
    const result = await this.strategy.processPayment(details);

    // Log del resultado
    if (result.success) {
      console.log(`[PaymentProcessor] Payment successful: ${result.transactionId}`);
      if (result.fee) {
        console.log(`[PaymentProcessor] Fee charged: ${result.fee.toString()}`);
      }
    } else {
      console.log(`[PaymentProcessor] Payment failed: ${result.message}`);
    }

    return result;
  }

  /**
   * Calcula la comisión para un monto dado con la estrategia actual
   */
  calculateFee(amount: import('../value-objects/Money.js').Money): import('../value-objects/Money.js').Money {
    return this.strategy.calculateFee(amount);
  }

  /**
   * Obtiene el nombre de la estrategia actual
   */
  getCurrentStrategyName(): string {
    return this.strategy.name;
  }
}
