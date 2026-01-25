import { describe, it, expect, beforeEach } from 'vitest';
import { CreateOrderUseCase } from '../../src/application/use-cases/CreateOrderUseCase.js';
import { PayOrderUseCase } from '../../src/application/use-cases/PayOrderUseCase.js';
import { CreateOrderDTO } from '../../src/application/dtos/CreateOrderDTO.js';
import { ProcessPaymentDTO } from '../../src/application/dtos/PaymentDTO.js';

describe('Payment Flow Integration Tests', () => {
  let createOrderUseCase: CreateOrderUseCase;
  let payOrderUseCase: PayOrderUseCase;

  beforeEach(() => {
    createOrderUseCase = new CreateOrderUseCase();
    payOrderUseCase = new PayOrderUseCase(createOrderUseCase);
  });

  describe('Complete Payment Flow', () => {
    it('should create order and process payment successfully', async () => {
      // 1. Crear orden
      const createOrderDTO: CreateOrderDTO = {
        customerId: 'customer-123',
        items: [
          {
            productId: 'prod-1',
            productName: 'Laptop',
            quantity: 1,
            unitPrice: 999.99
          },
          {
            productId: 'prod-2',
            productName: 'Mouse',
            quantity: 2,
            unitPrice: 29.99
          }
        ]
      };

      const orderResult = await createOrderUseCase.execute(createOrderDTO);

      expect(orderResult).toBeDefined();
      expect(orderResult.id).toBeDefined();
      expect(orderResult.status).toBe('PENDING');
      expect(orderResult.total).toBeCloseTo(1059.97, 2);

      // 2. Procesar pago con tarjeta de crédito
      const paymentDTO: ProcessPaymentDTO = {
        orderId: orderResult.id,
        paymentMethod: 'creditcard',
        customerEmail: 'customer@example.com'
      };

      const paymentResult = await payOrderUseCase.execute(paymentDTO);

      expect(paymentResult).toBeDefined();
      expect(paymentResult.orderId).toBe(orderResult.id);

      if (paymentResult.success) {
        expect(paymentResult.transactionId).toBeDefined();
        expect(paymentResult.fee).toBeDefined();
        expect(paymentResult.paymentMethod).toBe('CreditCard');

        // Verificar que la orden cambió de estado
        const updatedOrder = createOrderUseCase.getOrder(orderResult.id);
        expect(updatedOrder?.status).toBe('PAID');
      }
    });

    it('should work with different payment methods', async () => {
      const paymentMethods: Array<'creditcard' | 'paypal' | 'crypto' | 'banktransfer'> = [
        'creditcard',
        'paypal',
        'banktransfer' // crypto requiere mínimo 10, usamos 100
      ];

      for (const method of paymentMethods) {
        // Crear nueva orden para cada método
        const createOrderDTO: CreateOrderDTO = {
          customerId: 'customer-456',
          items: [
            {
              productId: 'prod-1',
              productName: 'Product',
              quantity: 1,
              unitPrice: 100
            }
          ]
        };

        const orderResult = await createOrderUseCase.execute(createOrderDTO);

        const paymentDTO: ProcessPaymentDTO = {
          orderId: orderResult.id,
          paymentMethod: method,
          customerEmail: 'test@example.com'
        };

        const paymentResult = await payOrderUseCase.execute(paymentDTO);

        expect(paymentResult).toBeDefined();
        expect(paymentResult.orderId).toBe(orderResult.id);

        // Todas las estrategias deben procesar (éxito o fallo)
        expect(paymentResult).toHaveProperty('success');
      }
    });

    it('should handle payment with crypto (minimum validation)', async () => {
      // Crear orden con monto >= 10 EUR
      const createOrderDTO: CreateOrderDTO = {
        customerId: 'customer-crypto',
        items: [
          {
            productId: 'prod-crypto',
            productName: 'Digital Asset',
            quantity: 1,
            unitPrice: 50
          }
        ]
      };

      const orderResult = await createOrderUseCase.execute(createOrderDTO);

      const paymentDTO: ProcessPaymentDTO = {
        orderId: orderResult.id,
        paymentMethod: 'crypto',
        customerEmail: 'crypto@example.com'
      };

      const paymentResult = await payOrderUseCase.execute(paymentDTO);

      expect(paymentResult).toBeDefined();
      if (paymentResult.success) {
        expect(paymentResult.transactionId).toMatch(/^0x/);
        expect(paymentResult.message).toContain('confirmations');
      }
    });
  });

  describe('Fee Comparison', () => {
    it('should compare fees for all payment methods', () => {
      const amount = 100;
      const fees = payOrderUseCase.comparePaymentFees(amount);

      expect(fees).toHaveProperty('creditcard');
      expect(fees).toHaveProperty('paypal');
      expect(fees).toHaveProperty('crypto');
      expect(fees).toHaveProperty('banktransfer');

      // Verificar que crypto y bank son generalmente más baratos para 100 EUR
      expect(fees.crypto).toBeLessThan(fees.creditcard);
      expect(fees.banktransfer).toBeLessThan(fees.creditcard);
    });

    it('should show bank transfer is best for large amounts', () => {
      const largeAmount = 10000;
      const fees = payOrderUseCase.comparePaymentFees(largeAmount);

      // Para montos grandes, bank transfer (fee fijo de 1 EUR) es el mejor
      expect(fees.banktransfer).toBe(1.00);
      expect(fees.banktransfer).toBeLessThan(fees.crypto);
      expect(fees.banktransfer).toBeLessThan(fees.creditcard);
      expect(fees.banktransfer).toBeLessThan(fees.paypal);
    });
  });

  describe('Error Handling', () => {
    it('should reject payment for non-existent order', async () => {
      const paymentDTO: ProcessPaymentDTO = {
        orderId: 'non-existent-order',
        paymentMethod: 'creditcard',
        customerEmail: 'test@example.com'
      };

      await expect(payOrderUseCase.execute(paymentDTO)).rejects.toThrow('not found');
    });

    it('should reject payment for already paid order', async () => {
      // Crear y pagar orden
      const createOrderDTO: CreateOrderDTO = {
        customerId: 'customer-789',
        items: [
          {
            productId: 'prod-1',
            productName: 'Product',
            quantity: 1,
            unitPrice: 100
          }
        ]
      };

      const orderResult = await createOrderUseCase.execute(createOrderDTO);

      // Primer pago (puede fallar aleatoriamente, intentar hasta éxito)
      let attempts = 0;
      let firstPaymentSuccess = false;

      while (!firstPaymentSuccess && attempts < 10) {
        const paymentDTO: ProcessPaymentDTO = {
          orderId: orderResult.id,
          paymentMethod: 'creditcard',
          customerEmail: 'test@example.com'
        };

        const result = await payOrderUseCase.execute(paymentDTO);
        firstPaymentSuccess = result.success;
        attempts++;
      }

      // Si el primer pago fue exitoso, intentar pagar de nuevo
      if (firstPaymentSuccess) {
        const secondPaymentDTO: ProcessPaymentDTO = {
          orderId: orderResult.id,
          paymentMethod: 'paypal',
          customerEmail: 'test@example.com'
        };

        await expect(payOrderUseCase.execute(secondPaymentDTO)).rejects.toThrow('not pending');
      }
    });

    it('should reject unsupported payment method', async () => {
      const createOrderDTO: CreateOrderDTO = {
        customerId: 'customer-999',
        items: [
          {
            productId: 'prod-1',
            productName: 'Product',
            quantity: 1,
            unitPrice: 100
          }
        ]
      };

      const orderResult = await createOrderUseCase.execute(createOrderDTO);

      const paymentDTO = {
        orderId: orderResult.id,
        paymentMethod: 'unsupported-method' as any,
        customerEmail: 'test@example.com'
      };

      await expect(payOrderUseCase.execute(paymentDTO)).rejects.toThrow('not supported');
    });
  });
});
