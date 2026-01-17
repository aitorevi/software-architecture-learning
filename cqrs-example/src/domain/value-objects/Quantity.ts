/**
 * CQRS EXAMPLE - Quantity Value Object
 *
 * Represents a quantity of products in stock.
 * Cannot be negative.
 */
export class Quantity {
  private constructor(private readonly _value: number) {
    if (_value < 0) {
      throw new QuantityError('Quantity cannot be negative');
    }
    if (!Number.isInteger(_value)) {
      throw new QuantityError('Quantity must be a whole number');
    }
  }

  static create(value: number): Quantity {
    return new Quantity(value);
  }

  static zero(): Quantity {
    return new Quantity(0);
  }

  get value(): number {
    return this._value;
  }

  add(other: Quantity): Quantity {
    return new Quantity(this._value + other._value);
  }

  subtract(other: Quantity): Quantity {
    const result = this._value - other._value;
    if (result < 0) {
      throw new QuantityError(
        `Cannot subtract ${other._value} from ${this._value}: would result in negative quantity`
      );
    }
    return new Quantity(result);
  }

  isZero(): boolean {
    return this._value === 0;
  }

  isLessThan(other: Quantity): boolean {
    return this._value < other._value;
  }

  isLessThanOrEqual(threshold: number): boolean {
    return this._value <= threshold;
  }

  equals(other: Quantity): boolean {
    return this._value === other._value;
  }
}

export class QuantityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuantityError';
  }
}
