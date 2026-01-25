/**
 * Value Object: OrderId
 *
 * Identificador único de una orden.
 */
export class OrderId {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('OrderId cannot be empty');
    }
  }

  static create(value?: string): OrderId {
    return new OrderId(value || OrderId.generate());
  }

  private static generate(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`;
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
