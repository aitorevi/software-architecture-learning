# Capa de Dominio - El Corazón del Sistema 💎

Buenas, mi niño. Aquí estás en lo más importante: **el dominio**. Esta es la chicha del sistema, donde vive la lógica de negocio pura. Todo lo que está aquí existe independientemente de bases de datos, frameworks o APIs.

## ¿Qué es el Dominio?

El dominio es el **modelo del problema que estás resolviendo**. En nuestro caso, un sistema de biblioteca. Aquí defines:

- ¿Qué es un libro?
- ¿Qué es un préstamo?
- ¿Cuándo se puede prestar un libro?
- ¿Cuándo se aplica una penalización?

Todo esto **sin mencionar HTTP, SQL, JSON o cualquier detalle técnico**. El dominio habla en lenguaje del negocio.

## Regla de Oro del Dominio

**El dominio NO DEPENDE de NADA externo.**

```
✅ PERMITIDO en el dominio:
- Otras clases del dominio
- Librerías estándar del lenguaje (Date, Math, etc.)
- Nada más

❌ PROHIBIDO en el dominio:
- Express, Fastify u otros frameworks web
- TypeORM, Mongoose u otros ORMs
- Axios, fetch u otros clientes HTTP
- Winston, Pino u otros loggers
- CUALQUIER librería de infraestructura
```

## Estructura del Dominio

```
domain/
├── entities/              # Aggregate Roots y Entidades
│   ├── book.ts           # 📖 Libro (AR)
│   ├── user.ts           # 👤 Usuario (AR)
│   ├── loan.ts           # 📝 Préstamo
│   └── penalty.ts        # 💰 Penalización
│
├── value-objects/        # Objetos de Valor
│   ├── book-id.ts       # ID de libro
│   ├── isbn.ts          # ISBN validado
│   ├── email.ts         # Email validado
│   ├── money.ts         # Cantidad + moneda
│   └── date-range.ts    # Rango de fechas
│
├── repositories/         # 🔌 PUERTOS - Interfaces
│   ├── book.repository.ts
│   ├── user.repository.ts
│   └── loan.repository.ts
│
├── services/            # Servicios de Dominio
│   ├── loan-validator.ts
│   ├── penalty-calculator.ts
│   └── id-generator.ts
│
├── events/              # Eventos de Dominio
│   ├── book-loaned.event.ts
│   ├── book-returned.event.ts
│   └── penalty-applied.event.ts
│
└── exceptions/          # Excepciones del Dominio
    ├── book-not-available.exception.ts
    ├── user-has-penalties.exception.ts
    └── user-exceed-loan-limit.exception.ts
```

## Componentes Explicados

### 1. Entities (Entidades)

Las entidades son objetos con **identidad**. Dos libros con el mismo título pero diferente ID son libros DISTINTOS.

**Características**:
- Tienen un identificador único (BookId, UserId)
- Su identidad persiste en el tiempo
- Pueden cambiar sus atributos pero siguen siendo la misma entidad
- Contienen lógica de negocio

**Ejemplo: Book**

```typescript
const book1 = Book.create({
  id: BookId.create('123'),
  isbn: ISBN.create('978-0-13-468599-1'),
  title: 'Clean Architecture',
  author: 'Uncle Bob'
});

const book2 = Book.create({
  id: BookId.create('456'),
  isbn: ISBN.create('978-0-13-468599-1'),
  title: 'Clean Architecture',
  author: 'Uncle Bob'
});

// ❌ book1 !== book2 (diferente ID, diferentes libros)
// Aunque sean copias del mismo libro físico
```

#### Aggregate Roots (Raíces de Agregado)

Algunos entities son **Aggregate Roots**. Son el punto de entrada para modificar un grupo de entidades relacionadas.

**En nuestro sistema**:
- `Book` es un AR → controla su propio estado (disponible/prestado)
- `User` es un AR → controla sus préstamos y penalizaciones
- `Loan` es una entidad → pero se accede vía User o Book

**Reglas de los AR**:
1. Solo los AR pueden ser recuperados por repositorios
2. Solo los AR emiten eventos de dominio
3. Los AR protegen las invariantes (reglas que SIEMPRE deben cumplirse)

### 2. Value Objects (Objetos de Valor)

Los Value Objects son objetos sin identidad, definidos únicamente por sus atributos.

**Características**:
- **Inmutables**: una vez creados, no cambian
- **Validación en construcción**: si se crea, es válido
- **Comparación por valor**: dos emails con el mismo texto son el mismo email
- Sin identidad: no tienen ID

**Ejemplo: ISBN**

```typescript
// ❌ ANTES (sin Value Object)
function registerBook(isbn: string, title: string) {
  // ¿Quién valida el ISBN? ¿Y si llega inválido?
  if (isbn.length < 10) throw new Error('Invalid ISBN');
  // Validación duplicada en múltiples lugares
}

// ✅ DESPUÉS (con Value Object)
function registerBook(isbn: ISBN, title: string) {
  // El ISBN YA está validado. Imposible que sea inválido.
  // La validación está centralizada en ISBN.create()
}

// Uso
const isbn = ISBN.create('978-0-13-468599-1'); // Valida automáticamente
// Si es inválido, lanza error aquí
// Si pasa, está garantizado que es válido
```

**Cuándo crear un Value Object**:
- ✅ Cuando necesitas validación (email, ISBN, teléfono)
- ✅ Cuando el concepto tiene reglas de negocio (Money con moneda)
- ✅ Cuando quieres expresividad (`Money` vs `number`)
- ❌ Para strings/números simples sin reglas (nombre, apellido)

### 3. Repositories (Interfaces de Puertos)

Los repositorios son **interfaces que el dominio DEFINE** pero **la infraestructura IMPLEMENTA**.

Esto es arquitectura hexagonal pura, mi niño. El dominio dice "necesito guardar libros", pero no dice CÓMO.

**Ejemplo: BookRepository**

```typescript
// src/domain/repositories/book.repository.ts
export interface BookRepository {
  save(book: Book): Promise<void>;
  findById(id: BookId): Promise<Book | null>;
}

// Luego en infraestructura puedes tener:
// - InMemoryBookRepository
// - PostgresBookRepository
// - MongoDbBookRepository
// - RedisBookRepository
// ... ¡lo que quieras!

// Y el dominio NO SABE cuál usas
```

**¿Por qué interfaces y no clases concretas?**

Porque así el dominio **no depende** de la implementación. Puedes:
- Testear con fakes (sin BD real)
- Cambiar de BD sin tocar el dominio
- Tener múltiples implementaciones (in-memory para tests, Postgres para prod)

### 4. Services (Servicios de Dominio)

Los servicios de dominio contienen lógica que:
- Involucra múltiples entidades
- No pertenece claramente a ninguna entidad
- Es parte del dominio pero no encaja en una entidad

**Ejemplo: LoanValidator**

```typescript
// ¿Dónde va la lógica de validar un préstamo?
// - ¿En Book? No, involucra al User también
// - ¿En User? No, involucra al Book también
// - ¿En Loan? No, Loan es el resultado, no puede validarse a sí mismo antes de existir

// Solución: Servicio de Dominio
const validator = new LoanValidator();
const result = validator.validateLoan(user, book);

if (!result.isValid) {
  throw new Error(result.errors.join(', '));
}
```

**Cuándo usar un Servicio de Dominio**:
- ✅ Operación involucra múltiples agregados
- ✅ Lógica no pertenece claramente a una entidad
- ✅ Necesitas reutilizar la lógica en varios casos de uso

**Cuándo NO usarlo**:
- ❌ Si la lógica pertenece a una entidad → métodos en la entidad
- ❌ Si la lógica es orquestación → caso de uso (application layer)
- ❌ Si la lógica es de infraestructura → servicio de infraestructura

### 5. Events (Eventos de Dominio)

Los eventos de dominio capturan **hechos significativos** que han ocurrido en el sistema.

**Características**:
- Siempre en pasado (`BookLoaned`, no `LoanBook`)
- Inmutables (representan algo que YA ocurrió)
- Pueden tener datos del evento
- Emitidos por Aggregate Roots

**Ejemplo: BookLoanedEvent**

```typescript
// Cuando se presta un libro:
const loan = user.borrowBook(book, loanId);

// El User emite el evento
const events = user.pullDomainEvents();
// [BookLoanedEvent { userId: '...', bookId: '...', loanDate: ... }]

// Otros pueden escuchar el evento y reaccionar:
// - Enviar email de confirmación
// - Actualizar estadísticas
// - Notificar a administradores
```

**¿Por qué eventos?**

- Desacopla componentes (quien emite no sabe quién escucha)
- Permite auditoría (historial de qué pasó)
- Facilita integraciones (otros sistemas pueden suscribirse)

### 6. Exceptions (Excepciones de Dominio)

Las excepciones del dominio representan **violaciones de reglas de negocio**.

**Características**:
- Nombres expresivos (no `Error`, sino `UserHasPenaltiesException`)
- Contienen información del problema
- Se lanzan cuando se violan invariantes

**Ejemplo**:

```typescript
// ❌ MALO
throw new Error('User cannot borrow');
// ¿Por qué no puede? ¿Penalizaciones? ¿Límite? ¿No sabemos?

// ✅ BUENO
throw new UserHasPenaltiesException(
  userId.getValue(),
  penalty.endDate
);
// Claro y específico. El que lo captura sabe exactamente qué pasó
```

## Patrones de Dominio en Acción

### Factory Methods

Usamos factory methods para crear entidades con validación.

```typescript
class Book {
  // Constructor privado - no se puede usar directamente
  private constructor(private props: BookProps) {}

  // Factory para crear nuevo libro
  static create(params: {...}): Book {
    // Validaciones
    const book = new Book({...});
    book.addDomainEvent(new BookRegisteredEvent(...));
    return book;
  }

  // Factory para reconstituir desde BD
  static reconstitute(props: BookProps): Book {
    return new Book(props);
    // Sin eventos, porque ya existía
  }
}
```

**¿Por qué?**

- Separas creación nueva vs reconstrucción desde BD
- Controlas cuándo se emiten eventos
- Encapsulas validación

### Encapsulación de Estado

Las entidades protegen su estado con métodos de negocio.

```typescript
class Book {
  // ❌ NO expongas setters genéricos
  // setStatus(status: BookStatus) { ... }

  // ✅ SÍ métodos de negocio expresivos
  markAsBorrowed(): void {
    if (!this.isAvailable()) {
      throw new BookNotAvailableException(this.id);
    }
    this.props.status = BookStatus.BORROWED;
  }

  markAsReturned(): void {
    this.props.status = BookStatus.AVAILABLE;
  }
}
```

**¿Por qué?**

- Los nombres expresan intención del negocio
- La validación está en el método
- Imposible dejar el objeto en estado inconsistente

### Invariantes (Reglas Invariables)

Los AR protegen invariantes: reglas que SIEMPRE deben cumplirse.

**Invariantes en nuestro sistema**:

```typescript
// User: "Un usuario puede tener máximo 3 préstamos activos"
class User {
  borrowBook(book: Book, loanId: LoanId): Loan {
    if (this.activeLoans.length >= 3) {
      throw new UserExceedLoanLimitException(this.id);
    }
    // ... crear loan
  }
}

// Book: "Un libro solo puede estar disponible O prestado, nunca ambos"
class Book {
  markAsBorrowed(): void {
    if (this.status === BookStatus.BORROWED) {
      throw new BookNotAvailableException(this.id);
    }
    this.status = BookStatus.BORROWED;
  }
}
```

Si fuera posible violar estas reglas, el AR no está haciendo su trabajo.

## Lenguaje Ubicuo (Ubiquitous Language)

El dominio usa el **mismo lenguaje que los expertos del negocio**. No traduzcas.

```typescript
// ❌ MALO - Lenguaje técnico
class BookRental {
  processTransaction(request: TransactionRequest) { ... }
}

// ✅ BUENO - Lenguaje del negocio
class Loan {
  borrow(book: Book, user: User) { ... }
  return() { ... }
}
```

Si tu bibliotecario habla de "préstamos", tu código debe hablar de `Loan`, no de `BookRental` o `Transaction`.

## Testing del Dominio

Una de las mayores ventajas: **el dominio se testea SIN dependencias externas**.

```typescript
describe('Book', () => {
  it('should throw when borrowing an already borrowed book', () => {
    // Arrange
    const book = Book.create({
      id: BookId.create('123'),
      isbn: ISBN.create('978-0-13-468599-1'),
      title: 'Clean Architecture',
      author: 'Uncle Bob'
    });

    book.markAsBorrowed();

    // Act & Assert
    expect(() => book.markAsBorrowed())
      .toThrow(BookNotAvailableException);
  });
});
```

**Sin bases de datos. Sin HTTP. Sin nada externo. Solo lógica pura.**

## Errores Comunes

### 1. Poner lógica de aplicación en el dominio

```typescript
// ❌ MALO - El dominio no debe saber de repositorios
class User {
  async borrowBook(bookId: string) {
    const book = await this.bookRepository.findById(bookId);
    // ...
  }
}

// ✅ BUENO - Eso es trabajo del caso de uso
class LoanBookUseCase {
  async execute(command: LoanBookCommand) {
    const book = await this.bookRepository.findById(bookId);
    const loan = user.borrowBook(book, loanId);
    // ...
  }
}
```

### 2. Exponer setters genéricos

```typescript
// ❌ MALO
class Book {
  setStatus(status: BookStatus) {
    this.status = status;
  }
}

// ✅ BUENO
class Book {
  markAsBorrowed(): void { ... }
  markAsReturned(): void { ... }
}
```

### 3. Hacer el dominio dependiente de infraestructura

```typescript
// ❌ MALO
import { PostgresClient } from '../infrastructure/postgres';

class Book {
  async save() {
    await PostgresClient.query(...);
  }
}

// ✅ BUENO - El dominio no sabe de BD
// Los repositorios (en infraestructura) se encargan de eso
```

## Resumen

El dominio es:
- **Puro**: sin dependencias externas
- **Expresivo**: usa lenguaje del negocio
- **Protegido**: los AR protegen invariantes
- **Testeable**: sin mocks ni stubs complicados

Recuerda, mi niño: **si puedes ejecutar tu dominio sin base de datos, sin framework web, sin NADA externo, lo estás haciendo bien**.

¿Te quedó clarito o le damos otra vuelta? 🚀
