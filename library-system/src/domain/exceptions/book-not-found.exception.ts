import { DomainException } from './domain-exception';

/**
 * Se lanza cuando se busca un libro que no existe en el sistema.
 */
export class BookNotFoundException extends DomainException {
  constructor(public readonly bookId: string) {
    super(`Book with id ${bookId} not found`, 'BOOK_NOT_FOUND');
  }
}
