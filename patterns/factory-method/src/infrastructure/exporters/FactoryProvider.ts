import { ExporterFactory } from '../../domain/factories/ExporterFactory.js';
import { PdfExporterFactory } from '../../domain/factories/PdfExporterFactory.js';
import { ExcelExporterFactory } from '../../domain/factories/ExcelExporterFactory.js';
import { CsvExporterFactory } from '../../domain/factories/CsvExporterFactory.js';

/**
 * Factory Provider - Registry Pattern
 *
 * Responsabilidad: Mapear formatos de exportación a sus factories correspondientes
 *
 * Este es un Registry Pattern que complementa el Factory Method.
 * Permite:
 * - Registrar factories en un mapa
 * - Obtener el factory apropiado según el formato solicitado
 * - Añadir nuevos formatos en runtime (extensibilidad)
 *
 * IMPORTANTE: Este es infraestructura, NO dominio.
 * El dominio define las factories, la infraestructura decide cuál usar.
 */
export class FactoryProvider {
  private factories: Map<string, ExporterFactory>;

  constructor() {
    this.factories = new Map();
    this.registerDefaultFactories();
  }

  /**
   * Registra las factories por defecto
   */
  private registerDefaultFactories(): void {
    this.factories.set('pdf', new PdfExporterFactory());
    this.factories.set('excel', new ExcelExporterFactory());
    this.factories.set('xlsx', new ExcelExporterFactory()); // Alias
    this.factories.set('csv', new CsvExporterFactory());
  }

  /**
   * Obtiene el factory para un formato específico
   *
   * @param format El formato deseado (pdf, excel, csv, etc)
   * @returns El ExporterFactory apropiado
   * @throws Error si el formato no está soportado
   */
  getFactory(format: string): ExporterFactory {
    const normalizedFormat = format.toLowerCase().trim();
    const factory = this.factories.get(normalizedFormat);

    if (!factory) {
      const supportedFormats = Array.from(this.factories.keys()).join(', ');
      throw new Error(
        `Unsupported export format: "${format}". ` +
        `Supported formats: ${supportedFormats}`
      );
    }

    return factory;
  }

  /**
   * Registra una nueva factory (extensibilidad en runtime)
   *
   * Esto permite añadir soporte para nuevos formatos sin recompilar:
   *
   * @example
   * provider.registerFactory('json', new JsonExporterFactory());
   * provider.registerFactory('xml', new XmlExporterFactory());
   */
  registerFactory(format: string, factory: ExporterFactory): void {
    const normalizedFormat = format.toLowerCase().trim();
    this.factories.set(normalizedFormat, factory);
  }

  /**
   * Obtiene la lista de formatos soportados
   */
  getSupportedFormats(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Verifica si un formato está soportado
   */
  isFormatSupported(format: string): boolean {
    const normalizedFormat = format.toLowerCase().trim();
    return this.factories.has(normalizedFormat);
  }
}
