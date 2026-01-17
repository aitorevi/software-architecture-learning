import { UserId, Email, LoanId, BookId } from '../value-objects';
import { DomainEvent, UserRegisteredEvent, PenaltyAppliedEvent } from '../events';
import { Loan, LoanStatus } from './loan';
import { Penalty } from './penalty';
import { Book } from './book';
import {
  UserExceedLoanLimitException,
  UserHasPenaltiesException,
  BookNotAvailableException,
} from '../exceptions';

/**
 * User Entity (Aggregate Root)
 *
 * ¿Por qué User es un Aggregate Root?
 * - Mantiene la consistencia entre préstamos y penalizaciones
 * - Aplica reglas de negocio: máximo 3 libros, no prestar con penalizaciones
 * - Es el punto de entrada para operaciones de préstamo
 *
 * Decisión: Los préstamos activos se mantienen DENTRO del agregado User
 * para poder validar reglas de negocio sin consultar externos.
 */

export interface UserProps {
  id: UserId;
  email: Email;
  name: string;
  activeLoans: Loan[];
  penalties: Penalty[];
  createdAt: Date;
}

export class User {
  private static readonly MAX_ACTIVE_LOANS = 3;
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private props: UserProps) {}

  /**
   * Factory method para crear un nuevo usuario
   */
  static create(params: { id: UserId; email: Email; name: string }): User {
    const user = new User({
      id: params.id,
      email: params.email,
      name: params.name,
      activeLoans: [],
      penalties: [],
      createdAt: new Date(),
    });

    user.addDomainEvent(
      new UserRegisteredEvent(
        params.id.getValue(),
        params.email.getValue(),
        params.name
      )
    );

    return user;
  }

  /**
   * Reconstituye un usuario desde persistencia
   */
  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // Getters
  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get activeLoans(): Loan[] {
    return [...this.props.activeLoans];
  }

  get penalties(): Penalty[] {
    return [...this.props.penalties];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Comportamiento de negocio

  /**
   * Verifica si el usuario tiene penalizaciones activas
   */
  hasPenalties(asOf: Date = new Date()): boolean {
    return this.props.penalties.some((p) => p.isActive(asOf));
  }

  /**
   * Obtiene la penalización activa más reciente
   */
  getActivePenalty(asOf: Date = new Date()): Penalty | undefined {
    return this.props.penalties.find((p) => p.isActive(asOf));
  }

  /**
   * Verifica si el usuario puede pedir un libro prestado
   */
  canBorrowBook(asOf: Date = new Date()): boolean {
    return (
      !this.hasPenalties(asOf) &&
      this.props.activeLoans.length < User.MAX_ACTIVE_LOANS
    );
  }

  /**
   * Pide un libro prestado
   *
   * @throws UserHasPenaltiesException si tiene penalizaciones activas
   * @throws UserExceedLoanLimitException si ya tiene 3 libros
   * @throws BookNotAvailableException si el libro no está disponible
   */
  borrowBook(book: Book, loanId: LoanId): Loan {
    // Verificar penalizaciones
    const activePenalty = this.getActivePenalty();
    if (activePenalty) {
      throw new UserHasPenaltiesException(
        this.props.id.getValue(),
        activePenalty.endDate
      );
    }

    // Verificar límite de préstamos
    if (this.props.activeLoans.length >= User.MAX_ACTIVE_LOANS) {
      throw new UserExceedLoanLimitException(
        this.props.id.getValue(),
        this.props.activeLoans.length,
        User.MAX_ACTIVE_LOANS
      );
    }

    // Verificar disponibilidad del libro
    if (!book.isAvailable()) {
      throw new BookNotAvailableException(book.id.getValue());
    }

    // Crear el préstamo
    const loan = Loan.create({
      id: loanId,
      bookId: book.id,
      userId: this.props.id,
    });

    // Marcar libro como prestado
    book.markAsBorrowed();

    // Agregar préstamo activo
    this.props.activeLoans.push(loan);

    return loan;
  }

  /**
   * Devuelve un libro prestado
   *
   * @returns el préstamo actualizado y posible penalización
   */
  returnBook(
    bookId: BookId,
    book: Book,
    returnDate: Date = new Date()
  ): { loan: Loan; penalty: Penalty | null } {
    // Buscar el préstamo activo de este libro
    const loanIndex = this.props.activeLoans.findIndex((l) =>
      l.bookId.equals(bookId)
    );

    if (loanIndex === -1) {
      throw new Error(
        `User ${this.props.id.getValue()} does not have an active loan for book ${bookId.getValue()}`
      );
    }

    const loan = this.props.activeLoans[loanIndex];

    // Marcar préstamo como devuelto
    const daysOverdue = loan.markAsReturned(returnDate);

    // Marcar libro como disponible
    book.markAsReturned();

    // Remover de préstamos activos
    this.props.activeLoans.splice(loanIndex, 1);

    // Aplicar penalización si hay retraso
    let penalty: Penalty | null = null;
    if (daysOverdue > 0) {
      penalty = Penalty.create({
        userId: this.props.id,
        loanId: loan.id,
        daysOverdue,
      });
      this.props.penalties.push(penalty);

      this.addDomainEvent(
        new PenaltyAppliedEvent(
          this.props.id.getValue(),
          loan.id.getValue(),
          daysOverdue,
          penalty.endDate
        )
      );
    }

    return { loan, penalty };
  }

  /**
   * Obtiene el historial de préstamos (activos)
   */
  getLoanHistory(): Loan[] {
    return [...this.props.activeLoans];
  }

  /**
   * Cuenta cuántos libros puede pedir aún
   */
  getRemainingLoanSlots(): number {
    return User.MAX_ACTIVE_LOANS - this.props.activeLoans.length;
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

  equals(other: User): boolean {
    return this.props.id.equals(other.id);
  }
}
