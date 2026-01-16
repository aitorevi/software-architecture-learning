import { Money, DateRange } from '../value-objects';

/**
 * PenaltyCalculator Domain Service
 *
 * ¿Por qué es un servicio de dominio?
 * - La lógica de cálculo de penalizaciones no pertenece a User ni a Loan
 * - Es una regla de negocio que puede evolucionar independientemente
 * - Puede ser reutilizada por múltiples casos de uso
 *
 * Es una clase PURA: no tiene dependencias de infraestructura.
 */
export class PenaltyCalculator {
  // Constantes de negocio
  private static readonly PENALTY_DAYS_PER_OVERDUE_DAY = 2;
  private static readonly MONETARY_PENALTY_PER_DAY_CENTS = 50; // 0.50 EUR por día
  private static readonly CURRENCY = 'EUR';

  /**
   * Calcula los días de penalización basado en días de retraso
   *
   * Regla: 2 días de penalización por cada día de retraso
   */
  calculatePenaltyDays(daysOverdue: number): number {
    if (daysOverdue <= 0) {
      return 0;
    }
    return daysOverdue * PenaltyCalculator.PENALTY_DAYS_PER_OVERDUE_DAY;
  }

  /**
   * Calcula el período de penalización desde hoy
   */
  calculatePenaltyPeriod(daysOverdue: number): DateRange | null {
    const penaltyDays = this.calculatePenaltyDays(daysOverdue);
    if (penaltyDays === 0) {
      return null;
    }
    return DateRange.fromToday(penaltyDays);
  }

  /**
   * Calcula la multa monetaria por retraso
   *
   * Regla: 0.50 EUR por cada día de retraso
   */
  calculateMonetaryPenalty(daysOverdue: number): Money {
    if (daysOverdue <= 0) {
      return Money.zero(PenaltyCalculator.CURRENCY);
    }

    const totalCents =
      daysOverdue * PenaltyCalculator.MONETARY_PENALTY_PER_DAY_CENTS;
    return Money.fromCents(totalCents, PenaltyCalculator.CURRENCY);
  }

  /**
   * Calcula días de retraso dado una fecha de vencimiento
   */
  calculateDaysOverdue(dueDate: Date, returnDate: Date = new Date()): number {
    if (returnDate <= dueDate) {
      return 0;
    }
    const diffTime = returnDate.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si un préstamo está vencido
   */
  isOverdue(dueDate: Date, asOf: Date = new Date()): boolean {
    return asOf > dueDate;
  }
}
