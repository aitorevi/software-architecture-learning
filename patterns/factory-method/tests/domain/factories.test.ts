import { describe, it, expect } from 'vitest';
import { Report } from '../../src/domain/entities/Report.js';
import { PdfExporterFactory } from '../../src/domain/factories/PdfExporterFactory.js';
import { ExcelExporterFactory } from '../../src/domain/factories/ExcelExporterFactory.js';
import { CsvExporterFactory } from '../../src/domain/factories/CsvExporterFactory.js';
import { PdfExporter } from '../../src/domain/exporters/PdfExporter.js';
import { ExcelExporter } from '../../src/domain/exporters/ExcelExporter.js';
import { CsvExporter } from '../../src/domain/exporters/CsvExporter.js';

/**
 * Tests para el Factory Method Pattern
 *
 * Estos tests verifican que:
 * 1. Cada factory crea el tipo correcto de exporter
 * 2. El método exportReport() funciona correctamente
 * 3. La validación de reportes funciona
 * 4. El polimorfismo funciona (podemos tratar todas las factories igual)
 */
describe('Factory Method Pattern', () => {
  const validReport = Report.create({
    title: 'Test Report',
    content: 'This is test content',
    author: 'El Profe Millo',
    category: 'Testing'
  });

  describe('PdfExporterFactory', () => {
    const factory = new PdfExporterFactory();

    it('should create PdfExporter instance', () => {
      const exporter = factory.createExporter();

      expect(exporter).toBeInstanceOf(PdfExporter);
      expect(exporter.getFormat()).toBe('pdf');
    });

    it('should export report through factory method', () => {
      const result = factory.exportReport(validReport);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.format).toBe('pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.filename).toContain('.pdf');
      expect(result.filename).toContain('test-report');
    });

    it('should generate proper filename', () => {
      const result = factory.exportReport(validReport);

      // El filename debe tener el título sanitizado + timestamp + extensión
      expect(result.filename).toMatch(/test-report-\d+\.pdf/);
    });

    it('should validate report before exporting', () => {
      // La validación ocurre en el constructor de Report, no en el factory
      // Esto demuestra que la validación del dominio sucede antes
      expect(() => {
        // @ts-expect-error - Testing invalid report
        Report.fromPersistence({
          id: '1',
          title: '',
          content: 'content',
          author: 'author',
          date: new Date()
        });
      }).toThrow('Report title cannot be empty');
    });
  });

  describe('ExcelExporterFactory', () => {
    const factory = new ExcelExporterFactory();

    it('should create ExcelExporter instance', () => {
      const exporter = factory.createExporter();

      expect(exporter).toBeInstanceOf(ExcelExporter);
      expect(exporter.getFormat()).toBe('xlsx');
    });

    it('should export report through factory method', () => {
      const result = factory.exportReport(validReport);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.format).toBe('xlsx');
      expect(result.mimeType).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(result.filename).toContain('.xlsx');
    });
  });

  describe('CsvExporterFactory', () => {
    const factory = new CsvExporterFactory();

    it('should create CsvExporter instance', () => {
      const exporter = factory.createExporter();

      expect(exporter).toBeInstanceOf(CsvExporter);
      expect(exporter.getFormat()).toBe('csv');
    });

    it('should export report through factory method', () => {
      const result = factory.exportReport(validReport);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.format).toBe('csv');
      expect(result.mimeType).toBe('text/csv');
      expect(result.filename).toContain('.csv');
    });
  });

  describe('Polymorphism (treating all factories the same)', () => {
    it('should be able to use any factory through the base class', () => {
      const factories = [
        new PdfExporterFactory(),
        new ExcelExporterFactory(),
        new CsvExporterFactory()
      ];

      // Polimorfismo: tratamos todas las factories igual
      factories.forEach(factory => {
        const result = factory.exportReport(validReport);

        // Todas deberían producir un resultado válido
        expect(result.buffer).toBeInstanceOf(Buffer);
        expect(result.format).toBeTruthy();
        expect(result.mimeType).toBeTruthy();
        expect(result.filename).toBeTruthy();
      });
    });

    it('should create different exporters but use them the same way', () => {
      const factories = [
        new PdfExporterFactory(),
        new ExcelExporterFactory(),
        new CsvExporterFactory()
      ];

      const exporters = factories.map(f => f.createExporter());

      // Todos implementan la misma interface
      exporters.forEach(exporter => {
        const buffer = exporter.export(validReport);
        expect(buffer).toBeInstanceOf(Buffer);
      });
    });
  });

  describe('Filename Sanitization', () => {
    it('should sanitize special characters in filename', () => {
      const specialReport = Report.create({
        title: 'Report: With/Special\\Chars!',
        content: 'content',
        author: 'author'
      });

      const factory = new PdfExporterFactory();
      const result = factory.exportReport(specialReport);

      // Los caracteres especiales deberían ser reemplazados por guiones
      expect(result.filename).toMatch(/^report-with-special-chars-\d+\.pdf$/);
    });

    it('should handle multiple spaces and dashes', () => {
      const report = Report.create({
        title: 'Multiple   Spaces   And---Dashes',
        content: 'content',
        author: 'author'
      });

      const factory = new PdfExporterFactory();
      const result = factory.exportReport(report);

      // Espacios múltiples y guiones múltiples deberían consolidarse
      expect(result.filename).toMatch(/^multiple-spaces-and-dashes-\d+\.pdf$/);
    });
  });

  describe('Validation', () => {
    it('should validate title is not empty', () => {
      // La validación ocurre en el constructor de Report
      expect(() => {
        // @ts-expect-error - Testing invalid report
        Report.fromPersistence({
          id: '1',
          title: '',
          content: 'content',
          author: 'author',
          date: new Date()
        });
      }).toThrow('title');
    });

    it('should validate content is not empty', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid report
        Report.fromPersistence({
          id: '1',
          title: 'title',
          content: '',
          author: 'author',
          date: new Date()
        });
      }).toThrow('content');
    });

    it('should validate author is not empty', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid report
        Report.fromPersistence({
          id: '1',
          title: 'title',
          content: 'content',
          author: '',
          date: new Date()
        });
      }).toThrow('author');
    });
  });
});
