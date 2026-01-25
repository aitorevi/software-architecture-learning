/**
 * Value Object: Money
 *
 * Representa una cantidad de dinero con su moneda.
 * Es inmutable y encapsula la lógica de manejo de dinero.
 */
export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string
  ) {
    if (_amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  static create(amount: number, currency: string = 'EUR'): Money {
    return new Money(amount, currency.toUpperCase());
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot add different currencies: ${this._currency} and ${other._currency}`);
    }
    return Money.create(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot subtract different currencies: ${this._currency} and ${other._currency}`);
    }
    return Money.create(this._amount - other._amount, this._currency);
  }

  multiply(factor: number): Money {
    return Money.create(this._amount * factor, this._currency);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  toString(): string {
    return `${this._amount.toFixed(2)} ${this._currency}`;
  }

  toJSON() {
    return {
      amount: this._amount,
      currency: this._currency
    };
  }
}
