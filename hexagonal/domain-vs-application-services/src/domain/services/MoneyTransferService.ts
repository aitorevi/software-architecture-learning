/**
 * MoneyTransferService - DOMAIN SERVICE
 *
 * ✅ ESTO ES UN DOMAIN SERVICE porque:
 * 1. Contiene lógica de negocio pura (sin I/O)
 * 2. Opera sobre múltiples entidades (dos cuentas)
 * 3. No tiene dependencias de infraestructura
 * 4. Es TESTEABLE sin mocks (solo necesitas entidades)
 *
 * REGLA DE ORO:
 * Si la lógica de negocio involucra múltiples entidades
 * y no pertenece naturalmente a ninguna de ellas,
 * va en un Domain Service.
 *
 * IMPORTANTE:
 * Este servicio NO sabe nada de:
 * - Repositorios
 * - APIs externas
 * - Eventos
 * - Transacciones
 * - Notificaciones
 *
 * Es LÓGICA DE NEGOCIO PURA.
 */

import { Account } from '../entities/Account.js';
import { Money } from '../value-objects/Money.js';

export class MoneyTransferService {
  /**
   * Ejecuta una transferencia entre dos cuentas.
   *
   * REGLAS DE NEGOCIO:
   * 1. No se puede transferir a la misma cuenta
   * 2. El monto debe ser positivo
   * 3. La cuenta origen debe tener fondos suficientes
   * 4. Las monedas deben coincidir
   *
   * IMPORTANTE:
   * Este método NO guarda las cuentas en la BD.
   * Solo ejecuta la lógica de negocio.
   * Es responsabilidad del Application Service guardar.
   */
  transfer(from: Account, to: Account, amount: Money): void {
    // Regla 1: No transferir a la misma cuenta
    if (from.getId() === to.getId()) {
      throw new Error('Cannot transfer money to the same account');
    }

    // Regla 2: Monto positivo (ya validado en Money, pero lo verificamos)
    if (amount.getAmount() <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    // Regla 3: Fondos suficientes
    if (!from.hasSufficientFunds(amount)) {
      throw new Error(
        `Insufficient funds in account ${from.getId()}. ` +
        `Balance: ${from.getBalance().toString()}, ` +
        `Required: ${amount.toString()}`
      );
    }

    // Regla 4: Las monedas deben coincidir
    // (esto lo valida Money.subtract y Money.add internamente)

    // ========================================
    // EJECUTAR TRANSFERENCIA (Lógica de negocio pura)
    // ========================================

    from.withdraw(amount);
    to.deposit(amount);

    // ========================================
    // IMPORTANTE: NO hace I/O
    // ========================================
    // ❌ NO hace: await repository.save(from)
    // ❌ NO hace: await eventBus.publish(...)
    // ❌ NO hace: await notificationService.send(...)
    //
    // Todo eso es responsabilidad del Application Service
  }

  /**
   * Valida si una transferencia es posible SIN ejecutarla.
   * Útil para verificaciones previas.
   */
  canTransfer(from: Account, to: Account, amount: Money): boolean {
    try {
      if (from.getId() === to.getId()) return false;
      if (amount.getAmount() <= 0) return false;
      if (!from.hasSufficientFunds(amount)) return false;
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * REFLEXIÓN, mi niño:
 *
 * ¿Ves la diferencia?
 *
 * Este servicio es PURO. No tiene I/O.
 * Puedes testearlo pasándole dos cuentas creadas en el test.
 * No necesitas mocks. No necesitas infraestructura.
 *
 * La lógica de negocio está AISLADA y es REUTILIZABLE.
 *
 * Si mañana quieres hacer transferencias desde un batch job,
 * desde una API REST, desde un evento, desde donde sea...
 * reutilizas este servicio SIN CAMBIOS.
 *
 * Eso es diseño limpio.
 */
