/**
 * Tests de MoneyTransferService - DOMAIN SERVICE
 *
 * 🎯 FÍJATE EN ESTO:
 *
 * ✅ NO hay mocks
 * ✅ NO hay dependencias de infraestructura
 * ✅ Solo creamos entidades y testeamos lógica pura
 *
 * Esto es posible porque el Domain Service NO tiene I/O.
 * Es lógica de negocio pura.
 *
 * Si necesitaras mocks aquí, sería señal de que el servicio
 * tiene responsabilidades que no le corresponden.
 */

import { describe, it, expect } from 'vitest';
import { MoneyTransferService } from '../../src/domain/services/MoneyTransferService.js';
import { Account } from '../../src/domain/entities/Account.js';
import { Money } from '../../src/domain/value-objects/Money.js';

describe('MoneyTransferService - Domain Service (SIN MOCKS)', () => {
  const transferService = new MoneyTransferService();

  it('should transfer money between accounts successfully', () => {
    // Arrange - Solo creamos entidades, sin mocks
    const fromAccount = Account.create(
      'account-1',
      'Juan',
      Money.create(1000, 'EUR')
    );

    const toAccount = Account.create(
      'account-2',
      'María',
      Money.create(500, 'EUR')
    );

    const amount = Money.create(300, 'EUR');

    // Act - Llamamos al Domain Service
    transferService.transfer(fromAccount, toAccount, amount);

    // Assert - Verificamos el estado
    expect(fromAccount.getBalance().getAmount()).toBe(700);
    expect(toAccount.getBalance().getAmount()).toBe(800);
  });

  it('should throw error when transferring to the same account', () => {
    // Arrange
    const account = Account.create(
      'account-1',
      'Juan',
      Money.create(1000, 'EUR')
    );

    const amount = Money.create(100, 'EUR');

    // Act & Assert
    expect(() => {
      transferService.transfer(account, account, amount);
    }).toThrow('Cannot transfer money to the same account');
  });

  it('should throw error when insufficient funds', () => {
    // Arrange
    const fromAccount = Account.create(
      'account-1',
      'Juan',
      Money.create(100, 'EUR')
    );

    const toAccount = Account.create(
      'account-2',
      'María',
      Money.create(500, 'EUR')
    );

    const amount = Money.create(200, 'EUR'); // Más de lo que tiene

    // Act & Assert
    expect(() => {
      transferService.transfer(fromAccount, toAccount, amount);
    }).toThrow(/Insufficient funds/);
  });

  it('should throw error when transferring non-positive amount', () => {
    // Arrange
    const fromAccount = Account.create(
      'account-1',
      'Juan',
      Money.create(1000, 'EUR')
    );

    const toAccount = Account.create(
      'account-2',
      'María',
      Money.create(500, 'EUR')
    );

    // Act & Assert - Monto cero
    expect(() => {
      const amount = Money.create(0, 'EUR');
      transferService.transfer(fromAccount, toAccount, amount);
    }).toThrow('Transfer amount must be positive');
  });

  it('should verify transfer possibility without executing it', () => {
    // Arrange
    const fromAccount = Account.create(
      'account-1',
      'Juan',
      Money.create(1000, 'EUR')
    );

    const toAccount = Account.create(
      'account-2',
      'María',
      Money.create(500, 'EUR')
    );

    const validAmount = Money.create(300, 'EUR');
    const invalidAmount = Money.create(2000, 'EUR');

    // Act & Assert
    expect(transferService.canTransfer(fromAccount, toAccount, validAmount)).toBe(true);
    expect(transferService.canTransfer(fromAccount, toAccount, invalidAmount)).toBe(false);
    expect(transferService.canTransfer(fromAccount, fromAccount, validAmount)).toBe(false);

    // Verificar que las cuentas NO cambiaron
    expect(fromAccount.getBalance().getAmount()).toBe(1000);
    expect(toAccount.getBalance().getAmount()).toBe(500);
  });
});

/**
 * REFLEXIÓN:
 *
 * ¿Viste que no usamos ni un solo mock?
 *
 * Esto es GOLD, mi niño. Tests simples, rápidos, sin dependencias.
 * Solo lógica de negocio pura.
 *
 * Si mañana cambias la base de datos, estos tests siguen pasando.
 * Si cambias el framework HTTP, estos tests siguen pasando.
 * Si cambias el sistema de eventos, estos tests siguen pasando.
 *
 * Porque el dominio es INDEPENDIENTE de todo eso.
 *
 * Esto es arquitectura hexagonal en acción.
 */
