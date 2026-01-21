import { LoanRepository, Loan, LoanId, UserId, BookId, LoanStatus } from '../../../src/domain';

/**
 * FakeLoanRepository para tests
 *
 * Implementación en memoria para testing
 */
export class FakeLoanRepository implements LoanRepository {
  private loans: Map<string, Loan> = new Map();

  async save(loan: Loan): Promise<void> {
    this.loans.set(loan.id.getValue(), loan);
  }

  async findById(id: LoanId): Promise<Loan | null> {
    return this.loans.get(id.getValue()) ?? null;
  }

  async findActiveByUserId(userId: UserId): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.userId.equals(userId) && loan.isActive()
    );
  }

  async findActiveByBookId(bookId: BookId): Promise<Loan | null> {
    for (const loan of this.loans.values()) {
      if (loan.bookId.equals(bookId) && loan.isActive()) {
        return loan;
      }
    }
    return null;
  }

  async findByUserId(userId: UserId): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter((loan) =>
      loan.userId.equals(userId)
    );
  }

  async findOverdue(asOf: Date = new Date()): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter((loan) =>
      loan.isOverdue(asOf)
    );
  }

  async findAll(): Promise<Loan[]> {
    return Array.from(this.loans.values());
  }

  async delete(id: LoanId): Promise<void> {
    this.loans.delete(id.getValue());
  }

  // Helper methods para tests
  clear(): void {
    this.loans.clear();
  }

  count(): number {
    return this.loans.size;
  }
}
