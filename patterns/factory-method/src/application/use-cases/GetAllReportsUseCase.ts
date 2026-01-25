import { ReportRepository } from '../../domain/repositories/ReportRepository.js';
import { ReportDTO, ReportResponseDTO } from '../dtos/ReportDTO.js';

/**
 * Caso de Uso: Obtener Todos los Reportes
 *
 * Responsabilidad: Obtener la lista de todos los reportes
 */
export class GetAllReportsUseCase {
  constructor(private reportRepository: ReportRepository) {}

  async execute(): Promise<ReportResponseDTO[]> {
    const reports = await this.reportRepository.findAll();
    return reports.map(ReportDTO.fromDomain);
  }
}
