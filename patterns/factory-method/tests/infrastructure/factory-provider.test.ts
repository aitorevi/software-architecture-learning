import { describe, it, expect } from 'vitest';
import { FactoryProvider } from '../../src/infrastructure/exporters/FactoryProvider.js';
import { PdfExporterFactory } from '../../src/domain/factories/PdfExporterFactory.js';
import { ExcelExporterFactory } from '../../src/domain/factories/ExcelExporterFactory.js';
import { CsvExporterFactory } from '../../src/domain/factories/CsvExporterFactory.js';

/**
 * Tests para el Factory Provider (Registry Pattern)
 *
 * El FactoryProvider es un Registry que mapea formatos a factories.
 * Complementa el Factory Method Pattern permitiendo seleccionar
 * dinámicamente qué factory usar.
 */
describe('FactoryProvider', () => {
  describe('Default Factories', () => {
    it('should register default factories on construction', () => {
      const provider = new FactoryProvider();

      const supportedFormats = provider.getSupportedFormats();

      expect(supportedFormats).toContain('pdf');
      expect(supportedFormats).toContain('excel');
      expect(supportedFormats).toContain('xlsx');
      expect(supportedFormats).toContain('csv');
    });

    it('should return PdfExporterFactory for pdf format', () => {
      const provider = new FactoryProvider();

      const factory = provider.getFactory('pdf');

      expect(factory).toBeInstanceOf(PdfExporterFactory);
    });

    it('should return ExcelExporterFactory for excel format', () => {
      const provider = new FactoryProvider();

      const factory = provider.getFactory('excel');

      expect(factory).toBeInstanceOf(ExcelExporterFactory);
    });

    it('should return ExcelExporterFactory for xlsx format (alias)', () => {
      const provider = new FactoryProvider();

      const factory = provider.getFactory('xlsx');

      expect(factory).toBeInstanceOf(ExcelExporterFactory);
    });

    it('should return CsvExporterFactory for csv format', () => {
      const provider = new FactoryProvider();

      const factory = provider.getFactory('csv');

      expect(factory).toBeInstanceOf(CsvExporterFactory);
    });
  });

  describe('Format Normalization', () => {
    it('should be case-insensitive', () => {
      const provider = new FactoryProvider();

      const factory1 = provider.getFactory('PDF');
      const factory2 = provider.getFactory('pdf');
      const factory3 = provider.getFactory('PdF');

      expect(factory1).toBeInstanceOf(PdfExporterFactory);
      expect(factory2).toBeInstanceOf(PdfExporterFactory);
      expect(factory3).toBeInstanceOf(PdfExporterFactory);
    });

    it('should trim whitespace', () => {
      const provider = new FactoryProvider();

      const factory = provider.getFactory('  pdf  ');

      expect(factory).toBeInstanceOf(PdfExporterFactory);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported format', () => {
      const provider = new FactoryProvider();

      expect(() => provider.getFactory('json')).toThrow(
        'Unsupported export format: "json"'
      );
    });

    it('should include supported formats in error message', () => {
      const provider = new FactoryProvider();

      try {
        provider.getFactory('xml');
        expect.fail('Should have thrown');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('Supported formats:');
          expect(error.message).toContain('pdf');
          expect(error.message).toContain('csv');
        }
      }
    });
  });

  describe('Dynamic Registration', () => {
    it('should allow registering new factories', () => {
      const provider = new FactoryProvider();

      // Registrar una nueva factory
      const customFactory = new PdfExporterFactory(); // Simulamos con PDF
      provider.registerFactory('custom', customFactory);

      const factory = provider.getFactory('custom');

      expect(factory).toBe(customFactory);
    });

    it('should allow overriding existing factories', () => {
      const provider = new FactoryProvider();

      const originalFactory = provider.getFactory('pdf');
      const newFactory = new PdfExporterFactory();

      provider.registerFactory('pdf', newFactory);
      const overriddenFactory = provider.getFactory('pdf');

      expect(overriddenFactory).toBe(newFactory);
      expect(overriddenFactory).not.toBe(originalFactory);
    });

    it('should update supported formats list after registration', () => {
      const provider = new FactoryProvider();

      provider.registerFactory('json', new PdfExporterFactory());

      const formats = provider.getSupportedFormats();

      expect(formats).toContain('json');
    });
  });

  describe('Format Support Checking', () => {
    it('should check if format is supported', () => {
      const provider = new FactoryProvider();

      expect(provider.isFormatSupported('pdf')).toBe(true);
      expect(provider.isFormatSupported('csv')).toBe(true);
      expect(provider.isFormatSupported('json')).toBe(false);
      expect(provider.isFormatSupported('xml')).toBe(false);
    });

    it('should be case-insensitive when checking support', () => {
      const provider = new FactoryProvider();

      expect(provider.isFormatSupported('PDF')).toBe(true);
      expect(provider.isFormatSupported('Pdf')).toBe(true);
      expect(provider.isFormatSupported('  pdf  ')).toBe(true);
    });
  });

  describe('Supported Formats List', () => {
    it('should return all supported formats', () => {
      const provider = new FactoryProvider();

      const formats = provider.getSupportedFormats();

      expect(formats).toBeInstanceOf(Array);
      expect(formats.length).toBeGreaterThan(0);
      expect(formats).toContain('pdf');
      expect(formats).toContain('csv');
    });

    it('should include newly registered formats', () => {
      const provider = new FactoryProvider();

      provider.registerFactory('json', new PdfExporterFactory());
      provider.registerFactory('xml', new CsvExporterFactory());

      const formats = provider.getSupportedFormats();

      expect(formats).toContain('json');
      expect(formats).toContain('xml');
    });
  });

  describe('Real-world Usage', () => {
    it('should support typical export workflow', () => {
      const provider = new FactoryProvider();

      // Usuario solicita diferentes formatos
      const userRequests = ['pdf', 'excel', 'CSV', ' xlsx '];

      userRequests.forEach(format => {
        const factory = provider.getFactory(format);
        expect(factory).toBeTruthy();

        // Cada factory puede crear su exporter
        const exporter = factory.createExporter();
        expect(exporter).toBeTruthy();
      });
    });
  });
});
