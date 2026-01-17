# Guía Pedagógica: El Patrón Repository 📚

¡Buenas, mi niño! Aquí estás en una de las piezas más importantes de la arquitectura hexagonal: **el patrón Repository**. Esta guía te va a explicar TODO lo que necesitas saber sobre repositories, desde qué son hasta cómo testearlos. Tranqui papas, que lo vemos despacito.

## Tabla de Contenidos

1. [¿Qué es el patrón Repository?](#qué-es-el-patrón-repository)
2. [Puerto vs Adaptador: La clave](#puerto-vs-adaptador-la-clave)
3. [DTOs vs Entidades de Dominio](#dtos-vs-entidades-de-dominio)
4. [El flujo completo: Controller → UseCase → Repository → BD](#el-flujo-completo)
5. [Implementaciones: InMemory vs PostgreSQL vs Fake](#implementaciones)
6. [Mapping entre capas](#mapping-entre-capas)
7. [Errores comunes](#errores-comunes)
8. [Testing con Repositories](#testing-con-repositories)
9. [Preguntas frecuentes](#preguntas-frecuentes)

---

## ¿Qué es el patrón Repository?

El patrón Repository es como una **abstracción de colección** que encapsula el acceso a datos. Imagínalo como si tuvieras una biblioteca donde guardas libros, pero no necesitas saber si los libros están en un estante de madera, en cajas o en el almacén. Solo sabes que puedes pedir un libro y te lo traen.

### Definición formal

> El patrón Repository **media entre el dominio y las capas de mapeo de datos** (como una base de datos) usando una interfaz similar a una colección para acceder a objetos del dominio.
>
> — Martin Fowler, *Patterns of Enterprise Application Architecture*

### Definición del Profe Millo (más clarita)

El Repository es como el **bibliotecario** del sistema:
- **Tú le pides**: "Dame el libro con ID 123"
- **Él se encarga**: de buscarlo en la base de datos (o donde esté guardado)
- **Te lo devuelve**: como una entidad de dominio lista para usar
- **Tú no sabes**: si lo sacó de PostgreSQL, MongoDB, un archivo o su memoria

```
┌─────────────────────────────────────────────────────────┐
│  "Dame el libro con ISBN 978-0-13-468599-1"             │
│                                                          │
│  UseCase                                                 │
│     │                                                    │
│     │ findByIsbn(isbn)                                  │
│     ▼                                                    │
│  ┌──────────────────────────────┐                       │
│  │  BookRepository (PUERTO)     │  ← Interface definida │
│  │  - findByIsbn(isbn)          │    por el DOMINIO     │
│  └──────────┬───────────────────┘                       │
│             │                                            │
│             │ implements                                 │
│             │                                            │
│  ┌──────────▼───────────────────┐                       │
│  │ PostgresBookRepository       │  ← Implementación     │
│  │ (ADAPTADOR)                  │    en INFRAESTRUCTURA │
│  │                              │                       │
│  │ 1. Ejecuta SQL               │                       │
│  │ 2. Mapea row → Book          │                       │
│  │ 3. Retorna Book              │                       │
│  └──────────┬───────────────────┘                       │
│             │                                            │
│             ▼                                            │
│    PostgreSQL Database                                  │
│    books table                                          │
└─────────────────────────────────────────────────────────┘
```

### ¿Por qué existe el patrón Repository?

Mira tú, sin el patrón Repository tendrías esto:

```typescript
// ❌ SIN Repository - Código acoplado a la BD
class LoanBookUseCase {
  async execute(command: LoanBookCommand) {
    // Consultando directamente a la BD desde el caso de uso
    const userRow = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [command.userId]
    );

    // Mapeando manualmente
    const user = new User(
      userRow.id,
      userRow.name,
      userRow.email,
      // ... mapeo tedioso
    );

    // Lógica de negocio mezclada con SQL
    if (userRow.active_loans >= 3) {
      throw new Error('Too many loans');
    }

    // Más SQL...
    const bookRow = await db.query(
      'SELECT * FROM books WHERE id = $1',
      [command.bookId]
    );

    // ... esto se pone feo rápido
  }
}
```

**Problemas**:
1. El caso de uso sabe de SQL → acoplamiento
2. Difícil de testear → necesitas BD real
3. Lógica de negocio mezclada con acceso a datos
4. Si cambias de BD, tocas todos los casos de uso

**Con el patrón Repository**:

```typescript
// ✅ CON Repository - Código limpio y desacoplado
class LoanBookUseCase {
  constructor(
    private readonly userRepository: UserRepository,  // Interface
    private readonly bookRepository: BookRepository   // Interface
  ) {}

  async execute(command: LoanBookCommand) {
    // Limpio y expresivo
    const user = await this.userRepository.findById(
      UserId.create(command.userId)
    );

    const book = await this.bookRepository.findById(
      BookId.create(command.bookId)
    );

    // La lógica de negocio está en el dominio
    const loan = user.borrowBook(book, loanId);

    // Guardar
    await this.loanRepository.save(loan);
  }
}
```

**Ventajas**:
1. ✅ El caso de uso NO sabe de SQL
2. ✅ Fácil de testear con fakes
3. ✅ Lógica de negocio separada
4. ✅ Cambiar de BD = solo cambiar el adaptador

---

## Puerto vs Adaptador: La clave

Esta es la parte MÁS IMPORTANTE para entender la arquitectura hexagonal, mi niño. Presta atención.

### ¿Qué es un Puerto?

Un **puerto** es una **interfaz** que el dominio DEFINE. Es como decir:

> "Necesito poder guardar y buscar libros. No me importa cómo, pero necesito estos métodos."

El puerto vive en el **dominio** (src/domain/repositories/):

```typescript
// src/domain/repositories/book.repository.ts

/**
 * PUERTO (Port)
 *
 * Esta es la interfaz que el DOMINIO define.
 * El dominio dice: "Necesito estas operaciones para trabajar con libros."
 */
export interface BookRepository {
  /**
   * Guardar un libro (crear o actualizar)
   * @param book - La entidad de dominio Book
   */
  save(book: Book): Promise<void>;

  /**
   * Buscar un libro por su ID
   * @param id - BookId (Value Object)
   * @returns Book o null si no existe
   */
  findById(id: BookId): Promise<Book | null>;

  /**
   * Buscar un libro por ISBN
   * @param isbn - ISBN (Value Object)
   * @returns Book o null si no existe
   */
  findByIsbn(isbn: ISBN): Promise<Book | null>;

  /**
   * Obtener todos los libros disponibles
   * @returns Array de Books con status AVAILABLE
   */
  findAvailable(): Promise<Book[]>;

  /**
   * Obtener todos los libros
   */
  findAll(): Promise<Book[]>;
}
```

**Características del Puerto**:
- ✅ Es una **interface** (TypeScript) o clase abstracta
- ✅ Vive en el **dominio** (src/domain/repositories/)
- ✅ Usa **tipos del dominio** (Book, BookId, ISBN)
- ✅ **No sabe NADA** de implementación (SQL, MongoDB, etc.)
- ✅ Define el **contrato**: "estos son los métodos que necesito"

### ¿Qué es un Adaptador?

Un **adaptador** es una **clase concreta** que IMPLEMENTA el puerto. Es como decir:

> "Vale, tú necesitas guardar y buscar libros. Yo te lo hago con PostgreSQL."

El adaptador vive en **infraestructura** (src/infrastructure/persistence/):

```typescript
// src/infrastructure/persistence/postgresql/pg-book.repository.ts

import { Pool } from 'pg';
import { BookRepository, Book, BookId, ISBN } from '../../../domain';

/**
 * ADAPTADOR (Adapter)
 *
 * Esta es la implementación CONCRETA del puerto.
 * Implementa BookRepository usando PostgreSQL.
 */
export class PostgresBookRepository implements BookRepository {
  constructor(
    private readonly pool: Pool  // Cliente de PostgreSQL
  ) {}

  async save(book: Book): Promise<void> {
    // AQUÍ está el SQL (detalle de implementación)
    const query = `
      INSERT INTO books (id, isbn, title, author, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        status = EXCLUDED.status
    `;

    // Convertimos la entidad de dominio a formato BD
    await this.pool.query(query, [
      book.id.getValue(),        // BookId → string
      book.isbn.getValue(),      // ISBN → string
      book.title,                // string
      book.author,               // string
      book.status,               // BookStatus enum
      book.createdAt,            // Date
    ]);
  }

  async findById(id: BookId): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE id = $1';
    const result = await this.pool.query(query, [id.getValue()]);

    if (result.rows.length === 0) {
      return null;
    }

    // Convertimos row de BD a entidad de dominio
    return this.mapRowToBook(result.rows[0]);
  }

  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE isbn = $1';
    const result = await this.pool.query(query, [isbn.getValue()]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToBook(result.rows[0]);
  }

  async findAvailable(): Promise<Book[]> {
    const query = `
      SELECT * FROM books
      WHERE status = 'AVAILABLE'
      ORDER BY title
    `;
    const result = await this.pool.query(query);

    return result.rows.map(row => this.mapRowToBook(row));
  }

  async findAll(): Promise<Book[]> {
    const query = 'SELECT * FROM books ORDER BY title';
    const result = await this.pool.query(query);

    return result.rows.map(row => this.mapRowToBook(row));
  }

  /**
   * MAPPING: Row de BD → Entidad de Dominio
   *
   * Este método convierte un row de PostgreSQL a una entidad Book.
   * IMPORTANTE: Usamos Book.reconstitute() en lugar de Book.create()
   * porque el libro ya existía (no queremos emitir eventos de creación).
   */
  private mapRowToBook(row: any): Book {
    return Book.reconstitute({
      id: BookId.create(row.id),           // string → BookId
      isbn: ISBN.create(row.isbn),         // string → ISBN
      title: row.title,                     // string
      author: row.author,                   // string
      status: row.status as BookStatus,     // string → enum
      createdAt: new Date(row.created_at),  // timestamp → Date
    });
  }
}
```

**Características del Adaptador**:
- ✅ Es una **clase concreta** que implementa la interface
- ✅ Vive en **infraestructura** (src/infrastructure/persistence/)
- ✅ Conoce los **detalles técnicos** (SQL, Pool, queries)
- ✅ Hace el **mapping** entre BD y dominio
- ✅ Es **intercambiable**: puedes tener PostgresBookRepository, MongoBookRepository, InMemoryBookRepository

### Inversión de Dependencias (Dependency Inversion)

Esto es lo que hace que la arquitectura hexagonal sea tan poderosa, mi niño:

```
ANTES (sin inversión)                   DESPUÉS (con inversión)
───────────────────────────             ─────────────────────────────

Dominio                                 Dominio
  │                                       │
  │ depende de ↓                          │ define ↓
  ▼                                       ▼
Infraestructura                         BookRepository (interface)
PostgresBookRepository                    ▲
                                          │ implementa
                                          │
                                        Infraestructura
                                        PostgresBookRepository
```

**SIN inversión**:
- El dominio importa `PostgresBookRepository`
- Si cambias de BD, tocas el dominio
- Difícil de testear

**CON inversión**:
- El dominio define `BookRepository` (interface)
- La infraestructura implementa la interface
- El dominio NO conoce la implementación
- Fácil cambiar: solo cambias qué clase usas
- Fácil testear: inyectas un fake

### Ejemplo de uso con Inyección de Dependencias

Mira cómo se conecta todo en el Composition Root (bootstrap/container.ts):

```typescript
// infrastructure/bootstrap/container.ts

class Container {
  private bookRepository: BookRepository;

  constructor() {
    this.setupRepositories();
  }

  private setupRepositories(): void {
    // Aquí decides QUÉ implementación usar
    const useInMemory = process.env.USE_IN_MEMORY === 'true';

    if (useInMemory) {
      // En desarrollo o tests
      this.bookRepository = new InMemoryBookRepository();
    } else {
      // En producción
      const pool = createPgPool();
      this.bookRepository = new PostgresBookRepository(pool);
    }

    // Nota: El tipo es BookRepository (interface),
    // pero la instancia puede ser cualquier implementación
  }

  getBookRepository(): BookRepository {
    return this.bookRepository;
  }
}
```

Y en el caso de uso:

```typescript
// application/use-cases/register-book.use-case.ts

class RegisterBookUseCase {
  constructor(
    // Inyectamos la INTERFACE, no la implementación
    private readonly bookRepository: BookRepository
  ) {}

  async execute(command: RegisterBookCommand): Promise<BookResponse> {
    // Creamos el libro (entidad de dominio)
    const book = Book.create({
      id: BookId.create(this.idGenerator.generate()),
      isbn: ISBN.create(command.isbn),
      title: command.title,
      author: command.author,
    });

    // Guardamos usando el repository
    // ¡No sabemos si es PostgreSQL o InMemory!
    await this.bookRepository.save(book);

    // Retornamos un DTO
    return this.toResponse(book);
  }
}
```

**¿Ves la magia?** El caso de uso NO SABE qué implementación de repository está usando. Podría ser PostgreSQL, MongoDB, un archivo, memoria... ¡da igual!

---

## DTOs vs Entidades de Dominio

Esta es otra confusión típica, mi niño. Vamos a aclararlo de una vez.

### ¿Qué es una Entidad de Dominio?

Una **entidad de dominio** es un objeto con:
- **Identidad** (BookId, UserId)
- **Lógica de negocio** (métodos que validan y transforman)
- **Estado protegido** (no se puede modificar arbitrariamente)
- **Value Objects** (ISBN, Email, Money)

```typescript
// domain/entities/book.ts

/**
 * ENTIDAD DE DOMINIO
 *
 * - Tiene identidad (BookId)
 * - Tiene lógica de negocio
 * - Protege sus invariantes
 * - Usa Value Objects
 */
export class Book {
  private constructor(private props: BookProps) {
    // Props privadas, solo accesibles vía getters
  }

  // Factory method para crear nuevo libro
  static create(params: CreateBookParams): Book {
    // Validaciones
    if (params.title.length < 3) {
      throw new InvalidBookTitleException();
    }

    const book = new Book({
      id: params.id,
      isbn: params.isbn,
      title: params.title,
      author: params.author,
      status: BookStatus.AVAILABLE,
      createdAt: new Date(),
    });

    // Emitir evento de dominio
    book.addDomainEvent(new BookRegisteredEvent(book.id, book.isbn));

    return book;
  }

  // Factory method para reconstituir desde BD
  static reconstitute(props: BookProps): Book {
    return new Book(props);
    // Sin eventos, porque ya existía
  }

  // Getters públicos
  get id(): BookId {
    return this.props.id;
  }

  get isbn(): ISBN {
    return this.props.isbn;
  }

  get title(): string {
    return this.props.title;
  }

  get status(): BookStatus {
    return this.props.status;
  }

  // Métodos de negocio (no setters genéricos)
  markAsBorrowed(): void {
    if (!this.isAvailable()) {
      throw new BookNotAvailableException(this.id);
    }
    this.props.status = BookStatus.BORROWED;
  }

  markAsReturned(): void {
    this.props.status = BookStatus.AVAILABLE;
  }

  isAvailable(): boolean {
    return this.props.status === BookStatus.AVAILABLE;
  }
}
```

### ¿Qué es un DTO (Data Transfer Object)?

Un **DTO** es un objeto plano que:
- **NO tiene identidad** (es solo datos)
- **NO tiene lógica** (sin métodos de negocio)
- **Transporta datos** entre capas
- Usa **tipos primitivos** (string, number, boolean)

```typescript
// application/dtos/book.dto.ts

/**
 * DTOs PARA BOOK
 *
 * Son objetos planos que cruzan las capas de la aplicación.
 * NO tienen comportamiento, solo datos.
 */

/**
 * COMMAND - Input para crear un libro
 *
 * Viene del controller (HTTP request body)
 * Va hacia el caso de uso
 */
export interface RegisterBookCommand {
  isbn: string;      // primitivo
  title: string;     // primitivo
  author: string;    // primitivo
}

/**
 * RESPONSE - Output del caso de uso
 *
 * Sale del caso de uso
 * Va hacia el controller (HTTP response body)
 */
export interface BookResponse {
  id: string;           // BookId → string
  isbn: string;         // ISBN → string
  title: string;        // string
  author: string;       // string
  status: string;       // BookStatus → string
  createdAt: string;    // Date → ISO string
}
```

### Diferencias clave

| Aspecto | Entidad de Dominio | DTO |
|---------|-------------------|-----|
| **Identidad** | ✅ Sí (BookId) | ❌ No |
| **Lógica de negocio** | ✅ Sí (métodos) | ❌ No |
| **Validación** | ✅ En constructor | ❌ Opcional en controller |
| **Tipos** | Value Objects (ISBN, Email) | Primitivos (string, number) |
| **Mutabilidad** | Encapsulada (métodos) | Puede ser mutable |
| **Dónde vive** | domain/ | application/dtos/ |
| **Propósito** | Modelar el negocio | Transportar datos |

### ¿Cuándo usar cada uno?

```typescript
// ❌ MALO - Exponer entidad de dominio directamente
export class BookController {
  async registerBook(req: Request, res: Response) {
    const book = await this.registerBookUseCase.execute(req.body);

    // ¡NO hagas esto!
    res.json(book);
    // Problemas:
    // 1. Expones métodos del dominio (markAsBorrowed, etc.)
    // 2. El JSON puede tener estructuras raras (Value Objects)
    // 3. Si cambias el dominio, rompes la API
  }
}

// ✅ BUENO - Usar DTOs para input/output
export class BookController {
  async registerBook(req: Request, res: Response) {
    // 1. Extraer DTO del request
    const command: RegisterBookCommand = {
      isbn: req.body.isbn,
      title: req.body.title,
      author: req.body.author,
    };

    // 2. Caso de uso trabaja con dominio internamente
    //    pero retorna un DTO
    const bookDTO: BookResponse = await this.registerBookUseCase.execute(command);

    // 3. Responder con el DTO
    res.status(201).json({
      success: true,
      data: bookDTO  // Solo datos primitivos
    });
  }
}
```

### Transformación: Entidad ↔ DTO

En el caso de uso, transformas entre entidades y DTOs:

```typescript
// application/use-cases/register-book.use-case.ts

export class RegisterBookUseCase {
  async execute(command: RegisterBookCommand): Promise<BookResponse> {
    // 1. Command (DTO) → Entidad de dominio
    const book = Book.create({
      id: BookId.create(this.idGenerator.generate()),
      isbn: ISBN.create(command.isbn),      // string → ISBN
      title: command.title,
      author: command.author,
    });

    // 2. Persistir la entidad
    await this.bookRepository.save(book);

    // 3. Entidad de dominio → Response (DTO)
    return this.toResponse(book);
  }

  /**
   * Convertir entidad de dominio a DTO
   */
  private toResponse(book: Book): BookResponse {
    return {
      id: book.id.getValue(),           // BookId → string
      isbn: book.isbn.getValue(),       // ISBN → string
      title: book.title,                 // string (sin cambios)
      author: book.author,               // string (sin cambios)
      status: book.status,               // enum → string
      createdAt: book.createdAt.toISOString(),  // Date → ISO string
    };
  }
}
```

---

## El flujo completo

Vamos a ver el flujo completo de una petición HTTP, paso por paso, siguiendo todos los tipos de datos.

### Escenario: Registrar un libro

```
POST /books
Content-Type: application/json

{
  "isbn": "978-0-13-468599-1",
  "title": "Clean Architecture",
  "author": "Robert C. Martin"
}
```

### Paso 1: Controller recibe HTTP Request

```typescript
// infrastructure/controllers/rest/book.controller.ts

export class BookController {
  constructor(
    private readonly registerBookUseCase: RegisterBookUseCase
  ) {}

  async registerBook(req: Request, res: Response): Promise<void> {
    try {
      // ENTRADA: HTTP Request Body (JSON)
      // {
      //   isbn: "978-0-13-468599-1",
      //   title: "Clean Architecture",
      //   author: "Robert C. Martin"
      // }

      // TRANSFORMACIÓN 1: HTTP Body → Command (DTO)
      const command: RegisterBookCommand = {
        isbn: req.body.isbn,      // string
        title: req.body.title,    // string
        author: req.body.author,  // string
      };

      // Llamar al caso de uso (pasa a Paso 2)
      const bookResponse = await this.registerBookUseCase.execute(command);

      // SALIDA: Response (DTO) → HTTP Response
      res.status(201).json({
        success: true,
        data: bookResponse
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
```

**Tipo de datos**: JSON → `RegisterBookCommand` (DTO)

### Paso 2: Caso de Uso procesa el comando

```typescript
// application/use-cases/register-book.use-case.ts

export class RegisterBookUseCase {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: RegisterBookCommand): Promise<BookResponse> {
    // ENTRADA: Command (DTO)
    // {
    //   isbn: "978-0-13-468599-1",
    //   title: "Clean Architecture",
    //   author: "Robert C. Martin"
    // }

    // Verificar que no existe otro libro con el mismo ISBN
    const existingBook = await this.bookRepository.findByIsbn(
      ISBN.create(command.isbn)
    );

    if (existingBook) {
      throw new BookAlreadyExistsException(command.isbn);
    }

    // TRANSFORMACIÓN 2: Command (DTO) → Book (Entidad de Dominio)
    const book = Book.create({
      id: BookId.create(this.idGenerator.generate()),
      isbn: ISBN.create(command.isbn),        // string → ISBN (Value Object)
      title: command.title,                    // string
      author: command.author,                  // string
    });

    // Guardar usando el repository (pasa a Paso 3)
    await this.bookRepository.save(book);

    // TRANSFORMACIÓN 3: Book (Entidad) → BookResponse (DTO)
    return this.toResponse(book);
  }

  private toResponse(book: Book): BookResponse {
    return {
      id: book.id.getValue(),              // BookId → string
      isbn: book.isbn.getValue(),          // ISBN → string
      title: book.title,                    // string
      author: book.author,                  // string
      status: book.status,                  // BookStatus → string
      createdAt: book.createdAt.toISOString(),  // Date → string (ISO)
    };
  }
}
```

**Tipo de datos**: `RegisterBookCommand` → `Book` → `BookResponse`

### Paso 3: Repository persiste la entidad

```typescript
// infrastructure/persistence/postgresql/pg-book.repository.ts

export class PostgresBookRepository implements BookRepository {
  constructor(private readonly pool: Pool) {}

  async save(book: Book): Promise<void> {
    // ENTRADA: Book (Entidad de Dominio)
    // Book {
    //   id: BookId { value: "book-abc-123" },
    //   isbn: ISBN { value: "978-0-13-468599-1" },
    //   title: "Clean Architecture",
    //   author: "Robert C. Martin",
    //   status: BookStatus.AVAILABLE,
    //   createdAt: Date(...)
    // }

    // TRANSFORMACIÓN 4: Book (Entidad) → Row de BD (primitivos)
    const query = `
      INSERT INTO books (id, isbn, title, author, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        status = EXCLUDED.status
    `;

    await this.pool.query(query, [
      book.id.getValue(),        // BookId → string
      book.isbn.getValue(),      // ISBN → string
      book.title,                // string
      book.author,               // string
      book.status,               // BookStatus (enum) → string
      book.createdAt,            // Date → timestamp
    ]);

    // Los datos se guardan en PostgreSQL:
    // books table
    // ┌──────────────┬─────────────────────┬───────────────────┬────────────────────┬───────────┬─────────────────────┐
    // │ id           │ isbn                │ title             │ author             │ status    │ created_at          │
    // ├──────────────┼─────────────────────┼───────────────────┼────────────────────┼───────────┼─────────────────────┤
    // │ book-abc-123 │ 978-0-13-468599-1   │ Clean Architecture│ Robert C. Martin   │ AVAILABLE │ 2024-01-17 10:30:00 │
    // └──────────────┴─────────────────────┴───────────────────┴────────────────────┴───────────┴─────────────────────┘
  }
}
```

**Tipo de datos**: `Book` → Primitivos → Row de PostgreSQL

### Paso 4: Respuesta al cliente

```typescript
// El cliente recibe:
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "id": "book-abc-123",
    "isbn": "978-0-13-468599-1",
    "title": "Clean Architecture",
    "author": "Robert C. Martin",
    "status": "AVAILABLE",
    "createdAt": "2024-01-17T10:30:00.000Z"
  }
}
```

### Diagrama completo del flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                         FLUJO COMPLETO                          │
└─────────────────────────────────────────────────────────────────┘

1. HTTP REQUEST (JSON)
   POST /books
   { isbn: "978-0-13-468599-1", title: "Clean Architecture", ... }
         │
         ▼
   ┌─────────────────────────────────────┐
   │ BookController                      │  CAPA: Infrastructure
   │ (Adaptador Primario)                │
   │                                     │
   │ • Extrae datos del request          │
   │ • Crea RegisterBookCommand (DTO)    │
   └────────────┬────────────────────────┘
                │
                │ RegisterBookCommand
                │ { isbn: string, title: string, author: string }
                │
                ▼
   ┌─────────────────────────────────────┐
   │ RegisterBookUseCase                 │  CAPA: Application
   │ (Caso de Uso)                       │
   │                                     │
   │ • Recibe Command (DTO)              │
   │ • Crea Book (Entidad)               │
   │ • Llama repository.save(book)       │
   │ • Retorna BookResponse (DTO)        │
   └────────────┬────────────────────────┘
                │
                │ Book (Entidad de Dominio)
                │ { id: BookId, isbn: ISBN, ... }
                │
                ▼
   ┌─────────────────────────────────────┐
   │ BookRepository (PUERTO)             │  CAPA: Domain
   │ interface                           │
   │                                     │
   │ save(book: Book): Promise<void>     │
   └────────────┬────────────────────────┘
                │
                │ implements
                │
                ▼
   ┌─────────────────────────────────────┐
   │ PostgresBookRepository              │  CAPA: Infrastructure
   │ (Adaptador Secundario)              │
   │                                     │
   │ • Extrae valores de Book            │
   │ • Ejecuta INSERT SQL                │
   │ • Persiste en PostgreSQL            │
   └────────────┬────────────────────────┘
                │
                │ SQL INSERT
                │
                ▼
   ┌─────────────────────────────────────┐
   │ PostgreSQL Database                 │
   │ books table                         │
   │                                     │
   │ id | isbn | title | author | ...    │
   └─────────────────────────────────────┘

         Respuesta sube por las capas
                │
                ▼
   ┌─────────────────────────────────────┐
   │ BookResponse (DTO)                  │
   │ { id: string, isbn: string, ... }   │
   └────────────┬────────────────────────┘
                │
                ▼
2. HTTP RESPONSE (JSON)
   201 Created
   { success: true, data: { id: "book-abc-123", ... } }
```

### Resumen de transformaciones

| Capa | Entrada | Salida | Tipo |
|------|---------|--------|------|
| Controller | HTTP JSON | Command | DTO |
| UseCase | Command | Book | DTO → Entidad |
| Repository | Book | - (void) | Entidad → BD |
| UseCase | Book | Response | Entidad → DTO |
| Controller | Response | HTTP JSON | DTO → JSON |

---

## Implementaciones

Ahora vamos a ver las diferentes implementaciones de repositories que puedes tener.

### 1. InMemoryRepository (Desarrollo y Testing)

```typescript
// infrastructure/persistence/in-memory/in-memory-book.repository.ts

/**
 * InMemoryBookRepository
 *
 * Implementación en memoria para:
 * - Desarrollo rápido (no necesitas BD)
 * - Tests de integración
 * - Demos
 *
 * IMPORTANTE: Los datos se pierden al reiniciar el servidor
 */
export class InMemoryBookRepository implements BookRepository {
  // Map<id, BookProps>
  private books: Map<string, BookProps> = new Map();

  async save(book: Book): Promise<void> {
    // Guardamos una COPIA de las props, no la referencia del book
    // ¿Por qué? Para simular la BD (que no guarda el objeto en memoria)
    const props: BookProps = {
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      status: book.status,
      createdAt: book.createdAt,
    };

    this.books.set(book.id.getValue(), props);
  }

  async findById(id: BookId): Promise<Book | null> {
    const props = this.books.get(id.getValue());

    if (!props) {
      return null;
    }

    // Reconstituimos el Book desde las props
    // Usamos reconstitute() NO create() porque el libro ya existía
    return Book.reconstitute(props);
  }

  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    // Iteramos por todos los libros buscando el ISBN
    for (const props of this.books.values()) {
      if (props.isbn.equals(isbn)) {
        return Book.reconstitute(props);
      }
    }
    return null;
  }

  async findAvailable(): Promise<Book[]> {
    const available: Book[] = [];

    for (const props of this.books.values()) {
      if (props.status === BookStatus.AVAILABLE) {
        available.push(Book.reconstitute(props));
      }
    }

    return available;
  }

  async findAll(): Promise<Book[]> {
    return Array.from(this.books.values())
      .map(props => Book.reconstitute(props));
  }

  async delete(id: BookId): Promise<void> {
    this.books.delete(id.getValue());
  }

  async existsByIsbn(isbn: ISBN): Promise<boolean> {
    return (await this.findByIsbn(isbn)) !== null;
  }

  // Métodos auxiliares para testing
  clear(): void {
    this.books.clear();
  }

  count(): number {
    return this.books.size;
  }
}
```

**Cuándo usar InMemoryRepository**:
- ✅ Desarrollo local (arranque rápido sin BD)
- ✅ Tests de integración (rápidos y sin setup)
- ✅ Demos y prototipos
- ❌ Producción (se pierden los datos al reiniciar)

### 2. PostgresRepository (Producción)

```typescript
// infrastructure/persistence/postgresql/pg-book.repository.ts

import { Pool, PoolClient } from 'pg';

/**
 * PostgresBookRepository
 *
 * Implementación con PostgreSQL para producción.
 * Persiste los datos en una base de datos relacional.
 */
export class PostgresBookRepository implements BookRepository {
  constructor(private readonly pool: Pool) {}

  async save(book: Book): Promise<void> {
    // UPSERT: Inserta o actualiza si ya existe
    const query = `
      INSERT INTO books (
        id,
        isbn,
        title,
        author,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id)
      DO UPDATE SET
        isbn = EXCLUDED.isbn,
        title = EXCLUDED.title,
        author = EXCLUDED.author,
        status = EXCLUDED.status
    `;

    const values = [
      book.id.getValue(),        // $1
      book.isbn.getValue(),      // $2
      book.title,                // $3
      book.author,               // $4
      book.status,               // $5
      book.createdAt,            // $6
    ];

    await this.pool.query(query, values);
  }

  async findById(id: BookId): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE id = $1';
    const result = await this.pool.query(query, [id.getValue()]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToBook(result.rows[0]);
  }

  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE isbn = $1';
    const result = await this.pool.query(query, [isbn.getValue()]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToBook(result.rows[0]);
  }

  async findAvailable(): Promise<Book[]> {
    const query = `
      SELECT * FROM books
      WHERE status = 'AVAILABLE'
      ORDER BY title ASC
    `;
    const result = await this.pool.query(query);

    return result.rows.map(row => this.mapRowToBook(row));
  }

  async findAll(): Promise<Book[]> {
    const query = 'SELECT * FROM books ORDER BY title ASC';
    const result = await this.pool.query(query);

    return result.rows.map(row => this.mapRowToBook(row));
  }

  async delete(id: BookId): Promise<void> {
    const query = 'DELETE FROM books WHERE id = $1';
    await this.pool.query(query, [id.getValue()]);
  }

  async existsByIsbn(isbn: ISBN): Promise<boolean> {
    const query = 'SELECT 1 FROM books WHERE isbn = $1 LIMIT 1';
    const result = await this.pool.query(query, [isbn.getValue()]);
    return result.rows.length > 0;
  }

  /**
   * MAPPING: Row de BD → Entidad de Dominio
   *
   * Convierte un row de PostgreSQL a una entidad Book.
   *
   * IMPORTANTE:
   * - La BD usa snake_case (created_at)
   * - El dominio usa camelCase (createdAt)
   * - Recreamos Value Objects (BookId, ISBN)
   * - Usamos Book.reconstitute() NO create()
   */
  private mapRowToBook(row: any): Book {
    return Book.reconstitute({
      id: BookId.create(row.id),              // string → BookId
      isbn: ISBN.create(row.isbn),            // string → ISBN
      title: row.title,                        // string
      author: row.author,                      // string
      status: row.status as BookStatus,        // string → enum
      createdAt: new Date(row.created_at),     // timestamp → Date
    });
  }
}
```

**Schema de PostgreSQL**:

```sql
-- Migración para crear la tabla books

CREATE TABLE IF NOT EXISTS books (
  id VARCHAR(100) PRIMARY KEY,
  isbn VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_status ON books(status);
```

### 3. FakeRepository (Unit Tests)

```typescript
// tests/unit/fakes/fake-book-repository.ts

/**
 * FakeBookRepository
 *
 * Implementación simplificada para UNIT TESTS.
 *
 * Diferencias con InMemoryRepository:
 * - Más simple (puede tener shortcuts)
 * - Solo para tests unitarios
 * - Puede tener métodos auxiliares específicos de tests
 */
export class FakeBookRepository implements BookRepository {
  // Guardamos directamente las entidades (no props)
  private books: Map<string, Book> = new Map();

  async save(book: Book): Promise<void> {
    // En un fake, podemos guardar la referencia directa
    this.books.set(book.id.getValue(), book);
  }

  async findById(id: BookId): Promise<Book | null> {
    return this.books.get(id.getValue()) ?? null;
  }

  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    for (const book of this.books.values()) {
      if (book.isbn.equals(isbn)) {
        return book;
      }
    }
    return null;
  }

  async findAvailable(): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter(book => book.isAvailable());
  }

  async findAll(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async delete(id: BookId): Promise<void> {
    this.books.delete(id.getValue());
  }

  async existsByIsbn(isbn: ISBN): Promise<boolean> {
    return (await this.findByIsbn(isbn)) !== null;
  }

  // ═══════════════════════════════════════
  // Métodos auxiliares para TESTS
  // ═══════════════════════════════════════

  /**
   * Limpia todos los libros (útil en beforeEach)
   */
  clear(): void {
    this.books.clear();
  }

  /**
   * Cuenta libros (útil para assertions)
   */
  count(): number {
    return this.books.size;
  }

  /**
   * Añade un libro directamente sin pasar por save
   * (útil para preparar escenarios de test)
   */
  addBook(book: Book): void {
    this.books.set(book.id.getValue(), book);
  }

  /**
   * Obtiene todos los libros como array
   * (útil para verificar estado en tests)
   */
  getAllBooks(): Book[] {
    return Array.from(this.books.values());
  }
}
```

**Ejemplo de uso en tests**:

```typescript
// tests/unit/application/register-book.test.ts

describe('RegisterBookUseCase', () => {
  let useCase: RegisterBookUseCase;
  let bookRepository: FakeBookRepository;
  let idGenerator: FakeIdGenerator;

  beforeEach(() => {
    // Crear fakes
    bookRepository = new FakeBookRepository();
    idGenerator = new FakeIdGenerator();

    // Crear caso de uso con fakes inyectados
    useCase = new RegisterBookUseCase(bookRepository, idGenerator);
  });

  it('should register a new book', async () => {
    // Arrange
    const command: RegisterBookCommand = {
      isbn: '978-0-13-468599-1',
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
    };

    // Act
    const result = await useCase.execute(command);

    // Assert
    expect(result.title).toBe('Clean Architecture');
    expect(bookRepository.count()).toBe(1);  // Método auxiliar del fake
  });

  it('should throw if ISBN already exists', async () => {
    // Arrange - Preparar libro existente
    const existingBook = Book.create({
      id: BookId.create('book-1'),
      isbn: ISBN.create('978-0-13-468599-1'),
      title: 'Existing',
      author: 'Author',
    });
    bookRepository.addBook(existingBook);  // Método auxiliar del fake

    const command: RegisterBookCommand = {
      isbn: '978-0-13-468599-1',  // Mismo ISBN
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
    };

    // Act & Assert
    await expect(useCase.execute(command))
      .rejects
      .toThrow(BookAlreadyExistsException);
  });
});
```

### Comparación de implementaciones

| Característica | InMemory | PostgreSQL | Fake |
|---------------|----------|------------|------|
| **Propósito** | Dev + Tests Integración | Producción | Unit Tests |
| **Persistencia** | ❌ Se pierde al reiniciar | ✅ Persistente | ❌ En memoria |
| **Velocidad** | ⚡ Muy rápida | 🐌 Más lenta (I/O) | ⚡ Muy rápida |
| **Setup** | Cero | BD + Migraciones | Cero |
| **Robustez** | Media | Alta | Baja (simplificada) |
| **Métodos auxiliares** | Algunos (clear) | Ninguno | Muchos (para tests) |
| **Guarda** | Props (copia) | SQL | Entidades (referencia) |

---

## Mapping entre capas

El mapping es el proceso de convertir datos de un formato a otro. Vamos a verlo en detalle.

### Mapeo 1: HTTP Request → Command (DTO)

**Dónde**: Controller (Infraestructura)

```typescript
// infrastructure/controllers/rest/book.controller.ts

async registerBook(req: Request, res: Response): Promise<void> {
  // HTTP Request Body:
  // {
  //   "isbn": "978-0-13-468599-1",
  //   "title": "Clean Architecture",
  //   "author": "Robert C. Martin"
  // }

  // Mapeo explícito (recomendado)
  const command: RegisterBookCommand = {
    isbn: req.body.isbn,
    title: req.body.title,
    author: req.body.author,
  };

  // ¿Por qué mapeo explícito y no req.body directamente?
  // 1. Validación de tipos
  // 2. Seguridad (evitas campos extra)
  // 3. Claridad (sabes exactamente qué campos usas)

  const result = await this.registerBookUseCase.execute(command);
  res.status(201).json({ success: true, data: result });
}
```

### Mapeo 2: Command (DTO) → Entidad de Dominio

**Dónde**: UseCase (Aplicación)

```typescript
// application/use-cases/register-book.use-case.ts

async execute(command: RegisterBookCommand): Promise<BookResponse> {
  // Command (DTO):
  // {
  //   isbn: "978-0-13-468599-1",      // string
  //   title: "Clean Architecture",     // string
  //   author: "Robert C. Martin"       // string
  // }

  // Mapeo: DTO → Entidad de Dominio
  const book = Book.create({
    id: BookId.create(this.idGenerator.generate()),  // generado
    isbn: ISBN.create(command.isbn),     // string → ISBN (Value Object)
    title: command.title,                 // string (directo)
    author: command.author,               // string (directo)
  });

  // Ahora tenemos:
  // Book {
  //   id: BookId { value: "book-abc-123" },
  //   isbn: ISBN { value: "978-0-13-468599-1" },
  //   title: "Clean Architecture",
  //   author: "Robert C. Martin",
  //   status: BookStatus.AVAILABLE,
  //   createdAt: Date(...)
  // }

  await this.bookRepository.save(book);
  return this.toResponse(book);
}
```

### Mapeo 3: Entidad de Dominio → Row de BD

**Dónde**: Repository (Infraestructura)

```typescript
// infrastructure/persistence/postgresql/pg-book.repository.ts

async save(book: Book): Promise<void> {
  // Entidad de Dominio:
  // Book {
  //   id: BookId { value: "book-abc-123" },
  //   isbn: ISBN { value: "978-0-13-468599-1" },
  //   title: "Clean Architecture",
  //   author: "Robert C. Martin",
  //   status: BookStatus.AVAILABLE,
  //   createdAt: Date(2024-01-17T10:30:00.000Z)
  // }

  const query = `
    INSERT INTO books (id, isbn, title, author, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    ...
  `;

  // Mapeo: Entidad → Primitivos para SQL
  await this.pool.query(query, [
    book.id.getValue(),        // BookId → string
    book.isbn.getValue(),      // ISBN → string
    book.title,                // string (directo)
    book.author,               // string (directo)
    book.status,               // BookStatus enum → string
    book.createdAt,            // Date → timestamp
  ]);

  // En PostgreSQL:
  // ┌──────────────┬───────────────────┬────────────────────┬──────────────────┬───────────┬─────────────────────┐
  // │ id           │ isbn              │ title              │ author           │ status    │ created_at          │
  // ├──────────────┼───────────────────┼────────────────────┼──────────────────┼───────────┼─────────────────────┤
  // │ book-abc-123 │ 978-0-13-468599-1 │ Clean Architecture │ Robert C. Martin │ AVAILABLE │ 2024-01-17 10:30:00 │
  // └──────────────┴───────────────────┴────────────────────┴──────────────────┴───────────┴─────────────────────┘
}
```

### Mapeo 4: Row de BD → Entidad de Dominio

**Dónde**: Repository (Infraestructura)

```typescript
// infrastructure/persistence/postgresql/pg-book.repository.ts

async findById(id: BookId): Promise<Book | null> {
  const query = 'SELECT * FROM books WHERE id = $1';
  const result = await this.pool.query(query, [id.getValue()]);

  if (result.rows.length === 0) {
    return null;
  }

  // Row de PostgreSQL:
  // {
  //   id: "book-abc-123",
  //   isbn: "978-0-13-468599-1",
  //   title: "Clean Architecture",
  //   author: "Robert C. Martin",
  //   status: "AVAILABLE",
  //   created_at: "2024-01-17T10:30:00.000Z"
  // }

  return this.mapRowToBook(result.rows[0]);
}

private mapRowToBook(row: any): Book {
  // Mapeo: Row (primitivos) → Entidad de Dominio
  return Book.reconstitute({
    id: BookId.create(row.id),              // string → BookId
    isbn: ISBN.create(row.isbn),            // string → ISBN
    title: row.title,                        // string (directo)
    author: row.author,                      // string (directo)
    status: row.status as BookStatus,        // string → enum
    createdAt: new Date(row.created_at),     // string/timestamp → Date
  });

  // Resultado:
  // Book {
  //   id: BookId { value: "book-abc-123" },
  //   isbn: ISBN { value: "978-0-13-468599-1" },
  //   title: "Clean Architecture",
  //   author: "Robert C. Martin",
  //   status: BookStatus.AVAILABLE,
  //   createdAt: Date(2024-01-17T10:30:00.000Z)
  // }
}
```

**⚠️ IMPORTANTE: create() vs reconstitute()**

```typescript
// ❌ MAL - Usar create() al recuperar de BD
return Book.create({
  id: BookId.create(row.id),
  isbn: ISBN.create(row.isbn),
  // ...
});
// Problema: create() emite eventos de dominio (BookRegisteredEvent)
// Pero el libro ya existía, no lo estás creando ahora

// ✅ BIEN - Usar reconstitute() al recuperar de BD
return Book.reconstitute({
  id: BookId.create(row.id),
  isbn: ISBN.create(row.isbn),
  // ...
});
// reconstitute() reconstruye la entidad SIN emitir eventos
```

### Mapeo 5: Entidad de Dominio → Response (DTO)

**Dónde**: UseCase (Aplicación)

```typescript
// application/use-cases/register-book.use-case.ts

private toResponse(book: Book): BookResponse {
  // Entidad de Dominio:
  // Book {
  //   id: BookId { value: "book-abc-123" },
  //   isbn: ISBN { value: "978-0-13-468599-1" },
  //   title: "Clean Architecture",
  //   author: "Robert C. Martin",
  //   status: BookStatus.AVAILABLE,
  //   createdAt: Date(2024-01-17T10:30:00.000Z)
  // }

  // Mapeo: Entidad → DTO (primitivos)
  return {
    id: book.id.getValue(),              // BookId → string
    isbn: book.isbn.getValue(),          // ISBN → string
    title: book.title,                    // string (directo)
    author: book.author,                  // string (directo)
    status: book.status,                  // BookStatus → string
    createdAt: book.createdAt.toISOString(),  // Date → ISO string
  };

  // Resultado (DTO):
  // {
  //   id: "book-abc-123",
  //   isbn: "978-0-13-468599-1",
  //   title: "Clean Architecture",
  //   author: "Robert C. Martin",
  //   status: "AVAILABLE",
  //   createdAt: "2024-01-17T10:30:00.000Z"
  // }
}
```

### Mapeo 6: Response (DTO) → HTTP Response

**Dónde**: Controller (Infraestructura)

```typescript
// infrastructure/controllers/rest/book.controller.ts

async registerBook(req: Request, res: Response): Promise<void> {
  const command: RegisterBookCommand = { /* ... */ };

  // Ejecutar caso de uso (retorna DTO)
  const bookResponse: BookResponse = await this.registerBookUseCase.execute(command);

  // bookResponse:
  // {
  //   id: "book-abc-123",
  //   isbn: "978-0-13-468599-1",
  //   title: "Clean Architecture",
  //   author: "Robert C. Martin",
  //   status: "AVAILABLE",
  //   createdAt: "2024-01-17T10:30:00.000Z"
  // }

  // Mapeo: DTO → HTTP Response
  res.status(201).json({
    success: true,
    data: bookResponse  // El DTO se serializa a JSON automáticamente
  });

  // HTTP Response enviada al cliente:
  // {
  //   "success": true,
  //   "data": {
  //     "id": "book-abc-123",
  //     "isbn": "978-0-13-468599-1",
  //     "title": "Clean Architecture",
  //     "author": "Robert C. Martin",
  //     "status": "AVAILABLE",
  //     "createdAt": "2024-01-17T10:30:00.000Z"
  //   }
  // }
}
```

### Tabla resumen de mapeos

| # | Desde | Hacia | Dónde | Responsable |
|---|-------|-------|-------|-------------|
| 1 | HTTP JSON | Command (DTO) | Controller | Infraestructura |
| 2 | Command (DTO) | Entidad Dominio | UseCase | Aplicación |
| 3 | Entidad Dominio | Row BD | Repository | Infraestructura |
| 4 | Row BD | Entidad Dominio | Repository | Infraestructura |
| 5 | Entidad Dominio | Response (DTO) | UseCase | Aplicación |
| 6 | Response (DTO) | HTTP JSON | Controller | Infraestructura |

---

## Errores comunes

Vamos a ver los errores más típicos al implementar el patrón Repository.

### Error 1: Exponer entidades de dominio directamente

```typescript
// ❌ MALO - Exponer Book (entidad) al exterior
export class BookController {
  async registerBook(req: Request, res: Response) {
    const book = await this.registerBookUseCase.execute(req.body);

    // ¡NO hagas esto!
    res.json(book);
  }
}

// Problemas:
// 1. Expones métodos del dominio (markAsBorrowed, etc.)
// 2. Acoplas la API al dominio (si cambias Book, rompes la API)
// 3. Los Value Objects pueden no serializarse bien a JSON
```

```typescript
// ✅ BUENO - Retornar DTOs
export class BookController {
  async registerBook(req: Request, res: Response) {
    // El caso de uso retorna un DTO
    const bookDTO: BookResponse = await this.registerBookUseCase.execute(req.body);

    res.status(201).json({
      success: true,
      data: bookDTO  // Solo primitivos, sin métodos
    });
  }
}
```

### Error 2: Usar create() en lugar de reconstitute()

```typescript
// ❌ MALO - Usar create() al recuperar de BD
async findById(id: BookId): Promise<Book | null> {
  const row = await this.query('SELECT * FROM books WHERE id = $1', [id]);

  return Book.create({  // ¡ERROR!
    id: BookId.create(row.id),
    isbn: ISBN.create(row.isbn),
    // ...
  });

  // Problema: create() emite evento BookRegisteredEvent
  // Pero el libro ya existía, no lo estás creando ahora
}
```

```typescript
// ✅ BUENO - Usar reconstitute() al recuperar de BD
async findById(id: BookId): Promise<Book | null> {
  const row = await this.query('SELECT * FROM books WHERE id = $1', [id]);

  return Book.reconstitute({  // Correcto
    id: BookId.create(row.id),
    isbn: ISBN.create(row.isbn),
    // ...
  });

  // reconstitute() reconstruye la entidad sin emitir eventos
}
```

### Error 3: Repository con lógica de negocio

```typescript
// ❌ MALO - Validación de negocio en el repository
export class PostgresBookRepository implements BookRepository {
  async save(book: Book): Promise<void> {
    // ¡Lógica de negocio NO va aquí!
    if (book.title.length < 3) {
      throw new Error('Title too short');
    }

    if (book.status === BookStatus.BORROWED) {
      // Validar algo más...
    }

    // Persistir...
  }
}
```

```typescript
// ✅ BUENO - Lógica de negocio en el dominio
export class Book {
  static create(params: CreateBookParams): Book {
    // La validación está AQUÍ
    if (params.title.length < 3) {
      throw new InvalidBookTitleException();
    }

    return new Book({ /* ... */ });
  }
}

export class PostgresBookRepository implements BookRepository {
  async save(book: Book): Promise<void> {
    // El repository SOLO persiste
    // La entidad ya viene validada
    await this.pool.query(/* ... */);
  }
}
```

### Error 4: Repository conoce casos de uso

```typescript
// ❌ MALO - Repository llama a casos de uso
export class PostgresBookRepository implements BookRepository {
  constructor(
    private pool: Pool,
    private loanBookUseCase: LoanBookUseCase  // ¡NO!
  ) {}

  async save(book: Book): Promise<void> {
    await this.pool.query(/* ... */);

    // ¡El repository NO debe orquestar!
    if (book.status === BookStatus.AVAILABLE) {
      await this.loanBookUseCase.execute(/* ... */);
    }
  }
}
```

```typescript
// ✅ BUENO - Repository solo persiste
export class PostgresBookRepository implements BookRepository {
  constructor(private readonly pool: Pool) {}

  async save(book: Book): Promise<void> {
    // Solo persistir, nada más
    await this.pool.query(/* ... */);
  }
}

// La orquestación va en el caso de uso
export class LoanBookUseCase {
  async execute(command: LoanBookCommand) {
    const book = await this.bookRepository.findById(/* ... */);
    const loan = user.borrowBook(book, loanId);

    await this.bookRepository.save(book);
    await this.loanRepository.save(loan);
  }
}
```

### Error 5: No usar el patrón Unit of Work para transacciones

```typescript
// ❌ MALO - Sin transacción (puede quedar inconsistente)
export class LoanBookUseCase {
  async execute(command: LoanBookCommand) {
    const user = await this.userRepository.findById(/* ... */);
    const book = await this.bookRepository.findById(/* ... */);
    const loan = user.borrowBook(book, loanId);

    await this.loanRepository.save(loan);      // Si falla aquí...
    await this.bookRepository.save(book);      // ...esto no se ejecuta
    await this.userRepository.save(user);      // ...esto tampoco

    // Problema: Loan guardado pero Book y User no actualizados
  }
}
```

```typescript
// ✅ BUENO - Con transacción (todo o nada)
export class LoanBookUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bookRepository: BookRepository,
    private readonly loanRepository: LoanRepository,
    private readonly unitOfWork: UnitOfWork  // Patrón Unit of Work
  ) {}

  async execute(command: LoanBookCommand) {
    // Iniciar transacción
    await this.unitOfWork.begin();

    try {
      const user = await this.userRepository.findById(/* ... */);
      const book = await this.bookRepository.findById(/* ... */);
      const loan = user.borrowBook(book, loanId);

      await this.loanRepository.save(loan);
      await this.bookRepository.save(book);
      await this.userRepository.save(user);

      // Confirmar transacción (commit)
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

### Error 6: Guardar referencias en InMemoryRepository

```typescript
// ❌ MALO - Guardar referencia directa
export class InMemoryBookRepository implements BookRepository {
  private books: Map<string, Book> = new Map();

  async save(book: Book): Promise<void> {
    // Guardas la referencia del objeto
    this.books.set(book.id.getValue(), book);

    // Problema: Si modificas book en el código,
    // también modificas el "guardado" en el repo
  }
}

// Ejemplo del problema:
const book = Book.create({ /* ... */ });
await repo.save(book);

book.markAsBorrowed();  // Modificas el objeto

const retrieved = await repo.findById(book.id);
// ¡retrieved ya está marcado como BORROWED!
// ¡Aunque no llamaste a save() de nuevo!
```

```typescript
// ✅ BUENO - Guardar copia de las props
export class InMemoryBookRepository implements BookRepository {
  private books: Map<string, BookProps> = new Map();

  async save(book: Book): Promise<void> {
    // Guardas una COPIA de las propiedades
    const props: BookProps = {
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      status: book.status,
      createdAt: book.createdAt,
    };

    this.books.set(book.id.getValue(), props);
  }

  async findById(id: BookId): Promise<Book | null> {
    const props = this.books.get(id.getValue());
    if (!props) return null;

    // Reconstituyes el Book desde las props
    return Book.reconstitute(props);
  }
}

// Ahora funciona correctamente:
const book = Book.create({ /* ... */ });
await repo.save(book);

book.markAsBorrowed();  // Modificas el objeto en memoria

const retrieved = await repo.findById(book.id);
// retrieved tiene el estado que tenía cuando se guardó
// (AVAILABLE, no BORROWED)
```

### Error 7: Repository en el dominio (implementación concreta)

```typescript
// ❌ MALO - Implementación concreta en el dominio
// src/domain/repositories/postgres-book.repository.ts  ← ¡NO!

import { Pool } from 'pg';

export class PostgresBookRepository {
  constructor(private pool: Pool) {}

  async save(book: Book) {
    // SQL en el dominio = acoplamiento
  }
}
```

```typescript
// ✅ BUENO - Solo interface en el dominio
// src/domain/repositories/book.repository.ts

export interface BookRepository {
  save(book: Book): Promise<void>;
  findById(id: BookId): Promise<Book | null>;
  // ...
}

// Implementación va en infraestructura
// src/infrastructure/persistence/postgresql/pg-book.repository.ts

export class PostgresBookRepository implements BookRepository {
  // ...
}
```

---

## Testing con Repositories

El patrón Repository hace que el testing sea mucho más fácil. Vamos a ver cómo testear cada capa.

### Test 1: Testing del Dominio (sin repositories)

El dominio NO usa repositories directamente (solo en interfaces). Se testea de forma aislada.

```typescript
// tests/unit/domain/entities/book.test.ts

import { Book, BookId, ISBN, BookStatus } from '../../../../src/domain';

describe('Book Entity', () => {
  describe('create', () => {
    it('should create a book with AVAILABLE status', () => {
      // Arrange
      const params = {
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-13-468599-1'),
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
      };

      // Act
      const book = Book.create(params);

      // Assert
      expect(book.id.equals(params.id)).toBe(true);
      expect(book.isbn.equals(params.isbn)).toBe(true);
      expect(book.title).toBe('Clean Architecture');
      expect(book.status).toBe(BookStatus.AVAILABLE);
      expect(book.isAvailable()).toBe(true);
    });

    it('should throw if title is too short', () => {
      // Arrange
      const params = {
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-13-468599-1'),
        title: 'AB',  // Menos de 3 caracteres
        author: 'Robert C. Martin',
      };

      // Act & Assert
      expect(() => Book.create(params))
        .toThrow(InvalidBookTitleException);
    });
  });

  describe('markAsBorrowed', () => {
    it('should change status to BORROWED when available', () => {
      // Arrange
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-13-468599-1'),
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
      });

      // Act
      book.markAsBorrowed();

      // Assert
      expect(book.status).toBe(BookStatus.BORROWED);
      expect(book.isAvailable()).toBe(false);
    });

    it('should throw when already borrowed', () => {
      // Arrange
      const book = Book.create({ /* ... */ });
      book.markAsBorrowed();  // Ya prestado

      // Act & Assert
      expect(() => book.markAsBorrowed())
        .toThrow(BookNotAvailableException);
    });
  });
});
```

**Sin base de datos. Sin HTTP. Sin nada externo. Solo lógica pura.**

### Test 2: Testing de Casos de Uso (con Fakes)

Los casos de uso se testean con repositorios fake.

```typescript
// tests/unit/application/use-cases/register-book.test.ts

import { RegisterBookUseCase } from '../../../../src/application';
import { FakeBookRepository } from '../../fakes/fake-book-repository';
import { FakeIdGenerator } from '../../fakes/fake-id-generator';

describe('RegisterBookUseCase', () => {
  let useCase: RegisterBookUseCase;
  let bookRepository: FakeBookRepository;
  let idGenerator: FakeIdGenerator;

  beforeEach(() => {
    // Crear fakes
    bookRepository = new FakeBookRepository();
    idGenerator = new FakeIdGenerator();
    idGenerator.setNextId('book-123');  // ID predecible para tests

    // Crear caso de uso con fakes inyectados
    useCase = new RegisterBookUseCase(bookRepository, idGenerator);
  });

  afterEach(() => {
    bookRepository.clear();
  });

  it('should register a new book', async () => {
    // Arrange
    const command = {
      isbn: '978-0-13-468599-1',
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
    };

    // Act
    const result = await useCase.execute(command);

    // Assert - Verificar el DTO retornado
    expect(result.id).toBe('book-123');
    expect(result.isbn).toBe('978-0-13-468599-1');
    expect(result.title).toBe('Clean Architecture');
    expect(result.status).toBe('AVAILABLE');

    // Assert - Verificar que se guardó
    expect(bookRepository.count()).toBe(1);

    const saved = await bookRepository.findById(
      BookId.create('book-123')
    );
    expect(saved).toBeDefined();
    expect(saved!.title).toBe('Clean Architecture');
  });

  it('should throw if book with same ISBN already exists', async () => {
    // Arrange - Crear libro existente
    const existingBook = Book.create({
      id: BookId.create('book-1'),
      isbn: ISBN.create('978-0-13-468599-1'),
      title: 'Existing Book',
      author: 'Another Author',
    });
    await bookRepository.save(existingBook);

    const command = {
      isbn: '978-0-13-468599-1',  // Mismo ISBN
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
    };

    // Act & Assert
    await expect(useCase.execute(command))
      .rejects
      .toThrow(BookAlreadyExistsException);

    // Verificar que no se creó un segundo libro
    expect(bookRepository.count()).toBe(1);
  });

  it('should generate unique IDs for each book', async () => {
    // Arrange
    idGenerator.setNextId('book-1');
    const command1 = {
      isbn: '978-0-13-468599-1',
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
    };

    idGenerator.setNextId('book-2');
    const command2 = {
      isbn: '978-0-321-12521-7',
      title: 'Domain-Driven Design',
      author: 'Eric Evans',
    };

    // Act
    const result1 = await useCase.execute(command1);
    const result2 = await useCase.execute(command2);

    // Assert
    expect(result1.id).toBe('book-1');
    expect(result2.id).toBe('book-2');
    expect(bookRepository.count()).toBe(2);
  });
});
```

**Ventajas de usar fakes**:
- ⚡ Tests rápidos (sin I/O de BD)
- 🎯 Tests aislados (solo testas el caso de uso)
- 🔧 Control total (IDs predecibles, estado inicial controlado)
- 📝 Fácil verificar estado (métodos auxiliares como count())

### Test 3: Testing de Repositories (con BD real o InMemory)

Los repositorios se testean con BD real (o InMemoryRepository como BD "de verdad").

```typescript
// tests/integration/infrastructure/persistence/pg-book.repository.test.ts

import { Pool } from 'pg';
import { PostgresBookRepository } from '../../../../src/infrastructure';
import { Book, BookId, ISBN, BookStatus } from '../../../../src/domain';

describe('PostgresBookRepository', () => {
  let pool: Pool;
  let repository: PostgresBookRepository;

  beforeAll(async () => {
    // Conectar a BD de test
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL,
    });

    repository = new PostgresBookRepository(pool);

    // Crear tabla (o ejecutar migraciones)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(100) PRIMARY KEY,
        isbn VARCHAR(20) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL
      )
    `);
  });

  afterAll(async () => {
    // Limpiar y cerrar conexión
    await pool.query('DROP TABLE IF EXISTS books');
    await pool.end();
  });

  beforeEach(async () => {
    // Limpiar tabla antes de cada test
    await pool.query('TRUNCATE books');
  });

  describe('save', () => {
    it('should insert a new book', async () => {
      // Arrange
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-13-468599-1'),
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
      });

      // Act
      await repository.save(book);

      // Assert - Verificar en BD
      const result = await pool.query(
        'SELECT * FROM books WHERE id = $1',
        ['book-1']
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].isbn).toBe('978-0-13-468599-1');
      expect(result.rows[0].title).toBe('Clean Architecture');
      expect(result.rows[0].status).toBe('AVAILABLE');
    });

    it('should update an existing book', async () => {
      // Arrange - Insertar libro inicial
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-13-468599-1'),
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
      });
      await repository.save(book);

      // Modificar el libro
      book.markAsBorrowed();

      // Act - Guardar de nuevo (update)
      await repository.save(book);

      // Assert - Verificar actualización
      const result = await pool.query(
        'SELECT * FROM books WHERE id = $1',
        ['book-1']
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe('BORROWED');
    });
  });

  describe('findById', () => {
    it('should return book when exists', async () => {
      // Arrange - Insertar libro directamente en BD
      await pool.query(
        `INSERT INTO books (id, isbn, title, author, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'book-1',
          '978-0-13-468599-1',
          'Clean Architecture',
          'Robert C. Martin',
          'AVAILABLE',
          new Date(),
        ]
      );

      // Act
      const book = await repository.findById(BookId.create('book-1'));

      // Assert
      expect(book).toBeDefined();
      expect(book!.id.getValue()).toBe('book-1');
      expect(book!.isbn.getValue()).toBe('978-0-13-468599-1');
      expect(book!.title).toBe('Clean Architecture');
      expect(book!.status).toBe(BookStatus.AVAILABLE);
    });

    it('should return null when not exists', async () => {
      // Act
      const book = await repository.findById(BookId.create('non-existent'));

      // Assert
      expect(book).toBeNull();
    });
  });

  describe('findByIsbn', () => {
    it('should find book by ISBN', async () => {
      // Arrange
      const book = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-13-468599-1'),
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
      });
      await repository.save(book);

      // Act
      const found = await repository.findByIsbn(
        ISBN.create('978-0-13-468599-1')
      );

      // Assert
      expect(found).toBeDefined();
      expect(found!.id.getValue()).toBe('book-1');
    });
  });

  describe('findAvailable', () => {
    it('should return only available books', async () => {
      // Arrange - Crear 3 libros: 2 disponibles, 1 prestado
      const book1 = Book.create({
        id: BookId.create('book-1'),
        isbn: ISBN.create('978-0-13-468599-1'),
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
      });

      const book2 = Book.create({
        id: BookId.create('book-2'),
        isbn: ISBN.create('978-0-321-12521-7'),
        title: 'Domain-Driven Design',
        author: 'Eric Evans',
      });

      const book3 = Book.create({
        id: BookId.create('book-3'),
        isbn: ISBN.create('978-0-201-61622-4'),
        title: 'The Pragmatic Programmer',
        author: 'Hunt & Thomas',
      });
      book3.markAsBorrowed();  // Este NO debe aparecer

      await repository.save(book1);
      await repository.save(book2);
      await repository.save(book3);

      // Act
      const available = await repository.findAvailable();

      // Assert
      expect(available).toHaveLength(2);
      expect(available.map(b => b.id.getValue())).toContain('book-1');
      expect(available.map(b => b.id.getValue())).toContain('book-2');
      expect(available.map(b => b.id.getValue())).not.toContain('book-3');
    });
  });
});
```

**Testing con BD real**:
- ✅ Testas el SQL real
- ✅ Detectas problemas de mapping
- ✅ Verificas índices y queries
- ⚠️ Más lentos que unit tests
- ⚠️ Necesitas setup de BD de test

**Alternativa: Testing con InMemoryRepository**

Si no quieres setup de BD, puedes testear el InMemoryRepository:

```typescript
// tests/integration/infrastructure/persistence/in-memory-book.repository.test.ts

import { InMemoryBookRepository } from '../../../../src/infrastructure';

describe('InMemoryBookRepository', () => {
  let repository: InMemoryBookRepository;

  beforeEach(() => {
    repository = new InMemoryBookRepository();
  });

  afterEach(() => {
    repository.clear();
  });

  // ... mismos tests que con PostgreSQL
  // pero sin necesidad de BD real
});
```

### Test 4: Testing de Controllers (con caso de uso mockeado)

Los controllers se testean mockeando el caso de uso.

```typescript
// tests/unit/infrastructure/controllers/book.controller.test.ts

import { Request, Response } from 'express';
import { BookController } from '../../../../src/infrastructure';
import { RegisterBookUseCase } from '../../../../src/application';

describe('BookController', () => {
  let controller: BookController;
  let mockRegisterBookUseCase: jest.Mocked<RegisterBookUseCase>;

  beforeEach(() => {
    // Mock del caso de uso
    mockRegisterBookUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new BookController(mockRegisterBookUseCase);
  });

  describe('POST /books', () => {
    it('should return 201 when book is registered', async () => {
      // Arrange
      const mockRequest = {
        body: {
          isbn: '978-0-13-468599-1',
          title: 'Clean Architecture',
          author: 'Robert C. Martin',
        },
      } as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mock del resultado del caso de uso
      mockRegisterBookUseCase.execute.mockResolvedValue({
        id: 'book-123',
        isbn: '978-0-13-468599-1',
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
        status: 'AVAILABLE',
        createdAt: '2024-01-17T10:30:00.000Z',
      });

      // Act
      await controller.registerBook(mockRequest, mockResponse);

      // Assert - Verificar llamada al caso de uso
      expect(mockRegisterBookUseCase.execute).toHaveBeenCalledWith({
        isbn: '978-0-13-468599-1',
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
      });

      // Assert - Verificar respuesta HTTP
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'book-123',
          isbn: '978-0-13-468599-1',
        }),
      });
    });

    it('should return 400 when ISBN already exists', async () => {
      // Arrange
      const mockRequest = {
        body: {
          isbn: '978-0-13-468599-1',
          title: 'Clean Architecture',
          author: 'Robert C. Martin',
        },
      } as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mock: el caso de uso lanza excepción
      mockRegisterBookUseCase.execute.mockRejectedValue(
        new BookAlreadyExistsException('978-0-13-468599-1')
      );

      // Act
      await controller.registerBook(mockRequest, mockResponse);

      // Assert - Verificar respuesta de error
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'BOOK_ALREADY_EXISTS',
        }),
      });
    });
  });
});
```

### Pirámide de Testing

```
                    ▲
                   / \
                  /   \
                 /  E2E \          ← Pocos: Lentos, frágiles
                /───────\
               /         \
              / Integration\        ← Algunos: Testas capas juntas
             /─────────────\
            /               \
           /   Unit Tests    \     ← Muchos: Rápidos, aislados
          /___________________\

Unit Tests:
- Domain entities (Book, User)
- Value Objects (ISBN, Email)
- Domain Services
- Use Cases (con fakes)

Integration Tests:
- Repositories (con BD real o InMemory)
- Controllers (con use cases reales)

E2E Tests:
- Flujo completo HTTP → DB
```

---

## Preguntas frecuentes

### 1. ¿Por qué la interfaz del repository va en el dominio?

Porque el dominio DEFINE qué necesita, y la infraestructura IMPLEMENTA cómo se hace.

```
SIN inversión:
  Dominio → depende de → Infraestructura ❌
  (Dominio conoce PostgreSQL)

CON inversión:
  Dominio → define → BookRepository (interface)
                          ↑
                   implementa
                          |
                   Infraestructura ✅
  (Dominio NO conoce PostgreSQL)
```

**Ventajas**:
- El dominio es puro (sin dependencias externas)
- Puedes cambiar de BD sin tocar dominio
- Fácil testear con fakes

### 2. ¿Cuándo usar save() y cuándo create/update separados?

Depende de tu preferencia:

**Opción A: Solo save() (recomendado)**
```typescript
interface BookRepository {
  save(book: Book): Promise<void>;  // Insert o Update
}

// El repository decide internamente si es INSERT o UPDATE
// basándose en si el libro ya existe (UPSERT)
```

**Opción B: create() y update() separados**
```typescript
interface BookRepository {
  create(book: Book): Promise<void>;   // Solo INSERT
  update(book: Book): Promise<void>;   // Solo UPDATE
}

// Más explícito, pero el caso de uso debe saber
// si el libro es nuevo o existente
```

**Recomendación**: Usa solo `save()` que haga UPSERT. Es más simple y el caso de uso no necesita saber si es nuevo o no.

### 3. ¿Los repositorios deben retornar entidades o DTOs?

**Siempre entidades de dominio.**

```typescript
// ✅ CORRECTO
interface BookRepository {
  findById(id: BookId): Promise<Book | null>;  // Retorna entidad
}

// ❌ INCORRECTO
interface BookRepository {
  findById(id: string): Promise<BookDTO | null>;  // Retorna DTO
}
```

**Razones**:
1. El repository es parte del dominio → retorna tipos del dominio
2. El caso de uso necesita la entidad (para llamar métodos de negocio)
3. El DTO es responsabilidad del caso de uso (capa de aplicación)

### 4. ¿Qué pasa si necesito hacer queries complejas?

Para queries complejas que NO encajan en el repository, crea **Query Handlers** o **Read Models** (CQRS).

```typescript
// ❌ MALO - Query compleja en repository
interface BookRepository {
  findBooksWithLowStockByCategory(
    category: string,
    threshold: number,
    sortBy: string,
    limit: number,
    offset: number
  ): Promise<Book[]>;

  // Esto se vuelve inmanejable rápido
}

// ✅ BUENO - Query Handler separado
interface GetLowStockBooksQuery {
  category: string;
  threshold: number;
  sortBy: string;
  limit: number;
  offset: number;
}

interface GetLowStockBooksQueryHandler {
  execute(query: GetLowStockBooksQuery): Promise<BookListDTO>;
}

// Implementación puede hacer query SQL directa
class PgGetLowStockBooksQueryHandler implements GetLowStockBooksQueryHandler {
  async execute(query: GetLowStockBooksQuery): Promise<BookListDTO> {
    // Query SQL optimizada directamente
    const result = await this.pool.query(`
      SELECT id, title, quantity, category
      FROM books
      WHERE category = $1
        AND quantity < $2
      ORDER BY ${query.sortBy}
      LIMIT $3 OFFSET $4
    `, [query.category, query.threshold, query.limit, query.offset]);

    // Retorna DTO (no entidades)
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      quantity: row.quantity,
      category: row.category,
    }));
  }
}
```

### 5. ¿Debo tener un repository por cada entidad?

**Generalmente sí, pero solo para Aggregate Roots.**

```typescript
// ✅ CORRECTO - Repositories para Aggregate Roots
interface BookRepository { /* ... */ }
interface UserRepository { /* ... */ }
interface LoanRepository { /* ... */ }

// ❌ INCORRECTO - Repository para entidad hija
interface PenaltyRepository { /* ... */ }
// Penalty es hijo de User, se accede vía User
```

**Regla**: Solo los Aggregate Roots tienen repositorios.

### 6. ¿Cómo manejo relaciones entre entidades?

Depende del tipo de relación:

**Opción A: Lazy Loading (cargar bajo demanda)**
```typescript
class User {
  private _loans: Loan[] | null = null;

  async getLoans(loanRepository: LoanRepository): Promise<Loan[]> {
    if (this._loans === null) {
      this._loans = await loanRepository.findByUserId(this.id);
    }
    return this._loans;
  }
}
```

**Opción B: Eager Loading (cargar todo junto)**
```typescript
interface UserRepository {
  findByIdWithLoans(id: UserId): Promise<User | null>;
}

// En la implementación:
async findByIdWithLoans(id: UserId): Promise<User | null> {
  const userRow = await this.pool.query(`
    SELECT u.*, json_agg(l.*) as loans
    FROM users u
    LEFT JOIN loans l ON l.user_id = u.id
    WHERE u.id = $1
    GROUP BY u.id
  `, [id.getValue()]);

  // Mapear user + loans
}
```

**Opción C: Referencias por ID (recomendado)**
```typescript
class Loan {
  constructor(
    public readonly id: LoanId,
    public readonly userId: UserId,      // Solo el ID
    public readonly bookId: BookId,      // Solo el ID
    // ...
  ) {}
}

// El caso de uso carga las entidades relacionadas si las necesita
const loan = await loanRepository.findById(loanId);
const user = await userRepository.findById(loan.userId);
const book = await bookRepository.findById(loan.bookId);
```

**Recomendación**: Usa referencias por ID y carga las entidades en el caso de uso cuando las necesites.

### 7. ¿Los métodos del repository deben ser síncronos o asíncronos?

**Siempre asíncronos (Promise)**, aunque la implementación sea síncrona.

```typescript
// ✅ CORRECTO - Siempre async
interface BookRepository {
  save(book: Book): Promise<void>;
  findById(id: BookId): Promise<Book | null>;
}

// Incluso si la implementación es síncrona (InMemory)
class InMemoryBookRepository implements BookRepository {
  async save(book: Book): Promise<void> {
    this.books.set(book.id.getValue(), book);
    // Síncrono, pero retornamos Promise para cumplir el contrato
  }
}
```

**Razón**: Todas las implementaciones deben cumplir el contrato. Si la interfaz es síncrona, no puedes tener implementación con BD real (que es asíncrona).

### 8. ¿Cómo testeo que el repository persiste correctamente?

Tienes dos opciones:

**Opción A: Test de integración con BD real**
```typescript
it('should persist book correctly', async () => {
  const book = Book.create({ /* ... */ });
  await repository.save(book);

  // Verificar leyendo directamente de la BD
  const result = await pool.query('SELECT * FROM books WHERE id = $1', [book.id.getValue()]);
  expect(result.rows[0].title).toBe(book.title);
});
```

**Opción B: Test round-trip (guardar y recuperar)**
```typescript
it('should save and retrieve book', async () => {
  const book = Book.create({ /* ... */ });
  await repository.save(book);

  const retrieved = await repository.findById(book.id);

  expect(retrieved).toBeDefined();
  expect(retrieved!.title).toBe(book.title);
  expect(retrieved!.status).toBe(book.status);
});
```

---

## Resumen

Bueno, mi niño, ya has visto TODO sobre el patrón Repository. Vamos a hacer un resumen rápido:

### Conceptos clave

1. **Repository = Abstracción de colección**
   - El dominio dice "necesito guardar/buscar libros"
   - La infraestructura implementa "te lo hago con PostgreSQL/MongoDB/etc."

2. **Puerto (Interface) vs Adaptador (Implementación)**
   - Puerto: Interface en el DOMINIO
   - Adaptador: Clase concreta en INFRAESTRUCTURA
   - Esto permite inversión de dependencias

3. **Entidad de Dominio vs DTO**
   - Entidad: Lógica de negocio, Value Objects, métodos
   - DTO: Solo datos primitivos para transportar entre capas

4. **Mapping entre capas**
   - HTTP JSON → Command (DTO)
   - Command → Entidad de Dominio
   - Entidad → Row de BD
   - Row de BD → Entidad (con reconstitute)
   - Entidad → Response (DTO)
   - Response → HTTP JSON

5. **Testing**
   - Dominio: Unit tests (sin repositories)
   - Casos de uso: Unit tests (con fakes)
   - Repositories: Integration tests (con BD o InMemory)

### Reglas de oro

1. ✅ **La interface del repository VA en el dominio**
2. ✅ **La implementación del repository VA en infraestructura**
3. ✅ **Los repositories trabajan con entidades, NO con DTOs**
4. ✅ **Usa reconstitute() al cargar de BD, NO create()**
5. ✅ **Un repository por Aggregate Root**
6. ✅ **El repository NO tiene lógica de negocio**
7. ✅ **Siempre usa Promise (async/await)**

### Próximos pasos

Ahora que dominas el patrón Repository, puedes:

1. **Practicar** implementando repositories para otras entidades (User, Loan)
2. **Experimentar** con diferentes implementaciones (MongoDB, Redis, archivos)
3. **Profundizar** en CQRS para separar aún más lecturas de escrituras
4. **Explorar** Unit of Work para manejar transacciones
5. **Estudiar** Event Sourcing como alternativa al CRUD

---

¡Y eso es todo, mi niño! Ahora ya sabes TODO sobre el patrón Repository. Recuerda:

> "El Repository es el puente entre tu dominio puro y el mundo sucio de las bases de datos. Manténlos separados y vivirás feliz."
>
> — El Profe Millo

¿Te quedó clarito o le damos otra vuelta? 🚀

---

## Referencias

- [Martin Fowler - Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design (Vaughn Vernon)](https://vaughnvernon.com/)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
