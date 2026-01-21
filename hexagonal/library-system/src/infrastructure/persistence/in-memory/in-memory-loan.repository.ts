import {
  LoanRepository,
  Loan,
  LoanId,
  UserId,
  BookId,
  LoanProps,
  LoanStatus,
} from '../../../domain';

/**
 * InMemoryLoanRepository
 *
 * Implementación en memoria del repositorio de préstamos.
 *
 * Nota: Los préstamos también están dentro del agregado User,
 * pero este repositorio permite consultas directas.
 */
export class InMemoryLoanRepository implements LoanRepository {
  private loans: Map<string, LoanProps> = new Map();

  async save(loan: Loan): Promise<void> {
    const props: LoanProps = {
      id: loan.id,
      bookId: loan.bookId,
      userId: loan.userId,
      loanPeriod: loan.loanPeriod,
      status: loan.status,
      returnedAt: loan.returnedAt,
      createdAt: loan.createdAt,
    };
    this.loans.set(loan.id.getValue(), props);
  }

  async findById(id: LoanId): Promise<Loan | null> {
    const props = this.loans.get(id.getValue());
    if (!props) return null;
    return Loan.reconstitute(props);
  }

  async findActiveByUserId(userId: UserId): Promise<Loan[]> {
    const result: Loan[] = [];
    for (const props of this.loans.values()) {
      if (
        props.userId.equals(userId) &&
        props.status === LoanStatus.ACTIVE
      ) {
        result.push(Loan.reconstitute(props));
      }
    }
    return result;
  }

  async findActiveByBookId(bookId: BookId): Promise<Loan | null> {
    for (const props of this.loans.values()) {
      if (
        props.bookId.equals(bookId) &&
        props.status === LoanStatus.ACTIVE
      ) {
        return Loan.reconstitute(props);
      }
    }
    return null;
  }

  async findByUserId(userId: UserId): Promise<Loan[]> {
    const result: Loan[] = [];
    for (const props of this.loans.values()) {
      if (props.userId.equals(userId)) {
        result.push(Loan.reconstitute(props));
      }
    }
    return result;
  }

  async findOverdue(asOf: Date = new Date()): Promise<Loan[]> {
    const result: Loan[] = [];
    for (const props of this.loans.values()) {
      const loan = Loan.reconstitute(props);
      if (loan.isOverdue(asOf)) {
        result.push(loan);
      }
    }
    return result;
  }

  async findAll(): Promise<Loan[]> {
    return Array.from(this.loans.values()).map((props) =>
      Loan.reconstitute(props)
    );
  }

  async delete(id: LoanId): Promise<void> {
    this.loans.delete(id.getValue());
  }

  // Método para limpiar
  clear(): void {
    this.loans.clear();
  }
}
