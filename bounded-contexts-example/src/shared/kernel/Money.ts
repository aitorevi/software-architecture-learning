/**
 * BOUNDED CONTEXTS EXAMPLE - Shared Kernel: Money
 *
 * BOUNDED CONTEXTS KEY CONCEPT:
 * The Shared Kernel contains types that are truly shared between contexts.
 * Keep this MINIMAL - each context should have its own domain model.
 *
 * Money is a good candidate because:
 * - All contexts deal with prices/amounts
 * - Currency handling should be consistent
 * - It's a generic concept, not specific to any business domain
 */

export class Money {
  private constructor(
    private readonly _amountInCents: number,
    private readonly _currency: string
  ) {}

  static fromCents(cents: number, currency: string = 'EUR'): Money {
    if (cents < 0) throw new Error('Amount cannot be negative');
    return new Money(Math.round(cents), currency.toUpperCase());
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
    if (this._currency !== other._currency) {
      throw new Error('Cannot add different currencies');
    }
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
}
