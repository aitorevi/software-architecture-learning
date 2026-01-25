import { DocumentExporter } from '../exporters/DocumentExporter.js';
import { CsvExporter } from '../exporters/CsvExporter.js';
import { ExporterFactory } from './ExporterFactory.js';

/**
 * Concrete Creator - Factory para crear CsvExporter
 *
 * En el Factory Method Pattern, esto es un "Concrete Creator".
 * Implementa el factory method createExporter() para devolver
 * una instancia de CsvExporter.
 */
export class CsvExporterFactory extends ExporterFactory {
  /**
   * Implementación del Factory Method
   *
   * Crea y devuelve una instancia de CsvExporter.
   */
  createExporter(): DocumentExporter {
    return new CsvExporter();
  }
}
