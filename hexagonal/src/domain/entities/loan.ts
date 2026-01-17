import { LoanId, BookId, UserId, DateRange } from '../value-objects';
import { DomainEvent, BookLoanedEvent, BookReturnedEvent } from '../events';

/**
 * Loan Entity
 *
 * Representa un préstamo de un libro a un usuario.
 *
 * Reglas de negocio:
 * - Período estándar de préstamo: 14 días
 * - Puede calcular días de retraso
 * - Registra fecha de devolución real
 */

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

export interface LoanProps {
  id: LoanId;
  bookId: BookId;
  userId: UserId;
  loanPeriod: DateRange;
  status: LoanStatus;
  returnedAt: Date | null;
  createdAt: Date;
}

export class Loan {
  private static readonly DEFAULT_LOAN_DAYS = 14;
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private props: LoanProps) {}

  /**
   * Factory method para crear un nuevo préstamo
   */
  static create(params: { id: LoanId; bookId: BookId; userId: UserId }): Loan {
    const loanPeriod = DateRange.fromToday(Loan.DEFAULT_LOAN_DAYS);

    const loan = new Loan({
      id: params.id,
      bookId: params.bookId,
      userId: params.userId,
      loanPeriod,
      status: LoanStatus.ACTIVE,
      returnedAt: null,
      createdAt: new Date(),
    });

    loan.addDomainEvent(
      new BookLoanedEvent(
        params.id.getValue(),
        params.bookId.getValue(),
        params.userId.getValue(),
        loanPeriod.getEndDate()
      )
    );

    return loan;
  }

  /**
   * Reconstituye un préstamo desde persistencia
   */
  static reconstitute(props: LoanProps): Loan {
    return new Loan(props);
  }

  // Getters
  get id(): LoanId {
    return this.props.id;
  }

  get bookId(): BookId {
    return this.props.bookId;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get loanPeriod(): DateRange {
    return this.props.loanPeriod;
  }

  get status(): LoanStatus {
    return this.props.status;
  }

  get returnedAt(): Date | null {
    return this.props.returnedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get dueDate(): Date {
    return this.props.loanPeriod.getEndDate();
  }

  // Comportamiento de negocio
  isActive(): boolean {
    return this.props.status === LoanStatus.ACTIVE;
  }

  isOverdue(asOf: Date = new Date()): boolean {
    return this.isActive() && this.props.loanPeriod.isExpired(asOf);
  }

  getDaysOverdue(asOf: Date = new Date()): number {
    if (!this.isActive()) {
      return 0;
    }
    return this.props.loanPeriod.getDaysOverdue(asOf);
  }

  /**
   * Marca el préstamo como devuelto
   * @returns número de días de retraso (0 si no hay retraso)
   */
  markAsReturned(returnDate: Date = new Date()): number {
    const daysOverdue = this.props.loanPeriod.getDaysOverdue(returnDate);

    this.props.status = LoanStatus.RETURNED;
    this.props.returnedAt = returnDate;

    this.addDomainEvent(
      new BookReturnedEvent(
        this.props.id.getValue(),
        this.props.bookId.getValue(),
        this.props.userId.getValue(),
        daysOverdue
      )
    );

    return daysOverdue;
  }

  /**
   * Actualiza el estado a OVERDUE si corresponde
   */
  checkAndUpdateOverdueStatus(asOf: Date = new Date()): void {
    if (this.isActive() && this.props.loanPeriod.isExpired(asOf)) {
      this.props.status = LoanStatus.OVERDUE;
    }
  }

  // Eventos de dominio
  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  equals(other: Loan): boolean {
    return this.props.id.equals(other.id);
  }
}
