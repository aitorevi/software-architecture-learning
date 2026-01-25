# 🎓 Presentación: Domain vs Application Services

> **Guía para presentar este concepto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar la distinción crucial entre Domain Services (lógica de negocio pura) y Application Services (orquestación con I/O), y por qué esta separación mejora el testing, la reutilización y el mantenimiento.

### Duración Recomendada
- **Express (30 min)**: Problema + Solución + Demo tests
- **Estándar (1 hora)**: Conceptos + Código + Ejercicios
- **Completo (2 horas)**: Workshop con implementación

### Prerrequisitos
- OOP básico
- Testing básico (mocks)
- Conceptos de arquitectura hexagonal (recomendado)

---

## 🎤 Estructura Sugerida

### 1. Introducción - El Problema (10 min)

**Pregunta inicial:** "¿Dónde ponen ustedes la lógica de una transferencia bancaria?"

**Mostrar código problemático:**

```typescript
// ❌ El clásico: Todo mezclado
class TransferMoneyUseCase {
  async execute(fromId: string, toId: string, amount: number) {
    // I/O
    const from = await this.accountRepo.findById(fromId);
    const to = await this.accountRepo.findById(toId);

    // Lógica de negocio mezclada
    if (from.balance < amount) throw new Error('Insufficient funds');
    if (fromId === toId) throw new Error('Same account');

    from.balance -= amount;
    to.balance += amount;

    // I/O
    await this.accountRepo.save(from);
    await this.accountRepo.save(to);
    await this.notificationService.send(...);
  }
}
```

**Los problemas (escribir en pizarra):**

1. ❌ Lógica de negocio + I/O mezclados
2. ❌ No puedes testear lógica sin mocks
3. ❌ No puedes reutilizar la lógica
4. ❌ Viola Single Responsibility

**Preguntar:** "¿Cómo testearían las validaciones sin mockear el repositorio?"

---

### 2. La Solución - Dos Tipos de Servicios (15 min)

**Dibujar en la pizarra:**

```
┌─────────────────────────────────────────────────┐
│           APPLICATION SERVICE                   │
│         (TransferMoneyUseCase)                  │
│                                                 │
│  1. Obtener cuentas (I/O)                       │
│  2. ┌────────────────────────────────┐          │
│     │   DOMAIN SERVICE               │          │
│     │ (MoneyTransferService)         │          │
│     │                                │          │
│     │  - Validar fondos              │          │
│     │  - Ejecutar transferencia      │          │
│     │  SIN I/O                       │          │
│     └────────────────────────────────┘          │
│  3. Guardar cambios (I/O)                       │
│  4. Publicar eventos (I/O)                      │
│  5. Enviar notificaciones (I/O)                 │
└─────────────────────────────────────────────────┘
```

**Explicar los dos servicios:**

#### Domain Service

```typescript
// ✅ SOLO lógica de negocio
class MoneyTransferService {
  transfer(from: Account, to: Account, amount: Money): void {
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
- ✅ Lógica pura
- ✅ Sin I/O
- ✅ Testeable sin mocks
- ✅ Reutilizable

#### Application Service

```typescript
// ✅ ORQUESTACIÓN
class TransferMoneyUseCase {
  async execute(command: TransferMoneyCommand) {
    // 1. I/O - Obtener datos
    const from = await this.accountRepo.findById(command.fromId);
    const to = await this.accountRepo.findById(command.toId);

    // 2. DELEGAR lógica al Domain Service
    this.transferService.transfer(from, to, amount);

    // 3. I/O - Guardar
    await this.accountRepo.saveMany([from, to]);

    // 4. I/O - Eventos
    await this.eventPublisher.publish('MoneyTransferred', ...);

    // 5. I/O - Notificaciones
    await this.notificationService.send(...);
  }
}
```

**Características:**
- ✅ Orquestación
- ✅ Con I/O
- ✅ Testeable con mocks
- ✅ Coordina componentes

---

### 3. La Clave: Testing (20 min)

**Esto es lo más importante para que lo entiendan.**

#### Demo: Testing del Domain Service (SIN MOCKS)

```typescript
describe('MoneyTransferService', () => {
  it('should transfer money', () => {
    // Arrange - Solo crear entidades
    const from = Account.create('1', 'Juan', Money.create(1000));
    const to = Account.create('2', 'María', Money.create(500));

    const service = new MoneyTransferService();

    // Act
    service.transfer(from, to, Money.create(300));

    // Assert
    expect(from.getBalance().getAmount()).toBe(700);
    expect(to.getBalance().getAmount()).toBe(800);
  });
});
```

**Enfatizar:**
- ❌ Cero mocks
- ✅ Test rápido (milisegundos)
- ✅ Confiable
- ✅ Fácil de leer

**Preguntar:** "¿Por qué no necesitamos mocks aquí?"

**Respuesta:** Porque el Domain Service NO tiene I/O. Solo opera sobre entidades en memoria.

#### Demo: Testing del Application Service (CON MOCKS)

```typescript
describe('TransferMoneyUseCase', () => {
  it('should orchestrate transfer', async () => {
    // Arrange - Mockear I/O
    const mockRepo = mock<AccountRepository>();
    const mockEvents = mock<EventPublisher>();

    mockRepo.findById
      .mockResolvedValueOnce(fromAccount)
      .mockResolvedValueOnce(toAccount);

    const useCase = new TransferMoneyUseCase(
      mockRepo,
      transferService,  // NO se mockea (lógica pura)
      mockEvents
    );

    // Act
    await useCase.execute({ fromId: '1', toId: '2', amount: 300 });

    // Assert - Verificar ORQUESTACIÓN
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
    expect(mockRepo.saveMany).toHaveBeenCalled();
    expect(mockEvents.publish).toHaveBeenCalled();
  });
});
```

**Enfatizar:**
- ✅ Mocks para I/O (repo, eventos)
- ❌ NO mock para Domain Service
- ✅ Testeamos orquestación, no lógica

---

### 4. La Regla de Oro (5 min)

**Escribir en la pizarra y repetir varias veces:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ¿Tiene I/O? (repos, APIs, eventos)            │
│       ↓ SÍ                                      │
│  APPLICATION SERVICE                            │
│                                                 │
│  ¿Es lógica pura entre múltiples entidades?    │
│       ↓ SÍ                                      │
│  DOMAIN SERVICE                                 │
│                                                 │
│  ¿Es lógica de UNA sola entidad?               │
│       ↓ SÍ                                      │
│  MÉTODO EN LA ENTIDAD                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 5. Demo en Vivo (15 min)

**Ejecutar el proyecto:**

```bash
# 1. Mostrar los tests pasando SIN mocks
npm test MoneyTransferService

# 2. Mostrar los tests CON mocks
npm test TransferMoneyUseCase

# 3. Arrancar servidor
npm run dev

# 4. Ejecutar transferencia
curl -X POST http://localhost:3000/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "account-1",
    "toAccountId": "account-2",
    "amount": 100
  }'

# 5. Ver resultado
curl http://localhost:3000/accounts
```

**Navegar por el código en este orden:**

1. `src/before/TransferMoneyUseCase.ts` - El problema
2. `src/domain/services/MoneyTransferService.ts` - Domain Service
3. `src/application/use-cases/TransferMoneyUseCase.ts` - Application Service
4. `tests/domain/MoneyTransferService.test.ts` - Sin mocks
5. `tests/application/TransferMoneyUseCase.test.ts` - Con mocks

---

### 6. Comparación Visual (5 min)

**Tabla en la pizarra:**

| Aspecto | Domain Service | Application Service |
|---------|---------------|-------------------|
| Responsabilidad | Lógica pura | Orquestación |
| I/O | ❌ Nunca | ✅ Siempre |
| Testing | Sin mocks | Con mocks |
| Dependencias | Solo dominio | Repos, APIs, eventos |
| Reutilización | Alta | Baja |
| Sincronía | Síncrono | Asíncrono |

---

### 7. Ejercicio Práctico (15 min)

**Ejercicio:**

"Implementen la lógica para cambiar la contraseña de un usuario:

Requisitos:
- Validar que la contraseña actual sea correcta
- Validar que la nueva contraseña cumpla requisitos (min 8 chars, etc.)
- Cambiar la contraseña
- Guardar el usuario
- Enviar email de confirmación

¿Qué va en Domain Service y qué en Application Service?"

**Solución:**

```typescript
// Domain Service
class PasswordChangeService {
  changePassword(
    user: User,
    currentPassword: string,
    newPassword: string
  ): void {
    // Validar contraseña actual
    if (!user.verifyPassword(currentPassword)) {
      throw new Error('Invalid current password');
    }

    // Validar nueva contraseña
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Cambiar
    user.setPassword(newPassword);

    // NO guarda, NO envía email
  }
}

// Application Service
class ChangePasswordUseCase {
  async execute(command: ChangePasswordCommand) {
    // I/O - Obtener
    const user = await this.userRepo.findById(command.userId);

    // Lógica - Delegar
    this.passwordService.changePassword(
      user,
      command.currentPassword,
      command.newPassword
    );

    // I/O - Guardar
    await this.userRepo.save(user);

    // I/O - Notificar
    await this.emailService.sendPasswordChanged(user.email);
  }
}
```

---

## 💡 Puntos Clave para Enfatizar

### 1. Testing es la Clave

"Si necesitas mocks para testear lógica de negocio, algo está mal."

Domain Service → Sin mocks
Application Service → Con mocks

### 2. No Es Sobre Nombres

No importa si lo llamas Service, UseCase o Handler.
Importa SI TIENE I/O O NO.

### 3. Separación de Responsabilidades

- Domain Service = Chef (cocina)
- Application Service = Camarero (orquesta)

### 4. Reutilización

El Domain Service se puede usar desde:
- REST API
- GraphQL
- Batch jobs
- Eventos
- Admin panel

El Application Service es más específico del contexto.

---

## ❓ Preguntas Frecuentes

### "¿Siempre necesito ambos?"

No. Si tu caso de uso es simple (solo obtener datos), solo necesitas Application Service.

El Domain Service aparece cuando hay lógica de negocio compleja entre múltiples entidades.

### "¿Puedo tener lógica en las entidades?"

¡Claro! Si la lógica es de UNA entidad, va en la entidad.

```typescript
// ✅ En entidad (una cuenta)
account.withdraw(amount);

// ✅ En Domain Service (dos cuentas)
transferService.transfer(from, to, amount);
```

### "¿El Domain Service puede llamar al repositorio?"

❌ NO. Si lo hace, ya no es Domain Service.

Los repositorios son I/O. El Domain Service es lógica pura.

### "¿Y si mi lógica necesita datos externos?"

Entonces NO va en Domain Service. Va en Application Service.

O el Application Service obtiene los datos y se los pasa al Domain Service.

### "¿Puedo tener múltiples Domain Services?"

Sí. Cada uno con su responsabilidad específica.

```typescript
MoneyTransferService
LoanApprovalService
InterestCalculationService
```

---

## 📋 Checklist de Presentación

Antes:
- [ ] Proyecto ejecutándose
- [ ] Tests pasando
- [ ] Ejemplos preparados
- [ ] Diagramas en la pizarra

Durante:
- [ ] Mostrar el problema (código mezclado)
- [ ] Explicar la solución (separación)
- [ ] Demostrar testing (con y sin mocks)
- [ ] Comparar lado a lado
- [ ] Demo en vivo
- [ ] Ejercicio práctico

Después:
- [ ] Compartir repositorio
- [ ] Responder dudas
- [ ] Sugerir ejercicios adicionales

---

## 🏆 Mensaje Final

"La distinción entre Domain Service y Application Service es fundamental para escribir código limpio y testeable.

**Domain Service = Lógica de negocio pura**
- Sin I/O
- Testeable sin mocks
- Altamente reutilizable

**Application Service = Orquestación**
- Con I/O
- Testeable con mocks
- Coordina todo

**La regla simple:**

Si tiene I/O → Application Service
Si es lógica pura → Domain Service

Cuando dominen esto, su código subirá varios niveles.

El testing les dirá si lo están haciendo bien:
- ¿Necesitas mocks para testear lógica? → Algo está mal
- ¿La lógica está pura y aislada? → Vas bien

Recuerden: la arquitectura no es sobre nombres bonitos.
Es sobre separación de responsabilidades que facilita el testing,
el mantenimiento y la evolución del código."

---

## 📚 Recursos Adicionales

**Lecturas recomendadas:**
- "Domain-Driven Design" - Eric Evans (Capítulo sobre Services)
- "Implementing Domain-Driven Design" - Vaughn Vernon
- "Clean Architecture" - Robert C. Martin

**Conceptos relacionados:**
- Hexagonal Architecture
- Dependency Inversion
- Single Responsibility Principle
- Command Query Separation

---

## 🎯 Ejercicios para Practicar

### Ejercicio 1: Sistema de Reservas
Implementar la lógica de reserva de hotel con:
- Verificar disponibilidad (lógica)
- Guardar reserva (I/O)
- Enviar confirmación (I/O)

### Ejercicio 2: E-commerce
Implementar proceso de compra con:
- Calcular precio total (lógica)
- Aplicar descuentos (lógica)
- Procesar pago (I/O)
- Enviar factura (I/O)

### Ejercicio 3: Refactoring
Tomar un Use Case existente y separarlo en Domain Service + Application Service.

---

**Profe Millo**
_"El testing no miente. Si necesitas mocks para testear negocio, revisa tu diseño."_
