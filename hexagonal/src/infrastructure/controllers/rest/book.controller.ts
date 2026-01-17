/**
 * ============================================================================
 * 📚 PATRÓN REPOSITORY - PASO 1: CONTROLLER (Adaptador de Entrada HTTP)
 * ============================================================================
 *
 * ¡Buenas, mi niño! Este es el PUNTO DE ENTRADA de nuestra aplicación.
 * Aquí es donde llegan las peticiones HTTP del mundo exterior.
 *
 * EN EL PATRÓN REPOSITORY, el Controller:
 * ────────────────────────────────────────
 * 1. Recibe datos "crudos" del exterior (JSON del body HTTP)
 * 2. Los transforma en DTOs/Commands (objetos simples con tipos)
 * 3. Llama al Caso de Uso correspondiente
 * 4. El Caso de Uso usará el Repository (pero el Controller no lo sabe!)
 * 5. Devuelve la respuesta HTTP al cliente
 *
 * FLUJO COMPLETO:
 * ──────────────
 *   HTTP Request (JSON)
 *        ↓
 *   Controller (AQUÍ ESTÁS) ← Adaptador de Entrada
 *        ↓
 *   DTO/Command
 *        ↓
 *   UseCase
 *        ↓
 *   Repository Interface (puerto)
 *        ↓
 *   Repository Implementation (adaptador)
 *        ↓
 *   Base de Datos
 *
 * ¿POR QUÉ EL CONTROLLER ESTÁ EN INFRASTRUCTURE?
 * ─────────────────────────────────────────────
 * Mira tú, esto es CLAVE para entender la hexagonal:
 *
 * - El Controller es un ADAPTADOR de entrada (driving adapter)
 * - Depende de HTTP/Express (detalle de infraestructura)
 * - Si mañana cambias de Express a Fastify, solo tocas esto
 * - El dominio y casos de uso NO SABEN que existe HTTP
 *
 * ¿POR QUÉ TAN SIMPLE?
 * ──────────────────
 * - NO tiene lógica de negocio (eso va en el dominio)
 * - NO sabe de bases de datos (eso va en el repository)
 * - Solo traduce: HTTP ↔ DTOs ↔ UseCase
 * - Solo maneja errores HTTP (códigos 200, 400, 500...)
 *
 * 👉 SIGUIENTE ARCHIVO: ../../../application/dtos/book.dto.ts
 *    (Para entender qué son los DTOs/Commands que creamos aquí)
 * ============================================================================
 */

import { Request, Response, Router } from 'express';
import {
  RegisterBookUseCase,
  GetAvailableBooksUseCase,
  RegisterBookCommand,
} from '../../../application';
import { DomainException } from '../../../domain';
export class BookController {
  public readonly router: Router;

  /**
   * INYECCIÓN DE DEPENDENCIAS
   * ─────────────────────────
   * Fíjate que el Controller NO crea los UseCases, los RECIBE.
   * Esto es inyección de dependencias, mi niño.
   *
   * Ventajas:
   * - Fácil de testear (pasas mocks de los use cases)
   * - No acoplamiento (no sabe cómo se crean los use cases)
   * - Flexible (puedes cambiar la implementación desde fuera)
   */
  constructor(
    private readonly registerBookUseCase: RegisterBookUseCase,
    private readonly getAvailableBooksUseCase: GetAvailableBooksUseCase
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/', this.registerBook.bind(this));
    this.router.get('/available', this.getAvailableBooks.bind(this));
  }

  /**
   * POST /books - Registra un nuevo libro
   * ──────────────────────────────────────
   *
   * FLUJO DE ESTA PETICIÓN:
   * 1. Llega JSON: { "isbn": "978-...", "title": "...", "author": "..." }
   * 2. Creamos un Command (DTO) con los datos
   * 3. Llamamos al UseCase.execute(command)
   * 4. El UseCase orquesta: crea entidad, llama repository, etc.
   * 5. Devolvemos respuesta HTTP 201 (Created)
   *
   * Mira tú cómo NO hay validación de negocio aquí:
   * - No validamos el ISBN (eso lo hace el Value Object)
   * - No validamos si existe (eso lo hace el UseCase)
   * - Solo traducimos HTTP → Command → UseCase
   */
  private async registerBook(req: Request, res: Response): Promise<void> {
    try {
      // PASO 1: Crear Command (DTO) desde el body HTTP
      // ──────────────────────────────────────────────
      const command: RegisterBookCommand = {
        isbn: req.body.isbn,
        title: req.body.title,
        author: req.body.author,
      };

      // PASO 2: Llamar al UseCase
      // ─────────────────────────
      // El UseCase se encarga de TODO:
      // - Validar el ISBN (via Value Object)
      // - Verificar duplicados (via Repository)
      // - Crear la entidad Book
      // - Guardarla en el Repository
      const book = await this.registerBookUseCase.execute(command);

      // PASO 3: Responder con HTTP 201
      // ──────────────────────────────
      res.status(201).json({
        success: true,
        data: book,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /books/available - Lista libros disponibles
   * ───────────────────────────────────────────────
   *
   * Esta petición es más simple:
   * - No recibe parámetros
   * - Llama al UseCase
   * - El UseCase llama al Repository.findAvailable()
   * - Devolvemos los libros
   */
  private async getAvailableBooks(_req: Request, res: Response): Promise<void> {
    try {
      const books = await this.getAvailableBooksUseCase.execute();

      res.json({
        success: true,
        data: books,
        count: books.length,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * MANEJO DE ERRORES
   * ─────────────────
   * Aquí SÍ tenemos lógica específica de HTTP:
   * - DomainException → 400 (Bad Request)
   * - Error genérico → 500 (Internal Server Error)
   *
   * Esto NO puede ir en el dominio porque el dominio
   * no sabe qué es un código HTTP.
   */
  private handleError(res: Response, error: unknown): void {
    if (error instanceof DomainException) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    } else if (error instanceof Error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  }
}
