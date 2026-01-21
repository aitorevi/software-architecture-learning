export class OrderId {
  private constructor(private readonly _value: string) {}

  static create(value: string): OrderId {
    if (!value || value.trim() === '') {
      throw new Error('OrderId cannot be empty');
    }
    return new OrderId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: OrderId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
