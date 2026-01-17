/**
 * ============================================================================
 * 💾 PATRÓN REPOSITORY - PASO 6: IMPLEMENTACIÓN IN-MEMORY (Adaptador)
 * ============================================================================
 *
 * ¡Buenas de nuevo, mi niño! Ahora estamos en INFRASTRUCTURE.
 * Aquí es donde IMPLEMENTAMOS el puerto (interface) que definimos en el dominio.
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * ────────────────────
 * Es un ADAPTADOR de salida (driven adapter) que:
 * - Implementa la interface BookRepository (el PUERTO)
 * - Persiste en MEMORIA (usando un Map de JavaScript)
 * - Está en infrastructure (no en domain ni application)
 *
 * ARQUITECTURA HEXAGONAL:
 * ──────────────────────
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │                        DOMINIO                          │
 *   │                                                         │
 *   │  ┌──────────────┐           ┌──────────────────────┐   │
 *   │  │    Book      │           │  BookRepository      │   │
 *   │  │  (Entidad)   │           │  (INTERFACE/PUERTO)  │   │
 *   │  └──────────────┘           └──────────────────────┘   │
 *   │                                      ↑                  │
 *   └──────────────────────────────────────┼──────────────────┘
 *                                          │
 *                                  implements (depende hacia dentro)
 *                                          │
 *   ┌──────────────────────────────────────┼──────────────────┐
 *   │                   INFRASTRUCTURE     │                  │
 *   │                                      │                  │
 *   │              ┌───────────────────────┴───────┐          │
 *   │              │  InMemoryBookRepository       │          │
 *   │              │  (IMPLEMENTACIÓN/ADAPTADOR)   │ ← AQUÍ ESTÁS
 *   │              │  - Usa Map<string, BookProps> │          │
 *   │              └───────────────────────────────┘          │
 *   │                                                         │
 *   └─────────────────────────────────────────────────────────┘
 *
 * VENTAJAS DE IN-MEMORY:
 * ─────────────────────
 * 1. VELOCIDAD: No hay I/O (disco, red)
 * 2. SIMPLICIDAD: No necesitas configurar PostgreSQL, MongoDB, etc.
 * 3. DESARROLLO: Puedes empezar sin base de datos
 * 4. TESTS: Tests rápidos sin BD real
 * 5. DEMOS: Fácil de mostrar sin setup
 *
 * DESVENTAJAS:
 * ───────────
 * - Los datos se pierden al reiniciar (no persiste)
 * - No escala (todo en RAM)
 * - No hay transacciones reales
 *
 * ¿CUÁNDO USAR?
 * ────────────
 * - Desarrollo local
 * - Tests de integración
 * - Prototipos/demos
 * - Sistemas pequeños donde la pérdida de datos es aceptable
 *
 * DIFERENCIA: InMemoryBookRepository vs FakeBookRepository
 * ────────────────────────────────────────────────────────
 *
 *   InMemoryBookRepository          FakeBookRepository
 *   ──────────────────────          ──────────────────
 *   Implementación completa         Implementación mínima
 *   Para desarrollo/demos           Solo para unit tests
 *   Funciona correctamente          Puede tener shortcuts
 *   Puedes usarlo en producción     NUNCA en producción
 *
 * 👉 SIGUIENTE ARCHIVO: ../postgresql/pg-book.repository.ts
 *    (Para ver la implementación con PostgreSQL, la otra cara de la moneda)
 * ============================================================================
 */

import {
  BookRepository,
  Book,
  BookId,
  ISBN,
  BookStatus,
  BookProps,
} from '../../../domain';

export class InMemoryBookRepository implements BookRepository {
  /**
   * STORAGE: Map en memoria
   * ──────────────────────
   * Usamos Map<string, BookProps> en vez de Map<BookId, Book> porque:
   *
   * 1. Key = string (el ID como string)
   *    - Map usa igualdad por referencia para objetos
   *    - Dos BookId("abc") diferentes son diferentes keys
   *    - string es más simple para keys
   *
   * 2. Value = BookProps (no Book)
   *    - Guardamos las PROPS, no la instancia
   *    - Simulamos lo que haría una BD (guardar datos crudos)
   *    - Al leer, reconstruimos con Book.reconstitute()
   *
   * Esto es más realista: una BD no guarda objetos JavaScript,
   * guarda datos (rows, documents...).
   */
  private books: Map<string, BookProps> = new Map();

  /**
   * SAVE: Guardar (crear o actualizar)
   * ──────────────────────────────────
   * PASOS:
   * 1. Extraer las props de la entidad Book
   * 2. Guardarlas en el Map (por ID)
   *
   * FÍJATE EN EL MAPPING:
   * ────────────────────
   *   Entidad (Book) → Persistencia (BookProps)
   *
   * En una BD real sería:
   *   Entidad (Book) → Row de tabla (SQL)
   *   Entidad (Book) → Document (MongoDB)
   *
   * Es UPSERT: si el ID existe, sobreescribe; si no, inserta.
   */
  async save(book: Book): Promise<void> {
    // IMPORTANTE: Guardamos una copia de las propiedades
    // No guardamos la instancia Book (simula cómo funciona una BD)
    const props: BookProps = {
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      status: book.status,
      createdAt: book.createdAt,
    };

    // Guardar en el Map (key = ID como string)
    this.books.set(book.id.getValue(), props);

    // En una BD real, aquí harías:
    // await db.query("INSERT INTO books ... ON CONFLICT UPDATE ...")
  }

  /**
   * FIND BY ID: Buscar por ID
   * ─────────────────────────
   * PASOS:
   * 1. Buscar en el Map por ID
   * 2. Si no existe, devolver null
   * 3. Si existe, RECONSTITUIR la entidad
   *
   * FÍJATE EN EL MAPPING:
   * ────────────────────
   *   Persistencia (BookProps) → Entidad (Book)
   *
   * Usamos Book.reconstitute(), NO Book.create():
   * - reconstitute: es un libro que ya existía (viene de BD)
   * - create: es un libro nuevo (no emitimos evento otra vez)
   */
  async findById(id: BookId): Promise<Book | null> {
    const props = this.books.get(id.getValue());

    if (!props) {
      return null;  // No existe
    }

    // RECONSTITUIR: convertir props → entidad
    return Book.reconstitute(props);

    // En una BD real, aquí harías:
    // const row = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    // return Book.reconstitute({ id: row.id, ... });
  }

  /**
   * FIND BY ISBN: Buscar por ISBN
   * ─────────────────────────────
   * Iteramos sobre todos los libros buscando el ISBN.
   *
   * En una BD real:
   * SELECT * FROM books WHERE isbn = '978-...'
   *
   * Fíjate que comparamos con .equals() (Value Object),
   * no con === (porque son objetos diferentes).
   */
  async findByIsbn(isbn: ISBN): Promise<Book | null> {
    for (const props of this.books.values()) {
      if (props.isbn.equals(isbn)) {
        return Book.reconstitute(props);
      }
    }
    return null;
  }

  /**
   * FIND AVAILABLE: Buscar disponibles
   * ──────────────────────────────────
   * Filtra los libros por status === AVAILABLE.
   *
   * En una BD real:
   * SELECT * FROM books WHERE status = 'AVAILABLE'
   */
  async findAvailable(): Promise<Book[]> {
    const available: Book[] = [];

    for (const props of this.books.values()) {
      if (props.status === BookStatus.AVAILABLE) {
        available.push(Book.reconstitute(props));
      }
    }

    return available;
  }

  /**
   * FIND ALL: Buscar todos
   * ──────────────────────
   * Devuelve todos los libros.
   *
   * CUIDADO: En producción con millones de libros, esto puede ser peligroso.
   * Considera paginación.
   */
  async findAll(): Promise<Book[]> {
    return Array.from(this.books.values()).map((props) =>
      Book.reconstitute(props)
    );

    // En una BD real:
    // SELECT * FROM books ORDER BY title
  }

  /**
   * DELETE: Eliminar por ID
   * ───────────────────────
   * Elimina del Map.
   *
   * En una BD real:
   * DELETE FROM books WHERE id = $1
   */
  async delete(id: BookId): Promise<void> {
    this.books.delete(id.getValue());
  }

  /**
   * EXISTS BY ISBN: Verificar si existe
   * ──────────────────────────────────
   * Optimización: reutiliza findByIsbn.
   *
   * En una BD real podrías optimizar:
   * SELECT 1 FROM books WHERE isbn = $1 LIMIT 1
   * (más rápido que SELECT * porque no carga todos los campos)
   */
  async existsByIsbn(isbn: ISBN): Promise<boolean> {
    return (await this.findByIsbn(isbn)) !== null;
  }

  /**
   * CLEAR: Limpiar todo (no está en la interface)
   * ─────────────────────────────────────────────
   * Método extra útil para tests de integración.
   *
   * Resetea el estado entre tests.
   * NO está en la interface BookRepository (es específico de InMemory).
   */
  clear(): void {
    this.books.clear();
  }
}
