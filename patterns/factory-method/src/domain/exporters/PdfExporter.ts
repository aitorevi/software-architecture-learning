import { Report } from '../entities/Report.js';
import { DocumentExporter } from './DocumentExporter.js';

/**
 * Concrete Product - Exportador de PDF
 *
 * En el Factory Method Pattern, esto es un "Concrete Product".
 * Implementa la interface DocumentExporter con lógica específica para PDF.
 */
export class PdfExporter implements DocumentExporter {
  export(data: Report): Buffer {
    const pdfContent = this.generatePdfContent(data);
    return Buffer.from(pdfContent, 'utf-8');
  }

  getFormat(): string {
    return 'pdf';
  }

  getMimeType(): string {
    return 'application/pdf';
  }

  /**
   * Genera el contenido del PDF
   * En una implementación real, usarías una librería como pdfkit o jsPDF
   */
  private generatePdfContent(data: Report): string {
    const border = '═'.repeat(60);
    const line = '─'.repeat(60);

    return `
${border}
PDF DOCUMENT
${border}

Title:    ${data.title}
Author:   ${data.author}
Date:     ${data.date.toISOString().split('T')[0]}
${data.category ? `Category: ${data.category}` : ''}

${line}
CONTENT
${line}

${this.wrapText(data.content, 60)}

${line}

Generated on: ${new Date().toLocaleString()}
Format: PDF (Portable Document Format)

${border}
    `.trim();
  }

  /**
   * Envuelve el texto a un ancho específico
   */
  private wrapText(text: string, width: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length > width) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }

    if (currentLine) {
      lines.push(currentLine.trim());
    }

    return lines.join('\n');
  }
}
