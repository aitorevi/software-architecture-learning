import { DomainException } from './domain-exception';

/**
 * Se lanza cuando un usuario intenta pedir prestado un libro
 * pero ya tiene el máximo permitido (3 libros).
 */
export class UserExceedLoanLimitException extends DomainException {
  constructor(
    public readonly userId: string,
    public readonly currentLoans: number,
    public readonly maxLoans: number
  ) {
    super(
      `User ${userId} has reached the maximum loan limit (${currentLoans}/${maxLoans})`,
      'USER_EXCEED_LOAN_LIMIT'
    );
  }
}
