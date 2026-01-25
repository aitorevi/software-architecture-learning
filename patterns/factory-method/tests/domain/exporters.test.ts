import { describe, it, expect } from 'vitest';
import { Report } from '../../src/domain/entities/Report.js';
import { PdfExporter } from '../../src/domain/exporters/PdfExporter.js';
import { ExcelExporter } from '../../src/domain/exporters/ExcelExporter.js';
import { CsvExporter } from '../../src/domain/exporters/CsvExporter.js';

/**
 * Tests para los Concrete Products (Exporters)
 *
 * Aquí testeamos cada exporter de forma aislada.
 * Cada exporter debe implementar la interface DocumentExporter.
 */
describe('Document Exporters (Concrete Products)', () => {
  // Reporte de prueba reutilizable
  const testReport = Report.create({
    title: 'Test Report',
    content: 'This is a test report with some content.',
    author: 'El Profe Millo',
    category: 'Testing'
  });

  describe('PdfExporter', () => {
    const exporter = new PdfExporter();

    it('should export report to PDF format', () => {
      const result = exporter.export(testReport);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // Verificar que el contenido contiene elementos clave
      const content = result.toString();
      expect(content).toContain('PDF DOCUMENT');
      expect(content).toContain(testReport.title);
      expect(content).toContain(testReport.author);
      expect(content).toContain(testReport.content);
    });

    it('should return correct format', () => {
      expect(exporter.getFormat()).toBe('pdf');
    });

    it('should return correct MIME type', () => {
      expect(exporter.getMimeType()).toBe('application/pdf');
    });

    it('should handle long content with text wrapping', () => {
      const longReport = Report.create({
        title: 'Long Report',
        content: 'This is a very long sentence that should be wrapped to multiple lines when exported to PDF format because it exceeds the maximum line width configured for the PDF exporter.',
        author: 'Tester'
      });

      const result = exporter.export(longReport);
      const content = result.toString();

      // Verificar que el contenido está presente
      expect(content).toContain('Long Report');
      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('ExcelExporter', () => {
    const exporter = new ExcelExporter();

    it('should export report to Excel format', () => {
      const result = exporter.export(testReport);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // Verificar estructura tipo Excel
      const content = result.toString();
      expect(content).toContain('EXCEL SPREADSHEET REPORT');
      expect(content).toContain(testReport.title);
      expect(content).toContain(testReport.author);
      expect(content).toContain('Row');
    });

    it('should return correct format', () => {
      expect(exporter.getFormat()).toBe('xlsx');
    });

    it('should return correct MIME type', () => {
      expect(exporter.getMimeType()).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });

    it('should split content into rows', () => {
      const multiSentenceReport = Report.create({
        title: 'Multi Sentence Report',
        content: 'First sentence. Second sentence! Third sentence?',
        author: 'Tester'
      });

      const result = exporter.export(multiSentenceReport);
      const content = result.toString();

      // Debería tener múltiples filas
      expect(content).toContain('Row 1:');
      expect(content).toContain('Row 2:');
      expect(content).toContain('Row 3:');
    });
  });

  describe('CsvExporter', () => {
    const exporter = new CsvExporter();

    it('should export report to CSV format', () => {
      const result = exporter.export(testReport);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // Verificar formato CSV
      const content = result.toString();
      expect(content).toContain('Field,Value');
      expect(content).toContain(`Title,${testReport.title}`);
      expect(content).toContain(`Author,${testReport.author}`);
    });

    it('should return correct format', () => {
      expect(exporter.getFormat()).toBe('csv');
    });

    it('should return correct MIME type', () => {
      expect(exporter.getMimeType()).toBe('text/csv');
    });

    it('should escape CSV special characters', () => {
      const specialReport = Report.create({
        title: 'Report with "quotes" and, commas',
        content: 'Content with special chars',
        author: 'Tester'
      });

      const result = exporter.export(specialReport);
      const content = result.toString();

      // Verificar que está escapado con comillas dobles
      expect(content).toContain('"Report with ""quotes"" and, commas"');
    });

    it('should split content into paragraphs', () => {
      const multiParagraphReport = Report.create({
        title: 'Multi Paragraph',
        content: 'First paragraph.\nSecond paragraph.\nThird paragraph.',
        author: 'Tester'
      });

      const result = exporter.export(multiParagraphReport);
      const content = result.toString();

      expect(content).toContain('Paragraph 1');
      expect(content).toContain('Paragraph 2');
      expect(content).toContain('Paragraph 3');
    });
  });

  describe('Interface Compliance', () => {
    it('all exporters should implement DocumentExporter interface', () => {
      const exporters = [
        new PdfExporter(),
        new ExcelExporter(),
        new CsvExporter()
      ];

      exporters.forEach(exporter => {
        // Verificar que tienen los métodos requeridos
        expect(typeof exporter.export).toBe('function');
        expect(typeof exporter.getFormat).toBe('function');
        expect(typeof exporter.getMimeType).toBe('function');

        // Verificar que funcionan
        const result = exporter.export(testReport);
        expect(result).toBeInstanceOf(Buffer);
        expect(exporter.getFormat()).toBeTruthy();
        expect(exporter.getMimeType()).toBeTruthy();
      });
    });
  });
});
