import { Report } from '../entities/Report.js';

/**
 * Product Interface - La interface común de todos los exportadores
 *
 * En el Factory Method Pattern, esto es el "Product".
 * Todos los exportadores concretos (PdfExporter, ExcelExporter, etc)
 * implementan esta interface.
 */
export interface DocumentExporter {
  /**
   * Exporta un reporte al formato específico
   * @param data El reporte a exportar
   * @returns Buffer con el contenido exportado
   */
  export(data: Report): Buffer;

  /**
   * Obtiene el formato del exportador
   * @returns El nombre del formato (pdf, excel, csv, etc)
   */
  getFormat(): string;

  /**
   * Obtiene el MIME type del formato
   * @returns El MIME type para el Content-Type HTTP
   */
  getMimeType(): string;
}
