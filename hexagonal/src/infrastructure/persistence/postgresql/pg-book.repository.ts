import { Pool } from 'pg';
import {
  BookRepository,
  Book,
  BookId,
  ISBN,
  BookStatus,
} from '../../../domain';

/**
 * PostgresBookRepository
 *
 * Implementación del repositorio de libros usando PostgreSQL.
 *
 * ¿Por qué esta implementación es intercambiable con InMemory?
 * - Ambas implementan la misma interface BookRepository
 * - El dominio y casos de uso no saben cuál se está usando
 * - Se puede cambiar en el Composition Root sin tocar código
 */
export class PostgresBookRepository implements BookRepository {
  constructor(private readonly pool: Pool) {}

  async save(book: Book): Promise<void> {
    const query = `
      INSERT INTO books (id, isbn, title, author, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        isbn = EXCLUDED.isbn,
        title = EXCLUDED.title,
        author = EXCLUDED.author,
        status = EXCLUDED.status
    `;

    await this.pool.query(query, [
      book.id.getValue(),
      book.isbn.getValue(),
      book.title,
      book.author,
      book.status,
      book.createdAt,
    ]);
  }

  async findById(id: BookId): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE id = $1';
    const result = await this.pool.query(query, [id.getValue()]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToBook(result.rows[0]);
  }

  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE isbn = $1';
    const result = await this.pool.query(query, [isbn.getValue()]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToBook(result.rows[0]);
  }

  async findAvailable(): Promise<Book[]> {
    const query = "SELECT * FROM books WHERE status = 'AVAILABLE' ORDER BY title";
    const result = await this.pool.query(query);
    return result.rows.map((row) => this.rowToBook(row));
  }

  async findAll(): Promise<Book[]> {
    const query = 'SELECT * FROM books ORDER BY title';
    const result = await this.pool.query(query);
    return result.rows.map((row) => this.rowToBook(row));
  }

  async delete(id: BookId): Promise<void> {
    const query = 'DELETE FROM books WHERE id = $1';
    await this.pool.query(query, [id.getValue()]);
  }

  async existsByIsbn(isbn: ISBN): Promise<boolean> {
    const query = 'SELECT 1 FROM books WHERE isbn = $1';
    const result = await this.pool.query(query, [isbn.getValue()]);
    return result.rows.length > 0;
  }

  private rowToBook(row: Record<string, unknown>): Book {
    return Book.reconstitute({
      id: BookId.create(row.id as string),
      isbn: ISBN.create(row.isbn as string),
      title: row.title as string,
      author: row.author as string,
      status: row.status as BookStatus,
      createdAt: new Date(row.created_at as string),
    });
  }
}
