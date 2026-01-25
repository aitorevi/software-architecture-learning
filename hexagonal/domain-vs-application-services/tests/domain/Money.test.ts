/**
 * Tests de Money - Value Object
 *
 * Verificamos que las operaciones con dinero funcionan correctamente.
 */

import { describe, it, expect } from 'vitest';
import { Money } from '../../src/domain/value-objects/Money.js';

describe('Money - Value Object', () => {
  it('should create money with amount and currency', () => {
    const money = Money.create(100, 'EUR');

    expect(money.getAmount()).toBe(100);
    expect(money.getCurrency()).toBe('EUR');
  });

  it('should throw error when creating negative amount', () => {
    expect(() => {
      Money.create(-100, 'EUR');
    }).toThrow('Money amount cannot be negative');
  });

  it('should throw error when currency is invalid', () => {
    expect(() => {
      Money.create(100, 'EU'); // Solo 2 letras
    }).toThrow('Currency must be a 3-letter code');

    expect(() => {
      Money.create(100, '');
    }).toThrow('Currency must be a 3-letter code');
  });

  it('should add two money amounts with same currency', () => {
    const money1 = Money.create(100, 'EUR');
    const money2 = Money.create(50, 'EUR');

    const result = money1.add(money2);

    expect(result.getAmount()).toBe(150);
    expect(result.getCurrency()).toBe('EUR');
  });

  it('should subtract two money amounts with same currency', () => {
    const money1 = Money.create(100, 'EUR');
    const money2 = Money.create(30, 'EUR');

    const result = money1.subtract(money2);

    expect(result.getAmount()).toBe(70);
    expect(result.getCurrency()).toBe('EUR');
  });

  it('should throw error when subtracting results in negative', () => {
    const money1 = Money.create(100, 'EUR');
    const money2 = Money.create(150, 'EUR');

    expect(() => {
      money1.subtract(money2);
    }).toThrow('Cannot subtract: result would be negative');
  });

  it('should throw error when operating with different currencies', () => {
    const euros = Money.create(100, 'EUR');
    const dollars = Money.create(100, 'USD');

    expect(() => {
      euros.add(dollars);
    }).toThrow(/Currency mismatch/);

    expect(() => {
      euros.subtract(dollars);
    }).toThrow(/Currency mismatch/);
  });

  it('should check if money is sufficient for amount', () => {
    const money = Money.create(100, 'EUR');

    expect(money.isSufficientFor(Money.create(50, 'EUR'))).toBe(true);
    expect(money.isSufficientFor(Money.create(100, 'EUR'))).toBe(true);
    expect(money.isSufficientFor(Money.create(101, 'EUR'))).toBe(false);
  });

  it('should compare two money amounts', () => {
    const money1 = Money.create(100, 'EUR');
    const money2 = Money.create(100, 'EUR');
    const money3 = Money.create(50, 'EUR');
    const money4 = Money.create(100, 'USD');

    expect(money1.equals(money2)).toBe(true);
    expect(money1.equals(money3)).toBe(false);
    expect(money1.equals(money4)).toBe(false);
  });

  it('should format money as string', () => {
    const money = Money.create(1234.56, 'EUR');

    expect(money.toString()).toBe('1234.56 EUR');
  });
});
