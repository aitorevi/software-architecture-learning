import { UserRepository, User, UserId, Email } from '../../../src/domain';

/**
 * FakeUserRepository para tests
 *
 * Implementación en memoria para testing
 */
export class FakeUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id.getValue(), user);
  }

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.getValue()) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.equals(email)) {
        return user;
      }
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id.getValue());
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return (await this.findByEmail(email)) !== null;
  }

  // Helper methods para tests
  clear(): void {
    this.users.clear();
  }

  count(): number {
    return this.users.size;
  }
}
