import { Report } from '../../domain/entities/Report.js';

/**
 * DTO para crear un reporte
 */
export interface CreateReportDTO {
  title: string;
  content: string;
  author: string;
  category?: string;
}

/**
 * DTO para la respuesta de un reporte
 */
export interface ReportResponseDTO {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category?: string;
}

/**
 * Conversiones entre Domain y DTO
 */
export class ReportDTO {
  static fromDomain(report: Report): ReportResponseDTO {
    return {
      id: report.id,
      title: report.title,
      content: report.content,
      author: report.author,
      date: report.date.toISOString(),
      category: report.category
    };
  }

  static toDomain(dto: CreateReportDTO): Report {
    return Report.create(dto);
  }
}
