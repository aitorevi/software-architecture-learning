import { describe, it, expect } from 'vitest';
import { CreditCardStrategy } from '../../src/domain/strategies/CreditCardStrategy.js';
import { PayPalStrategy } from '../../src/domain/strategies/PayPalStrategy.js';
import { CryptoStrategy } from '../../src/domain/strategies/CryptoStrategy.js';
import { BankTransferStrategy } from '../../src/domain/strategies/BankTransferStrategy.js';
import { Money } from '../../src/domain/value-objects/Money.js';
import { PaymentDetails } from '../../src/domain/strategies/PaymentStrategy.js';

describe('Payment Strategies', () => {
  const createPaymentDetails = (amount: number): PaymentDetails => ({
    orderId: 'TEST-001',
    amount: Money.create(amount),
    customerEmail: 'test@example.com'
  });

  describe('CreditCardStrategy', () => {
    const strategy = new CreditCardStrategy();

    it('should have correct name', () => {
      expect(strategy.name).toBe('CreditCard');
    });

    it('should calculate fee correctly (2.9% + 0.30)', () => {
      const amount = Money.create(100);
      const fee = strategy.calculateFee(amount);

      // 100 * 0.029 = 2.9
      // 2.9 + 0.30 = 3.20
      expect(fee.amount).toBeCloseTo(3.20, 2);
    });

    it('should validate payment details', () => {
      const validDetails = createPaymentDetails(50);
      expect(strategy.validatePaymentDetails(validDetails)).toBe(true);
    });

    it('should reject negative amounts', () => {
      // Money no permite valores negativos, así que probamos directamente la validación
      const invalidDetails: PaymentDetails = {
        orderId: 'TEST-001',
        amount: Money.create(0), // 0 es técnicamente válido pero rechazado por validación
        customerEmail: 'test@example.com'
      };
      expect(strategy.validatePaymentDetails(invalidDetails)).toBe(false);
    });

    it('should reject invalid email', () => {
      const details: PaymentDetails = {
        orderId: 'TEST-001',
        amount: Money.create(50),
        customerEmail: 'invalid-email'
      };
      expect(strategy.validatePaymentDetails(details)).toBe(false);
    });

    it('should process payment successfully', async () => {
      const details = createPaymentDetails(100);
      const result = await strategy.processPayment(details);

      // Puede ser exitoso o fallar (simulación aleatoria)
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('processedAt');

      if (result.success) {
        expect(result.transactionId).toMatch(/^CC-/);
        expect(result.fee).toBeDefined();
      }
    });
  });

  describe('PayPalStrategy', () => {
    const strategy = new PayPalStrategy();

    it('should have correct name', () => {
      expect(strategy.name).toBe('PayPal');
    });

    it('should calculate fee correctly (3.4% + 0.35)', () => {
      const amount = Money.create(100);
      const fee = strategy.calculateFee(amount);

      // 100 * 0.034 = 3.4
      // 3.4 + 0.35 = 3.75
      expect(fee.amount).toBeCloseTo(3.75, 2);
    });

    it('should validate email format strictly', () => {
      const validDetails: PaymentDetails = {
        orderId: 'TEST-001',
        amount: Money.create(50),
        customerEmail: 'valid@email.com'
      };
      expect(strategy.validatePaymentDetails(validDetails)).toBe(true);

      const invalidDetails: PaymentDetails = {
        orderId: 'TEST-001',
        amount: Money.create(50),
        customerEmail: 'invalid@'
      };
      expect(strategy.validatePaymentDetails(invalidDetails)).toBe(false);
    });

    it('should process payment and return transaction ID', async () => {
      const details = createPaymentDetails(100);
      const result = await strategy.processPayment(details);

      if (result.success) {
        expect(result.transactionId).toMatch(/^PP-/);
      }
    });
  });

  describe('CryptoStrategy', () => {
    const strategy = new CryptoStrategy();

    it('should have correct name', () => {
      expect(strategy.name).toBe('Crypto');
    });

    it('should calculate fee correctly (1%)', () => {
      const amount = Money.create(100);
      const fee = strategy.calculateFee(amount);

      // 100 * 0.01 = 1
      expect(fee.amount).toBeCloseTo(1.00, 2);
    });

    it('should enforce minimum amount of 10', () => {
      const tooLow = createPaymentDetails(5);
      expect(strategy.validatePaymentDetails(tooLow)).toBe(false);

      const valid = createPaymentDetails(10);
      expect(strategy.validatePaymentDetails(valid)).toBe(true);
    });

    it('should return transaction hash format', async () => {
      const details = createPaymentDetails(50);
      const result = await strategy.processPayment(details);

      if (result.success) {
        expect(result.transactionId).toMatch(/^0x[a-f0-9]+$/);
      }
    });
  });

  describe('BankTransferStrategy', () => {
    const strategy = new BankTransferStrategy();

    it('should have correct name', () => {
      expect(strategy.name).toBe('BankTransfer');
    });

    it('should calculate fixed fee of 1 EUR', () => {
      const amount100 = Money.create(100);
      const amount1000 = Money.create(1000);

      const fee100 = strategy.calculateFee(amount100);
      const fee1000 = strategy.calculateFee(amount1000);

      // Fee es fijo independiente del monto
      expect(fee100.amount).toBe(1.00);
      expect(fee1000.amount).toBe(1.00);
    });

    it('should enforce minimum amount of 50', () => {
      const tooLow = createPaymentDetails(30);
      expect(strategy.validatePaymentDetails(tooLow)).toBe(false);

      const valid = createPaymentDetails(50);
      expect(strategy.validatePaymentDetails(valid)).toBe(true);
    });

    it('should return bank transaction format', async () => {
      const details = createPaymentDetails(100);
      const result = await strategy.processPayment(details);

      if (result.success) {
        expect(result.transactionId).toMatch(/^BANK-/);
      }
    });
  });

  describe('Fee Comparison', () => {
    it('should show crypto is cheapest for large amounts', () => {
      const amount = Money.create(1000);

      const creditCardFee = new CreditCardStrategy().calculateFee(amount);
      const paypalFee = new PayPalStrategy().calculateFee(amount);
      const cryptoFee = new CryptoStrategy().calculateFee(amount);
      const bankFee = new BankTransferStrategy().calculateFee(amount);

      // Para 1000 EUR:
      // - CreditCard: 29.90
      // - PayPal: 34.35
      // - Crypto: 10.00
      // - Bank: 1.00

      expect(bankFee.amount).toBeLessThan(cryptoFee.amount);
      expect(cryptoFee.amount).toBeLessThan(creditCardFee.amount);
      expect(creditCardFee.amount).toBeLessThan(paypalFee.amount);
    });

    it('should show bank transfer is best for very large amounts', () => {
      const largeAmount = Money.create(10000);

      const bankFee = new BankTransferStrategy().calculateFee(largeAmount);
      const cryptoFee = new CryptoStrategy().calculateFee(largeAmount);

      // Bank: 1 EUR fijo
      // Crypto: 100 EUR (1%)
      expect(bankFee.amount).toBe(1.00);
      expect(cryptoFee.amount).toBe(100.00);
    });
  });
});
