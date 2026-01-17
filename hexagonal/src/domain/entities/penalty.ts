import { UserId, LoanId, DateRange } from '../value-objects';

/**
 * Penalty Entity
 *
 * Representa una penalización por devolución tardía.
 *
 * Reglas de negocio:
 * - Se crea cuando un usuario devuelve un libro con retraso
 * - Duración: 2 días por cada día de retraso
 * - El usuario no puede pedir libros mientras tenga penalizaciones activas
 */

export interface PenaltyProps {
  userId: UserId;
  loanId: LoanId;
  penaltyPeriod: DateRange;
  daysOverdue: number;
  createdAt: Date;
}

export class Penalty {
  private constructor(private readonly props: PenaltyProps) {}

  /**
   * Factory method para crear una penalización
   * @param daysOverdue días de retraso
   */
  static create(params: {
    userId: UserId;
    loanId: LoanId;
    daysOverdue: number;
  }): Penalty {
    // Penalización: 2 días por cada día de retraso
    const penaltyDays = params.daysOverdue * 2;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + penaltyDays);

    return new Penalty({
      userId: params.userId,
      loanId: params.loanId,
      penaltyPeriod: DateRange.create(startDate, endDate),
      daysOverdue: params.daysOverdue,
      createdAt: new Date(),
    });
  }

  /**
   * Reconstituye una penalización desde persistencia
   */
  static reconstitute(props: PenaltyProps): Penalty {
    return new Penalty(props);
  }

  // Getters
  get userId(): UserId {
    return this.props.userId;
  }

  get loanId(): LoanId {
    return this.props.loanId;
  }

  get penaltyPeriod(): DateRange {
    return this.props.penaltyPeriod;
  }

  get daysOverdue(): number {
    return this.props.daysOverdue;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get endDate(): Date {
    return this.props.penaltyPeriod.getEndDate();
  }

  // Comportamiento
  isActive(asOf: Date = new Date()): boolean {
    return this.props.penaltyPeriod.contains(asOf);
  }

  getDaysRemaining(asOf: Date = new Date()): number {
    if (!this.isActive(asOf)) {
      return 0;
    }
    const endDate = this.props.penaltyPeriod.getEndDate();
    const diffTime = endDate.getTime() - asOf.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
