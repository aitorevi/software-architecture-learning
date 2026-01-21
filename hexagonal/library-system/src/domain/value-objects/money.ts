/**
 * Money Value Object
 *
 * Encapsula valores monetarios con su moneda.
 * Evita errores de punto flotante usando centavos internamente.
 *
 * ¿Por qué un Value Object para Money?
 * - Evita el "primitive obsession" anti-pattern
 * - Operaciones aritméticas seguras
 * - Siempre incluye la moneda
 * - Inmutable: operaciones retornan nuevo Money
 */
export class Money {
  private constructor(
    private readonly amountInCents: number,
    private readonly currency: string
  ) {
    this.validate(amountInCents, currency);
  }

  private validate(amountInCents: number, currency: string): void {
    if (!Number.isInteger(amountInCents)) {
      throw new Error('Amount in cents must be an integer');
    }
    if (amountInCents < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a 3-letter ISO code');
    }
  }

  /**
   * Crea Money desde valor decimal (ej: 10.50 EUR)
   */
  static create(amount: number, currency: string): Money {
    const amountInCents = Math.round(amount * 100);
    return new Money(amountInCents, currency.toUpperCase());
  }

  /**
   * Crea Money desde centavos
   */
  static fromCents(cents: number, currency: string): Money {
    return new Money(cents, currency.toUpperCase());
  }

  /**
   * Money con valor cero
   */
  static zero(currency: string): Money {
    return new Money(0, currency.toUpperCase());
  }

  getAmount(): number {
    return this.amountInCents / 100;
  }

  getAmountInCents(): number {
    return this.amountInCents;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountInCents + other.amountInCents, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amountInCents - other.amountInCents;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amountInCents * factor), this.currency);
  }

  isZero(): boolean {
    return this.amountInCents === 0;
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amountInCents > other.amountInCents;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot operate on different currencies: ${this.currency} vs ${other.currency}`
      );
    }
  }

  equals(other: Money): boolean {
    return (
      this.amountInCents === other.amountInCents &&
      this.currency === other.currency
    );
  }

  toString(): string {
    return `${this.getAmount().toFixed(2)} ${this.currency}`;
  }
}
