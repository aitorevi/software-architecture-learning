# Quick Start - Domain vs Application Services ⚡

> 5 minutos para entender la diferencia crucial

## TL;DR - La Idea Central

```typescript
// ❌ ANTES: Todo mezclado
class TransferMoneyUseCase {
  async execute(fromId, toId, amount) {
    const from = await repo.findById(fromId);  // I/O
    const to = await repo.findById(toId);      // I/O

    // Lógica de negocio mezclada aquí
    if (from.balance < amount) throw Error();
    from.balance -= amount;
    to.balance += amount;

    await repo.save(from);  // I/O
    await repo.save(to);    // I/O
  }
}

// ✅ DESPUÉS: Separado
class MoneyTransferService {  // DOMAIN SERVICE
  transfer(from, to, amount) {
    // Solo lógica de negocio pura
    // Sin I/O, sin repos, sin APIs
    from.withdraw(amount);
    to.deposit(amount);
  }
}

class TransferMoneyUseCase {  // APPLICATION SERVICE
  async execute(fromId, toId, amount) {
    const from = await repo.findById(fromId);
    const to = await repo.findById(toId);

    this.transferService.transfer(from, to, amount);  // Delega

    await repo.save(from);
    await repo.save(to);
  }
}
```

## La Regla de Oro

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ¿Tiene I/O? (repos, APIs, eventos)                        │
│       ↓ SÍ                                                  │
│  APPLICATION SERVICE (orquestación)                         │
│       ↓ NO                                                  │
│  DOMAIN SERVICE (lógica pura)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Prueba Rápida (3 min)

```bash
# 1. Instalar
npm install

# 2. Ejecutar tests
npm test

# 3. Ver la diferencia
# - tests/domain/MoneyTransferService.test.ts (SIN mocks)
# - tests/application/TransferMoneyUseCase.test.ts (CON mocks)

# 4. Arrancar servidor
npm run dev

# 5. Probar una transferencia
curl -X POST http://localhost:3000/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "account-1",
    "toAccountId": "account-2",
    "amount": 100
  }'
```

## Comparación Visual

| Aspecto | Domain Service | Application Service |
|---------|---------------|-------------------|
| **Responsabilidad** | Lógica de negocio pura | Orquestación |
| **Dependencias** | Solo entidades/VOs | Repos, APIs, eventos |
| **I/O** | ❌ Nunca | ✅ Siempre |
| **Testing** | Sin mocks | Con mocks |
| **Ubicación** | `domain/services/` | `application/use-cases/` |
| **Ejemplo** | Validar transferencia | Obtener cuentas, guardar |

## La Clave para Testearlo

```typescript
// Domain Service - Test sin mocks
it('should transfer money', () => {
  const from = Account.create('1', 'Juan', Money.create(1000));
  const to = Account.create('2', 'María', Money.create(500));

  transferService.transfer(from, to, Money.create(300));

  expect(from.getBalance().getAmount()).toBe(700);
  expect(to.getBalance().getAmount()).toBe(800);
});

// Application Service - Test con mocks
it('should orchestrate transfer', async () => {
  mockRepo.findById.mockResolvedValue(account);

  await useCase.execute({ fromId: '1', toId: '2', amount: 300 });

  expect(mockRepo.saveMany).toHaveBeenCalled();
  expect(mockEvents.publish).toHaveBeenCalled();
});
```

## Archivos Clave

```
src/
├── before/
│   └── TransferMoneyUseCase.ts          ❌ El problema
├── domain/
│   └── services/
│       └── MoneyTransferService.ts      ✅ Domain Service
└── application/
    └── use-cases/
        └── TransferMoneyUseCase.ts      ✅ Application Service
```

## Siguiente Paso

Lee `README_ES.md` para entender el **por qué** en profundidad.

---

**La diferencia:**
- Domain Service = Chef cocinando (lógica pura)
- Application Service = Camarero orquestando (I/O)

-- Profe Millo
