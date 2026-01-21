/**
 * UserId Value Object
 *
 * Inmutable, encapsula la identidad del usuario.
 * No depende de ninguna librería externa (uuid se usa solo en factory).
 */
export class UserId {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
  }

  static create(value: string): UserId {
    return new UserId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
