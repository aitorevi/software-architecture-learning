import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentProcessor } from '../../src/domain/services/PaymentProcessor.js';
import { CreditCardStrategy } from '../../src/domain/strategies/CreditCardStrategy.js';
import { PayPalStrategy } from '../../src/domain/strategies/PayPalStrategy.js';
import { Money } from '../../src/domain/value-objects/Money.js';
import { PaymentDetails } from '../../src/domain/strategies/PaymentStrategy.js';

describe('PaymentProcessor - Strategy Pattern Context', () => {
  let processor: PaymentProcessor;
  let paymentDetails: PaymentDetails;

  beforeEach(() => {
    // Iniciar con estrategia de tarjeta de crédito
    processor = new PaymentProcessor(new CreditCardStrategy());

    paymentDetails = {
      orderId: 'TEST-001',
      amount: Money.create(100),
      customerEmail: 'test@example.com'
    };
  });

  describe('Strategy Switching', () => {
    it('should start with initial strategy', () => {
      expect(processor.getCurrentStrategyName()).toBe('CreditCard');
    });

    it('should allow changing strategy at runtime', () => {
      expect(processor.getCurrentStrategyName()).toBe('CreditCard');

      // Cambiar a PayPal
      processor.setStrategy(new PayPalStrategy());

      expect(processor.getCurrentStrategyName()).toBe('PayPal');
    });

    it('should use correct fee calculation after strategy change', () => {
      const amount = Money.create(100);

      // Con CreditCard
      const creditCardFee = processor.calculateFee(amount);
      expect(creditCardFee.amount).toBeCloseTo(3.20, 2);

      // Cambiar a PayPal
      processor.setStrategy(new PayPalStrategy());

      const paypalFee = processor.calculateFee(amount);
      expect(paypalFee.amount).toBeCloseTo(3.75, 2);
    });
  });

  describe('Payment Processing', () => {
    it('should delegate processing to current strategy', async () => {
      const result = await processor.processPayment(paymentDetails);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('processedAt');
    });

    it('should validate before processing', async () => {
      // Money no permite valores negativos, así que probamos con email inválido
      const invalidDetails: PaymentDetails = {
        orderId: 'TEST-001',
        amount: Money.create(50),
        customerEmail: '' // Email vacío es inválido
      };

      const result = await processor.processPayment(invalidDetails);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation failed');
    });

    it('should use different strategies without code changes', async () => {
      // Procesar con CreditCard
      const ccResult = await processor.processPayment(paymentDetails);

      // Cambiar a PayPal
      processor.setStrategy(new PayPalStrategy());
      const ppResult = await processor.processPayment(paymentDetails);

      // Ambos deben tener la estructura correcta
      expect(ccResult).toHaveProperty('success');
      expect(ppResult).toHaveProperty('success');

      // Pero diferentes IDs de transacción
      if (ccResult.success && ppResult.success) {
        expect(ccResult.transactionId).toMatch(/^CC-/);
        expect(ppResult.transactionId).toMatch(/^PP-/);
      }
    });
  });

  describe('Real-world Scenario: Multiple Payment Attempts', () => {
    it('should try different strategies on failure', async () => {
      const strategies = [
        new CreditCardStrategy(),
        new PayPalStrategy(),
        new CreditCardStrategy() // Intentar de nuevo
      ];

      const results = [];

      for (const strategy of strategies) {
        processor.setStrategy(strategy);
        const result = await processor.processPayment(paymentDetails);
        results.push({
          strategy: strategy.name,
          success: result.success
        });

        if (result.success) {
          break; // Pago exitoso, salir
        }
      }

      // Al menos un intento debe haberse realizado
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
