/**
 * Tests de Account - Entidad de Dominio
 *
 * Tests simples para verificar que la entidad funciona correctamente.
 */

import { describe, it, expect } from 'vitest';
import { Account } from '../../src/domain/entities/Account.js';
import { Money } from '../../src/domain/value-objects/Money.js';

describe('Account - Domain Entity', () => {
  it('should create an account with initial balance', () => {
    const account = Account.create(
      'account-1',
      'Juan Pérez',
      Money.create(1000, 'EUR')
    );

    expect(account.getId()).toBe('account-1');
    expect(account.getHolderName()).toBe('Juan Pérez');
    expect(account.getBalance().getAmount()).toBe(1000);
    expect(account.getBalance().getCurrency()).toBe('EUR');
  });

  it('should deposit money successfully', () => {
    const account = Account.create(
      'account-1',
      'Juan',
      Money.create(1000, 'EUR')
    );

    account.deposit(Money.create(500, 'EUR'));

    expect(account.getBalance().getAmount()).toBe(1500);
  });

  it('should withdraw money when sufficient funds', () => {
    const account = Account.create(
      'account-1',
      'Juan',
      Money.create(1000, 'EUR')
    );

    account.withdraw(Money.create(300, 'EUR'));

    expect(account.getBalance().getAmount()).toBe(700);
  });

  it('should throw error when withdrawing more than balance', () => {
    const account = Account.create(
      'account-1',
      'Juan',
      Money.create(100, 'EUR')
    );

    expect(() => {
      account.withdraw(Money.create(200, 'EUR'));
    }).toThrow(/Insufficient funds/);
  });

  it('should check if has sufficient funds', () => {
    const account = Account.create(
      'account-1',
      'Juan',
      Money.create(1000, 'EUR')
    );

    expect(account.hasSufficientFunds(Money.create(500, 'EUR'))).toBe(true);
    expect(account.hasSufficientFunds(Money.create(1000, 'EUR'))).toBe(true);
    expect(account.hasSufficientFunds(Money.create(1001, 'EUR'))).toBe(false);
  });

  it('should throw error when creating account with empty ID', () => {
    expect(() => {
      Account.create('', 'Juan', Money.create(1000, 'EUR'));
    }).toThrow('Account ID cannot be empty');
  });

  it('should throw error when creating account with empty holder name', () => {
    expect(() => {
      Account.create('account-1', '', Money.create(1000, 'EUR'));
    }).toThrow('Account holder name cannot be empty');
  });
});
