/**
 * InMemoryAccountRepository - Adaptador de Persistencia
 *
 * Implementa el puerto AccountRepository usando memoria.
 * En un sistema real, esto sería una base de datos (PostgreSQL, MongoDB, etc.)
 */

import { Account } from '../../domain/entities/Account.js';
import { AccountRepository } from '../../domain/repositories/AccountRepository.js';

export class InMemoryAccountRepository implements AccountRepository {
  private accounts: Map<string, Account> = new Map();

  async findById(id: string): Promise<Account | null> {
    return this.accounts.get(id) || null;
  }

  async save(account: Account): Promise<void> {
    this.accounts.set(account.getId(), account);
  }

  async saveMany(accounts: Account[]): Promise<void> {
    // En un sistema real, esto sería una transacción
    for (const account of accounts) {
      this.accounts.set(account.getId(), account);
    }
  }

  async findAll(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  // Método auxiliar para tests
  clear(): void {
    this.accounts.clear();
  }

  // Método auxiliar para tests
  size(): number {
    return this.accounts.size;
  }
}
