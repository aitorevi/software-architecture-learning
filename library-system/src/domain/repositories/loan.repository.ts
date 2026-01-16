import { Loan } from '../entities';
import { LoanId, UserId, BookId } from '../value-objects';

/**
 * LoanRepository Interface
 *
 * Define el contrato para persistencia de préstamos.
 *
 * Nota: Los préstamos también están dentro del agregado User,
 * pero este repositorio permite consultas directas sobre préstamos
 * sin cargar todo el User.
 */
export interface LoanRepository {
  /**
   * Guarda un préstamo (crear o actualizar)
   */
  save(loan: Loan): Promise<void>;

  /**
   * Busca un préstamo por ID
   */
  findById(id: LoanId): Promise<Loan | null>;

  /**
   * Busca préstamos activos de un usuario
   */
  findActiveByUserId(userId: UserId): Promise<Loan[]>;

  /**
   * Busca el préstamo activo de un libro (si existe)
   */
  findActiveByBookId(bookId: BookId): Promise<Loan | null>;

  /**
   * Obtiene todos los préstamos de un usuario (historial)
   */
  findByUserId(userId: UserId): Promise<Loan[]>;

  /**
   * Obtiene todos los préstamos vencidos (overdue)
   */
  findOverdue(asOf?: Date): Promise<Loan[]>;

  /**
   * Obtiene todos los préstamos
   */
  findAll(): Promise<Loan[]>;

  /**
   * Elimina un préstamo por ID
   */
  delete(id: LoanId): Promise<void>;
}
