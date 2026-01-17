/**
 * CQRS EXAMPLE - ProductId Value Object
 */
export class ProductId {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim() === '') {
      throw new Error('ProductId cannot be empty');
    }
  }

  static create(value: string): ProductId {
    return new ProductId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ProductId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
