import {
  BookRepository,
  Book,
  BookId,
  ISBN,
  BookStatus,
  BookProps,
} from '../../../domain';

/**
 * InMemoryBookRepository
 *
 * Implementación en memoria del repositorio de libros.
 * Útil para desarrollo, demos y testing de integración.
 *
 * ¿Por qué separar de FakeBookRepository?
 * - Los fakes son para unit tests (pueden tener shortcuts)
 * - Esta implementación es más robusta y puede usarse en producción
 */
export class InMemoryBookRepository implements BookRepository {
  private books: Map<string, BookProps> = new Map();

  async save(book: Book): Promise<void> {
    // Guardar una copia de las propiedades
    const props: BookProps = {
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      status: book.status,
      createdAt: book.createdAt,
    };
    this.books.set(book.id.getValue(), props);
  }

  async findById(id: BookId): Promise<Book | null> {
    const props = this.books.get(id.getValue());
    if (!props) return null;
    return Book.reconstitute(props);
  }

  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    for (const props of this.books.values()) {
      if (props.isbn.equals(isbn)) {
        return Book.reconstitute(props);
      }
    }
    return null;
  }

  async findAvailable(): Promise<Book[]> {
    const available: Book[] = [];
    for (const props of this.books.values()) {
      if (props.status === BookStatus.AVAILABLE) {
        available.push(Book.reconstitute(props));
      }
    }
    return available;
  }

  async findAll(): Promise<Book[]> {
    return Array.from(this.books.values()).map((props) =>
      Book.reconstitute(props)
    );
  }

  async delete(id: BookId): Promise<void> {
    this.books.delete(id.getValue());
  }

  async existsByIsbn(isbn: ISBN): Promise<boolean> {
    return (await this.findByIsbn(isbn)) !== null;
  }

  // Método para limpiar (útil en tests de integración)
  clear(): void {
    this.books.clear();
  }
}
