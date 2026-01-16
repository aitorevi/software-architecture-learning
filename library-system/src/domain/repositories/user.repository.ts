import { User } from '../entities';
import { UserId, Email } from '../value-objects';

/**
 * UserRepository Interface
 *
 * Define el contrato para persistencia de usuarios.
 *
 * Nota: El User incluye sus préstamos activos y penalizaciones
 * como parte del agregado, por lo que save() persiste todo.
 */
export interface UserRepository {
  /**
   * Guarda un usuario (crear o actualizar)
   * Incluye préstamos activos y penalizaciones
   */
  save(user: User): Promise<void>;

  /**
   * Busca un usuario por ID
   * Carga préstamos activos y penalizaciones
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Busca un usuario por email
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Obtiene todos los usuarios
   */
  findAll(): Promise<User[]>;

  /**
   * Elimina un usuario por ID
   */
  delete(id: UserId): Promise<void>;

  /**
   * Verifica si existe un usuario con el email dado
   */
  existsByEmail(email: Email): Promise<boolean>;
}
