# Domain Services vs Application Services 💰

> The crucial distinction that separates amateur from professional code

This project demonstrates the critical difference between **Domain Services** (pure business logic) and **Application Services** (orchestration with I/O), and why this separation improves testing, reusability, and maintainability.

[🇪🇸 Versión en Español](./README_ES.md)

---

## What You'll Learn

1. The difference between Domain Service and Application Service
2. Why separate business logic from orchestration
3. How to test each correctly (with and without mocks)
4. When to use each type of service
5. Common mistakes and how to avoid them

---

## The Core Idea

```typescript
// ❌ BEFORE: Everything mixed
class TransferMoneyUseCase {
  async execute(fromId, toId, amount) {
    const from = await repo.findById(fromId);  // I/O
    const to = await repo.findById(toId);      // I/O

    // Business logic mixed here
    if (from.balance < amount) throw Error();
    from.balance -= amount;
    to.balance += amount;

    await repo.save(from);  // I/O
    await repo.save(to);    // I/O
  }
}

// ✅ AFTER: Separated
class MoneyTransferService {  // DOMAIN SERVICE
  transfer(from, to, amount) {
    // Pure business logic
    // No I/O, no repos, no APIs
    from.withdraw(amount);
    to.deposit(amount);
  }
}

class TransferMoneyUseCase {  // APPLICATION SERVICE
  async execute(fromId, toId, amount) {
    const from = await repo.findById(fromId);
    const to = await repo.findById(toId);

    this.transferService.transfer(from, to, amount);  // Delegates

    await repo.save(from);
    await repo.save(to);
  }
}
```

---

## The Golden Rule

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Has I/O? (repos, APIs, events)                            │
│       ↓ YES                                                 │
│  APPLICATION SERVICE (orchestration)                        │
│       ↓ NO                                                  │
│  DOMAIN SERVICE (pure logic)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Run tests
npm test

# 3. See the difference
# - tests/domain/MoneyTransferService.test.ts (NO mocks)
# - tests/application/TransferMoneyUseCase.test.ts (WITH mocks)

# 4. Start server
npm run dev

# 5. Try a transfer
curl -X POST http://localhost:3000/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "account-1",
    "toAccountId": "account-2",
    "amount": 100
  }'
```

---

## Testing - The Key Difference

### Domain Service (NO MOCKS)

```typescript
describe('MoneyTransferService', () => {
  it('should transfer money', () => {
    const from = Account.create('1', 'Juan', Money.create(1000));
    const to = Account.create('2', 'María', Money.create(500));

    transferService.transfer(from, to, Money.create(300));

    expect(from.getBalance().getAmount()).toBe(700);
    expect(to.getBalance().getAmount()).toBe(800);
  });
});
```

### Application Service (WITH MOCKS)

```typescript
describe('TransferMoneyUseCase', () => {
  it('should orchestrate transfer', async () => {
    mockRepo.findById.mockResolvedValue(account);

    await useCase.execute({ fromId: '1', toId: '2', amount: 300 });

    expect(mockRepo.saveMany).toHaveBeenCalled();
    expect(mockEvents.publish).toHaveBeenCalled();
  });
});
```

---

## Comparison

| Aspect | Domain Service | Application Service |
|--------|---------------|-------------------|
| **Purpose** | Pure business logic | Orchestration |
| **Dependencies** | Domain only | Repos, APIs, events |
| **I/O** | ❌ Never | ✅ Always |
| **Testing** | Without mocks | With mocks |
| **Location** | `domain/services/` | `application/use-cases/` |
| **Example** | Validate transfer | Get accounts, save |

---

## Documentation

- **QUICKSTART.md** - Quick overview (5 min)
- **README_ES.md** - Complete tutorial in Spanish (45 min)
- **PRESENTATION.md** - Guide for presenting to others

---

## Project Structure

```
src/
├── before/
│   └── TransferMoneyUseCase.ts          ❌ The problem
├── domain/
│   └── services/
│       └── MoneyTransferService.ts      ✅ Domain Service
└── application/
    └── use-cases/
        └── TransferMoneyUseCase.ts       ✅ Application Service

tests/
├── domain/
│   └── MoneyTransferService.test.ts     NO MOCKS
└── application/
    └── TransferMoneyUseCase.test.ts     WITH MOCKS
```

---

**By El Profe Millo**
_"If you need mocks to test business logic, review your design"_
