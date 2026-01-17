import { Book } from '../entities';
import { BookId, ISBN } from '../value-objects';

/**
 * BookRepository Interface
 *
 * Define el contrato para persistencia de libros.
 * Implementado por: InMemoryBookRepository, PostgresBookRepository, etc.
 *
 * ¿Por qué interface en el dominio?
 * - El dominio DEFINE qué necesita
 * - La infraestructura IMPLEMENTA cómo se hace
 * - Permite cambiar de BD sin tocar el dominio
 */
export interface BookRepository {
  /**
   * Guarda un libro (crear o actualizar)
   */
  save(book: Book): Promise<void>;

  /**
   * Busca un libro por su ID
   */
  findById(id: BookId): Promise<Book | null>;

  /**
   * Busca un libro por ISBN
   */
  findByIsbn(isbn: ISBN): Promise<Book | null>;

  /**
   * Obtiene todos los libros disponibles
   */
  findAvailable(): Promise<Book[]>;

  /**
   * Obtiene todos los libros
   */
  findAll(): Promise<Book[]>;

  /**
   * Elimina un libro por ID
   */
  delete(id: BookId): Promise<void>;

  /**
   * Verifica si existe un libro con el ISBN dado
   */
  existsByIsbn(isbn: ISBN): Promise<boolean>;
}
