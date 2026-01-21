/**
 * ============================================================================
 * 🔌 PATRÓN REPOSITORY - PASO 4: REPOSITORY INTERFACE (Puerto del Dominio)
 * ============================================================================
 *
 * ¡Anda p'allá, mi niño! Esto es LO MÁS IMPORTANTE del patrón Repository.
 * Estamos en el DOMINIO, pero definiendo cómo queremos PERSISTIR.
 *
 * ¿QUÉ ES ESTA INTERFACE?
 * ──────────────────────
 * Esta interface es un PUERTO (en términos de arquitectura hexagonal).
 * Define el CONTRATO para acceder a libros, pero NO dice CÓMO.
 *
 * Analogía del Puerto de Las Palmas:
 * ─────────────────────────────────
 * - El PUERTO define: "Aquí atracan barcos de X tamaño"
 * - No dice: "Solo barcos de Alemania" o "Solo cruceros"
 * - Cualquier barco que cumpla el contrato puede atracar
 *
 * En software:
 * - El PUERTO (interface) define: "Dame un libro por ID"
 * - No dice: "Usa PostgreSQL" o "Usa MongoDB"
 * - Cualquier implementación que cumpla el contrato sirve
 *
 * ¿POR QUÉ ESTÁ EN EL DOMINIO? ← ESTO ES CLAVE
 * ────────────────────────────────────────────
 * Mira tú, esto rompe la cabeza al principio, pero es GENIAL:
 *
 * 1. INVERSIÓN DE DEPENDENCIAS (Dependency Inversion Principle)
 *
 *    ANTES (mal):
 *    ───────────
 *    Dominio ──depende de──> Infraestructura
 *    (Book)                  (PostgresRepository)
 *
 *    Problema: El dominio conoce detalles de PostgreSQL
 *
 *    AHORA (bien):
 *    ────────────
 *    Dominio ──define──> Interface (PUERTO)
 *       ↑                     ↑
 *       │                     │
 *       │                     │ implements
 *       │                     │
 *       │                Infraestructura
 *       │             (PostgresRepository,
 *       │              InMemoryRepository...)
 *       │
 *    No depende de infraestructura!
 *
 * 2. EL DOMINIO MANDA
 *    El dominio dice: "Yo necesito guardar libros, buscarlos por ISBN..."
 *    La infraestructura responde: "Vale, yo implemento eso con PostgreSQL"
 *    Si mañana cambias a MongoDB: el dominio NO SE ENTERA.
 *
 * 3. TESTEABLE
 *    En tests puedes crear un FakeBookRepository que implemente
 *    esta interface sin usar base de datos real.
 *
 * LENGUAJE UBICUO (Ubiquitous Language):
 * ─────────────────────────────────────
 * Fíjate en los nombres de los métodos:
 * - save(book) ← lenguaje de negocio, no "insert" o "update"
 * - findById() ← no "selectById" (SQL)
 * - findAvailable() ← concepto del dominio (libros disponibles)
 *
 * Los nombres reflejan el NEGOCIO, no la tecnología.
 *
 * FIRMA DE LOS MÉTODOS:
 * ────────────────────
 * Fíjate que usan tipos del DOMINIO:
 * - Book (entidad)
 * - BookId (Value Object)
 * - ISBN (Value Object)
 *
 * NO usan:
 * - string para IDs (usa BookId)
 * - string para ISBN (usa ISBN)
 * - DTOs (usa entidades del dominio)
 *
 * Esto protege al dominio: solo acepta tipos válidos.
 *
 * 👉 SIGUIENTE ARCHIVO: ../entities/book.ts
 *    (Para ver la ENTIDAD Book que estamos persistiendo)
 * ============================================================================
 */

import { Book } from '../entities';
import { BookId, ISBN } from '../value-objects';

/**
 * BookRepository Interface
 * ───────────────────────
 * Contrato para la persistencia de libros.
 *
 * IMPLEMENTACIONES ACTUALES:
 * - InMemoryBookRepository (en infrastructure/persistence/in-memory)
 * - PostgresBookRepository (en infrastructure/persistence/postgresql)
 *
 * FUTURAS IMPLEMENTACIONES POSIBLES:
 * - MongoBookRepository
 * - RedisBookRepository
 * - FileSystemBookRepository
 * - FakeBookRepository (para tests)
 */
export interface BookRepository {
  /**
   * Guarda un libro (crear o actualizar)
   * ───────────────────────────────────
   * Implementación típica: UPSERT (insert si no existe, update si existe)
   *
   * @param book - La entidad Book completa
   * @returns Promise que se resuelve cuando se guarda
   *
   * Responsabilidad de la implementación:
   * - Convertir la entidad Book a formato de BD (row, document...)
   * - Hacer el INSERT o UPDATE
   * - Manejar errores de BD (duplicados, constraints...)
   */
  save(book: Book): Promise<void>;

  /**
   * Busca un libro por su ID
   * ────────────────────────
   * @param id - BookId (Value Object, no string)
   * @returns La entidad Book o null si no existe
   *
   * Fíjate: NO devuelve un DTO, devuelve una ENTIDAD.
   * El repository se encarga de:
   * - Hacer la query a la BD
   * - Convertir el row/document a entidad Book
   * - Usar Book.reconstitute() (no Book.create())
   */
  findById(id: BookId): Promise<Book | null>;

  /**
   * Busca un libro por ISBN
   * ───────────────────────
   * @param isbn - ISBN (Value Object, no string)
   * @returns La entidad Book o null
   *
   * Caso de uso: Verificar duplicados antes de registrar un libro
   */
  findByIsbn(isbn: ISBN): Promise<Book | null>;

  /**
   * Obtiene todos los libros disponibles
   * ────────────────────────────────────
   * @returns Array de entidades Book con status = AVAILABLE
   *
   * Fíjate: "disponibles" es un concepto de NEGOCIO.
   * La implementación traduce a: WHERE status = 'AVAILABLE'
   */
  findAvailable(): Promise<Book[]>;

  /**
   * Obtiene todos los libros
   * ────────────────────────
   * @returns Array con todas las entidades Book
   *
   * Cuidado: En producción con millones de libros,
   * este método podría necesitar paginación.
   */
  findAll(): Promise<Book[]>;

  /**
   * Elimina un libro por ID
   * ───────────────────────
   * @param id - BookId del libro a eliminar
   *
   * Nota: En sistemas reales, considera soft-delete
   * (marcar como eliminado en vez de borrar).
   */
  delete(id: BookId): Promise<void>;

  /**
   * Verifica si existe un libro con el ISBN dado
   * ────────────────────────────────────────────
   * @param isbn - ISBN a verificar
   * @returns true si existe, false si no
   *
   * Optimización: Más eficiente que findByIsbn() porque
   * solo necesita un SELECT 1, no cargar toda la entidad.
   */
  existsByIsbn(isbn: ISBN): Promise<boolean>;
}
