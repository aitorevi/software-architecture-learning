/**
 * ============================================================================
 * 🐘 PATRÓN REPOSITORY - PASO 7: IMPLEMENTACIÓN POSTGRESQL (Adaptador)
 * ============================================================================
 *
 * ¡Venga, mi niño! Esta es la otra implementación del mismo PUERTO.
 * Es como tener dos barcos diferentes que atracan en el mismo muelle.
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * ────────────────────
 * Es un ADAPTADOR de salida (driven adapter) que:
 * - Implementa la MISMA interface BookRepository que InMemory
 * - Persiste en POSTGRESQL (base de datos relacional)
 * - Está en infrastructure (como InMemory)
 *
 * LO MÁGICO DE LA ARQUITECTURA HEXAGONAL:
 * ──────────────────────────────────────
 *
 *                    DOMINIO
 *                       │
 *                       │ define
 *                       ↓
 *           ┌───────────────────────┐
 *           │  BookRepository       │  ← PUERTO (interface)
 *           │  (interface)          │
 *           └───────────────────────┘
 *                       ↑
 *                       │ implements
 *          ┌────────────┴────────────┐
 *          │                         │
 *  ┌───────┴──────────┐   ┌──────────┴────────┐
 *  │  InMemoryBook    │   │  PostgresBook     │  ← ADAPTADORES
 *  │  Repository      │   │  Repository       │    (implementations)
 *  └──────────────────┘   └───────────────────┘
 *         │                         │
 *         ↓                         ↓
 *     Map (RAM)                PostgreSQL
 *
 * Fíjate: AMBOS implementan el MISMO contrato (BookRepository).
 * El UseCase NO SABE cuál está usando.
 *
 * INTERCAMBIABILIDAD:
 * ──────────────────
 * Puedes cambiar de InMemory a PostgreSQL (o viceversa) en UN SOLO LUGAR:
 * el container (donde se inyectan las dependencias).
 *
 * El resto del código (dominio, casos de uso, controladores) NO CAMBIA.
 * Eso está fetén!
 *
 * VENTAJAS DE POSTGRESQL:
 * ──────────────────────
 * 1. PERSISTENCIA: Los datos sobreviven al reinicio
 * 2. TRANSACCIONES: ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad)
 * 3. ESCALABILIDAD: Millones de registros
 * 4. QUERIES COMPLEJAS: JOINs, índices, aggregations
 * 5. CONCURRENCIA: Múltiples usuarios simultáneos
 *
 * DESVENTAJAS:
 * ───────────
 * - Más lento que memoria (I/O a disco)
 * - Requiere configuración (instalar PostgreSQL, crear BD...)
 * - Más complejo de testear
 *
 * RESPONSABILIDAD EXTRA: MAPPING
 * ─────────────────────────────
 * Este adaptador tiene que hacer el MAPPING bidireccional:
 *
 *   Entidad (dominio)  ↔  Row (PostgreSQL)
 *   ─────────────────      ────────────────
 *   Book                   { id: "...", isbn: "...", ... }
 *   - BookId                 id: string
 *   - ISBN                   isbn: string
 *   - BookStatus enum        status: string
 *   - Date                   created_at: timestamp
 *
 * Métodos de mapping:
 * - save(): Book → SQL INSERT/UPDATE
 * - rowToBook(): SQL row → Book.reconstitute()
 *
 * 👉 SIGUIENTE ARCHIVO: ../../bootstrap/container.ts
 *    (Para ver cómo se ELIGE entre InMemory y PostgreSQL en runtime)
 * ============================================================================
 */

import { Pool } from 'pg';
import {
  BookRepository,
  Book,
  BookId,
  ISBN,
  BookStatus,
} from '../../../domain';

export class PostgresBookRepository implements BookRepository {
  /**
   * POOL DE CONEXIONES
   * ─────────────────
   * Pool es una colección de conexiones reutilizables a PostgreSQL.
   *
   * Ventajas del Pool:
   * - Reutiliza conexiones (no abre/cierra por cada query)
   * - Más rápido (evita handshake TCP cada vez)
   * - Limita conexiones concurrentes (no satura el servidor)
   *
   * Se inyecta via constructor (inyección de dependencias).
   */
  constructor(private readonly pool: Pool) {}

  /**
   * SAVE: Guardar (UPSERT)
   * ──────────────────────
   * PASOS:
   * 1. Extraer valores primitivos de la entidad Book
   * 2. Construir query SQL (INSERT ... ON CONFLICT UPDATE)
   * 3. Ejecutar query con parámetros
   *
   * MAPPING: Entidad → SQL
   * ─────────────────────
   *   book.id.getValue()    →  $1 (string)
   *   book.isbn.getValue()  →  $2 (string)
   *   book.title            →  $3 (string)
   *   book.author           →  $4 (string)
   *   book.status           →  $5 (enum as string)
   *   book.createdAt        →  $6 (Date as timestamp)
   *
   * ON CONFLICT (UPSERT):
   * ────────────────────
   * - Si el ID ya existe: hace UPDATE
   * - Si el ID no existe: hace INSERT
   *
   * Esto es equivalente a:
   * - MySQL: INSERT ... ON DUPLICATE KEY UPDATE
   * - MongoDB: updateOne({ _id }, { $set }, { upsert: true })
   */
  async save(book: Book): Promise<void> {
    const query = `
      INSERT INTO books (id, isbn, title, author, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        isbn = EXCLUDED.isbn,
        title = EXCLUDED.title,
        author = EXCLUDED.author,
        status = EXCLUDED.status
    `;

    // Parámetros: extraemos valores primitivos de los Value Objects
    await this.pool.query(query, [
      book.id.getValue(),      // Value Object → string
      book.isbn.getValue(),    // Value Object → string
      book.title,              // string
      book.author,             // string
      book.status,             // enum → string
      book.createdAt,          // Date → timestamp
    ]);

    // Nota: createdAt NO se actualiza en el UPDATE (solo en INSERT)
  }

  /**
   * FIND BY ID: Buscar por ID
   * ─────────────────────────
   * PASOS:
   * 1. Ejecutar SELECT con parámetro $1
   * 2. Si no hay resultados, devolver null
   * 3. Si hay resultado, convertir row → Book
   *
   * PARÁMETROS PARAMETRIZADOS ($1, $2...):
   * ──────────────────────────────────────
   * Usamos $1 en vez de concatenar strings.
   *
   * ¿Por qué?
   * - Previene SQL Injection
   * - PostgreSQL cachea el plan de ejecución
   * - Más rápido en queries repetidas
   *
   * MAL:  "SELECT * FROM books WHERE id = '" + id + "'"  ← SQL Injection!
   * BIEN: "SELECT * FROM books WHERE id = $1" + [id]     ← Seguro
   */
  async findById(id: BookId): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE id = $1';
    const result = await this.pool.query(query, [id.getValue()]);

    if (result.rows.length === 0) {
      return null;  // No encontrado
    }

    // Convertir row de SQL → entidad Book
    return this.rowToBook(result.rows[0]);
  }

  /**
   * FIND BY ISBN: Buscar por ISBN
   * ─────────────────────────────
   * Similar a findById, pero filtra por ISBN.
   *
   * En producción podrías añadir un índice:
   * CREATE INDEX idx_books_isbn ON books(isbn);
   */
  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE isbn = $1';
    const result = await this.pool.query(query, [isbn.getValue()]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToBook(result.rows[0]);
  }

  /**
   * FIND AVAILABLE: Buscar disponibles
   * ──────────────────────────────────
   * Filtra por status = 'AVAILABLE' y ordena por título.
   *
   * FÍJATE:
   * - WHERE status = 'AVAILABLE' ← Concepto de negocio
   * - ORDER BY title ← Ordenamiento para UX
   *
   * En producción:
   * - Añade índice: CREATE INDEX idx_books_status ON books(status);
   * - Considera paginación (LIMIT, OFFSET)
   */
  async findAvailable(): Promise<Book[]> {
    const query = "SELECT * FROM books WHERE status = 'AVAILABLE' ORDER BY title";
    const result = await this.pool.query(query);

    // Convertir cada row → Book
    return result.rows.map((row) => this.rowToBook(row));
  }

  /**
   * FIND ALL: Buscar todos
   * ──────────────────────
   * Devuelve todos los libros ordenados por título.
   *
   * CUIDADO: Con millones de libros, esto puede ser lento.
   * Considera:
   * - LIMIT/OFFSET (paginación)
   * - Cursor-based pagination (más eficiente)
   * - Streaming (procesar de a lotes)
   */
  async findAll(): Promise<Book[]> {
    const query = 'SELECT * FROM books ORDER BY title';
    const result = await this.pool.query(query);
    return result.rows.map((row) => this.rowToBook(row));
  }

  /**
   * DELETE: Eliminar por ID
   * ───────────────────────
   * Elimina físicamente el registro de la tabla.
   *
   * ALTERNATIVA (Soft Delete):
   * En sistemas reales, considera NO eliminar físicamente:
   *
   *   UPDATE books SET deleted_at = NOW() WHERE id = $1
   *
   * Ventajas del soft delete:
   * - Puedes recuperar datos borrados "por error"
   * - Auditoría (sabes QUÉ se borró y CUÁNDO)
   * - Integridad referencial (loans sigue apuntando a books)
   */
  async delete(id: BookId): Promise<void> {
    const query = 'DELETE FROM books WHERE id = $1';
    await this.pool.query(query, [id.getValue()]);
  }

  /**
   * EXISTS BY ISBN: Verificar existencia
   * ────────────────────────────────────
   * Optimización: solo verifica si existe, no carga los datos.
   *
   * SELECT 1 vs SELECT *:
   * - SELECT 1: solo verifica existencia (rápido)
   * - SELECT *: carga todas las columnas (lento, innecesario)
   *
   * Esta query es MUCHO más rápida cuando hay índice en ISBN.
   */
  async existsByIsbn(isbn: ISBN): Promise<boolean> {
    const query = 'SELECT 1 FROM books WHERE isbn = $1';
    const result = await this.pool.query(query, [isbn.getValue()]);
    return result.rows.length > 0;
  }

  /**
   * ════════════════════════════════════════════════════════════════
   * MAPPER: Row de SQL → Entidad Book
   * ════════════════════════════════════════════════════════════════
   * Método PRIVADO que convierte un row de PostgreSQL a una entidad.
   *
   * PASOS:
   * 1. Extraer valores del row (Record<string, unknown>)
   * 2. Convertir primitivos → Value Objects
   * 3. Usar Book.reconstitute() (NO create)
   *
   * MAPPING: SQL → Entidad
   * ─────────────────────
   *   row.id (string)        →  BookId.create()
   *   row.isbn (string)      →  ISBN.create()
   *   row.title (string)     →  title
   *   row.author (string)    →  author
   *   row.status (string)    →  BookStatus (cast)
   *   row.created_at (date)  →  new Date()
   *
   * ¿POR QUÉ reconstitute() EN VEZ DE create()?
   * ───────────────────────────────────────────
   * - reconstitute: "Este libro ya existía, lo estoy recuperando de BD"
   * - create: "Este libro es NUEVO, lo estoy creando ahora"
   *
   * Si usáramos create(), emitiría BookRegisteredEvent otra vez.
   * Eso estaría mal: el libro YA se registró antes.
   *
   * CAST (as string, as BookStatus):
   * ───────────────────────────────
   * PostgreSQL devuelve Record<string, unknown>.
   * Tenemos que hacer cast para que TypeScript confíe.
   *
   * En producción podrías añadir validación:
   *   if (!row.id || typeof row.id !== 'string') {
   *     throw new Error('Invalid row: missing id');
   *   }
   */
  private rowToBook(row: Record<string, unknown>): Book {
    return Book.reconstitute({
      id: BookId.create(row.id as string),
      isbn: ISBN.create(row.isbn as string),
      title: row.title as string,
      author: row.author as string,
      status: row.status as BookStatus,
      createdAt: new Date(row.created_at as string),
    });
  }
}
