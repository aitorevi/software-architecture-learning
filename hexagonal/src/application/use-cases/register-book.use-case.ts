import { Book, BookId, ISBN, BookRepository, IdGenerator } from '../../domain';
import { RegisterBookCommand, BookResponse } from '../dtos';

/**
 * RegisterBookUseCase
 *
 * Registra un nuevo libro en el catálogo de la biblioteca.
 *
 * ¿Por qué el caso de uso no tiene lógica de negocio?
 * - Solo orquesta: crea el libro y lo persiste
 * - La validación del ISBN está en el Value Object
 * - El estado inicial está en la entidad Book
 */
export class RegisterBookUseCase {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: RegisterBookCommand): Promise<BookResponse> {
    // Crear Value Objects (validación automática)
    const isbn = ISBN.create(command.isbn);

    // Verificar si ya existe un libro con este ISBN
    const existingBook = await this.bookRepository.existsByIsbn(isbn);
    if (existingBook) {
      throw new Error(`Book with ISBN ${command.isbn} already exists`);
    }

    // Crear la entidad
    const book = Book.create({
      id: BookId.create(this.idGenerator.generate()),
      isbn,
      title: command.title,
      author: command.author,
    });

    // Persistir
    await this.bookRepository.save(book);

    // Retornar DTO
    return this.toResponse(book);
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
