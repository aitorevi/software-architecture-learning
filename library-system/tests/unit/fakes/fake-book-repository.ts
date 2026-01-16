import { BookRepository, Book, BookId, ISBN, BookStatus } from '../../../src/domain';

/**
 * FakeBookRepository para tests
 *
 * Implementación en memoria para testing
 */
export class FakeBookRepository implements BookRepository {
  private books: Map<string, Book> = new Map();

  async save(book: Book): Promise<void> {
    this.books.set(book.id.getValue(), book);
  }

  async findById(id: BookId): Promise<Book | null> {
    return this.books.get(id.getValue()) ?? null;
  }

  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    for (const book of this.books.values()) {
      if (book.isbn.equals(isbn)) {
        return book;
      }
    }
    return null;
  }

  async findAvailable(): Promise<Book[]> {
    return Array.from(this.books.values()).filter((book) => book.isAvailable());
  }

  async findAll(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async delete(id: BookId): Promise<void> {
    this.books.delete(id.getValue());
  }

  async existsByIsbn(isbn: ISBN): Promise<boolean> {
    return (await this.findByIsbn(isbn)) !== null;
  }

  // Helper methods para tests
  clear(): void {
    this.books.clear();
  }

  count(): number {
    return this.books.size;
  }
}
