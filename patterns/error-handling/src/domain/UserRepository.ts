/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  USER REPOSITORY - PUERTO (INTERFACE)                                     ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Este es un PUERTO en arquitectura hexagonal.                             ║
 * ║                                                                           ║
 * ║  El dominio DEFINE la interface.                                          ║
 * ║  La infraestructura IMPLEMENTA la interface.                              ║
 * ║                                                                           ║
 * ║  Inversión de Dependencias: Dominio → Interface ← Infraestructura         ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { User } from './User.js';
import { UserId } from './UserId.js';
import { Email } from './value-objects/Email.js';

/**
 * PUERTO: UserRepository
 *
 * Define QUÉ operaciones necesita el dominio.
 * NO define CÓMO se implementan (eso es responsabilidad del adaptador).
 */
export interface UserRepository {
  /**
   * Guarda un usuario.
   * Si ya existe (mismo ID), lo actualiza.
   */
  save(user: User): Promise<void>;

  /**
   * Busca un usuario por ID.
   * Retorna null si no existe.
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Busca un usuario por email.
   * Retorna null si no existe.
   *
   * Útil para verificar si un email ya está registrado.
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Obtiene todos los usuarios.
   * (Útil para demos, en producción usarías paginación)
   */
  findAll(): Promise<User[]>;

  /**
   * Elimina un usuario por ID.
   * Retorna true si se eliminó, false si no existía.
   */
  delete(id: UserId): Promise<boolean>;
}
