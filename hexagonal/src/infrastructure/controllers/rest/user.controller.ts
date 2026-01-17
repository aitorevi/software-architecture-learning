import { Request, Response, Router } from 'express';
import {
  RegisterUserUseCase,
  GetUserLoansUseCase,
  RegisterUserCommand,
} from '../../../application';
import { DomainException } from '../../../domain';

/**
 * UserController
 *
 * Adaptador REST para operaciones con usuarios.
 */
export class UserController {
  public readonly router: Router;

  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getUserLoansUseCase: GetUserLoansUseCase
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/', this.registerUser.bind(this));
    this.router.get('/:userId/loans', this.getUserLoans.bind(this));
  }

  /**
   * POST /users
   * Registra un nuevo usuario
   */
  private async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const command: RegisterUserCommand = {
        email: req.body.email,
        name: req.body.name,
      };

      const user = await this.registerUserUseCase.execute(command);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /users/:userId/loans
   * Obtiene el historial de préstamos de un usuario
   */
  private async getUserLoans(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const loans = await this.getUserLoansUseCase.execute(userId);

      res.json({
        success: true,
        data: loans,
        count: loans.length,
      });
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
