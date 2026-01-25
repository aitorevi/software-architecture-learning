import { DocumentExporter } from '../exporters/DocumentExporter.js';
import { ExcelExporter } from '../exporters/ExcelExporter.js';
import { ExporterFactory } from './ExporterFactory.js';

/**
 * Concrete Creator - Factory para crear ExcelExporter
 *
 * En el Factory Method Pattern, esto es un "Concrete Creator".
 * Implementa el factory method createExporter() para devolver
 * una instancia de ExcelExporter.
 */
export class ExcelExporterFactory extends ExporterFactory {
  /**
   * Implementación del Factory Method
   *
   * Crea y devuelve una instancia de ExcelExporter.
   */
  createExporter(): DocumentExporter {
    return new ExcelExporter();
  }
}
