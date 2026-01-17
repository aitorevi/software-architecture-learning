/**
 * CQRS EXAMPLE - SKU (Stock Keeping Unit) Value Object
 *
 * A unique identifier for products in the inventory.
 * Format: ABC-12345 (3 letters, dash, 5 digits)
 */
export class Sku {
  private static readonly SKU_PATTERN = /^[A-Z]{3}-\d{5}$/;

  private constructor(private readonly _value: string) {}

  static create(value: string): Sku {
    const normalized = value.toUpperCase().trim();
    if (!this.SKU_PATTERN.test(normalized)) {
      throw new SkuError(
        `Invalid SKU format: ${value}. Expected format: ABC-12345`
      );
    }
    return new Sku(normalized);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Sku): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

export class SkuError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SkuError';
  }
}
