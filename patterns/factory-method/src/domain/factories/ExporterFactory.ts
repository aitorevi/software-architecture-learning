import { Report } from '../entities/Report.js';
import { DocumentExporter } from '../exporters/DocumentExporter.js';

/**
 * Resultado de la exportación
 */
export interface ExportResult {
  buffer: Buffer;
  format: string;
  mimeType: string;
  filename: string;
}

/**
 * Creator Abstract - La clase base del Factory Method Pattern
 *
 * Esta clase declara el FACTORY METHOD que las subclases deben implementar.
 * También contiene lógica común de exportación que usa el factory method.
 *
 * Patrón: Template Method + Factory Method
 * - El método exportReport() es un Template Method que define el algoritmo
 * - El método createExporter() es el Factory Method que las subclases implementan
 */
export abstract class ExporterFactory {
  /**
   * FACTORY METHOD - Las subclases deben implementar este método
   *
   * Este es el corazón del patrón. Cada subclase decide qué tipo
   * concreto de DocumentExporter crear.
   *
   * @returns Una instancia de DocumentExporter
   */
  abstract createExporter(): DocumentExporter;

  /**
   * Template Method que usa el Factory Method
   *
   * Este método define el algoritmo de exportación:
   * 1. Validar el reporte
   * 2. Crear el exporter (usando el factory method)
   * 3. Exportar el contenido
   * 4. Construir el resultado
   *
   * La clave: usa createExporter() sin saber qué tipo concreto se creará
   */
  exportReport(data: Report): ExportResult {
    // 1. Validar antes de exportar
    this.validateReport(data);

    // 2. Crear el exporter (delegado a subclases)
    const exporter = this.createExporter();

    // 3. Exportar
    const buffer = exporter.export(data);

    // 4. Construir resultado
    return {
      buffer,
      format: exporter.getFormat(),
      mimeType: exporter.getMimeType(),
      filename: this.generateFilename(data, exporter.getFormat())
    };
  }

  /**
   * Hook method - Las subclases pueden sobreescribirlo si necesitan
   * validación específica por formato
   */
  protected validateReport(data: Report): void {
    if (!data.title) {
      throw new Error('Report must have a title');
    }

    if (!data.content) {
      throw new Error('Report must have content');
    }

    if (!data.author) {
      throw new Error('Report must have an author');
    }
  }

  /**
   * Helper method para generar el nombre del archivo
   */
  protected generateFilename(data: Report, format: string): string {
    const sanitizedTitle = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const timestamp = Date.now();

    return `${sanitizedTitle}-${timestamp}.${format}`;
  }
}
