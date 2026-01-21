/**
 * LoanId Value Object
 *
 * Inmutable, encapsula la identidad del préstamo.
 */
export class LoanId {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('LoanId cannot be empty');
    }
  }

  static create(value: string): LoanId {
    return new LoanId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: LoanId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
