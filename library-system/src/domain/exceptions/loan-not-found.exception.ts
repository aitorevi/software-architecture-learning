import { DomainException } from './domain-exception';

/**
 * Se lanza cuando se busca un préstamo que no existe en el sistema.
 */
export class LoanNotFoundException extends DomainException {
  constructor(public readonly loanId: string) {
    super(`Loan with id ${loanId} not found`, 'LOAN_NOT_FOUND');
  }
}
