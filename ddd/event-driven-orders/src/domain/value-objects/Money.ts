export class Money {
  private constructor(
    private readonly _amountInCents: number,
    private readonly _currency: string
  ) {}

  static fromCents(cents: number, currency: string = 'EUR'): Money {
    if (cents < 0) {
      throw new Error('Amount cannot be negative');
    }
    return new Money(Math.round(cents), currency.toUpperCase());
  }

  static fromAmount(amount: number, currency: string = 'EUR'): Money {
    return Money.fromCents(Math.round(amount * 100), currency);
  }

  static zero(currency: string = 'EUR'): Money {
    return new Money(0, currency.toUpperCase());
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
    return new Money(Math.round(this._amountInCents * factor), this._currency);
  }

  equals(other: Money): boolean {
    return (
      this._amountInCents === other._amountInCents &&
      this._currency === other._currency
    );
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
    }
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this._currency}`;
  }
}
