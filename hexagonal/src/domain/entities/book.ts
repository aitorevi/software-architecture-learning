import { BookId, ISBN } from '../value-objects';
import { DomainEvent, BookRegisteredEvent } from '../events';
import { BookNotAvailableException } from '../exceptions';

/**
 * Book Entity (Aggregate Root)
 *
 * ¿Por qué Book es un Aggregate Root?
 * - Tiene identidad propia (BookId)
 * - Mantiene su propia consistencia (estado available/borrowed)
 * - Es el punto de entrada para operaciones con libros
 *
 * Reglas de negocio encapsuladas:
 * - Solo se puede prestar si está disponible
 * - Solo se puede devolver si está prestado
 */

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
}

export interface BookProps {
  id: BookId;
  isbn: ISBN;
  title: string;
  author: string;
  status: BookStatus;
  createdAt: Date;
}

export class Book {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private props: BookProps) {}

  /**
   * Factory method para crear un nuevo libro
   */
  static create(params: {
    id: BookId;
    isbn: ISBN;
    title: string;
    author: string;
  }): Book {
    const book = new Book({
      id: params.id,
      isbn: params.isbn,
      title: params.title,
      author: params.author,
      status: BookStatus.AVAILABLE,
      createdAt: new Date(),
    });

    book.addDomainEvent(
      new BookRegisteredEvent(
        params.id.getValue(),
        params.isbn.getValue(),
        params.title
      )
    );

    return book;
  }

  /**
   * Reconstituye un libro desde persistencia (sin emitir eventos)
   */
  static reconstitute(props: BookProps): Book {
    return new Book(props);
  }

  // Getters
  get id(): BookId {
    return this.props.id;
  }

  get isbn(): ISBN {
    return this.props.isbn;
  }

  get title(): string {
    return this.props.title;
  }

  get author(): string {
    return this.props.author;
  }

  get status(): BookStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Comportamiento de negocio
  isAvailable(): boolean {
    return this.props.status === BookStatus.AVAILABLE;
  }

  /**
   * Marca el libro como prestado.
   * @throws BookNotAvailableException si el libro no está disponible
   */
  markAsBorrowed(): void {
    if (!this.isAvailable()) {
      throw new BookNotAvailableException(
        this.props.id.getValue(),
        'Book is already borrowed'
      );
    }
    this.props.status = BookStatus.BORROWED;
  }

  /**
   * Marca el libro como devuelto/disponible.
   */
  markAsReturned(): void {
    this.props.status = BookStatus.AVAILABLE;
  }

  // Eventos de dominio
  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  equals(other: Book): boolean {
    return this.props.id.equals(other.id);
  }
}
