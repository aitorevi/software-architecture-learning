/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  IN-MEMORY USER REPOSITORY - ADAPTADOR                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Este es un ADAPTADOR en arquitectura hexagonal.                          ║
 * ║                                                                           ║
 * ║  IMPLEMENTA la interface UserRepository (puerto).                         ║
 * ║  El dominio NO conoce esta implementación.                                ║
 * ║                                                                           ║
 * ║  Ventajas de InMemory para desarrollo/testing:                            ║
 * ║  • No necesitas BD                                                        ║
 * ║  • Tests rápidos                                                          ║
 * ║  • Fácil reset entre tests                                                ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { User } from '../../domain/User.js';
import { UserId } from '../../domain/UserId.js';
import { Email } from '../../domain/value-objects/Email.js';
import { UserRepository } from '../../domain/UserRepository.js';

export class InMemoryUserRepository implements UserRepository {
  /**
   * Almacenamiento en memoria - un Map de UserId → User
   */
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    // Guardamos usando el ID como key
    this.users.set(user.getId().toString(), user);
  }

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.toString()) || null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    // Buscamos linealmente - en BD real sería un índice
    for (const user of this.users.values()) {
      if (user.getEmail().equals(email)) {
        return user;
      }
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async delete(id: UserId): Promise<boolean> {
    return this.users.delete(id.toString());
  }

  /**
   * Útil para tests - limpiar todos los usuarios
   */
  clear(): void {
    this.users.clear();
  }
}
