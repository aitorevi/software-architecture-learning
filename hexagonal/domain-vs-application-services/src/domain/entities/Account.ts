/**
 * Account - Entidad de Dominio
 *
 * Representa una cuenta bancaria.
 * Encapsula el estado y las reglas de negocio relacionadas con UNA cuenta.
 *
 * IMPORTANTE:
 * Las operaciones que involucran MÚLTIPLES cuentas (como transferencias)
 * NO van aquí. Van en un Domain Service.
 */

import { Money } from '../value-objects/Money.js';

export class Account {
  private constructor(
    private readonly id: string,
    private readonly holderName: string,
    private balance: Money
  ) {}

  static create(id: string, holderName: string, initialBalance: Money): Account {
    if (!id || id.trim() === '') {
      throw new Error('Account ID cannot be empty');
    }

    if (!holderName || holderName.trim() === '') {
      throw new Error('Account holder name cannot be empty');
    }

    return new Account(id, holderName, initialBalance);
  }

  /**
   * Reconstruir desde persistencia
   */
  static fromPersistence(id: string, holderName: string, balance: Money): Account {
    return new Account(id, holderName, balance);
  }

  // ========================================
  // Getters
  // ========================================

  getId(): string {
    return this.id;
  }

  getHolderName(): string {
    return this.holderName;
  }

  getBalance(): Money {
    return this.balance;
  }

  // ========================================
  // Operaciones de UNA cuenta
  // ========================================

  /**
   * Deposita dinero en la cuenta
   */
  deposit(amount: Money): void {
    this.balance = this.balance.add(amount);
  }

  /**
   * Retira dinero de la cuenta
   * Lanza error si no hay fondos suficientes
   */
  withdraw(amount: Money): void {
    if (!this.hasSufficientFunds(amount)) {
      throw new Error(
        `Insufficient funds. Balance: ${this.balance.toString()}, Required: ${amount.toString()}`
      );
    }

    this.balance = this.balance.subtract(amount);
  }

  /**
   * Verifica si hay fondos suficientes para una cantidad
   */
  hasSufficientFunds(amount: Money): boolean {
    return this.balance.isSufficientFor(amount);
  }

  // ========================================
  // IMPORTANTE: Las transferencias NO van aquí
  // ========================================

  /**
   * ❌ NO HAGAS ESTO:
   *
   * transferTo(other: Account, amount: Money): void {
   *   this.withdraw(amount);
   *   other.deposit(amount);
   * }
   *
   * ¿Por qué NO?
   * Una transferencia es una operación entre DOS cuentas.
   * Involucra coordinación y reglas de negocio que trascienden
   * una sola entidad.
   *
   * ✅ SOLUCIÓN: MoneyTransferService (Domain Service)
   */
}
