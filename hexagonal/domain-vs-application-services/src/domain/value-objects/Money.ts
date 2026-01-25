/**
 * Money - Value Object
 *
 * Representa una cantidad de dinero con su moneda.
 * Es INMUTABLE y encapsula las reglas de negocio sobre el dinero.
 */
export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {
    this.validate();
  }

  static create(amount: number, currency: string = 'EUR'): Money {
    return new Money(amount, currency);
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error('Money amount cannot be negative');
    }

    if (!this.currency || this.currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code (e.g., EUR, USD)');
    }
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  /**
   * Verifica si hay suficiente dinero para una cantidad dada
   */
  isSufficientFor(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount >= other.amount;
  }

  /**
   * Suma dos cantidades de dinero
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Resta dos cantidades de dinero
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const newAmount = this.amount - other.amount;

    if (newAmount < 0) {
      throw new Error('Cannot subtract: result would be negative');
    }

    return new Money(newAmount, this.currency);
  }

  /**
   * Verifica que dos cantidades tengan la misma moneda
   */
  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: cannot operate ${this.currency} with ${other.currency}`
      );
    }
  }

  /**
   * Compara si dos cantidades de dinero son iguales
   */
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}
