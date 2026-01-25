/**
 * Tests de TransferMoneyUseCase - APPLICATION SERVICE
 *
 * 🎯 FÍJATE EN ESTO:
 *
 * ✅ SÍ hay mocks (para repositorios, eventos, notificaciones)
 * ✅ Testeamos la ORQUESTACIÓN, no la lógica de negocio
 * ✅ La lógica ya está testeada en MoneyTransferService
 *
 * Esto es correcto porque el Application Service coordina I/O.
 * Los mocks están aquí para verificar que la orquestación funciona.
 *
 * La lógica de negocio NO se testea aquí, se testea en el Domain Service.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransferMoneyUseCase } from '../../src/application/use-cases/TransferMoneyUseCase.js';
import { MoneyTransferService } from '../../src/domain/services/MoneyTransferService.js';
import { Account } from '../../src/domain/entities/Account.js';
import { Money } from '../../src/domain/value-objects/Money.js';
import { AccountRepository } from '../../src/domain/repositories/AccountRepository.js';
import { NotificationService, EventPublisher } from '../../src/application/use-cases/TransferMoneyUseCase.js';

describe('TransferMoneyUseCase - Application Service (CON MOCKS)', () => {
  let transferUseCase: TransferMoneyUseCase;
  let mockAccountRepo: AccountRepository;
  let mockNotificationService: NotificationService;
  let mockEventPublisher: EventPublisher;
  let transferService: MoneyTransferService;

  beforeEach(() => {
    // ========================================
    // Crear mocks para las dependencias de I/O
    // ========================================

    mockAccountRepo = {
      findById: vi.fn(),
      save: vi.fn(),
      saveMany: vi.fn(),
      findAll: vi.fn(),
    };

    mockNotificationService = {
      sendTransferNotification: vi.fn(),
    };

    mockEventPublisher = {
      publish: vi.fn(),
    };

    // El Domain Service NO se mockea (es lógica pura)
    transferService = new MoneyTransferService();

    transferUseCase = new TransferMoneyUseCase(
      mockAccountRepo,
      transferService,
      mockNotificationService,
      mockEventPublisher
    );
  });

  it('should orchestrate a complete transfer successfully', async () => {
    // Arrange
    const fromAccount = Account.create(
      'account-1',
      'Juan',
      Money.create(1000, 'EUR')
    );

    const toAccount = Account.create(
      'account-2',
      'María',
      Money.create(500, 'EUR')
    );

    // Mockear el repositorio
    vi.mocked(mockAccountRepo.findById)
      .mockResolvedValueOnce(fromAccount)
      .mockResolvedValueOnce(toAccount);

    vi.mocked(mockAccountRepo.saveMany).mockResolvedValue();

    // Act
    const result = await transferUseCase.execute({
      fromAccountId: 'account-1',
      toAccountId: 'account-2',
      amount: 300,
      currency: 'EUR',
    });

    // Assert - Verificar resultado
    expect(result.success).toBe(true);
    expect(result.fromAccountBalance).toBe(700);
    expect(result.toAccountBalance).toBe(800);

    // ========================================
    // Verificar la ORQUESTACIÓN
    // ========================================

    // 1. Se obtuvieron las cuentas correctas
    expect(mockAccountRepo.findById).toHaveBeenCalledWith('account-1');
    expect(mockAccountRepo.findById).toHaveBeenCalledWith('account-2');

    // 2. Se guardaron las cuentas modificadas
    expect(mockAccountRepo.saveMany).toHaveBeenCalledWith([fromAccount, toAccount]);

    // 3. Se publicó el evento
    expect(mockEventPublisher.publish).toHaveBeenCalledWith(
      'MoneyTransferred',
      expect.objectContaining({
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: 300,
        currency: 'EUR',
      })
    );

    // 4. Se envió la notificación
    expect(mockNotificationService.sendTransferNotification).toHaveBeenCalledWith(
      'Juan',
      'María',
      '300.00 EUR'
    );
  });

  it('should throw error when source account not found', async () => {
    // Arrange
    vi.mocked(mockAccountRepo.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(
      transferUseCase.execute({
        fromAccountId: 'non-existent',
        toAccountId: 'account-2',
        amount: 100,
      })
    ).rejects.toThrow('Source account not found');

    // No debería llamar a save ni notificar
    expect(mockAccountRepo.saveMany).not.toHaveBeenCalled();
    expect(mockNotificationService.sendTransferNotification).not.toHaveBeenCalled();
  });

  it('should throw error when destination account not found', async () => {
    // Arrange
    const fromAccount = Account.create(
      'account-1',
      'Juan',
      Money.create(1000, 'EUR')
    );

    vi.mocked(mockAccountRepo.findById)
      .mockResolvedValueOnce(fromAccount)
      .mockResolvedValueOnce(null); // Cuenta destino no existe

    // Act & Assert
    await expect(
      transferUseCase.execute({
        fromAccountId: 'account-1',
        toAccountId: 'non-existent',
        amount: 100,
      })
    ).rejects.toThrow('Destination account not found');

    // No debería guardar ni notificar
    expect(mockAccountRepo.saveMany).not.toHaveBeenCalled();
    expect(mockNotificationService.sendTransferNotification).not.toHaveBeenCalled();
  });

  it('should propagate domain errors from transfer service', async () => {
    // Arrange
    const fromAccount = Account.create(
      'account-1',
      'Juan',
      Money.create(100, 'EUR') // Fondos insuficientes
    );

    const toAccount = Account.create(
      'account-2',
      'María',
      Money.create(500, 'EUR')
    );

    vi.mocked(mockAccountRepo.findById)
      .mockResolvedValueOnce(fromAccount)
      .mockResolvedValueOnce(toAccount);

    // Act & Assert - El Domain Service lanzará el error
    await expect(
      transferUseCase.execute({
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: 300, // Más de lo que tiene
      })
    ).rejects.toThrow(/Insufficient funds/);

    // No debería guardar ni notificar cuando falla la lógica de negocio
    expect(mockAccountRepo.saveMany).not.toHaveBeenCalled();
    expect(mockNotificationService.sendTransferNotification).not.toHaveBeenCalled();
  });
});

/**
 * REFLEXIÓN:
 *
 * ¿Ves la diferencia?
 *
 * AQUÍ sí usamos mocks, pero SOLO para las dependencias de I/O:
 * - Repositorio (base de datos)
 * - Notificaciones (API externa)
 * - Eventos (message broker)
 *
 * La lógica de negocio (MoneyTransferService) NO se mockea.
 * Ya está testeada en sus propios tests.
 *
 * Aquí testeamos que la ORQUESTACIÓN funciona:
 * 1. Obtenemos cuentas
 * 2. Llamamos al domain service
 * 3. Guardamos cambios
 * 4. Publicamos eventos
 * 5. Enviamos notificaciones
 *
 * Eso está fetén.
 */
