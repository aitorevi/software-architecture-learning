import { Request, Response, Router } from 'express';
import {
  LoanBookUseCase,
  ReturnBookUseCase,
  LoanBookCommand,
  ReturnBookCommand,
} from '../../../application';
import { DomainException } from '../../../domain';

/**
 * LoanController
 *
 * Adaptador REST para operaciones de préstamos.
 */
export class LoanController {
  public readonly router: Router;

  constructor(
    private readonly loanBookUseCase: LoanBookUseCase,
    private readonly returnBookUseCase: ReturnBookUseCase
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/', this.loanBook.bind(this));
    this.router.post('/return', this.returnBook.bind(this));
  }

  /**
   * POST /loans
   * Crea un nuevo préstamo
   */
  private async loanBook(req: Request, res: Response): Promise<void> {
    try {
      const command: LoanBookCommand = {
        userId: req.body.userId,
        bookId: req.body.bookId,
      };

      const loan = await this.loanBookUseCase.execute(command);

      res.status(201).json({
        success: true,
        data: loan,
        message: `Book loaned successfully. Due date: ${loan.dueDate}`,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /loans/return
   * Devuelve un libro prestado
   */
  private async returnBook(req: Request, res: Response): Promise<void> {
    try {
      const command: ReturnBookCommand = {
        userId: req.body.userId,
        bookId: req.body.bookId,
      };

      const result = await this.returnBookUseCase.execute(command);

      const response: Record<string, unknown> = {
        success: true,
        data: result.loan,
        message: 'Book returned successfully',
      };

      if (result.penalty) {
        response.warning = `Late return! Penalty applied until ${result.penalty.endDate}`;
        response.penalty = result.penalty;
      }

      res.json(response);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown): void {
    if (error instanceof DomainException) {
      const statusCode = error.code.includes('NOT_FOUND') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    } else if (error instanceof Error) {
      // Handle specific business rule errors
      if (
        error.message.includes('does not have an active loan') ||
        error.message.includes('already exists')
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BUSINESS_RULE_VIOLATION',
            message: error.message,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error.message,
          },
        });
      }
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
