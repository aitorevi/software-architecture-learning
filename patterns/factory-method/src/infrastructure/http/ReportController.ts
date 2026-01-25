import { Request, Response } from 'express';
import { CreateReportUseCase } from '../../application/use-cases/CreateReportUseCase.js';
import { GetAllReportsUseCase } from '../../application/use-cases/GetAllReportsUseCase.js';

/**
 * Controller HTTP para operaciones CRUD de reportes
 */
export class ReportController {
  constructor(
    private createReportUseCase: CreateReportUseCase,
    private getAllReportsUseCase: GetAllReportsUseCase
  ) {}

  /**
   * POST /reports
   *
   * Crea un nuevo reporte
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, author, category } = req.body;

      // Validar input
      if (!title || !content || !author) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Missing required fields: title, content, author'
        });
        return;
      }

      // Ejecutar caso de uso
      const report = await this.createReportUseCase.execute({
        title,
        content,
        author,
        category
      });

      res.status(201).json(report);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: 'Bad request',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      });
    }
  }

  /**
   * GET /reports
   *
   * Obtiene todos los reportes
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const reports = await this.getAllReportsUseCase.execute();
      res.json({ reports, count: reports.length });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      });
    }
  }
}
