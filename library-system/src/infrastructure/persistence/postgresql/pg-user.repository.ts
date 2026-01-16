import { Pool } from 'pg';
import {
  UserRepository,
  User,
  UserId,
  Email,
  Loan,
  LoanId,
  BookId,
  DateRange,
  LoanStatus,
  Penalty,
} from '../../../domain';

/**
 * PostgresUserRepository
 *
 * Implementación del repositorio de usuarios usando PostgreSQL.
 *
 * Complejidad: El User es un agregado que incluye préstamos activos
 * y penalizaciones. Este repositorio debe cargar todo al reconstituir.
 */
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async save(user: User): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Guardar usuario
      await client.query(
        `
        INSERT INTO users (id, email, name, created_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name
        `,
        [user.id.getValue(), user.email.getValue(), user.name, user.createdAt]
      );

      // Guardar préstamos activos
      for (const loan of user.activeLoans) {
        await client.query(
          `
          INSERT INTO loans (id, book_id, user_id, start_date, due_date, status, returned_at, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            returned_at = EXCLUDED.returned_at
          `,
          [
            loan.id.getValue(),
            loan.bookId.getValue(),
            loan.userId.getValue(),
            loan.loanPeriod.getStartDate(),
            loan.loanPeriod.getEndDate(),
            loan.status,
            loan.returnedAt,
            loan.createdAt,
          ]
        );
      }

      // Guardar penalizaciones
      for (const penalty of user.penalties) {
        // Check if penalty exists
        const existing = await client.query(
          'SELECT 1 FROM penalties WHERE user_id = $1 AND loan_id = $2',
          [penalty.userId.getValue(), penalty.loanId.getValue()]
        );

        if (existing.rows.length === 0) {
          await client.query(
            `
            INSERT INTO penalties (user_id, loan_id, start_date, end_date, days_overdue, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
              penalty.userId.getValue(),
              penalty.loanId.getValue(),
              penalty.penaltyPeriod.getStartDate(),
              penalty.penaltyPeriod.getEndDate(),
              penalty.daysOverdue,
              penalty.createdAt,
            ]
          );
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: UserId): Promise<User | null> {
    const userResult = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id.getValue()]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    return this.reconstituteUser(userResult.rows[0]);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userResult = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.getValue()]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    return this.reconstituteUser(userResult.rows[0]);
  }

  async findAll(): Promise<User[]> {
    const result = await this.pool.query('SELECT * FROM users ORDER BY name');
    return Promise.all(result.rows.map((row) => this.reconstituteUser(row)));
  }

  async delete(id: UserId): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id.getValue()]);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email.getValue()]
    );
    return result.rows.length > 0;
  }

  private async reconstituteUser(row: Record<string, unknown>): Promise<User> {
    const userId = row.id as string;

    // Cargar préstamos activos
    const loansResult = await this.pool.query(
      "SELECT * FROM loans WHERE user_id = $1 AND status = 'ACTIVE'",
      [userId]
    );

    const activeLoans = loansResult.rows.map((loanRow) =>
      Loan.reconstitute({
        id: LoanId.create(loanRow.id as string),
        bookId: BookId.create(loanRow.book_id as string),
        userId: UserId.create(loanRow.user_id as string),
        loanPeriod: DateRange.create(
          new Date(loanRow.start_date as string),
          new Date(loanRow.due_date as string)
        ),
        status: loanRow.status as LoanStatus,
        returnedAt: loanRow.returned_at
          ? new Date(loanRow.returned_at as string)
          : null,
        createdAt: new Date(loanRow.created_at as string),
      })
    );

    // Cargar penalizaciones activas
    const penaltiesResult = await this.pool.query(
      'SELECT * FROM penalties WHERE user_id = $1 AND end_date > NOW()',
      [userId]
    );

    const penalties = penaltiesResult.rows.map((penaltyRow) =>
      Penalty.reconstitute({
        userId: UserId.create(penaltyRow.user_id as string),
        loanId: LoanId.create(penaltyRow.loan_id as string),
        penaltyPeriod: DateRange.create(
          new Date(penaltyRow.start_date as string),
          new Date(penaltyRow.end_date as string)
        ),
        daysOverdue: penaltyRow.days_overdue as number,
        createdAt: new Date(penaltyRow.created_at as string),
      })
    );

    return User.reconstitute({
      id: UserId.create(userId),
      email: Email.create(row.email as string),
      name: row.name as string,
      activeLoans,
      penalties,
      createdAt: new Date(row.created_at as string),
    });
  }
}
