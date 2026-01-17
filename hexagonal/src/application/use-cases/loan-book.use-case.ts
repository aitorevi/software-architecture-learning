import {
  UserId,
  BookId,
  LoanId,
  UserRepository,
  BookRepository,
  LoanRepository,
  IdGenerator,
  UserNotFoundException,
  BookNotFoundException,
} from '../../domain';
import { LoanBookCommand, LoanResponse } from '../dtos';

/**
 * LoanBookUseCase
 *
 * Procesa el préstamo de un libro a un usuario.
 *
 * Orquestación:
 * 1. Busca usuario y libro
 * 2. Delega la validación y creación del préstamo a User.borrowBook()
 * 3. Persiste los cambios
 *
 * La lógica de negocio (límites, penalizaciones) está en User.borrowBook()
 */
export class LoanBookUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bookRepository: BookRepository,
    private readonly loanRepository: LoanRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: LoanBookCommand): Promise<LoanResponse> {
    // 1. Buscar usuario
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    // 2. Buscar libro
    const bookId = BookId.create(command.bookId);
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new BookNotFoundException(command.bookId);
    }

    // 3. Crear préstamo (la validación está en User.borrowBook)
    const loanId = LoanId.create(this.idGenerator.generate());
    const loan = user.borrowBook(book, loanId);

    // 4. Persistir cambios
    await this.loanRepository.save(loan);
    await this.bookRepository.save(book);
    await this.userRepository.save(user);

    // 5. Retornar DTO
    return this.toResponse(loan);
  }

  private toResponse(loan: import('../../domain').Loan): LoanResponse {
    return {
      id: loan.id.getValue(),
      bookId: loan.bookId.getValue(),
      userId: loan.userId.getValue(),
      startDate: loan.loanPeriod.getStartDate().toISOString(),
      dueDate: loan.dueDate.toISOString(),
      status: loan.status,
      returnedAt: loan.returnedAt?.toISOString() ?? null,
      daysOverdue: loan.getDaysOverdue(),
    };
  }
}
