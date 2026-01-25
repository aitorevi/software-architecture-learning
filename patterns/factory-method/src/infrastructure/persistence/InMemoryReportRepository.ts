import { Report } from '../../domain/entities/Report.js';
import { ReportRepository } from '../../domain/repositories/ReportRepository.js';

/**
 * Implementación en memoria del ReportRepository
 *
 * Adaptador de Infraestructura - Hexagonal Architecture
 * En producción, esto sería una BD real (Postgres, Mongo, etc)
 */
export class InMemoryReportRepository implements ReportRepository {
  private reports: Map<string, Report> = new Map();

  async save(report: Report): Promise<void> {
    this.reports.set(report.id, report);
  }

  async findById(id: string): Promise<Report | null> {
    return this.reports.get(id) || null;
  }

  async findAll(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async delete(id: string): Promise<void> {
    this.reports.delete(id);
  }

  /**
   * Helper para tests: limpiar todos los reportes
   */
  async clear(): Promise<void> {
    this.reports.clear();
  }
}
