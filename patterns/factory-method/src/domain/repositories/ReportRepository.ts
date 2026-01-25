import { Report } from '../entities/Report.js';

/**
 * Puerto del Repositorio - Hexagonal Architecture
 *
 * Esta es la interface que define el contrato del repositorio.
 * Las implementaciones concretas (InMemoryReportRepository, etc)
 * están en la capa de infraestructura.
 */
export interface ReportRepository {
  /**
   * Guarda un reporte
   */
  save(report: Report): Promise<void>;

  /**
   * Busca un reporte por ID
   */
  findById(id: string): Promise<Report | null>;

  /**
   * Obtiene todos los reportes
   */
  findAll(): Promise<Report[]>;

  /**
   * Elimina un reporte
   */
  delete(id: string): Promise<void>;
}
