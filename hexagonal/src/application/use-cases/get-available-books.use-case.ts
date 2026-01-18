 import { BookRepository, Book } from '../../domain';
import { BookResponse } from '../dtos';

/**
 * GetAvailableBooksUseCase
 *
 * Obtiene todos los libros disponibles para préstamo.
 * Es un Query (solo lectura), no modifica estado.
 */
export class GetAvailableBooksUseCase {
  constructor(private readonly bookRepository: BookRepository) {}

  async execute(): Promise<BookResponse[]> {
    const books = await this.bookRepository.findAvailable();
    return books.map(this.toResponse);
  }

  private toResponse(book: Book): BookResponse {
    return {
      id: book.id.getValue(),
      isbn: book.isbn.getValue(),
      title: book.title,
      author: book.author,
      status: book.status,
      createdAt: book.createdAt.toISOString(),
    };
  }
}
