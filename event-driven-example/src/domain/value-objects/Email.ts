export class Email {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly _value: string) {}

  static create(value: string): Email {
    const normalized = value.toLowerCase().trim();
    if (!this.EMAIL_PATTERN.test(normalized)) {
      throw new Error(`Invalid email format: ${value}`);
    }
    return new Email(normalized);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
