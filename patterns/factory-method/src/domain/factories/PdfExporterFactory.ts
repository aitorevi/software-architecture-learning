import { DocumentExporter } from '../exporters/DocumentExporter.js';
import { PdfExporter } from '../exporters/PdfExporter.js';
import { ExporterFactory } from './ExporterFactory.js';

/**
 * Concrete Creator - Factory para crear PdfExporter
 *
 * En el Factory Method Pattern, esto es un "Concrete Creator".
 * Implementa el factory method createExporter() para devolver
 * una instancia de PdfExporter.
 *
 * Esta clase decide QUÉ tipo de exporter crear (PdfExporter)
 * mientras que la clase base ExporterFactory decide CÓMO usarlo.
 */
export class PdfExporterFactory extends ExporterFactory {
  /**
   * Implementación del Factory Method
   *
   * Crea y devuelve una instancia de PdfExporter.
   * Aquí es donde se decide el tipo concreto de objeto a crear.
   */
  createExporter(): DocumentExporter {
    return new PdfExporter();
  }

  /**
   * Opcional: Sobreescribir hook method para validación específica de PDF
   *
   * Por ejemplo, PDF podría requerir validaciones adicionales
   */
  // protected validateReport(data: Report): void {
  //   super.validateReport(data);
  //   // Validaciones específicas para PDF si las necesitas
  // }
}
