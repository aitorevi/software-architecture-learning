# Resumen Ejecutivo - Domain vs Application Services

## La Diferencia en 30 Segundos

```typescript
// Domain Service = Lógica pura (sin I/O)
class MoneyTransferService {
  transfer(from: Account, to: Account, amount: Money): void {
    // Solo validaciones y transformaciones
    from.withdraw(amount);
    to.deposit(amount);
  }
}

// Application Service = Orquestación (con I/O)
class TransferMoneyUseCase {
  async execute(command: TransferMoneyCommand): Promise<TransferResult> {
    const from = await this.repo.findById(command.fromId);  // I/O
    const to = await this.repo.findById(command.toId);      // I/O

    this.transferService.transfer(from, to, amount);        // Delega

    await this.repo.saveMany([from, to]);                   // I/O
    await this.events.publish('MoneyTransferred', ...);     // I/O
  }
}
```

## Regla Mnemotécnica

```
I/O? → Application Service
Lógica pura? → Domain Service
```

## Testing - La Prueba Definitiva

### Domain Service: SIN MOCKS ✅

```typescript
it('should transfer money', () => {
  const from = Account.create('1', 'Juan', Money.create(1000));
  const to = Account.create('2', 'María', Money.create(500));

  transferService.transfer(from, to, Money.create(300));

  expect(from.getBalance().getAmount()).toBe(700);
  expect(to.getBalance().getAmount()).toBe(800);
});
```

**Características:**
- Cero dependencias externas
- Cero mocks
- Test rápido (milisegundos)
- Alta confiabilidad

### Application Service: CON MOCKS ✅

```typescript
it('should orchestrate transfer', async () => {
  mockRepo.findById.mockResolvedValue(account);

  await useCase.execute({ fromId: '1', toId: '2', amount: 300 });

  expect(mockRepo.findById).toHaveBeenCalledWith('1');
  expect(mockRepo.saveMany).toHaveBeenCalled();
  expect(mockEvents.publish).toHaveBeenCalled();
});
```

**Características:**
- Mocks para I/O (repos, eventos, APIs)
- NO mock para Domain Service
- Verifica orquestación, no lógica

## Estructura de Carpetas

```
src/
├── domain/services/
│   └── MoneyTransferService.ts    ← Domain Service (lógica pura)
└── application/use-cases/
    └── TransferMoneyUseCase.ts     ← Application Service (orquestación)
```

## Comparación Rápida

| Característica | Domain Service | Application Service |
|---------------|---------------|-------------------|
| **I/O** | ❌ Nunca | ✅ Siempre |
| **Async** | ❌ No (síncrono) | ✅ Sí (async/await) |
| **Mocks en tests** | ❌ No | ✅ Sí |
| **Dependencias** | Solo dominio | Repos, APIs, eventos |
| **Reutilización** | Alta | Media-Baja |
| **Velocidad tests** | Muy rápido | Más lento |

## Cuándo Usar Cada Uno

### Domain Service ✅

- Lógica entre múltiples entidades
- Reglas de negocio complejas
- Necesitas reutilizar la lógica
- Quieres testear sin infraestructura

### Application Service ✅

- Orquestación de operaciones
- Conversión DTOs ↔ Dominio
- Manejo de transacciones
- Coordinación de I/O

## Errores Comunes

### ❌ Error 1: I/O en Domain Service

```typescript
// ❌ MAL
class MoneyTransferService {
  async transfer(fromId: string, toId: string, amount: number) {
    const from = await this.repo.findById(fromId); // ❌ I/O
    // ...
  }
}
```

### ❌ Error 2: Lógica en Application Service

```typescript
// ❌ MAL
class TransferMoneyUseCase {
  async execute(command) {
    const from = await this.repo.findById(command.fromId);

    if (from.balance < command.amount) { // ❌ Lógica de negocio
      throw new Error('Insufficient funds');
    }
  }
}
```

### ✅ Correcto: Separación Clara

```typescript
// ✅ BIEN
class MoneyTransferService {
  transfer(from: Account, to: Account, amount: Money) {
    // Solo lógica pura
  }
}

class TransferMoneyUseCase {
  async execute(command) {
    const from = await this.repo.findById(command.fromId);
    this.transferService.transfer(from, to, amount); // Delega
    await this.repo.save(from);
  }
}
```

## Archivos del Proyecto

### Documentación
- `WELCOME.txt` - Bienvenida rápida
- `README_ES.md` - Tutorial completo (45 min)
- `QUICKSTART.md` - Inicio rápido (5 min)
- `PRESENTATION.md` - Guía para presentar
- `DIAGRAM.md` - Diagramas visuales
- `SUMMARY.md` - Este archivo

### Código
- `src/before/` - Problema (todo mezclado)
- `src/domain/services/` - Domain Service
- `src/application/use-cases/` - Application Service
- `tests/domain/` - Tests sin mocks
- `tests/application/` - Tests con mocks

### Scripts
- `npm test` - Ejecutar todos los tests
- `npm run dev` - Arrancar servidor
- `./examples.sh` - Demo con ejemplos

## Ejecutar el Proyecto

```bash
# 1. Instalar
npm install

# 2. Ver los tests (la clave para entender)
npm test

# 3. Arrancar servidor
npm run dev

# 4. Ejecutar ejemplos
./examples.sh
```

## La Regla de Oro (Repite esto)

> **"Si necesitas mocks para testear lógica de negocio,
> tu Domain Service tiene dependencias que no le corresponden."**

---

**Profe Millo**
_Testing is the truth. Mocks don't lie._
