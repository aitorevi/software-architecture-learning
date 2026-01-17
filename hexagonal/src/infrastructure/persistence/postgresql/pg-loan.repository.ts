import { Pool } from 'pg';
import {
  LoanRepository,
  Loan,
  LoanId,
  UserId,
  BookId,
  DateRange,
  LoanStatus,
} from '../../../domain';

/**
 * PostgresLoanRepository
 *
 * Implementación del repositorio de préstamos usando PostgreSQL.
 */
export class PostgresLoanRepository implements LoanRepository {
  constructor(private readonly pool: Pool) {}

  async save(loan: Loan): Promise<void> {
    const query = `
      INSERT INTO loans (id, book_id, user_id, start_date, due_date, status, returned_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        returned_at = EXCLUDED.returned_at
    `;

    await this.pool.query(query, [
      loan.id.getValue(),
      loan.bookId.getValue(),
      loan.userId.getValue(),
      loan.loanPeriod.getStartDate(),
      loan.loanPeriod.getEndDate(),
      loan.status,
      loan.returnedAt,
      loan.createdAt,
    ]);
  }

  async findById(id: LoanId): Promise<Loan | null> {
    const result = await this.pool.query(
      'SELECT * FROM loans WHERE id = $1',
      [id.getValue()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToLoan(result.rows[0]);
  }

  async findActiveByUserId(userId: UserId): Promise<Loan[]> {
    const result = await this.pool.query(
      "SELECT * FROM loans WHERE user_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC",
      [userId.getValue()]
    );

    return result.rows.map((row) => this.rowToLoan(row));
  }

  async findActiveByBookId(bookId: BookId): Promise<Loan | null> {
    const result = await this.pool.query(
      "SELECT * FROM loans WHERE book_id = $1 AND status = 'ACTIVE'",
      [bookId.getValue()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToLoan(result.rows[0]);
  }

  async findByUserId(userId: UserId): Promise<Loan[]> {
    const result = await this.pool.query(
      'SELECT * FROM loans WHERE user_id = $1 ORDER BY created_at DESC',
      [userId.getValue()]
    );

    return result.rows.map((row) => this.rowToLoan(row));
  }

  async findOverdue(asOf: Date = new Date()): Promise<Loan[]> {
    const result = await this.pool.query(
      "SELECT * FROM loans WHERE status = 'ACTIVE' AND due_date < $1 ORDER BY due_date",
      [asOf]
    );

    return result.rows.map((row) => this.rowToLoan(row));
  }

  async findAll(): Promise<Loan[]> {
    const result = await this.pool.query(
      'SELECT * FROM loans ORDER BY created_at DESC'
    );

    return result.rows.map((row) => this.rowToLoan(row));
  }

  async delete(id: LoanId): Promise<void> {
    await this.pool.query('DELETE FROM loans WHERE id = $1', [id.getValue()]);
  }

  private rowToLoan(row: Record<string, unknown>): Loan {
    return Loan.reconstitute({
      id: LoanId.create(row.id as string),
      bookId: BookId.create(row.book_id as string),
      userId: UserId.create(row.user_id as string),
      loanPeriod: DateRange.create(
        new Date(row.start_date as string),
        new Date(row.due_date as string)
      ),
      status: row.status as LoanStatus,
      returnedAt: row.returned_at ? new Date(row.returned_at as string) : null,
      createdAt: new Date(row.created_at as string),
    });
  }
}
