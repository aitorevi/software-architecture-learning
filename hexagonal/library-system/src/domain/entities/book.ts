/**
 * ============================================================================
 * 📘 PATRÓN REPOSITORY - PASO 5: ENTIDAD DE DOMINIO (La chicha del negocio)
 * ============================================================================
 *
 * ¡Venga, mi niño! Ahora estamos en el NÚCLEO del dominio.
 * La entidad Book es donde vive la LÓGICA DE NEGOCIO pura.
 *
 * ¿QUÉ ES UNA ENTIDAD?
 * ───────────────────
 * - Tiene IDENTIDAD única (BookId)
 * - Tiene COMPORTAMIENTO (métodos que cambian su estado)
 * - Tiene REGLAS DE NEGOCIO (invariantes que siempre se cumplen)
 * - Es MUTABLE (su estado puede cambiar en el tiempo)
 *
 * DIFERENCIA: Entidad vs DTO
 * ─────────────────────────
 *
 *   DTO (BookResponse)              Entidad (Book)
 *   ──────────────────              ──────────────
 *   - Primitivos (string)           - Value Objects (BookId, ISBN)
 *   - Sin métodos                   - Con métodos de negocio
 *   - Para transporte               - Para lógica de negocio
 *   - Inmutable (readonly)          - Mutable (cambia de estado)
 *
 * ¿POR QUÉ Book ES UN AGGREGATE ROOT?
 * ──────────────────────────────────
 * Mira tú, este concepto viene de Domain-Driven Design (DDD):
 *
 * 1. IDENTIDAD PROPIA
 *    - Cada libro se identifica por su BookId (no por ISBN)
 *    - Dos libros con mismo ISBN son DIFERENTES (copias físicas)
 *
 * 2. FRONTERA DE CONSISTENCIA
 *    - Book mantiene sus propias reglas invariantes
 *    - Ejemplo: "No puedes prestar un libro ya prestado"
 *    - Nadie de fuera puede romper estas reglas
 *
 * 3. PUNTO DE ENTRADA
 *    - Para cambiar el estado de un libro, llamas a sus métodos
 *    - No modificas book.status directamente (es privado)
 *    - Llamas a book.markAsBorrowed() (encapsulación)
 *
 * PATRÓN REPOSITORY Y ENTIDADES:
 * ─────────────────────────────
 *
 *   Repository                      Entidad
 *   ──────────                      ───────
 *        │                             │
 *        │  save(book: Book)           │
 *        ├────────────────────────────>│
 *        │                             │
 *        │  Convierte a row/document   │
 *        │  {                          │
 *        │    id: "123",               │
 *        │    isbn: "978...",          │
 *        │    status: "AVAILABLE"      │
 *        │  }                          │
 *        │                             │
 *        ├────> INSERT INTO books      │
 *        │                             │
 *        │  findById(id)               │
 *        <────────────────────────────┤
 *        │                             │
 *        │  SELECT * FROM books        │
 *        │                             │
 *        │  Book.reconstitute(props) ← Reconstruye la entidad
 *        │                             │
 *        │  return book                │
 *        ├────────────────────────────>│
 *
 * Fíjate en dos métodos clave:
 * - Book.create(): para NUEVOS libros (emite eventos)
 * - Book.reconstitute(): para libros DESDE BD (sin eventos)
 *
 * 👉 SIGUIENTE ARCHIVO: ../../infrastructure/persistence/in-memory/in-memory-book.repository.ts
 *    (Para ver cómo se IMPLEMENTA el Repository con estas entidades)
 * ============================================================================
 */

import { BookId, ISBN } from '../value-objects';
import { DomainEvent, BookRegisteredEvent } from '../events';
import { BookNotAvailableException } from '../exceptions';

/**
 * ENUM: Estado del libro
 * ─────────────────────
 * Podría ser un Value Object, pero un enum es suficiente aquí.
 */
export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
}

/**
 * PROPS: Propiedades de la entidad
 * ───────────────────────────────
 * Usamos una interface para agrupar todas las props.
 * Esto facilita crear y reconstituir la entidad.
 *
 * Fíjate que usa:
 * - Value Objects (BookId, ISBN) ← NO primitivos
 * - Date (no string)
 * - Enum (BookStatus)
 */
export interface BookProps {
  id: BookId;
  isbn: ISBN;
  title: string;
  author: string;
  status: BookStatus;
  createdAt: Date;
}

export class Book {
  /**
   * EVENTOS DE DOMINIO
   * ─────────────────
   * Los eventos capturan "cosas que pasaron" en el dominio.
   * Ejemplo: BookRegisteredEvent
   *
   * Se usan para:
   * - Event Sourcing
   * - Comunicación entre Bounded Contexts
   * - Auditoría
   */
  private readonly domainEvents: DomainEvent[] = [];

  /**
   * CONSTRUCTOR PRIVADO
   * ──────────────────
   * Fíjate que el constructor es PRIVADO.
   * No puedes hacer: new Book(...)
   *
   * ¿Por qué?
   * - Forzamos usar los factory methods (create o reconstitute)
   * - Controlamos cómo se crean los libros
   * - Aseguramos que siempre están en estado válido
   */
  private constructor(private props: BookProps) {}

  /**
   * FACTORY METHOD: create
   * ─────────────────────
   * Se usa para crear UN NUEVO libro (que NO existía en BD).
   *
   * Responsabilidades:
   * 1. Establecer estado inicial (AVAILABLE)
   * 2. Establecer fecha de creación (now)
   * 3. Emitir evento de dominio (BookRegisteredEvent)
   *
   * CUÁNDO USAR:
   * - En UseCase cuando el usuario registra un libro nuevo
   *
   * Ejemplo:
   *   const book = Book.create({
   *     id: BookId.create("abc-123"),
   *     isbn: ISBN.create("978-..."),
   *     title: "Clean Code",
   *     author: "Robert C. Martin"
   *   });
   */
  static create(params: {
    id: BookId;
    isbn: ISBN;
    title: string;
    author: string;
  }): Book {
    const book = new Book({
      id: params.id,
      isbn: params.isbn,
      title: params.title,
      author: params.author,
      status: BookStatus.AVAILABLE,  // ← Estado inicial
      createdAt: new Date(),          // ← Fecha actual
    });

    // Emitir evento: "Se registró un libro nuevo"
    book.addDomainEvent(
      new BookRegisteredEvent(
        params.id.getValue(),
        params.isbn.getValue(),
        params.title
      )
    );

    return book;
  }

  /**
   * FACTORY METHOD: reconstitute
   * ────────────────────────────
   * Se usa para RECONSTRUIR un libro desde la BD.
   *
   * Responsabilidades:
   * 1. Crear la entidad con los datos de BD (status, createdAt ya existen)
   * 2. NO emitir eventos (ya pasó, es historia)
   * 3. NO cambiar nada (es una reconstitución fiel)
   *
   * CUÁNDO USAR:
   * - En el Repository cuando haces findById(), findAll(), etc.
   * - Cuando hidratas datos desde PostgreSQL, MongoDB, etc.
   *
   * DIFERENCIA CON create():
   * ────────────────────────
   *   create()                  reconstitute()
   *   ────────                  ──────────────
   *   Nuevo libro               Libro existente
   *   Estado = AVAILABLE        Estado viene de BD
   *   createdAt = now           createdAt viene de BD
   *   Emite evento              NO emite evento
   *
   * Ejemplo (dentro del Repository):
   *   const row = await db.query("SELECT * FROM books WHERE id = $1");
   *   const book = Book.reconstitute({
   *     id: BookId.create(row.id),
   *     isbn: ISBN.create(row.isbn),
   *     title: row.title,
   *     author: row.author,
   *     status: row.status,        // ← Desde BD
   *     createdAt: row.created_at  // ← Desde BD
   *   });
   */
  static reconstitute(props: BookProps): Book {
    return new Book(props);
  }

  /**
   * ════════════════════════════════════════════════════════════════
   * GETTERS (Acceso a las propiedades)
   * ════════════════════════════════════════════════════════════════
   * Devuelven las props de forma controlada.
   * No puedes hacer book.props.status = ... (props es private)
   * Solo puedes leer: book.status
   */
  get id(): BookId {
    return this.props.id;
  }

  get isbn(): ISBN {
    return this.props.isbn;
  }

  get title(): string {
    return this.props.title;
  }

  get author(): string {
    return this.props.author;
  }

  get status(): BookStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * ════════════════════════════════════════════════════════════════
   * COMPORTAMIENTO DE NEGOCIO (Métodos públicos)
   * ════════════════════════════════════════════════════════════════
   * Aquí es donde vive la LÓGICA DE NEGOCIO, mi niño.
   */

  /**
   * Verifica si el libro está disponible
   * ────────────────────────────────────
   * Esto es una QUERY (no cambia estado).
   * Se usa antes de intentar prestarlo.
   */
  isAvailable(): boolean {
    return this.props.status === BookStatus.AVAILABLE;
  }

  /**
   * Marca el libro como prestado
   * ────────────────────────────
   * Esto es un COMMAND (cambia estado).
   *
   * REGLA DE NEGOCIO:
   * Solo se puede prestar si está disponible.
   * Si ya está prestado, lanza excepción.
   *
   * Fíjate que esto NO se valida en el UseCase ni en el Repository.
   * Se valida AQUÍ, en la entidad, porque es una REGLA INVARIANTE.
   *
   * @throws BookNotAvailableException si ya está prestado
   */
  markAsBorrowed(): void {
    if (!this.isAvailable()) {
      throw new BookNotAvailableException(
        this.props.id.getValue(),
        'Book is already borrowed'
      );
    }
    this.props.status = BookStatus.BORROWED;
  }

  /**
   * Marca el libro como devuelto/disponible
   * ───────────────────────────────────────
   * Cambia el estado a AVAILABLE.
   *
   * En un sistema más complejo podrías validar:
   * - ¿Estaba realmente prestado?
   * - ¿Está en buen estado?
   * - ¿Tiene multa pendiente?
   */
  markAsReturned(): void {
    this.props.status = BookStatus.AVAILABLE;
  }

  /**
   * ════════════════════════════════════════════════════════════════
   * EVENTOS DE DOMINIO (Domain Events)
   * ════════════════════════════════════════════════════════════════
   */

  /**
   * Añade un evento de dominio
   * ──────────────────────────
   * Los eventos se acumulan y luego se publican (patrón Event Sourcing).
   */
  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Obtiene y limpia los eventos de dominio
   * ───────────────────────────────────────
   * Se llama después de persistir la entidad.
   * Los eventos se publican a un EventBus para que otros contextos reaccionen.
   */
  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  /**
   * ════════════════════════════════════════════════════════════════
   * IGUALDAD (Equality)
   * ════════════════════════════════════════════════════════════════
   * Dos libros son iguales si tienen el mismo ID.
   *
   * Aunque tengan ISBN diferente (error), si el ID coincide, son el mismo.
   * Las entidades se identifican por ID, no por sus atributos.
   */
  equals(other: Book): boolean {
    return this.props.id.equals(other.id);
  }
}
