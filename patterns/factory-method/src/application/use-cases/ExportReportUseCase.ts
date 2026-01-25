import { ExporterFactory, ExportResult } from '../../domain/factories/ExporterFactory.js';
import { ReportRepository } from '../../domain/repositories/ReportRepository.js';

/**
 * Caso de Uso: Exportar Reporte
 *
 * Responsabilidad: Orquestar la exportación de un reporte usando un ExporterFactory
 *
 * CLAVE DEL FACTORY METHOD PATTERN:
 * Este caso de uso recibe un ExporterFactory por inyección de dependencias.
 * No sabe (ni le importa) qué tipo concreto de exporter se creará.
 * Solo sabe que el factory tiene un método exportReport() que devolverá un resultado.
 *
 * Esto es DESACOPLAMIENTO en acción:
 * - El caso de uso no depende de PdfExporter, ExcelExporter, ni CsvExporter
 * - Solo depende de la abstracción ExporterFactory
 * - Puedes cambiar el factory en runtime sin tocar este código
 */
export class ExportReportUseCase {
  constructor(
    private reportRepository: ReportRepository,
    private exporterFactory: ExporterFactory  // ← Inyección del factory
  ) {}

  async execute(reportId: string): Promise<ExportResult> {
    // 1. Obtener el reporte del repositorio
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new Error(`Report with ID ${reportId} not found`);
    }

    // 2. Exportar usando el factory
    // El factory se encarga de:
    // - Crear el exporter apropiado (usando el factory method)
    // - Validar el reporte
    // - Exportar el contenido
    // - Construir el resultado
    //
    // Nosotros NO sabemos si es PDF, Excel o CSV - ¡y no nos importa!
    return this.exporterFactory.exportReport(report);
  }
}
