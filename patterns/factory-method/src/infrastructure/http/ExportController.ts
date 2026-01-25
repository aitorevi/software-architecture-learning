import { Request, Response } from 'express';
import { ExportReportUseCase } from '../../application/use-cases/ExportReportUseCase.js';
import { FactoryProvider } from '../exporters/FactoryProvider.js';

/**
 * Controller HTTP para exportación de reportes
 *
 * Adaptador de entrada que maneja requests HTTP y delega
 * la lógica de negocio a los casos de uso.
 */
export class ExportController {
  constructor(
    private exportReportUseCase: ExportReportUseCase,
    private factoryProvider: FactoryProvider
  ) {}

  /**
   * GET /reports/:id/export?format=pdf
   *
   * Exporta un reporte en el formato especificado
   */
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const format = (req.query.format as string) || 'pdf';

      // Obtener la factory según el formato solicitado
      const factory = this.factoryProvider.getFactory(format);

      // Crear una nueva instancia del caso de uso con la factory específica
      const useCase = new ExportReportUseCase(
        this.exportReportUseCase['reportRepository'], // Acceder al repo privado
        factory
      );

      // Ejecutar exportación
      const result = await useCase.execute(id);

      // Configurar headers HTTP
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.filename}"`
      );

      // Enviar el archivo
      res.send(result.buffer);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            error: 'Report not found',
            message: error.message
          });
          return;
        }

        if (error.message.includes('Unsupported')) {
          res.status(400).json({
            error: 'Invalid format',
            message: error.message,
            supportedFormats: ['pdf', 'excel', 'csv']
          });
          return;
        }

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
   * GET /formats
   *
   * Obtiene los formatos de exportación disponibles
   */
  getSupportedFormats(_req: Request, res: Response): void {
    try {
      const formats = this.factoryProvider.getSupportedFormats();

      res.json({
        formats: formats.map(format => ({
          name: format,
          endpoint: `/reports/:id/export?format=${format}`
        }))
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      });
    }
  }
}
