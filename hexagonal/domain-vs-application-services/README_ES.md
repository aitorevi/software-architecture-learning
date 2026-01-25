# Domain Services vs Application Services 💰

> La distinción que separa el código amateur del profesional

¡Buenas, mi niño! Este es uno de los conceptos que más confusión genera cuando empiezas con arquitectura limpia. La diferencia entre **Domain Service** y **Application Service** parece sutil, pero cuando la entiendes, tu código sube varios niveles.

---

## ¿Qué Vas a Aprender?

1. La diferencia entre Domain Service y Application Service
2. Por qué separar lógica de negocio de orquestación
3. Cómo testear cada uno correctamente (con y sin mocks)
4. Cuándo usar cada tipo de servicio
5. Errores comunes y cómo evitarlos

---

## El Problema - ¿Por Qué Esto Importa?

Imagínate que tienes un sistema bancario. Necesitas implementar transferencias de dinero entre cuentas.

### El Código Típico (Todo Mezclado) ❌

Este es el código que encuentras en el 90% de proyectos:

```typescript
class TransferMoneyUseCase {
  async execute(fromId: string, toId: string, amount: number) {
    // Obtener cuentas (I/O)
    const from = await this.accountRepo.findById(fromId);
    const to = await this.accountRepo.findById(toId);

    // Validar (lógica de negocio)
    if (from.balance < amount) {
      throw new Error('Insufficient funds');
    }

    if (fromId === toId) {
      throw new Error('Cannot transfer to same account');
    }

    // Ejecutar transferencia (lógica de negocio)
    from.balance -= amount;
    to.balance += amount;

    // Guardar (I/O)
    await this.accountRepo.save(from);
    await this.accountRepo.save(to);

    // Notificar (I/O)
    await this.notificationService.notify(...);
  }
}
```

**¿Ves el problema?**

Todo está mezclado:
- Lógica de negocio (validar fondos, ejecutar transferencia)
- Orquestación (obtener cuentas, guardar)
- I/O (repositorios, notificaciones)

**Consecuencias:**

1. **No puedes testear la lógica sin mocks** - Para testear las validaciones necesitas mockear el repositorio
2. **No puedes reutilizar la lógica** - Si quieres hacer transferencias desde otro contexto, tienes que copiar código
3. **Difícil de leer** - Mezcla niveles de abstracción
4. **Viola Single Responsibility** - Este método hace demasiadas cosas

---

## La Solución - Domain vs Application Services

Mira tú, la solución es separar las responsabilidades en dos tipos de servicios:

### 1. Domain Service (Lógica de Negocio Pura)

```typescript
class MoneyTransferService {  // DOMAIN SERVICE
  transfer(from: Account, to: Account, amount: Money): void {
    // SOLO lógica de negocio
    // Sin I/O, sin repos, sin APIs

    if (from.getId() === to.getId()) {
      throw new Error('Cannot transfer to same account');
    }

    if (!from.hasSufficientFunds(amount)) {
      throw new Error('Insufficient funds');
    }

    from.withdraw(amount);
    to.deposit(amount);

    // NO guarda, NO notifica, NO hace I/O
  }
}
```

**Características:**
- ✅ Lógica de negocio pura
- ✅ Sin dependencias de infraestructura
- ✅ Opera sobre entidades ya cargadas
- ✅ Se testea SIN mocks
- ✅ Reutilizable en cualquier contexto

### 2. Application Service (Orquestación)

```typescript
class TransferMoneyUseCase {  // APPLICATION SERVICE
  async execute(command: TransferMoneyCommand): Promise<TransferResult> {
    // 1. Obtener datos (I/O)
    const from = await this.accountRepo.findById(command.fromId);
    const to = await this.accountRepo.findById(command.toId);

    // 2. Delegar lógica de negocio al Domain Service
    this.transferService.transfer(from, to, amount);

    // 3. Guardar cambios (I/O)
    await this.accountRepo.saveMany([from, to]);

    // 4. Publicar eventos (I/O)
    await this.eventPublisher.publish('MoneyTransferred', ...);

    // 5. Enviar notificaciones (I/O)
    await this.notificationService.send(...);

    return result;
  }
}
```

**Características:**
- ✅ Orquesta la operación completa
- ✅ Coordina múltiples componentes
- ✅ Maneja I/O (repos, APIs, eventos)
- ✅ Maneja transacciones
- ✅ Se testea CON mocks (solo la orquestación)

---

## La Regla de Oro

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Si tiene I/O (repositorios, APIs, eventos)                   │
│      → APPLICATION SERVICE                                     │
│                                                                │
│  Si es lógica pura entre múltiples entidades                  │
│      → DOMAIN SERVICE                                          │
│                                                                │
│  Si es lógica de UNA sola entidad                             │
│      → Método en la ENTIDAD                                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Testing - La Clave de la Distinción

Aquí es donde la separación brilla, mi niño.

### Testing del Domain Service (SIN MOCKS)

```typescript
describe('MoneyTransferService', () => {
  it('should transfer money between accounts', () => {
    // Arrange - Solo creamos entidades
    const from = Account.create('1', 'Juan', Money.create(1000));
    const to = Account.create('2', 'María', Money.create(500));
    const amount = Money.create(300);

    const service = new MoneyTransferService();

    // Act - Llamamos al servicio
    service.transfer(from, to, amount);

    // Assert - Verificamos el estado
    expect(from.getBalance().getAmount()).toBe(700);
    expect(to.getBalance().getAmount()).toBe(800);
  });
});
```

**¿Viste?**
- ❌ Cero mocks
- ✅ Solo lógica pura
- ✅ Rápido, simple, confiable

Si necesitas mocks aquí, es señal de que el servicio tiene responsabilidades que no le corresponden.

### Testing del Application Service (CON MOCKS)

```typescript
describe('TransferMoneyUseCase', () => {
  it('should orchestrate complete transfer', async () => {
    // Arrange - Mockear dependencias de I/O
    const mockRepo = mock<AccountRepository>();
    const mockEvents = mock<EventPublisher>();

    mockRepo.findById
      .mockResolvedValueOnce(fromAccount)
      .mockResolvedValueOnce(toAccount);

    const useCase = new TransferMoneyUseCase(mockRepo, transferService, mockEvents);

    // Act
    await useCase.execute({ fromId: '1', toId: '2', amount: 300 });

    // Assert - Verificar orquestación
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
    expect(mockRepo.findById).toHaveBeenCalledWith('2');
    expect(mockRepo.saveMany).toHaveBeenCalledWith([fromAccount, toAccount]);
    expect(mockEvents.publish).toHaveBeenCalledWith('MoneyTransferred', ...);
  });
});
```

**Aquí sí usamos mocks:**
- ✅ Para repositorios (I/O)
- ✅ Para eventos (I/O)
- ✅ Para notificaciones (I/O)
- ❌ NO para el Domain Service (lógica pura)

---

## Arquitectura - Dónde Vive Cada Uno

```
src/
├── domain/                          # DOMINIO (sin I/O)
│   ├── entities/
│   │   └── Account.ts              # Entidad (lógica de UNA cuenta)
│   │
│   ├── value-objects/
│   │   └── Money.ts                # Value Object
│   │
│   ├── services/
│   │   └── MoneyTransferService.ts # ✅ DOMAIN SERVICE
│   │
│   └── repositories/
│       └── AccountRepository.ts    # Puerto (interface)
│
├── application/                     # APLICACIÓN (orquestación)
│   ├── use-cases/
│   │   └── TransferMoneyUseCase.ts # ✅ APPLICATION SERVICE
│   │
│   └── dtos/
│       └── TransferMoneyDTO.ts     # DTOs
│
└── infrastructure/                  # INFRAESTRUCTURA (I/O)
    ├── persistence/
    │   └── InMemoryAccountRepository.ts
    │
    └── http/
        └── TransferController.ts
```

---

## Comparación Lado a Lado

| Aspecto | Domain Service | Application Service |
|---------|---------------|-------------------|
| **Propósito** | Lógica de negocio pura | Orquestación |
| **Opera sobre** | Entidades ya cargadas | DTOs y comandos |
| **Dependencias** | Solo dominio | Repos, APIs, eventos |
| **I/O** | ❌ Nunca | ✅ Siempre |
| **Sincronía** | Síncrono | Asíncrono (async/await) |
| **Testing** | Sin mocks | Con mocks |
| **Reutilización** | Alta (pura) | Baja (acoplada a contexto) |
| **Ubicación** | `domain/services/` | `application/use-cases/` |
| **Nombre típico** | `*Service` | `*UseCase` |
| **Ejemplo** | `MoneyTransferService` | `TransferMoneyUseCase` |

---

## Casos de Uso - ¿Cuándo Usar Cada Uno?

### Domain Service - Úsalo Cuando:

✅ La lógica involucra **múltiples entidades**

```typescript
// Transferencia entre DOS cuentas
MoneyTransferService.transfer(from, to, amount)

// Calcular precio de pedido con MÚLTIPLES productos
OrderPricingService.calculateTotal(order, products, discounts)

// Validar disponibilidad de MÚLTIPLES habitaciones
HotelBookingService.checkAvailability(rooms, dateRange)
```

✅ La lógica **no pertenece naturalmente a ninguna entidad**

```typescript
// ¿Dónde va la lógica de transferencia?
// ¿En Account origen? ¿En Account destino?
// En ninguna → Domain Service
```

✅ Quieres **reutilizar la lógica en múltiples contextos**

```typescript
// Mismo Domain Service usado por:
// - API REST
// - Batch job
// - Evento de dominio
// - Admin panel
```

### Application Service - Úsalo Cuando:

✅ Necesitas **orquestar múltiples operaciones**

```typescript
async execute(command) {
  // Obtener datos
  // Llamar domain service
  // Guardar cambios
  // Publicar eventos
  // Enviar notificaciones
}
```

✅ Necesitas **manejar transacciones**

```typescript
await this.transactionManager.runInTransaction(async () => {
  // Operaciones que deben ser atómicas
});
```

✅ Necesitas **convertir entre capas** (DTOs ↔ Dominio)

```typescript
// Entrada: DTO
const command = TransferMoneyCommand;

// Dominio
this.transferService.transfer(from, to, amount);

// Salida: DTO
return TransferResult;
```

---

## Errores Comunes

### ❌ Error 1: Poner I/O en el Domain Service

```typescript
class MoneyTransferService {
  async transfer(fromId: string, toId: string, amount: number) {
    // ❌ MAL: El Domain Service no debería hacer I/O
    const from = await this.repo.findById(fromId);
    const to = await this.repo.findById(toId);
    // ...
  }
}
```

**✅ Corrección:** El Application Service obtiene las entidades y las pasa al Domain Service.

### ❌ Error 2: Poner lógica de negocio en el Application Service

```typescript
class TransferMoneyUseCase {
  async execute(command) {
    const from = await this.repo.findById(command.fromId);
    const to = await this.repo.findById(command.toId);

    // ❌ MAL: Lógica de negocio en Application Service
    if (from.balance < command.amount) {
      throw new Error('Insufficient funds');
    }

    from.balance -= command.amount;
    to.balance += command.amount;
    // ...
  }
}
```

**✅ Corrección:** Delegar al Domain Service.

### ❌ Error 3: Confundir con métodos de entidad

```typescript
class Account {
  // ❌ MAL: Transferencia involucra DOS cuentas
  transferTo(other: Account, amount: Money) {
    this.withdraw(amount);
    other.deposit(amount);
  }
}
```

**✅ Corrección:** Las operaciones multi-entidad van en Domain Services.

---

## Flujo Completo

Veamos el flujo de una transferencia de principio a fin:

```
1. HTTP Request
   └─> TransferController (Infrastructure)
         ↓
2. Validar request
   └─> Crear TransferMoneyCommand (DTO)
         ↓
3. Llamar caso de uso
   └─> TransferMoneyUseCase (Application Service)
         ↓
4. Obtener cuentas
   └─> AccountRepository.findById() (I/O)
         ↓
5. Ejecutar lógica de negocio
   └─> MoneyTransferService.transfer() (Domain Service)
         |
         ├─> Account.withdraw()
         └─> Account.deposit()
         ↓
6. Guardar cambios
   └─> AccountRepository.saveMany() (I/O)
         ↓
7. Publicar eventos
   └─> EventPublisher.publish() (I/O)
         ↓
8. Enviar notificaciones
   └─> NotificationService.send() (I/O)
         ↓
9. Retornar resultado
   └─> TransferResult (DTO)
```

---

## Ventajas de la Separación

### 1. Testabilidad

**Domain Service:** Tests rápidos, sin mocks, confiables
```typescript
// Milisegundos
service.transfer(from, to, amount);
```

**Application Service:** Tests de integración con mocks
```typescript
// Más lentos pero necesarios
await useCase.execute(command);
```

### 2. Reutilización

El Domain Service se puede usar desde:
- REST API
- GraphQL
- Batch jobs
- Eventos de dominio
- Admin panel
- CLI tools

### 3. Mantenibilidad

```typescript
// Cambiar de MySQL a PostgreSQL
// ✅ Domain Service: Sin cambios
// ⚠️ Application Service: Posibles cambios en transacciones

// Añadir nueva validación de negocio
// ✅ Domain Service: Aquí se añade
// ⚠️ Application Service: Sin cambios

// Cambiar sistema de eventos
// ✅ Domain Service: Sin cambios
// ⚠️ Application Service: Se actualiza
```

### 4. Claridad

```typescript
// Al leer el código es obvio:
// - MoneyTransferService = Lógica de negocio
// - TransferMoneyUseCase = Orquestación
```

---

## Analogía - El Restaurante

Para que te quede clarito, mi niño:

**Domain Service = Chef**
- Sabe COCINAR (lógica de negocio)
- No sale de la cocina
- No habla con clientes
- No maneja dinero
- Pura ejecución

**Application Service = Camarero**
- ORQUESTA todo
- Toma la orden (input)
- Lleva la orden al chef (delega)
- Trae la comida (output)
- Cobra (transacción)
- Avisar a otros (eventos)

---

## Proyecto - Estructura de Archivos

Este proyecto incluye:

### Código ANTES (Todo Mezclado)
```
src/before/
└── TransferMoneyUseCase.ts  # El problema en acción
```

### Código DESPUÉS (Separado)
```
src/domain/
├── entities/
│   └── Account.ts
├── value-objects/
│   └── Money.ts
└── services/
    └── MoneyTransferService.ts  # ✅ Domain Service

src/application/
└── use-cases/
    └── TransferMoneyUseCase.ts   # ✅ Application Service
```

### Tests que Demuestran la Diferencia
```
tests/domain/
└── MoneyTransferService.test.ts  # SIN MOCKS

tests/application/
└── TransferMoneyUseCase.test.ts  # CON MOCKS
```

---

## Ejecutar el Proyecto

```bash
# Instalar dependencias
npm install

# Ejecutar tests (¡clave para entender!)
npm test

# Ver los tests que pasan SIN mocks (Domain Service)
npm test MoneyTransferService

# Ver los tests que usan mocks (Application Service)
npm test TransferMoneyUseCase

# Arrancar servidor
npm run dev

# Probar una transferencia
curl -X POST http://localhost:3000/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "account-1",
    "toAccountId": "account-2",
    "amount": 100
  }'

# Ver las cuentas
curl http://localhost:3000/accounts
```

---

## Preguntas Frecuentes

### ¿Es lo mismo que Service Layer pattern?

No exactamente. Service Layer es más genérico. La distinción Domain vs Application es más específica y separa claramente lógica de negocio de orquestación.

### ¿Siempre necesito ambos?

No. Si tu caso de uso es simple (solo obtener datos y devolverlos), solo necesitas Application Service. El Domain Service aparece cuando hay lógica de negocio compleja entre múltiples entidades.

### ¿Puedo tener lógica en las entidades?

¡Absolutamente! Si la lógica es de UNA sola entidad, va en la entidad. El Domain Service es para lógica que involucra MÚLTIPLES entidades.

```typescript
// ✅ En la entidad (lógica de UNA cuenta)
account.withdraw(amount);
account.deposit(amount);

// ✅ En Domain Service (lógica de DOS cuentas)
transferService.transfer(from, to, amount);
```

### ¿El Domain Service puede llamar a otros Domain Services?

Sí, perfectamente. Pero cuidado con la complejidad. Si la cadena es muy larga, revisa tu diseño.

### ¿El Application Service puede llamar a varios Domain Services?

Sí, es su trabajo. Orquesta TODO lo necesario para completar el caso de uso.

---

## Conclusión

La distinción entre Domain Service y Application Service es fundamental, mi niño.

**Domain Service:**
- Lógica de negocio pura
- Sin I/O
- Testeable sin mocks
- Altamente reutilizable

**Application Service:**
- Orquestación
- Con I/O
- Testeable con mocks
- Acoplado al contexto

**La regla:**
- Si tiene I/O → Application Service
- Si es lógica pura → Domain Service
- Si es lógica de UNA entidad → Método en la entidad

Cuando entiendes esto, tu código se vuelve más limpio, más testeable y más mantenible.

¡Venga, a darle caña!

---

**Profe Millo**
_"Si necesitas mocks para testear lógica de negocio, revisa tu diseño"_
