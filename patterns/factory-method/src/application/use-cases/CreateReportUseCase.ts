import { Report } from '../../domain/entities/Report.js';
import { ReportRepository } from '../../domain/repositories/ReportRepository.js';
import { CreateReportDTO, ReportDTO, ReportResponseDTO } from '../dtos/ReportDTO.js';

/**
 * Caso de Uso: Crear Reporte
 *
 * Responsabilidad: Orquestar la creación de un nuevo reporte
 */
export class CreateReportUseCase {
  constructor(private reportRepository: ReportRepository) {}

  async execute(dto: CreateReportDTO): Promise<ReportResponseDTO> {
    // 1. Crear la entidad de dominio
    const report = Report.create(dto);

    // 2. Persistir
    await this.reportRepository.save(report);

    // 3. Devolver DTO
    return ReportDTO.fromDomain(report);
  }
}
