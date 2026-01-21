# Capa de Infraestructura - Los Adaptadores 🔧

Buenas, mi niño. Ahora estamos en la capa de **infraestructura**, donde viven todos los **adaptadores**. Esta es la capa más externa del hexágono, la que conecta tu dominio con el mundo real: bases de datos, APIs REST, sistemas de mensajería, lo que sea.

## ¿Qué es la Infraestructura?

La infraestructura contiene las **implementaciones concretas** de las interfaces que el dominio define. Si el dominio dice "necesito guardar libros", la infraestructura dice "yo te lo guardo en PostgreSQL" o "yo te lo guardo en memoria".

**Piénsalo así**:
- **Dominio**: "Necesito un repositorio de libros" (interface)
- **Infraestructura**: "Aquí tienes uno que usa PostgreSQL" (implementación)

## Regla de Oro de la Infraestructura

**La infraestructura IMPLEMENTA, no decide.**

```
✅ La infraestructura PUEDE:
- Implementar interfaces del dominio
- Hablar con bases de datos
- Hacer peticiones HTTP
- Leer archivos
- Cualquier cosa "externa"

❌ La infraestructura NO PUEDE:
- Contener reglas de negocio (eso va en el dominio)
- Orquestar casos de uso (eso va en aplicación)
```

## Tipos de Adaptadores

En arquitectura hexagonal hay dos tipos de adaptadores:

### 1. Adaptadores Primarios (Driving Adapters)

Son los que **inician** acciones en el sistema. El usuario hace algo, y estos adaptadores lo convierten en llamadas al dominio.

**Ejemplos**:
- Controllers REST (Express, Fastify)
- Controllers GraphQL
- Handlers de eventos (SQS, Kafka)
- CLI commands
- Tests

### 2. Adaptadores Secundarios (Driven Adapters)

Son los que el dominio **usa** para hacer cosas externas. El dominio necesita algo, y estos adaptadores lo proveen.

**Ejemplos**:
- Repositorios (PostgreSQL, MongoDB, InMemory)
- Clientes HTTP (para APIs externas)
- Servicios de email
- Generadores de ID (UUID, nanoid)

```
      ┌────────────────────────────────┐
      │  ADAPTADORES PRIMARIOS         │
      │  (Inician acciones)            │
      │  • REST Controllers            │
      │  • GraphQL Resolvers           │
      │  • Event Handlers              │
      └────────────┬───────────────────┘
                   │
                   ▼
      ┌────────────────────────────────┐
      │  DOMINIO                       │
      │  (El corazón)                  │
      └────────────┬───────────────────┘
                   │
                   ▼
      ┌────────────────────────────────┐
      │  ADAPTADORES SECUNDARIOS       │
      │  (Proveen servicios)           │
      │  • Repositorios (BD)           │
      │  • Email Service               │
      │  • ID Generator                │
      └────────────────────────────────┘
```

## Estructura de la Infraestructura

```
infrastructure/
├── controllers/rest/            # 🔵 ADAPTADORES PRIMARIOS
│   ├── book.controller.ts       # REST endpoints para libros
│   ├── user.controller.ts       # REST endpoints para usuarios
│   └── loan.controller.ts       # REST endpoints para préstamos
│
├── persistence/                 # 🟢 ADAPTADORES SECUNDARIOS
│   ├── in-memory/               # Implementación en memoria
│   │   ├── in-memory-book.repository.ts
│   │   ├── in-memory-user.repository.ts
│   │   ├── in-memory-loan.repository.ts
│   │   └── uuid-id-generator.ts
│   │
│   └── postgresql/              # Implementación PostgreSQL
│       ├── pg-book.repository.ts
│       ├── pg-user.repository.ts
│       ├── pg-loan.repository.ts
│       └── pg-pool.ts           # Configuración de conexión
│
└── bootstrap/                   # Configuración e inyección
    ├── container.ts             # Dependency Injection container
    └── server.ts                # Configuración del servidor Express
```

## Adaptadores Primarios: Controllers REST

Los controllers son la cara visible de tu aplicación. Reciben peticiones HTTP y las convierten en llamadas a casos de uso.

### Anatomía de un Controller

```typescript
export class BookController {
  public readonly router: Router;

  // 1. Inyectar casos de uso (no repositorios, ¡casos de uso!)
  constructor(
    private readonly registerBookUseCase: RegisterBookUseCase,
    private readonly getAvailableBooksUseCase: GetAvailableBooksUseCase
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  // 2. Definir rutas
  private setupRoutes(): void {
    this.router.post('/', this.registerBook.bind(this));
    this.router.get('/available', this.getAvailableBooks.bind(this));
  }

  // 3. Handler de la ruta
  private async registerBook(req: Request, res: Response): Promise<void> {
    try {
      // 3a. Extraer datos del request
      const command: RegisterBookCommand = {
        isbn: req.body.isbn,
        title: req.body.title,
        author: req.body.author,
      };

      // 3b. Llamar al caso de uso
      const book = await this.registerBookUseCase.execute(command);

      // 3c. Formatear respuesta HTTP
      res.status(201).json({
        success: true,
        data: book,
      });
    } catch (error) {
      // 3d. Manejar errores
      this.handleError(res, error);
    }
  }

  // 4. Manejo de errores centralizado
  private handleError(res: Response, error: unknown): void {
    if (error instanceof DomainException) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  }
}
```

### Responsabilidades del Controller

Un controller solo debe:

1. **Traducir HTTP a comandos**
   ```typescript
   const command: LoanBookCommand = {
     userId: req.body.userId,
     bookId: req.body.bookId
   };
   ```

2. **Llamar al caso de uso**
   ```typescript
   const loan = await this.loanBookUseCase.execute(command);
   ```

3. **Traducir DTOs a HTTP**
   ```typescript
   res.status(201).json({
     success: true,
     data: loan
   });
   ```

4. **Convertir excepciones a HTTP status codes**
   ```typescript
   if (error instanceof BookNotFoundException) {
     res.status(404).json({...});
   } else if (error instanceof UserHasPenaltiesException) {
     res.status(400).json({...});
   }
   ```

### Errores Comunes en Controllers

```typescript
// ❌ MALO - Lógica de negocio en el controller
async registerBook(req: Request, res: Response) {
  const { isbn, title, author } = req.body;

  // ¡Validación de ISBN no va aquí!
  if (!isbn || isbn.length < 10) {
    return res.status(400).json({...});
  }

  // ¡Esto es lógica de aplicación!
  const existingBook = await bookRepo.findByIsbn(isbn);
  if (existingBook) {
    return res.status(409).json({...});
  }

  // ...
}

// ✅ BUENO - Solo traducir y delegar
async registerBook(req: Request, res: Response) {
  try {
    const command: RegisterBookCommand = {
      isbn: req.body.isbn,
      title: req.body.title,
      author: req.body.author,
    };

    // El caso de uso se encarga de todo
    const book = await this.registerBookUseCase.execute(command);

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    this.handleError(res, error);
  }
}
```

**Por qué es mejor**: El controller es súper simple. Toda la complejidad está en el caso de uso, que es testeable sin HTTP.

## Adaptadores Secundarios: Repositorios

Los repositorios **implementan** las interfaces que el dominio define.

### Implementación en Memoria

Útil para desarrollo, demos y testing de integración.

```typescript
export class InMemoryBookRepository implements BookRepository {
  private books: Map<string, BookProps> = new Map();

  async save(book: Book): Promise<void> {
    // Guardar una copia de las propiedades
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

    // Reconstituir la entidad desde las propiedades
    return Book.reconstitute(props);
  }

  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    for (const props of this.books.values()) {
      if (props.isbn.equals(isbn)) {
        return Book.reconstitute(props);
      }
    }
    return null;
  }

  // ... otros métodos
}
```

**Detalles importantes**:

1. **Guardamos props, no la entidad**
   ```typescript
   // ❌ MALO
   this.books.set(id, book); // Guardas la referencia

   // ✅ BUENO
   this.books.set(id, { ...bookProps }); // Guardas una copia
   ```
   ¿Por qué? Porque si guardas la referencia, modificar el book en memoria modifica el "guardado".

2. **Reconstituimos al recuperar**
   ```typescript
   const props = this.books.get(id);
   return Book.reconstitute(props);
   ```
   Usamos `reconstitute` en lugar de `create` porque el libro ya existía (no queremos emitir eventos de creación de nuevo).

### Implementación en PostgreSQL

Para producción, normalmente usarás una BD real.

```typescript
export class PgBookRepository implements BookRepository {
  constructor(private readonly pool: Pool) {}

  async save(book: Book): Promise<void> {
    const query = `
      INSERT INTO books (id, isbn, title, author, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status
    `;

    await this.pool.query(query, [
      book.id.getValue(),
      book.isbn.getValue(),
      book.title,
      book.author,
      book.status,
      book.createdAt,
    ]);
  }

  async findById(id: BookId): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE id = $1';
    const result = await this.pool.query(query, [id.getValue()]);

    if (result.rows.length === 0) return null;

    // Mapear row de BD a BookProps
    const row = result.rows[0];
    return Book.reconstitute({
      id: BookId.create(row.id),
      isbn: ISBN.create(row.isbn),
      title: row.title,
      author: row.author,
      status: row.status,
      createdAt: new Date(row.created_at),
    });
  }

  // ... otros métodos
}
```

**Detalles importantes**:

1. **Mapping de BD a Dominio**
   ```typescript
   // BD usa snake_case: created_at
   // Dominio usa camelCase: createdAt
   // El repositorio hace la traducción
   createdAt: new Date(row.created_at)
   ```

2. **Recrear Value Objects**
   ```typescript
   isbn: ISBN.create(row.isbn)
   ```
   La BD guarda el string, pero el dominio necesita el Value Object.

3. **UPSERT para save()**
   ```typescript
   ON CONFLICT (id) DO UPDATE SET ...
   ```
   `save()` debe funcionar tanto para crear como para actualizar.

## Inyección de Dependencias

El contenedor DI conecta todo. Define qué implementaciones usar.

```typescript
// infrastructure/bootstrap/container.ts
export class Container {
  // Repositorios
  private bookRepository: BookRepository;
  private userRepository: UserRepository;
  private loanRepository: LoanRepository;

  // Servicios
  private idGenerator: IdGenerator;

  // Casos de uso
  private registerBookUseCase: RegisterBookUseCase;
  private loanBookUseCase: LoanBookUseCase;
  // ... etc

  constructor() {
    this.setupRepositories();
    this.setupServices();
    this.setupUseCases();
  }

  private setupRepositories(): void {
    // Puedes cambiar entre implementaciones aquí
    const useInMemory = process.env.USE_IN_MEMORY === 'true';

    if (useInMemory) {
      this.bookRepository = new InMemoryBookRepository();
      this.userRepository = new InMemoryUserRepository();
      this.loanRepository = new InMemoryLoanRepository();
    } else {
      const pool = createPgPool();
      this.bookRepository = new PgBookRepository(pool);
      this.userRepository = new PgUserRepository(pool);
      this.loanRepository = new PgLoanRepository(pool);
    }
  }

  private setupServices(): void {
    this.idGenerator = new UuidIdGenerator();
  }

  private setupUseCases(): void {
    this.registerBookUseCase = new RegisterBookUseCase(
      this.bookRepository,
      this.idGenerator
    );

    this.loanBookUseCase = new LoanBookUseCase(
      this.userRepository,
      this.bookRepository,
      this.loanRepository,
      this.idGenerator
    );

    // ... otros casos de uso
  }

  // Getters para acceder a los casos de uso
  getRegisterBookUseCase(): RegisterBookUseCase {
    return this.registerBookUseCase;
  }

  // ... otros getters
}
```

**Ventajas del contenedor**:
- Un solo lugar para cambiar implementaciones
- Fácil cambiar de InMemory a PostgreSQL
- Los casos de uso no conocen las implementaciones concretas

## Servidor Express

El servidor configura Express y conecta los controllers.

```typescript
// infrastructure/bootstrap/server.ts
export class Server {
  private app: express.Application;
  private container: Container;

  constructor() {
    this.container = new Container();
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(cors());
  }

  private setupRoutes(): void {
    // Crear controllers con casos de uso inyectados
    const bookController = new BookController(
      this.container.getRegisterBookUseCase(),
      this.container.getGetAvailableBooksUseCase()
    );

    const loanController = new LoanController(
      this.container.getLoanBookUseCase(),
      this.container.getReturnBookUseCase(),
      // ... otros casos de uso
    );

    // Montar routers
    this.app.use('/books', bookController.router);
    this.app.use('/loans', loanController.router);
  }

  start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }
}
```

## Flujo Completo de una Petición

Vamos a ver el flujo completo de principio a fin:

```
1. 🌐 Cliente hace petición
   POST /loans
   Body: { userId: "abc", bookId: "xyz" }
       ↓
2. 🔵 Express Router
   app.use('/loans', loanController.router)
       ↓
3. 🎯 LoanController
   async createLoan(req, res) {
     const command = { userId: req.body.userId, ... };
     const loan = await this.loanBookUseCase.execute(command);
     res.json(loan);
   }
       ↓
4. 🎬 LoanBookUseCase
   async execute(command) {
     const user = await userRepository.findById(...);
     const book = await bookRepository.findById(...);
     const loan = user.borrowBook(book, loanId);
     await loanRepository.save(loan);
     return toDTO(loan);
   }
       ↓
5. 🟢 PgBookRepository (ejemplo)
   async findById(id) {
     const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
     return Book.reconstitute(result.rows[0]);
   }
       ↓
6. 💎 User.borrowBook() (dominio)
   borrowBook(book, loanId) {
     if (this.hasPenalties()) throw ...;
     if (this.activeLoans.length >= 3) throw ...;
     if (!book.isAvailable()) throw ...;
     const loan = Loan.create(...);
     book.markAsBorrowed();
     return loan;
   }
       ↓
7. 🟢 PgLoanRepository
   async save(loan) {
     await pool.query('INSERT INTO loans ...', [...]);
   }
       ↓
8. 🌐 Cliente recibe respuesta
   201 Created
   { success: true, data: { id: "loan-123", ... } }
```

Mira tú, **el dominio (paso 6) no sabe NADA de HTTP ni de PostgreSQL**. Solo conoce las interfaces.

## Múltiples Adaptadores para la Misma Interfaz

Una de las mayores ventajas de la arquitectura hexagonal: puedes tener múltiples adaptadores primarios para el mismo dominio.

### Ejemplo: CLI además de REST

```typescript
// CLI Adapter (adaptador primario alternativo)
export class BookCLI {
  constructor(
    private readonly registerBookUseCase: RegisterBookUseCase
  ) {}

  async run(args: string[]): Promise<void> {
    const [command, ...params] = args;

    if (command === 'register') {
      const [isbn, title, author] = params;
      const book = await this.registerBookUseCase.execute({
        isbn, title, author
      });
      console.log(`Book registered: ${book.id}`);
    }
  }
}

// Uso:
// $ node cli.js register "978-0-13-468599-1" "Clean Architecture" "Uncle Bob"
```

**Mismo dominio, mismo caso de uso, diferente adaptador.** Eso está fetén, ¿no?

## Testing de Infraestructura

### Testing de Controllers

Los controllers se testean con request/response mockeados.

```typescript
describe('BookController', () => {
  it('should return 201 when registering a book', async () => {
    // Arrange
    const mockUseCase = {
      execute: jest.fn().mockResolvedValue({
        id: 'book-123',
        isbn: '978-0-13-468599-1',
        title: 'Clean Architecture',
        author: 'Uncle Bob',
        status: 'AVAILABLE'
      })
    };

    const controller = new BookController(mockUseCase as any, {} as any);

    const req = {
      body: {
        isbn: '978-0-13-468599-1',
        title: 'Clean Architecture',
        author: 'Uncle Bob'
      }
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    // Act
    await controller.registerBook(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        id: 'book-123'
      })
    });
  });
});
```

### Testing de Repositorios

Los repositorios se testean con BD real (o test containers).

```typescript
describe('PgBookRepository', () => {
  let pool: Pool;
  let repository: PgBookRepository;

  beforeAll(async () => {
    pool = new Pool({ connectionString: TEST_DB_URL });
    repository = new PgBookRepository(pool);

    // Crear tablas
    await pool.query(`CREATE TABLE IF NOT EXISTS books (...)`);
  });

  afterEach(async () => {
    await pool.query('TRUNCATE books');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should save and retrieve a book', async () => {
    // Arrange
    const book = Book.create({
      id: BookId.create('book-123'),
      isbn: ISBN.create('978-0-13-468599-1'),
      title: 'Clean Architecture',
      author: 'Uncle Bob'
    });

    // Act
    await repository.save(book);
    const retrieved = await repository.findById(book.id);

    // Assert
    expect(retrieved).toBeDefined();
    expect(retrieved!.title).toBe('Clean Architecture');
  });
});
```

## Errores Comunes

### 1. Controllers con demasiada lógica

```typescript
// ❌ MALO
async createLoan(req, res) {
  const user = await userRepo.findById(req.body.userId);
  if (!user) return res.status(404).json({...});

  if (user.activeLoans.length >= 3) {
    return res.status(400).json({ error: 'Too many loans' });
  }

  // Mucha lógica en el controller!
}

// ✅ BUENO
async createLoan(req, res) {
  try {
    const loan = await this.loanBookUseCase.execute(req.body);
    res.status(201).json({ data: loan });
  } catch (error) {
    this.handleError(res, error);
  }
}
```

### 2. Repositorios que no implementan todas las interfaces

```typescript
// ❌ MALO
class PgBookRepository implements BookRepository {
  async save(book: Book) { /* implementado */ }
  async findById(id: BookId) { /* implementado */ }
  // ¡Falta findByIsbn!
}

// TypeScript te da error de compilación si faltan métodos
```

### 3. Mixing de responsabilidades

```typescript
// ❌ MALO - El repositorio valida
class PgBookRepository {
  async save(book: Book) {
    if (book.title.length < 3) {
      throw new Error('Title too short');
    }
    // ...
  }
}

// ✅ BUENO - El dominio valida, el repo solo persiste
class Book {
  static create(params) {
    if (params.title.length < 3) {
      throw new Error('Title too short');
    }
    // ...
  }
}
```

## Resumen

La infraestructura:
- **Implementa** las interfaces del dominio
- **Conecta** el dominio con el mundo externo
- **Traduce** entre protocolos externos y dominio
- **Es intercambiable** (puedes cambiar de BD sin tocar dominio)

Recuerda, mi niño: **la infraestructura es el pegamento. Une las piezas pero no toma decisiones de negocio**.

¿Te quedó clarito o le damos otra vuelta? 🚀
