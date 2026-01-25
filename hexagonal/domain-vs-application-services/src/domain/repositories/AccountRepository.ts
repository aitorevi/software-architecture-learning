/**
 * AccountRepository - Puerto (Interface)
 *
 * Define el contrato para acceder a cuentas.
 * Vive en el DOMINIO pero se implementa en INFRAESTRUCTURA.
 *
 * Esto es Inversión de Dependencias en acción.
 */

import { Account } from '../entities/Account.js';

export interface AccountRepository {
  /**
   * Encuentra una cuenta por su ID
   */
  findById(id: string): Promise<Account | null>;

  /**
   * Guarda una cuenta (create o update)
   */
  save(account: Account): Promise<void>;

  /**
   * Guarda múltiples cuentas en una transacción
   * (útil para transferencias)
   */
  saveMany(accounts: Account[]): Promise<void>;

  /**
   * Encuentra todas las cuentas (para tests y demos)
   */
  findAll(): Promise<Account[]>;
}
