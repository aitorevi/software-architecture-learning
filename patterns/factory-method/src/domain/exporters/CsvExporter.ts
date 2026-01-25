import { Report } from '../entities/Report.js';
import { DocumentExporter } from './DocumentExporter.js';

/**
 * Concrete Product - Exportador de CSV
 *
 * En el Factory Method Pattern, esto es un "Concrete Product".
 * Implementa la interface DocumentExporter con lógica específica para CSV.
 */
export class CsvExporter implements DocumentExporter {
  export(data: Report): Buffer {
    const csvContent = this.generateCsvContent(data);
    return Buffer.from(csvContent, 'utf-8');
  }

  getFormat(): string {
    return 'csv';
  }

  getMimeType(): string {
    return 'text/csv';
  }

  /**
   * Genera el contenido del CSV
   */
  private generateCsvContent(data: Report): string {
    const rows = [
      // Header
      ['Field', 'Value'],

      // Metadata
      ['Title', this.escapeCSV(data.title)],
      ['Author', this.escapeCSV(data.author)],
      ['Date', data.date.toISOString().split('T')[0]],
      ['Category', this.escapeCSV(data.category || 'N/A')],

      // Separator
      ['', ''],
      ['Content', ''],
      ['', ''],

      // Content (dividido en párrafos)
      ...this.splitIntoParagraphs(data.content),

      // Footer
      ['', ''],
      ['Generated', new Date().toLocaleString()],
      ['Format', 'CSV (Comma-Separated Values)']
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  /**
   * Escapa valores CSV (maneja comas, comillas, saltos de línea)
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Divide el contenido en párrafos para el CSV
   */
  private splitIntoParagraphs(content: string): string[][] {
    const paragraphs = content.split('\n').filter(p => p.trim());

    if (paragraphs.length === 0) {
      paragraphs.push(content);
    }

    return paragraphs.map((para, index) => [
      `Paragraph ${index + 1}`,
      this.escapeCSV(para.trim())
    ]);
  }
}
