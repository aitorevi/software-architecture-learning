import { DomainException } from './domain-exception';

/**
 * Se lanza cuando se intenta prestar un libro que no está disponible.
 * Puede ser porque está prestado o reservado.
 */
export class BookNotAvailableException extends DomainException {
  constructor(
    public readonly bookId: string,
    public readonly reason?: string
  ) {
    super(
      `Book ${bookId} is not available${reason ? `: ${reason}` : ''}`,
      'BOOK_NOT_AVAILABLE'
    );
  }
}
