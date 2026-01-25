import { Report } from '../entities/Report.js';
import { DocumentExporter } from './DocumentExporter.js';

/**
 * Concrete Product - Exportador de Excel
 *
 * En el Factory Method Pattern, esto es un "Concrete Product".
 * Implementa la interface DocumentExporter con lógica específica para Excel.
 */
export class ExcelExporter implements DocumentExporter {
  export(data: Report): Buffer {
    const excelContent = this.generateExcelContent(data);
    return Buffer.from(excelContent, 'utf-8');
  }

  getFormat(): string {
    return 'xlsx';
  }

  getMimeType(): string {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  /**
   * Genera el contenido del Excel (simplificado como CSV para el ejemplo)
   * En una implementación real, usarías una librería como exceljs o xlsx
   */
  private generateExcelContent(data: Report): string {
    const sections = [
      '╔═══════════════════════════════════════════════════════╗',
      '║               EXCEL SPREADSHEET REPORT                ║',
      '╚═══════════════════════════════════════════════════════╝',
      '',
      'METADATA',
      '─'.repeat(60),
      `Title:\t${data.title}`,
      `Author:\t${data.author}`,
      `Date:\t${data.date.toISOString().split('T')[0]}`,
      data.category ? `Category:\t${data.category}` : '',
      '',
      'CONTENT',
      '─'.repeat(60),
      ...this.splitIntoRows(data.content),
      '',
      'FOOTER',
      '─'.repeat(60),
      `Generated:\t${new Date().toLocaleString()}`,
      `Format:\tExcel (XLSX)`,
      `Rows:\t${this.splitIntoRows(data.content).length + 6}`,
      ''
    ];

    return sections.filter(Boolean).join('\n');
  }

  /**
   * Divide el contenido en filas (simulando celdas de Excel)
   */
  private splitIntoRows(content: string): string[] {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    return sentences.map((sentence, index) =>
      `Row ${index + 1}:\t${sentence.trim()}`
    );
  }
}
