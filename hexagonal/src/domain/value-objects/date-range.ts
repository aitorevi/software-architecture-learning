/**
 * DateRange Value Object
 *
 * Encapsula un rango de fechas (inicio y fin).
 * Usado para períodos de préstamo y penalizaciones.
 *
 * ¿Por qué un Value Object para DateRange?
 * - Garantiza que startDate <= endDate
 * - Calcula duración, días de retraso, etc.
 * - Inmutable y autovalidado
 */
export class DateRange {
  private constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {
    this.validate(startDate, endDate);
  }

  private validate(startDate: Date, endDate: Date): void {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Invalid start date');
    }
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('Invalid end date');
    }
    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }
  }

  static create(startDate: Date, endDate: Date): DateRange {
    return new DateRange(new Date(startDate), new Date(endDate));
  }

  /**
   * Crea un rango desde hoy por N días
   */
  static fromToday(days: number): DateRange {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return new DateRange(start, end);
  }

  getStartDate(): Date {
    return new Date(this.startDate);
  }

  getEndDate(): Date {
    return new Date(this.endDate);
  }

  /**
   * Duración en días
   */
  getDurationInDays(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si una fecha está dentro del rango
   */
  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  /**
   * Calcula días de retraso respecto a una fecha
   */
  getDaysOverdue(asOf: Date = new Date()): number {
    if (asOf <= this.endDate) {
      return 0;
    }
    const diffTime = asOf.getTime() - this.endDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si el rango ha expirado
   */
  isExpired(asOf: Date = new Date()): boolean {
    return asOf > this.endDate;
  }

  equals(other: DateRange): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }

  toString(): string {
    return `${this.startDate.toISOString().split('T')[0]} - ${this.endDate.toISOString().split('T')[0]}`;
  }
}
