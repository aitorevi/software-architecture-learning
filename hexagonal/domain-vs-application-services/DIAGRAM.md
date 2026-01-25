# Diagramas - Domain vs Application Services

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                   HTTP REQUEST                                  │
│                        ↓                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          INFRASTRUCTURE LAYER                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  TransferController                                │  │  │
│  │  │  - Recibe request                                  │  │  │
│  │  │  - Valida input                                    │  │  │
│  │  │  - Llama Application Service                       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        ↓                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          APPLICATION LAYER                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  TransferMoneyUseCase                              │  │  │
│  │  │  (APPLICATION SERVICE)                             │  │  │
│  │  │                                                     │  │  │
│  │  │  1. Obtener cuentas del repo        (I/O)         │  │  │
│  │  │  2. ┌─────────────────────────────────────┐       │  │  │
│  │  │     │  MoneyTransferService          │       │  │  │
│  │  │     │  (DOMAIN SERVICE)              │       │  │  │
│  │  │     │                                │       │  │  │
│  │  │     │  - Validar reglas de negocio  │       │  │  │
│  │  │     │  - Ejecutar transferencia     │       │  │  │
│  │  │     │  - LÓGICA PURA (sin I/O)      │       │  │  │
│  │  │     └─────────────────────────────────────┘       │  │  │
│  │  │  3. Guardar cuentas en repo          (I/O)         │  │  │
│  │  │  4. Publicar eventos                 (I/O)         │  │  │
│  │  │  5. Enviar notificaciones            (I/O)         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        ↓                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          DOMAIN LAYER                                    │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Entities: Account                                 │  │  │
│  │  │  Value Objects: Money                              │  │  │
│  │  │  Domain Services: MoneyTransferService             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de una Transferencia

```
Cliente                Controller             Application Service      Domain Service        Repository
   │                       │                         │                       │                    │
   │  POST /transfers      │                         │                       │                    │
   │──────────────────────>│                         │                       │                    │
   │                       │                         │                       │                    │
   │                       │  execute(command)       │                       │                    │
   │                       │────────────────────────>│                       │                    │
   │                       │                         │                       │                    │
   │                       │                         │  findById(fromId)     │                    │
   │                       │                         │───────────────────────────────────────────>│
   │                       │                         │                       │                    │
   │                       │                         │  Account from         │                    │
   │                       │                         │<───────────────────────────────────────────│
   │                       │                         │                       │                    │
   │                       │                         │  findById(toId)       │                    │
   │                       │                         │───────────────────────────────────────────>│
   │                       │                         │                       │                    │
   │                       │                         │  Account to           │                    │
   │                       │                         │<───────────────────────────────────────────│
   │                       │                         │                       │                    │
   │                       │                         │  transfer(from, to, amount)                │
   │                       │                         │──────────────────────>│                    │
   │                       │                         │                       │                    │
   │                       │                         │                       │ Validar reglas     │
   │                       │                         │                       │ Ejecutar lógica    │
   │                       │                         │                       │ (sin I/O)          │
   │                       │                         │                       │                    │
   │                       │                         │  void (success)       │                    │
   │                       │                         │<──────────────────────│                    │
   │                       │                         │                       │                    │
   │                       │                         │  saveMany([from, to]) │                    │
   │                       │                         │───────────────────────────────────────────>│
   │                       │                         │                       │                    │
   │                       │                         │  publish(event)       │                    │
   │                       │                         │──────────────────────>│                    │
   │                       │                         │                       │                    │
   │                       │  TransferResult         │                       │                    │
   │                       │<────────────────────────│                       │                    │
   │                       │                         │                       │                    │
   │  200 OK + result      │                         │                       │                    │
   │<──────────────────────│                         │                       │                    │
```

## Comparación ANTES vs DESPUÉS

### ANTES - Todo Mezclado

```
┌──────────────────────────────────────────────────────┐
│  TransferMoneyUseCase                                │
│  ┌────────────────────────────────────────────────┐  │
│  │  execute(fromId, toId, amount)                 │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ from = await repo.findById(fromId)   I/O │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ to = await repo.findById(toId)       I/O │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ if (from.balance < amount) ...    LÓGICA │  │  │
│  │  │ if (fromId === toId) ...          LÓGICA │  │  │
│  │  │ from.balance -= amount            LÓGICA │  │  │
│  │  │ to.balance += amount              LÓGICA │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ await repo.save(from)                I/O │  │  │
│  │  │ await repo.save(to)                  I/O │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                 │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ await notify(...)                    I/O │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ❌ TODO MEZCLADO                                     │
│  ❌ No se puede testear lógica sin mocks              │
│  ❌ No se puede reutilizar lógica                     │
└──────────────────────────────────────────────────────┘
```

### DESPUÉS - Separado

```
┌─────────────────────────────────────────────────────────────────────┐
│  TransferMoneyUseCase (APPLICATION SERVICE)                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  execute(command)                                             │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │ from = await repo.findById(...)                      I/O │ │  │
│  │  │ to = await repo.findById(...)                        I/O │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │ transferService.transfer(from, to, amount)     DELEGACIÓN │ │  │
│  │  │         │                                                 │ │  │
│  │  │         └──> MoneyTransferService (DOMAIN SERVICE)        │ │  │
│  │  │              ┌─────────────────────────────────────────┐  │ │  │
│  │  │              │ Validar reglas         LÓGICA PURA     │  │ │  │
│  │  │              │ Ejecutar transferencia LÓGICA PURA     │  │ │  │
│  │  │              │ SIN I/O                                │  │ │  │
│  │  │              └─────────────────────────────────────────┘  │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │ await repo.saveMany([from, to])                      I/O │ │  │
│  │  │ await eventPublisher.publish(...)                    I/O │ │  │
│  │  │ await notificationService.send(...)                  I/O │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ✅ SEPARADO Y CLARO                                                 │
│  ✅ Lógica testeable sin mocks (Domain Service)                     │
│  ✅ Orquestación testeable con mocks (Application Service)          │
│  ✅ Lógica reutilizable                                             │
└─────────────────────────────────────────────────────────────────────┘
```

## Testing - Diferencia Visual

### Domain Service (Sin Mocks)

```
┌─────────────────────────────────────────────────────────┐
│  Test: MoneyTransferService                             │
│                                                          │
│  it('should transfer money', () => {                    │
│                                                          │
│    ┌─────────────────────────────────────────────────┐  │
│    │ Arrange                                         │  │
│    │ ━━━━━━━                                         │  │
│    │ const from = Account.create(...)  ← En memoria  │  │
│    │ const to = Account.create(...)    ← En memoria  │  │
│    │ const amount = Money.create(...)  ← En memoria  │  │
│    │                                                  │  │
│    │ ❌ NO HAY MOCKS                                  │  │
│    └─────────────────────────────────────────────────┘  │
│                                                          │
│    ┌─────────────────────────────────────────────────┐  │
│    │ Act                                             │  │
│    │ ━━━                                             │  │
│    │ service.transfer(from, to, amount)              │  │
│    │         ↓                                       │  │
│    │   Lógica pura ejecutándose                      │  │
│    │   (milisegundos)                                │  │
│    └─────────────────────────────────────────────────┘  │
│                                                          │
│    ┌─────────────────────────────────────────────────┐  │
│    │ Assert                                          │  │
│    │ ━━━━━━                                          │  │
│    │ expect(from.balance).toBe(700)                  │  │
│    │ expect(to.balance).toBe(800)                    │  │
│    │                                                  │  │
│    │ ✅ Verificamos estado en memoria                 │  │
│    └─────────────────────────────────────────────────┘  │
│                                                          │
│  });                                                     │
│                                                          │
│  ✅ Rápido                                               │
│  ✅ Confiable                                            │
│  ✅ Sin dependencias                                     │
└─────────────────────────────────────────────────────────┘
```

### Application Service (Con Mocks)

```
┌─────────────────────────────────────────────────────────┐
│  Test: TransferMoneyUseCase                             │
│                                                          │
│  it('should orchestrate transfer', async () => {        │
│                                                          │
│    ┌─────────────────────────────────────────────────┐  │
│    │ Arrange                                         │  │
│    │ ━━━━━━━                                         │  │
│    │ const mockRepo = mock<AccountRepository>()      │  │
│    │ const mockEvents = mock<EventPublisher>()       │  │
│    │ const mockNotif = mock<NotificationService>()   │  │
│    │                                                  │  │
│    │ mockRepo.findById.mockResolvedValue(account)    │  │
│    │                                                  │  │
│    │ ✅ MOCKS para I/O                                │  │
│    │ ❌ NO MOCK para Domain Service                   │  │
│    └─────────────────────────────────────────────────┘  │
│                                                          │
│    ┌─────────────────────────────────────────────────┐  │
│    │ Act                                             │  │
│    │ ━━━                                             │  │
│    │ await useCase.execute(command)                  │  │
│    │         ↓                                       │  │
│    │   Orquestación ejecutándose                     │  │
│    │   (llamadas a mocks)                            │  │
│    └─────────────────────────────────────────────────┘  │
│                                                          │
│    ┌─────────────────────────────────────────────────┐  │
│    │ Assert                                          │  │
│    │ ━━━━━━                                          │  │
│    │ expect(mockRepo.findById).toHaveBeenCalled()    │  │
│    │ expect(mockRepo.saveMany).toHaveBeenCalled()    │  │
│    │ expect(mockEvents.publish).toHaveBeenCalled()   │  │
│    │                                                  │  │
│    │ ✅ Verificamos ORQUESTACIÓN                      │  │
│    │ ❌ NO verificamos lógica de negocio              │  │
│    └─────────────────────────────────────────────────┘  │
│                                                          │
│  });                                                     │
│                                                          │
│  ✅ Verifica coordinación                               │
│  ✅ Usa mocks correctamente                             │
│  ✅ Lógica ya testeada en Domain Service                │
└─────────────────────────────────────────────────────────┘
```

---

**La clave visual:** Mira dónde están los mocks y dónde no.
