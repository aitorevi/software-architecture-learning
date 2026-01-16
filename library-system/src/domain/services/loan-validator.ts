import { User, Book, Loan } from '../entities';

/**
 * LoanValidator Domain Service
 *
 * Valida si un préstamo puede realizarse según las reglas de negocio.
 *
 * ¿Por qué es un servicio de dominio?
 * - La validación involucra múltiples entidades (User, Book)
 * - Centraliza las reglas de validación
 * - Facilita testing de reglas de negocio
 */

export interface LoanValidationResult {
  isValid: boolean;
  errors: string[];
}

export class LoanValidator {
  private static readonly MAX_ACTIVE_LOANS = 3;

  /**
   * Valida si un usuario puede pedir prestado un libro específico
   */
  validateLoan(user: User, book: Book): LoanValidationResult {
    const errors: string[] = [];

    // Regla 1: Usuario no debe tener penalizaciones activas
    if (user.hasPenalties()) {
      const penalty = user.getActivePenalty();
      errors.push(
        `User has active penalties until ${penalty?.endDate.toISOString().split('T')[0]}`
      );
    }

    // Regla 2: Usuario no debe exceder límite de préstamos
    if (user.activeLoans.length >= LoanValidator.MAX_ACTIVE_LOANS) {
      errors.push(
        `User has reached maximum loan limit (${user.activeLoans.length}/${LoanValidator.MAX_ACTIVE_LOANS})`
      );
    }

    // Regla 3: Libro debe estar disponible
    if (!book.isAvailable()) {
      errors.push('Book is not available for loan');
    }

    // Regla 4: Usuario no debe tener ya prestado este libro
    const alreadyHasBook = user.activeLoans.some((loan) =>
      loan.bookId.equals(book.id)
    );
    if (alreadyHasBook) {
      errors.push('User already has this book on loan');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida si un usuario puede pedir más libros
   */
  canUserBorrowMore(user: User): LoanValidationResult {
    const errors: string[] = [];

    if (user.hasPenalties()) {
      errors.push('User has active penalties');
    }

    if (user.activeLoans.length >= LoanValidator.MAX_ACTIVE_LOANS) {
      errors.push('User has reached maximum loan limit');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcula cuántos libros más puede pedir el usuario
   */
  getRemainingLoanCapacity(user: User): number {
    if (user.hasPenalties()) {
      return 0;
    }
    return Math.max(0, LoanValidator.MAX_ACTIVE_LOANS - user.activeLoans.length);
  }

  /**
   * Verifica si un préstamo específico puede ser devuelto por el usuario
   */
  validateReturn(user: User, loan: Loan): LoanValidationResult {
    const errors: string[] = [];

    // El préstamo debe pertenecer al usuario
    if (!loan.userId.equals(user.id)) {
      errors.push('Loan does not belong to this user');
    }

    // El préstamo debe estar activo
    if (!loan.isActive()) {
      errors.push('Loan is not active');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
