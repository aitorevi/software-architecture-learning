/**
 * ❌ ANTES - Todo Mezclado (El Desastre)
 *
 * Este es el código típico que encuentras en proyectos reales.
 * TODO está mezclado en un solo lugar:
 * - Lógica de negocio (verificar fondos, validar transferencia)
 * - Orquestación (obtener cuentas, guardar)
 * - I/O (repositorios, eventos)
 *
 * PROBLEMAS:
 * 1. No puedes testear la lógica de negocio sin mocks
 * 2. La lógica de negocio está acoplada a infraestructura
 * 3. No se puede reutilizar la lógica de transferencia
 * 4. Difícil de entender y mantener
 * 5. Viola el principio de Single Responsibility
 */

interface Account {
  id: string;
  holderName: string;
  balance: number;
}

interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  save(account: Account): Promise<void>;
}

interface NotificationService {
  sendTransferNotification(from: string, to: string, amount: number): Promise<void>;
}

export class TransferMoneyUseCase_BEFORE {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly notificationService: NotificationService
  ) {}

  async execute(fromId: string, toId: string, amount: number): Promise<void> {
    // ========================================
    // 🔴 PROBLEMA 1: Orquestación + Negocio mezclados
    // ========================================

    // Obtener cuentas (I/O - Orquestación)
    const fromAccount = await this.accountRepository.findById(fromId);
    if (!fromAccount) {
      throw new Error('Source account not found');
    }

    const toAccount = await this.accountRepository.findById(toId);
    if (!toAccount) {
      throw new Error('Destination account not found');
    }

    // ========================================
    // 🔴 PROBLEMA 2: Lógica de negocio enterrada aquí
    // Esta lógica debería estar en el dominio, no aquí
    // ========================================

    // Validar que no sea la misma cuenta
    if (fromId === toId) {
      throw new Error('Cannot transfer to the same account');
    }

    // Validar monto positivo
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Verificar fondos suficientes
    if (fromAccount.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Ejecutar transferencia (más lógica de negocio)
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // ========================================
    // 🔴 PROBLEMA 3: No puedes testear la lógica sin mocks
    // Para testear las validaciones necesitas mockear los repositorios
    // ========================================

    // Guardar cambios (I/O - Orquestación)
    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);

    // Notificar (I/O - Orquestación)
    await this.notificationService.sendTransferNotification(
      fromAccount.holderName,
      toAccount.holderName,
      amount
    );

    // ========================================
    // 🔴 PROBLEMA 4: No hay transacción explícita
    // Si falla la notificación, las cuentas ya están modificadas
    // ========================================
  }
}

/**
 * REFLEXIÓN, mi niño:
 *
 * ¿Ves el problema? La lógica de negocio (validar fondos, ejecutar transferencia)
 * está MEZCLADA con la orquestación (obtener cuentas, guardar, notificar).
 *
 * Resultado:
 * - No puedes testear las reglas de negocio sin mocks
 * - No puedes reutilizar la lógica de transferencia en otro contexto
 * - El código es difícil de leer y mantener
 * - Violas el principio de Single Responsibility
 *
 * LA SOLUCIÓN:
 * - Domain Service: Lógica de negocio pura (sin I/O)
 * - Application Service: Orquestación (con I/O)
 *
 * Lo veremos en el código "AFTER" (después).
 */
