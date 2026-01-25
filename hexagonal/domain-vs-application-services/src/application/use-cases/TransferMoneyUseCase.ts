/**
 * TransferMoneyUseCase - APPLICATION SERVICE
 *
 * ✅ ESTO ES UN APPLICATION SERVICE porque:
 * 1. ORQUESTA la operación completa
 * 2. Coordina múltiples componentes (repos, servicios, eventos)
 * 3. Maneja I/O (base de datos, APIs externas)
 * 4. Maneja transacciones
 * 5. Convierte entre DTOs y entidades de dominio
 *
 * IMPORTANTE:
 * NO contiene lógica de negocio.
 * Delega la lógica al Domain Service (MoneyTransferService).
 *
 * RESPONSABILIDADES:
 * 1. Obtener cuentas del repositorio
 * 2. Llamar al Domain Service para ejecutar la lógica
 * 3. Guardar las cuentas modificadas
 * 4. Publicar eventos
 * 5. Enviar notificaciones
 * 6. Manejar transacciones
 * 7. Convertir a DTOs para la respuesta
 */

import { AccountRepository } from '../../domain/repositories/AccountRepository.js';
import { MoneyTransferService } from '../../domain/services/MoneyTransferService.js';
import { Money } from '../../domain/value-objects/Money.js';
import { TransferMoneyCommand, TransferResult } from '../dtos/TransferMoneyDTO.js';
import { v4 as uuid } from 'uuid';

/**
 * Puerto para notificaciones (opcional)
 */
export interface NotificationService {
  sendTransferNotification(
    fromName: string,
    toName: string,
    amount: string
  ): Promise<void>;
}

/**
 * Puerto para eventos (opcional)
 */
export interface EventPublisher {
  publish(eventName: string, data: any): Promise<void>;
}

export class TransferMoneyUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transferService: MoneyTransferService,
    private readonly notificationService?: NotificationService,
    private readonly eventPublisher?: EventPublisher
  ) {}

  async execute(command: TransferMoneyCommand): Promise<TransferResult> {
    // ========================================
    // 1. ORQUESTACIÓN: Obtener cuentas
    // ========================================

    const fromAccount = await this.accountRepository.findById(command.fromAccountId);
    if (!fromAccount) {
      throw new Error(`Source account not found: ${command.fromAccountId}`);
    }

    const toAccount = await this.accountRepository.findById(command.toAccountId);
    if (!toAccount) {
      throw new Error(`Destination account not found: ${command.toAccountId}`);
    }

    // ========================================
    // 2. DELEGACIÓN: Llamar al Domain Service
    //    (Aquí está la lógica de negocio)
    // ========================================

    const amount = Money.create(command.amount, command.currency || 'EUR');

    // El Domain Service ejecuta TODA la lógica de negocio
    // Validaciones, verificaciones, ejecución de la transferencia
    this.transferService.transfer(fromAccount, toAccount, amount);

    // ========================================
    // 3. ORQUESTACIÓN: Guardar cambios (I/O)
    // ========================================

    // En un sistema real, esto sería una transacción
    await this.accountRepository.saveMany([fromAccount, toAccount]);

    // ========================================
    // 4. ORQUESTACIÓN: Publicar eventos (I/O)
    // ========================================

    const transactionId = uuid();

    if (this.eventPublisher) {
      await this.eventPublisher.publish('MoneyTransferred', {
        transactionId,
        fromAccountId: fromAccount.getId(),
        toAccountId: toAccount.getId(),
        amount: amount.getAmount(),
        currency: amount.getCurrency(),
        timestamp: new Date().toISOString(),
      });
    }

    // ========================================
    // 5. ORQUESTACIÓN: Enviar notificaciones (I/O)
    // ========================================

    if (this.notificationService) {
      await this.notificationService.sendTransferNotification(
        fromAccount.getHolderName(),
        toAccount.getHolderName(),
        amount.toString()
      );
    }

    // ========================================
    // 6. CONVERSIÓN: Retornar DTO
    // ========================================

    return {
      success: true,
      message: 'Transfer completed successfully',
      transactionId,
      fromAccountBalance: fromAccount.getBalance().getAmount(),
      toAccountBalance: toAccount.getBalance().getAmount(),
    };
  }
}

/**
 * REFLEXIÓN, mi niño:
 *
 * ¿Ves la diferencia con el BEFORE?
 *
 * ANTES:
 * - Todo mezclado en un solo lugar
 * - Lógica de negocio + I/O juntos
 * - Imposible testear sin mocks
 *
 * DESPUÉS:
 * - Application Service ORQUESTA
 * - Domain Service contiene la LÓGICA DE NEGOCIO
 * - Puedes testear la lógica sin mocks
 * - Puedes testear la orquestación con mocks
 *
 * TESTING:
 * - MoneyTransferService se testea SIN mocks (lógica pura)
 * - TransferMoneyUseCase se testea CON mocks (tiene I/O)
 *
 * Eso está fetén.
 */
