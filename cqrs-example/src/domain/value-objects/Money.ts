/**
 * CQRS EXAMPLE - Money Value Object
 *
 * Represents monetary values with currency.
 * Stores amount in cents to avoid floating-point errors.
 */
export class Money {
  private constructor(
    private readonly _amountInCents: number,
    private readonly _currency: string
  ) {
    if (_amountInCents < 0) {
      throw new MoneyError('Amount cannot be negative');
    }
    if (!Number.isInteger(_amountInCents)) {
      throw new MoneyError('Amount in cents must be a whole number');
    }
  }

  static fromCents(cents: number, currency: string = 'EUR'): Money {
    return new Money(cents, currency.toUpperCase());
  }

  static fromAmount(amount: number, currency: string = 'EUR'): Money {
    const cents = Math.round(amount * 100);
    return new Money(cents, currency.toUpperCase());
  }

  get amountInCents(): number {
    return this._amountInCents;
  }

  get amount(): number {
    return this._amountInCents / 100;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amountInCents + other._amountInCents, this._currency);
  }

  multiply(factor: number): Money {
    const result = Math.round(this._amountInCents * factor);
    return new Money(result, this._currency);
  }

  equals(other: Money): boolean {
    return (
      this._amountInCents === other._amountInCents &&
      this._currency === other._currency
    );
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new MoneyError(
        `Cannot operate on different currencies: ${this._currency} vs ${other._currency}`
      );
    }
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this._currency}`;
  }
}

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}
