# Capa de Aplicación - La Orquestación 🎬

Buenas, mi niño. Ahora estamos en la capa de **aplicación**, también conocida como la capa de **casos de uso**. Si el dominio es el músico que toca los instrumentos, esta capa es el director de orquesta que coordina cuándo toca cada uno.

## ¿Qué es la Capa de Aplicación?

La capa de aplicación **orquesta** las operaciones del dominio para implementar las funcionalidades que el usuario necesita. No tiene lógica de negocio propia, solo coordina.

**Piénsalo así**:
- **Dominio**: "Sé cómo prestar un libro" (las reglas)
- **Aplicación**: "Voy a buscar el usuario, buscar el libro, crear el préstamo y guardarlo" (la coordinación)

## Regla de Oro de la Aplicación

**La aplicación ORQUESTA, no decide.**

```
✅ La aplicación PUEDE:
- Buscar entidades usando repositorios
- Llamar métodos del dominio
- Guardar cambios en repositorios
- Transformar entidades a DTOs
- Manejar transacciones

❌ La aplicación NO PUEDE:
- Contener reglas de negocio (eso va en el dominio)
- Conocer detalles de HTTP/BD (eso va en infraestructura)
- Modificar directamente propiedades de entidades
```

## Estructura de la Aplicación

```
application/
├── use-cases/                      # Los casos de uso
│   ├── register-book.use-case.ts
│   ├── register-user.use-case.ts
│   ├── loan-book.use-case.ts
│   ├── return-book.use-case.ts
│   ├── get-available-books.use-case.ts
│   └── get-user-loans.use-case.ts
│
└── dtos/                           # Data Transfer Objects
    ├── book.dto.ts
    ├── user.dto.ts
    └── loan.dto.ts
```

## Casos de Uso (Use Cases)

Un caso de uso representa **una acción que un usuario puede realizar**. Es una historia: "Como usuario, quiero prestar un libro".

### Estructura de un Caso de Uso

Todos los casos de uso siguen el mismo patrón:

```typescript
export class [NombreDelCasoDeUso]UseCase {
  // 1. Inyectar dependencias (repositorios, servicios)
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bookRepository: BookRepository,
    // ... otros repositorios o servicios
  ) {}

  // 2. Método execute que recibe un comando y retorna un DTO
  async execute(command: [NombreDelComando]): Promise<[NombreDelDTO]> {
    // 3. Buscar entidades necesarias
    // 4. Llamar métodos del dominio
    // 5. Guardar cambios
    // 6. Retornar DTO
  }
}
```

### Ejemplo Completo: LoanBookUseCase

Vamos a analizar paso por paso cómo funciona el caso de uso de prestar un libro.

```typescript
import {
  UserId, BookId, LoanId,
  UserRepository, BookRepository, LoanRepository,
  IdGenerator,
  UserNotFoundException, BookNotFoundException,
} from '../../domain';
import { LoanBookCommand, LoanResponse } from '../dtos';

export class LoanBookUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bookRepository: BookRepository,
    private readonly loanRepository: LoanRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: LoanBookCommand): Promise<LoanResponse> {
    // PASO 1: Buscar el usuario
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    // PASO 2: Buscar el libro
    const bookId = BookId.create(command.bookId);
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new BookNotFoundException(command.bookId);
    }

    // PASO 3: Crear el préstamo (AQUÍ está la lógica de negocio)
    // user.borrowBook() valida:
    // - ¿El usuario tiene penalizaciones?
    // - ¿Ha llegado al límite de 3 préstamos?
    // - ¿El libro está disponible?
    const loanId = LoanId.create(this.idGenerator.generate());
    const loan = user.borrowBook(book, loanId);

    // PASO 4: Persistir los cambios
    await this.loanRepository.save(loan);
    await this.bookRepository.save(book);  // El libro ahora está "prestado"
    await this.userRepository.save(user);  // El user tiene un préstamo más

    // PASO 5: Retornar DTO
    return this.toResponse(loan);
  }

  private toResponse(loan: Loan): LoanResponse {
    return {
      id: loan.id.getValue(),
      bookId: loan.bookId.getValue(),
      userId: loan.userId.getValue(),
      startDate: loan.loanPeriod.getStartDate().toISOString(),
      dueDate: loan.dueDate.toISOString(),
      status: loan.status,
      returnedAt: loan.returnedAt?.toISOString() ?? null,
      daysOverdue: loan.getDaysOverdue(),
    };
  }
}
```

### Anatomía del Caso de Uso

Vamos a desglosar cada parte:

#### 1. Dependencias Inyectadas

```typescript
constructor(
  private readonly userRepository: UserRepository,
  private readonly bookRepository: BookRepository,
  private readonly loanRepository: LoanRepository,
  private readonly idGenerator: IdGenerator
) {}
```

**¿Por qué inyectar?**
- Puedes cambiar la implementación sin tocar el caso de uso
- Facilita el testing (inyectas fakes en tests)
- Inviertes las dependencias (el caso de uso depende de interfaces, no de implementaciones)

#### 2. Comando (Input)

```typescript
interface LoanBookCommand {
  userId: string;
  bookId: string;
}
```

El comando es un **objeto plano (DTO)** con los datos necesarios. Viene normalmente desde un controller.

**Características**:
- Datos primitivos (string, number, boolean)
- Sin lógica, solo datos
- Representa la intención del usuario

#### 3. Orquestación

```typescript
// Buscar
const user = await this.userRepository.findById(userId);
const book = await this.bookRepository.findById(bookId);

// Ejecutar lógica de dominio
const loan = user.borrowBook(book, loanId);

// Persistir
await this.loanRepository.save(loan);
await this.bookRepository.save(book);
await this.userRepository.save(user);
```

Mira tú, aquí NO hay lógica de negocio. Solo:
1. **Cargar** datos
2. **Llamar** al dominio
3. **Guardar** cambios

La validación ("¿puede el usuario prestar?") está en `user.borrowBook()`, **no aquí**.

#### 4. Respuesta (Output)

```typescript
return {
  id: loan.id.getValue(),
  bookId: loan.bookId.getValue(),
  // ... más datos
};
```

Retornamos un **DTO** (objeto plano), no la entidad de dominio. ¿Por qué?

- El dominio es interno, no lo exponemos
- El DTO tiene la forma que necesita el cliente
- Podemos transformar/formatear datos (fechas a string, etc.)

## Data Transfer Objects (DTOs)

Los DTOs son objetos planos que transportan datos entre capas.

### ¿Por qué DTOs?

```typescript
// ❌ MALO - Exponer entidades de dominio
app.post('/loans', async (req, res) => {
  const loan = await loanBookUseCase.execute(req.body);
  res.json(loan); // ¡Expones la entidad completa con todos sus métodos!
});

// ✅ BUENO - Usar DTOs
app.post('/loans', async (req, res) => {
  const loanDTO = await loanBookUseCase.execute(req.body);
  res.json(loanDTO); // Solo datos, sin métodos ni lógica
});
```

**Beneficios**:
1. **Desacoplamiento**: puedes cambiar el dominio sin cambiar la API
2. **Control**: decides qué datos exponer
3. **Formato**: puedes adaptar los datos al cliente (fechas como strings, etc.)

### Tipos de DTOs

#### Commands (Comandos)

Representan intenciones del usuario. Siempre verbos.

```typescript
// "Quiero prestar un libro"
export interface LoanBookCommand {
  userId: string;
  bookId: string;
}

// "Quiero registrar un libro"
export interface RegisterBookCommand {
  isbn: string;
  title: string;
  author: string;
}
```

#### Queries (Consultas)

Representan peticiones de información.

```typescript
// "Quiero ver los préstamos de un usuario"
export interface GetUserLoansQuery {
  userId: string;
}
```

#### Responses (Respuestas)

Representan datos que retornas.

```typescript
export interface LoanResponse {
  id: string;
  userId: string;
  bookId: string;
  startDate: string;      // Date → string para JSON
  dueDate: string;
  status: 'ACTIVE' | 'RETURNED';
  returnedAt: string | null;
  daysOverdue: number;
}
```

## Patrones Comunes

### 1. Patrón Command/Query

Separamos operaciones que **modifican** (commands) de las que solo **consultan** (queries).

```typescript
// COMMAND - Modifica estado
class LoanBookUseCase {
  async execute(command: LoanBookCommand): Promise<LoanResponse> {
    // Modifica: crea loan, cambia book status, etc.
  }
}

// QUERY - Solo consulta
class GetAvailableBooksUseCase {
  async execute(): Promise<BookResponse[]> {
    // Solo lee, no modifica nada
  }
}
```

**¿Por qué separar?**
- Claridad: sabes si una operación modifica o no
- Optimización: las queries se pueden cachear
- Escalabilidad: preparado para CQRS (tema avanzado)

### 2. Patrón Repository

El caso de uso usa repositorios para cargar/guardar entidades.

```typescript
class LoanBookUseCase {
  async execute(command: LoanBookCommand): Promise<LoanResponse> {
    // Cargar
    const user = await this.userRepository.findById(userId);
    const book = await this.bookRepository.findById(bookId);

    // Modificar
    const loan = user.borrowBook(book, loanId);

    // Guardar
    await this.loanRepository.save(loan);
    await this.bookRepository.save(book);
    await this.userRepository.save(user);
  }
}
```

**Importante**: El caso de uso NO sabe si es PostgreSQL, MongoDB o en memoria. Solo usa la interfaz.

### 3. Manejo de Errores

Los casos de uso dejan que los errores del dominio suban.

```typescript
async execute(command: LoanBookCommand): Promise<LoanResponse> {
  // Si el usuario no existe
  if (!user) {
    throw new UserNotFoundException(command.userId);
    // Este error lo capturará el controller
  }

  // Si el dominio lanza error (ej: UserHasPenaltiesException)
  const loan = user.borrowBook(book, loanId);
  // El error sube automáticamente
}
```

Los errores del dominio son específicos y expresivos. El controller los convierte en HTTP status codes.

## Diferencias: Dominio vs Aplicación

Esta tabla te ayudará a saber dónde poner cada cosa:

| Responsabilidad | Dominio | Aplicación |
|----------------|---------|------------|
| Validar que un usuario puede prestar | ✅ Sí (regla de negocio) | ❌ No |
| Buscar usuario y libro | ❌ No | ✅ Sí (orquestación) |
| Calcular penalización por días | ✅ Sí (regla de negocio) | ❌ No |
| Guardar en la BD | ❌ No | ✅ Sí (infraestructura vía repo) |
| Decidir formato de fecha en respuesta | ❌ No | ✅ Sí (DTO) |
| Límite de 3 préstamos por usuario | ✅ Sí (regla de negocio) | ❌ No |

**Regla rápida**: Pregúntate "¿Esta lógica existe aunque cambie la tecnología?"
- Si SÍ → dominio
- Si NO → aplicación o infraestructura

## Transacciones

En algunos casos, necesitas garantizar que múltiples operaciones sean atómicas (todas o ninguna).

```typescript
class LoanBookUseCase {
  async execute(command: LoanBookCommand): Promise<LoanResponse> {
    // Inicio de transacción (implementado por infraestructura)
    await this.unitOfWork.begin();

    try {
      const user = await this.userRepository.findById(userId);
      const book = await this.bookRepository.findById(bookId);
      const loan = user.borrowBook(book, loanId);

      await this.loanRepository.save(loan);
      await this.bookRepository.save(book);
      await this.userRepository.save(user);

      // Confirmar transacción
      await this.unitOfWork.commit();

      return this.toResponse(loan);
    } catch (error) {
      // Rollback en caso de error
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
```

**Nota**: `UnitOfWork` es un patrón de infraestructura, pero se usa desde aplicación.

## Testing de Casos de Uso

Los casos de uso se testean con repositorios en memoria (fakes).

```typescript
describe('LoanBookUseCase', () => {
  let useCase: LoanBookUseCase;
  let userRepo: InMemoryUserRepository;
  let bookRepo: InMemoryBookRepository;
  let loanRepo: InMemoryLoanRepository;
  let idGenerator: FakeIdGenerator;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    bookRepo = new InMemoryBookRepository();
    loanRepo = new InMemoryLoanRepository();
    idGenerator = new FakeIdGenerator();

    useCase = new LoanBookUseCase(
      userRepo, bookRepo, loanRepo, idGenerator
    );
  });

  it('should create a loan when user and book are available', async () => {
    // Arrange - Preparar datos de test
    const user = User.create({
      id: UserId.create('user-1'),
      name: 'Juan',
      email: Email.create('juan@test.com')
    });
    await userRepo.save(user);

    const book = Book.create({
      id: BookId.create('book-1'),
      isbn: ISBN.create('978-0-13-468599-1'),
      title: 'Clean Architecture',
      author: 'Uncle Bob'
    });
    await bookRepo.save(book);

    // Act - Ejecutar caso de uso
    const result = await useCase.execute({
      userId: 'user-1',
      bookId: 'book-1'
    });

    // Assert - Verificar resultado
    expect(result.status).toBe('ACTIVE');
    expect(result.userId).toBe('user-1');
    expect(result.bookId).toBe('book-1');

    // Verificar que se guardó
    const savedLoan = await loanRepo.findById(
      LoanId.create(result.id)
    );
    expect(savedLoan).toBeDefined();
  });

  it('should throw when user has penalties', async () => {
    // Arrange
    const user = User.create({...});
    user.applyPenalty(/* ... */);
    await userRepo.save(user);

    const book = Book.create({...});
    await bookRepo.save(book);

    // Act & Assert
    await expect(
      useCase.execute({ userId: 'user-1', bookId: 'book-1' })
    ).rejects.toThrow(UserHasPenaltiesException);
  });
});
```

**Ventajas del testing con fakes**:
- **Rápido**: no hay BD real
- **Aislado**: solo testas el caso de uso
- **Determinístico**: siempre da el mismo resultado
- **Simple**: no necesitas mocks complicados

## Errores Comunes

### 1. Poner lógica de negocio en el caso de uso

```typescript
// ❌ MALO - Lógica de negocio en aplicación
class LoanBookUseCase {
  async execute(command: LoanBookCommand): Promise<LoanResponse> {
    const user = await this.userRepository.findById(userId);

    // ¡Esta validación debería estar en el dominio!
    if (user.activeLoans.length >= 3) {
      throw new Error('User has too many loans');
    }

    // ...
  }
}

// ✅ BUENO - Lógica en el dominio
class LoanBookUseCase {
  async execute(command: LoanBookCommand): Promise<LoanResponse> {
    const user = await this.userRepository.findById(userId);
    const book = await this.bookRepository.findById(bookId);

    // user.borrowBook() contiene toda la validación
    const loan = user.borrowBook(book, loanId);

    // ...
  }
}
```

### 2. Exponer entidades de dominio directamente

```typescript
// ❌ MALO
async execute(command: LoanBookCommand): Promise<Loan> {
  // ...
  return loan; // ¡Expones la entidad!
}

// ✅ BUENO
async execute(command: LoanBookCommand): Promise<LoanResponse> {
  // ...
  return this.toResponse(loan); // Retornas un DTO
}
```

### 3. Casos de uso que hacen demasiado

```typescript
// ❌ MALO - Un caso de uso que hace de todo
class ManageBooksUseCase {
  async execute(action: string, data: any) {
    if (action === 'create') { /* ... */ }
    if (action === 'update') { /* ... */ }
    if (action === 'delete') { /* ... */ }
  }
}

// ✅ BUENO - Un caso de uso por acción
class RegisterBookUseCase { /* ... */ }
class UpdateBookUseCase { /* ... */ }
class DeleteBookUseCase { /* ... */ }
```

**Regla**: Un caso de uso = una acción del usuario.

## Resumen

La capa de aplicación:
- **Orquesta** operaciones del dominio
- **No contiene** lógica de negocio
- **Usa** repositorios para cargar/guardar
- **Transforma** entidades a DTOs
- **Es fácil de testear** con fakes

Recuerda, mi niño: **si tu caso de uso tiene un "if" con lógica de negocio, probablemente debería estar en el dominio**.

¿Te quedó clarito o le damos otra vuelta? 🚀
