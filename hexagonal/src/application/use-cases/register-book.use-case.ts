/**
 * ============================================================================
 * 🎯 PATRÓN REPOSITORY - PASO 3: USE CASE (Caso de Uso / Orquestador)
 * ============================================================================
 *
 * ¡Buenas de nuevo, mi niño! Ahora estamos en el corazón de la CAPA DE APLICACIÓN.
 * El UseCase es como el director de orquesta: no toca los instrumentos,
 * pero coordina a todos los músicos.
 *
 * ¿QUÉ ES UN USE CASE?
 * ───────────────────
 * - Representa UN caso de uso del negocio: "Registrar un libro"
 * - Orquesta el flujo: qué hacer primero, qué hacer después
 * - Usa el PUERTO (interface BookRepository), no la implementación
 * - No sabe SI los datos van a PostgreSQL, MongoDB o memoria
 *
 * RESPONSABILIDADES DEL USE CASE:
 * ──────────────────────────────
 * 1. Recibir Command (DTO con primitivos)
 * 2. Crear Value Objects (ISBN, BookId) ← Aquí se validan!
 * 3. Verificar reglas de aplicación (ej: libro duplicado)
 * 4. Crear/modificar entidades del dominio
 * 5. Llamar al Repository para persistir
 * 6. Devolver Response (DTO con primitivos)
 *
 * ¿POR QUÉ NO TIENE LÓGICA DE NEGOCIO?
 * ───────────────────────────────────
 * Mira tú, esto confunde mucho al principio:
 *
 * - Lógica de APLICACIÓN: orquestación, flujo, coordinación
 *   Ejemplo: "Primero verifico duplicados, luego creo, luego guardo"
 *
 * - Lógica de NEGOCIO: reglas invariantes del dominio
 *   Ejemplo: "Un ISBN debe tener formato válido" (eso va en ISBN Value Object)
 *   Ejemplo: "Un libro no se puede prestar si ya está prestado" (eso va en Book.markAsBorrowed)
 *
 * DONDE USA EL REPOSITORY (PATRÓN REPOSITORY):
 * ────────────────────────────────────────────
 *
 *   UseCase                        Repository Interface        Repository Impl
 *   (AQUÍ ESTÁS)                   (Puerto en dominio)         (Adaptador en infra)
 *        │                                  │                           │
 *        │  bookRepository.existsByIsbn()   │                           │
 *        ├─────────────────────────────────>│                           │
 *        │                                  │  implements                │
 *        │                                  ├──────────────────────────>│
 *        │                                  │                           │
 *        │                                  │     SELECT ... FROM books │
 *        │                                  │                           ├──> PostgreSQL
 *        │                                  │                           │
 *        │            true/false            │                           │
 *        <─────────────────────────────────┤                           │
 *
 * Fíjate en lo MÁGICO:
 * - El UseCase depende de la INTERFACE (BookRepository)
 * - NO depende de PostgresBookRepository ni InMemoryBookRepository
 * - Esto es INVERSIÓN DE DEPENDENCIAS (la D de SOLID)
 *
 * 👉 SIGUIENTE ARCHIVO: ../../domain/repositories/book.repository.ts
 *    (Para ver la INTERFACE del Repository que estamos usando aquí)
 * ============================================================================
 */

import { Book, BookId, ISBN, BookRepository, IdGenerator } from '../../domain';
import { RegisterBookCommand, BookResponse } from '../dtos';

export class RegisterBookUseCase {
  /**
   * INYECCIÓN DE DEPENDENCIAS VIA CONSTRUCTOR
   * ─────────────────────────────────────────
   * Fíjate en el tipo: BookRepository (la INTERFACE)
   * No dice PostgresBookRepository ni InMemoryBookRepository.
   *
   * Esto permite:
   * - Tests: inyectar un FakeBookRepository
   * - Desarrollo: usar InMemoryBookRepository
   * - Producción: usar PostgresBookRepository
   *
   * Todo sin cambiar UNA SOLA LÍNEA de este UseCase.
   */
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  /**
   * EXECUTE: El método principal del UseCase
   * ────────────────────────────────────────
   * FLUJO PASO A PASO (fíjate en los comentarios):
   */
  async execute(command: RegisterBookCommand): Promise<BookResponse> {
    // ──────────────────────────────────────────────────────────────
    // PASO 1: Crear Value Objects
    // ──────────────────────────────────────────────────────────────
    // Aquí transformamos el string del DTO en un Value Object.
    // Si el ISBN no es válido, ISBN.create() lanzará una excepción.
    // Esa es la VALIDACIÓN DE NEGOCIO (no está en el UseCase).
    const isbn = ISBN.create(command.isbn);

    // ──────────────────────────────────────────────────────────────
    // PASO 2: Verificar duplicados usando el REPOSITORY
    // ──────────────────────────────────────────────────────────────
    // Llamamos al PUERTO (interface BookRepository)
    // No sabemos si va a memoria, PostgreSQL, MongoDB...
    // Solo sabemos que devuelve true/false.
    const existingBook = await this.bookRepository.existsByIsbn(isbn);
    if (existingBook) {
      throw new Error(`Book with ISBN ${command.isbn} already exists`);
    }

    // ──────────────────────────────────────────────────────────────
    // PASO 3: Crear la ENTIDAD de dominio
    // ──────────────────────────────────────────────────────────────
    // Book.create() es un factory method que:
    // - Establece el estado inicial (AVAILABLE)
    // - Emite un evento de dominio (BookRegisteredEvent)
    // - Valida invariantes (si las hubiera)
    const book = Book.create({
      id: BookId.create(this.idGenerator.generate()),
      isbn,
      title: command.title,
      author: command.author,
    });

    // ──────────────────────────────────────────────────────────────
    // PASO 4: Persistir usando el REPOSITORY
    // ──────────────────────────────────────────────────────────────
    // De nuevo, llamamos al PUERTO (interface).
    // La implementación hará:
    // - InMemory: guardar en un Map
    // - PostgreSQL: INSERT INTO books...
    // - MongoDB: db.books.insertOne(...)
    //
    // Pero este UseCase NO LO SABE. Eso está fetén!
    await this.bookRepository.save(book);

    // ──────────────────────────────────────────────────────────────
    // PASO 5: Convertir la entidad a DTO de respuesta
    // ──────────────────────────────────────────────────────────────
    // Transformamos Value Objects → primitivos (string, number...)
    return this.toResponse(book);
  }

  /**
   * MAPPER: Entidad → DTO
   * ─────────────────────
   * Convierte la entidad Book (con Value Objects) a BookResponse (con primitivos).
   *
   * Fíjate en los .getValue():
   * - book.id es un BookId (Value Object)
   * - book.id.getValue() es un string
   *
   * Esto es necesario para serializar a JSON.
   */
  private toResponse(book: Book): BookResponse {
    return {
      id: book.id.getValue(),
      isbn: book.isbn.getValue(),
      title: book.title,
      author: book.author,
      status: book.status,
      createdAt: book.createdAt.toISOString(),
    };
  }
}
