# Sistema de Biblioteca - Arquitectura Hexagonal 📚

Bienvenido, mi niño. Este proyecto es tu primera parada en el mundo de la **Arquitectura Hexagonal** (también conocida como Puertos y Adaptadores). Aquí vas a aprender cómo separar la lógica de negocio del resto del sistema de forma que puedas cambiar bases de datos, frameworks o APIs sin tocar el corazón de tu aplicación.

## ¿Qué vas a aprender?

Este sistema de biblioteca es como el puerto de Las Palmas: tiene barcos que llegan (peticiones HTTP), muelles donde atracan (puertos/interfaces) y el centro de la ciudad donde pasa la acción de verdad (el dominio). Todo organizado para que cada cosa esté en su sitio.

### Conceptos clave que dominarás

1. **Dominio** - El corazón del sistema, donde viven las reglas de negocio
2. **Puertos** - Las interfaces que definen cómo hablar con el dominio
3. **Adaptadores** - Las implementaciones concretas (bases de datos, REST, etc.)
4. **Value Objects** - Objetos inmutables definidos por sus valores
5. **Aggregate Roots** - Entidades que protegen la consistencia
6. **Servicios de Dominio** - Lógica que involucra múltiples entidades

## Funcionalidades del Sistema

Este sistema de biblioteca permite:

- **Registrar libros** con validación automática de ISBN (¡no se te cuela un ISBN inválido!)
- **Registrar usuarios** con emails validados
- **Prestar libros** con reglas de negocio:
  - Máximo 3 préstamos activos por usuario
  - Los usuarios con penalizaciones no pueden pedir prestado
  - Cálculo automático de penalizaciones por devoluciones tardías (50 céntimos por día)

## Arquitectura - La Cebolla 🧅

Imagínate que el sistema es como una cebolla con capas. El centro (el dominio) no sabe NADA de las capas externas. Las capas externas SÍ conocen al dominio.

```
┌─────────────────────────────────────────────────────┐
│         INFRAESTRUCTURA (Adaptadores)               │
│  ┌───────────────────────────────────────────────┐  │
│  │      APLICACIÓN (Casos de Uso)                │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │         DOMINIO (Reglas de Negocio)     │  │  │
│  │  │   • Entidades (Book, User, Loan)        │  │  │
│  │  │   • Value Objects (ISBN, Email, Money)  │  │  │
│  │  │   • Servicios de Dominio                │  │  │
│  │  │   • Interfaces de Repositorios          │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │                                                 │  │
│  │   Casos de Uso:                                │  │
│  │   • LoanBookUseCase                            │  │
│  │   • RegisterBookUseCase                        │  │
│  │   • ReturnBookUseCase                          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│   Adaptadores:                                        │
│   • REST Controllers (Express)                        │
│   • InMemoryBookRepository                            │
│   • PostgresBookRepository                            │
└────────────────────────────────────────────────────────┘
```

### ¿Por qué esta estructura, Profe?

Buena pregunta, mi niño. Mira tú:

1. **El dominio no depende de NADA** - Puedes testearlo sin base de datos, sin Express, sin nada externo
2. **Los adaptadores son intercambiables** - Hoy usas PostgreSQL, mañana MongoDB. Solo cambias el adaptador
3. **Los casos de uso son claros** - Cada uno hace una cosa y la hace bien
4. **El testing es fetén** - Puedes testear el dominio aislado con fakes

## Estructura de Carpetas

```
src/
├── domain/                           # 🎯 EL NÚCLEO - Aquí vive la chicha
│   ├── entities/                     # Las entidades del negocio
│   │   ├── book.ts                   # 📖 Libro (Aggregate Root)
│   │   ├── user.ts                   # 👤 Usuario (Aggregate Root)
│   │   ├── loan.ts                   # 📝 Préstamo
│   │   └── penalty.ts                # 💰 Penalización
│   │
│   ├── value-objects/                # Valores inmutables
│   │   ├── isbn.ts                   # ISBN con validación automática
│   │   ├── email.ts                  # Email validado
│   │   ├── money.ts                  # Dinero (cantidad + moneda)
│   │   └── date-range.ts             # Rango de fechas para préstamos
│   │
│   ├── repositories/                 # 🔌 PUERTOS - Interfaces que el dominio necesita
│   │   ├── book.repository.ts
│   │   ├── user.repository.ts
│   │   └── loan.repository.ts
│   │
│   ├── services/                     # Servicios de dominio
│   │   ├── loan-validator.ts         # Valida si un préstamo es posible
│   │   ├── penalty-calculator.ts     # Calcula penalizaciones
│   │   └── id-generator.ts           # Puerto para generar IDs
│   │
│   ├── events/                       # Eventos de dominio
│   │   ├── book-loaned.event.ts
│   │   ├── book-returned.event.ts
│   │   └── penalty-applied.event.ts
│   │
│   └── exceptions/                   # Excepciones del dominio
│       ├── book-not-available.exception.ts
│       ├── user-has-penalties.exception.ts
│       └── user-exceed-loan-limit.exception.ts
│
├── application/                      # 🎬 CASOS DE USO - La orquestación
│   ├── use-cases/
│   │   ├── register-book.use-case.ts        # Registrar un libro
│   │   ├── register-user.use-case.ts        # Registrar un usuario
│   │   ├── loan-book.use-case.ts            # Prestar un libro
│   │   ├── return-book.use-case.ts          # Devolver un libro
│   │   ├── get-available-books.use-case.ts  # Listar libros disponibles
│   │   └── get-user-loans.use-case.ts       # Obtener préstamos de un usuario
│   │
│   └── dtos/                         # Objetos de transferencia
│       ├── book.dto.ts
│       ├── user.dto.ts
│       └── loan.dto.ts
│
└── infrastructure/                   # 🔧 ADAPTADORES - Las implementaciones
    ├── controllers/rest/             # Adaptadores de entrada (REST)
    │   ├── book.controller.ts
    │   ├── user.controller.ts
    │   └── loan.controller.ts
    │
    ├── persistence/                  # Adaptadores de salida (BD)
    │   ├── in-memory/                # Para desarrollo y testing
    │   │   ├── in-memory-book.repository.ts
    │   │   ├── in-memory-user.repository.ts
    │   │   ├── in-memory-loan.repository.ts
    │   │   └── uuid-id-generator.ts
    │   │
    │   └── postgresql/               # Para producción
    │       ├── pg-book.repository.ts
    │       ├── pg-user.repository.ts
    │       └── pg-loan.repository.ts
    │
    └── bootstrap/                    # Configuración e inyección de dependencias
        ├── container.ts              # Contenedor DI
        └── server.ts                 # Configuración del servidor Express
```

## Flujo de una Petición - Paso a Paso

Vamos a ver qué pasa cuando un usuario quiere prestar un libro. Tranqui papas, que lo vemos despacito.

### Ejemplo: POST /loans

```
1. 🌐 PETICIÓN HTTP
   └─> POST /loans
       Body: { userId: "abc", bookId: "xyz" }

2. 🎯 ADAPTADOR (Controller)
   └─> LoanController.createLoan()
       • Recibe la petición HTTP
       • Extrae los datos del body
       • Llama al caso de uso

3. 🎬 CASO DE USO
   └─> LoanBookUseCase.execute()
       • Busca el usuario (vía UserRepository)
       • Busca el libro (vía BookRepository)
       • Crea el préstamo
       • Guarda los cambios
       • Retorna un DTO

4. 💎 DOMINIO
   └─> User.borrowBook(book, loanId)
       • Valida reglas de negocio:
         ✓ ¿El usuario tiene penalizaciones?
         ✓ ¿Ha llegado al límite de préstamos?
         ✓ ¿El libro está disponible?
       • Crea el Loan
       • Marca el libro como prestado
       • Emite evento BookLoanedEvent

5. 💾 PERSISTENCIA (Repository)
   └─> BookRepository.save(book)
   └─> LoanRepository.save(loan)
   └─> UserRepository.save(user)

6. 🌐 RESPUESTA HTTP
   └─> 201 Created
       Body: { id: "loan-123", userId: "abc", bookId: "xyz", ... }
```

## Conceptos Clave Explicados

### 1. Value Objects

Los Value Objects son como las papas arrugadas: se definen por lo que son (sus ingredientes), no por su identidad. Dos emails con el mismo valor son el mismo email.

**Ejemplo: ISBN**

```typescript
// ❌ MALO - String simple sin validación
const isbn = "978-0-13-468599-1";
// Nada te impide meter un ISBN inválido

// ✅ BUENO - Value Object con validación
const isbn = ISBN.create("978-0-13-468599-1");
// Si el ISBN es inválido, lanza error
// Imposible tener un ISBN inválido en el sistema
```

**Características**:
- Inmutables (no se pueden cambiar)
- Validación en el constructor
- Comparación por valor, no por referencia
- No tienen identidad propia

### 2. Aggregate Roots (Raíces de Agregado)

Los Aggregate Roots son las entidades principales que protegen la consistencia. Son como el capitán del barco: todo pasa por ellos.

**Ejemplo: Book**

```typescript
// ❌ MALO - Modificar directamente
book.status = BookStatus.BORROWED;
// ¿Quién valida que el libro está disponible?

// ✅ BUENO - Método del aggregate que protege las reglas
book.markAsBorrowed();
// Valida internamente que el libro está disponible
// Si no lo está, lanza BookNotAvailableException
```

**Características**:
- Tienen identidad (BookId, UserId)
- Protegen invariantes del negocio
- Son el punto de entrada para operaciones
- Emiten eventos de dominio

### 3. Repositorios (Puertos)

Los repositorios son interfaces que el dominio DEFINE, pero que la infraestructura IMPLEMENTA. Es como decir "necesito guardar libros" sin especificar cómo.

**En el Dominio** (src/domain/repositories/book.repository.ts):
```typescript
export interface BookRepository {
  save(book: Book): Promise<void>;
  findById(id: BookId): Promise<Book | null>;
  findByIsbn(isbn: ISBN): Promise<Book | null>;
}
```

**En la Infraestructura** (src/infrastructure/persistence/...):
```typescript
// Implementación en memoria
class InMemoryBookRepository implements BookRepository { ... }

// Implementación en PostgreSQL
class PgBookRepository implements BookRepository { ... }

// ¡El dominio no sabe cuál usas!
```

### 4. Servicios de Dominio

Cuando una operación involucra múltiples entidades o no pertenece claramente a una, usamos un servicio de dominio.

**Ejemplo: LoanValidator**

```typescript
// Este servicio valida si un préstamo es posible
// Involucra User y Book, así que no va en ninguno de los dos
const validator = new LoanValidator();
const result = validator.validateLoan(user, book);

if (!result.isValid) {
  console.log(result.errors);
  // ["User has active penalties", "Book is not available"]
}
```

### 5. Casos de Uso (Application Layer)

Los casos de uso orquestan las operaciones del dominio. Son como el director de orquesta: coordinan, pero no tocan los instrumentos.

**Características**:
- Un caso de uso = una acción del usuario
- Orquestan llamadas al dominio
- No tienen lógica de negocio (esa va en el dominio)
- Usan repositorios para cargar/guardar
- Retornan DTOs

## Instalación y Uso

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar en modo desarrollo

```bash
npm run dev
```

El servidor arranca en `http://localhost:3000`

### 3. Ejecutar tests

```bash
# Todos los tests
npm test

# En modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

### 4. Compilar para producción

```bash
npm run build
npm start
```

## Ejemplos de Uso de la API

### Registrar un Libro

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0-13-468599-1",
    "title": "Clean Architecture",
    "author": "Robert C. Martin"
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "id": "book-abc-123",
    "isbn": "978-0-13-468599-1",
    "title": "Clean Architecture",
    "author": "Robert C. Martin",
    "status": "AVAILABLE"
  }
}
```

### Registrar un Usuario

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }'
```

### Prestar un Libro

```bash
curl -X POST http://localhost:3000/loans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-abc-123",
    "bookId": "book-xyz-456"
  }'
```

### Devolver un Libro

```bash
curl -X POST http://localhost:3000/loans/loan-123/return \
  -H "Content-Type: application/json"
```

## Testing - La Clave del Hexágono

Una de las mayores ventajas de la arquitectura hexagonal es lo fácil que es testear. Veamos por qué.

### Testing del Dominio (Unit Tests)

El dominio se testea SIN bases de datos, SIN HTTP, SIN nada externo. Solo lógica pura.

```typescript
// tests/unit/domain/entities/book.test.ts
describe('Book', () => {
  it('should not allow borrowing when already borrowed', () => {
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

### Testing de Casos de Uso (Integration Tests con Fakes)

Los casos de uso se testean con repositorios falsos (in-memory).

```typescript
// tests/unit/application/loan-book.test.ts
describe('LoanBookUseCase', () => {
  it('should create a loan when conditions are met', async () => {
    // Arrange
    const userRepo = new InMemoryUserRepository();
    const bookRepo = new InMemoryBookRepository();
    const loanRepo = new InMemoryLoanRepository();
    const idGenerator = new FakeIdGenerator();

    const useCase = new LoanBookUseCase(
      userRepo, bookRepo, loanRepo, idGenerator
    );

    // Preparar datos de test...

    // Act
    const loan = await useCase.execute({ userId: '...', bookId: '...' });

    // Assert
    expect(loan.status).toBe('ACTIVE');
  });
});
```

### Testing de Adaptadores (Integration Tests)

Los adaptadores se testean de forma aislada o con integración real.

```typescript
// tests/integration/infrastructure/pg-book.repository.test.ts
describe('PgBookRepository', () => {
  it('should save and retrieve a book', async () => {
    const repo = new PgBookRepository(pool);
    const book = Book.create({ ... });

    await repo.save(book);
    const retrieved = await repo.findById(book.id);

    expect(retrieved).toBeDefined();
    expect(retrieved!.title).toBe(book.title);
  });
});
```

## Ejercicios Propuestos

Ahora que ya has visto cómo funciona, aquí tienes unos ejercicios pa' practicar:

### Nivel 1 - Básico

1. **Añadir una nueva regla de negocio**: Los libros de más de 500 páginas solo se pueden prestar por 14 días (no 21)
   - Pista: Añade el campo `pages` a Book
   - Pista 2: Modifica el método que calcula la fecha de devolución

2. **Crear un nuevo caso de uso**: `RenewLoanUseCase` que extienda el préstamo 7 días más
   - Solo si el libro no tiene reservas
   - Solo si no se ha renovado ya una vez

### Nivel 2 - Intermedio

3. **Añadir sistema de reservas**: Los usuarios pueden reservar libros prestados
   - Crear entidad `Reservation`
   - Cuando se devuelva el libro, notificar al primer usuario de la cola

4. **Implementar un adaptador nuevo**: Crear `MongoDbBookRepository`
   - Implementa la interfaz `BookRepository`
   - Usa MongoDB en lugar de PostgreSQL

### Nivel 3 - Avanzado

5. **Event Sourcing parcial**: Guardar historial de eventos de préstamos
   - Cada préstamo genera eventos
   - Poder reconstruir el estado desde eventos

6. **Añadir un nuevo adaptador de entrada**: Crear `BookCLIController`
   - Interfaz de línea de comandos
   - Usa los mismos casos de uso que el REST controller

## Diagrama de Flujo Completo

Este diagrama muestra cómo fluye una petición desde HTTP hasta la base de datos:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  POST /books { "isbn": "978-...", "title": "Clean Architecture", ... } │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CONTROLLER (Adaptador Primario)                                        │
│  ├── Recibe HTTP Request                                                │
│  ├── Crea RegisterBookCommand (DTO)                                     │
│  └── Llama al UseCase                                                   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  USE CASE (Aplicación)                                                   │
│  ├── Recibe Command (DTO primitivos)                                    │
│  ├── Crea Value Objects: ISBN.create("978-...")                         │
│  ├── Crea Entidad: Book.create({...})                                   │
│  ├── Llama al Repository (INTERFACE)                                    │
│  └── Retorna BookResponse (DTO)                                         │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  REPOSITORY INTERFACE (Puerto en Dominio)                               │
│  └── save(book: Book): Promise<void>                                    │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │           implements        │
                    ▼                             ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐
│  InMemoryBookRepository       │  │  PostgresBookRepository       │
│  (Para testing/desarrollo)    │  │  (Para producción)            │
│                               │  │                               │
│  Map.set(id, book)            │  │  INSERT INTO books VALUES...  │
└───────────────────────────────┘  └───────────────────────────────┘
```

### Inversión de Dependencias (La Clave)

```
SIN INVERSIÓN (mal)                CON INVERSIÓN (bien)
──────────────────────             ──────────────────────

UseCase                            UseCase
    │                                  │
    │ depende de ↓                     │ depende de ↓
    ▼                                  ▼
PostgresRepository                 BookRepository (INTERFACE)
                                       ▲
                                       │ implementa
                                       │
                                   PostgresRepository

El dominio DEFINE qué necesita (interface)
La infraestructura IMPLEMENTA cómo lo hace
```

---

## Recursos Adicionales

### Lecturas Recomendadas

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) - Artículo original de Alistair Cockburn
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/) - El libro azul de Eric Evans
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Uncle Bob sobre arquitectura limpia

## Preguntas Frecuentes

### ¿Por qué tanta complejidad para un sistema tan simple?

Buena pregunta, mi niño. Este ejemplo es simple PARA QUE APRENDAS. En un sistema real con decenas de entidades, cientos de reglas de negocio y múltiples equipos trabajando, esta separación te salva la vida.

### ¿Siempre hay que usar hexagonal?

No, no te dejes enredar. Si estás haciendo un CRUD simple que solo inserta y lee datos, igual no lo necesitas. Pero si tienes lógica de negocio compleja (como este sistema de préstamos con penalizaciones, límites, validaciones), entonces sí vale la pena.

### ¿Qué diferencia hay entre Hexagonal, Clean y Onion?

Todas son primas hermanas, mi niño:
- **Hexagonal** (Cockburn) enfatiza puertos y adaptadores
- **Clean** (Uncle Bob) enfatiza las capas concéntricas
- **Onion** (Palermo) enfatiza las dependencias apuntando hacia dentro

Al final, todas buscan lo mismo: **separar el dominio de los detalles técnicos**.

### ¿Cómo sé dónde poner cada cosa?

Regla de oro: "¿Esta lógica existiría aunque cambiara la base de datos o el framework?"
- Si SÍ → va en el dominio
- Si NO → va en infraestructura

## Siguiente Paso

Una vez domines este proyecto, estás listo para:

→ **[Vertical Slicing Tasks](../../slicing/vertical-slicing-tasks)** - Organización por features en lugar de capas

### Otros proyectos avanzados

- **[Event-Driven Orders](../../ddd/event-driven-orders)** - Arquitectura dirigida por eventos

---

Venga, mi niño, a darle caña que esto se aprende haciendo. Cualquier duda, revisa el código que está to' comentado pa' que lo entiendas bien.

¡Que lo disfrutes!
