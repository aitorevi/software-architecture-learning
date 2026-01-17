import { Request, Response, Router } from 'express';
import {
  RegisterBookUseCase,
  GetAvailableBooksUseCase,
  RegisterBookCommand,
} from '../../../application';
import { DomainException } from '../../../domain';

/**
 * BookController
 *
 * Adaptador REST para operaciones con libros.
 *
 * ¿Por qué los controladores son tan simples?
 * - Solo traducen HTTP a casos de uso
 * - No tienen lógica de negocio
 * - Solo manejan errores y formatean respuestas
 */
export class BookController {
  public readonly router: Router;

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
   * POST /books
   * Registra un nuevo libro
   */
  private async registerBook(req: Request, res: Response): Promise<void> {
    try {
      const command: RegisterBookCommand = {
        isbn: req.body.isbn,
        title: req.body.title,
        author: req.body.author,
      };

      const book = await this.registerBookUseCase.execute(command);

      res.status(201).json({
        success: true,
        data: book,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /books/available
   * Lista libros disponibles
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
