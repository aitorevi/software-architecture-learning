/**
 * BookId Value Object
 *
 * Inmutable, encapsula la identidad del libro.
 */
export class BookId {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('BookId cannot be empty');
    }
  }

  static create(value: string): BookId {
    return new BookId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BookId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
