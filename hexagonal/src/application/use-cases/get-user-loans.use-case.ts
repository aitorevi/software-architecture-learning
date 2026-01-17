import {
  UserId,
  LoanRepository,
  UserRepository,
  UserNotFoundException,
  Loan,
} from '../../domain';
import { LoanResponse } from '../dtos';

/**
 * GetUserLoansUseCase
 *
 * Obtiene el historial de préstamos de un usuario.
 */
export class GetUserLoansUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loanRepository: LoanRepository
  ) {}

  async execute(userId: string): Promise<LoanResponse[]> {
    // Verificar que el usuario existe
    const userIdVO = UserId.create(userId);
    const user = await this.userRepository.findById(userIdVO);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Obtener todos los préstamos del usuario
    const loans = await this.loanRepository.findByUserId(userIdVO);
    return loans.map(this.toResponse);
  }

  private toResponse(loan: Loan): LoanResponse {
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
