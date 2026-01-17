import {
  UserId,
  BookId,
  UserRepository,
  BookRepository,
  LoanRepository,
  UserNotFoundException,
  BookNotFoundException,
  Loan,
  Penalty,
} from '../../domain';
import { ReturnBookCommand, LoanResultResponse, LoanResponse } from '../dtos';

/**
 * ReturnBookUseCase
 *
 * Procesa la devolución de un libro prestado.
 *
 * Orquestación:
 * 1. Busca usuario y libro
 * 2. Delega la devolución a User.returnBook()
 * 3. Persiste los cambios
 * 4. Retorna info del préstamo y posible penalización
 */
export class ReturnBookUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bookRepository: BookRepository,
    private readonly loanRepository: LoanRepository
  ) {}

  async execute(command: ReturnBookCommand): Promise<LoanResultResponse> {
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

    // 3. Procesar devolución (puede crear penalización)
    const { loan, penalty } = user.returnBook(bookId, book);

    // 4. Persistir cambios
    await this.loanRepository.save(loan);
    await this.bookRepository.save(book);
    await this.userRepository.save(user);

    // 5. Retornar resultado
    return this.toResultResponse(loan, penalty);
  }

  private toResultResponse(
    loan: Loan,
    penalty: Penalty | null
  ): LoanResultResponse {
    return {
      loan: this.toLoanResponse(loan),
      penalty: penalty
        ? {
            daysOverdue: penalty.daysOverdue,
            endDate: penalty.endDate.toISOString(),
          }
        : null,
    };
  }

  private toLoanResponse(loan: Loan): LoanResponse {
    return {
      id: loan.id.getValue(),
      bookId: loan.bookId.getValue(),
      userId: loan.userId.getValue(),
      startDate: loan.loanPeriod.getStartDate().toISOString(),
      dueDate: loan.dueDate.toISOString(),
      status: loan.status,
      returnedAt: loan.returnedAt?.toISOString() ?? null,
      daysOverdue: 0, // Ya fue devuelto
    };
  }
}
