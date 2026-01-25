import { describe, it, expect, beforeEach } from 'vitest';
import { CreateReportUseCase } from '../../src/application/use-cases/CreateReportUseCase.js';
import { ExportReportUseCase } from '../../src/application/use-cases/ExportReportUseCase.js';
import { GetAllReportsUseCase } from '../../src/application/use-cases/GetAllReportsUseCase.js';
import { InMemoryReportRepository } from '../../src/infrastructure/persistence/InMemoryReportRepository.js';
import { PdfExporterFactory } from '../../src/domain/factories/PdfExporterFactory.js';
import { ExcelExporterFactory } from '../../src/domain/factories/ExcelExporterFactory.js';

/**
 * Tests para los Casos de Uso
 *
 * Estos tests verifican la lógica de aplicación (casos de uso)
 * usando el repositorio in-memory y diferentes factories.
 */
describe('Use Cases', () => {
  let repository: InMemoryReportRepository;
  let createReportUseCase: CreateReportUseCase;
  let getAllReportsUseCase: GetAllReportsUseCase;

  beforeEach(() => {
    // Crear instancias frescas para cada test
    repository = new InMemoryReportRepository();
    createReportUseCase = new CreateReportUseCase(repository);
    getAllReportsUseCase = new GetAllReportsUseCase(repository);
  });

  describe('CreateReportUseCase', () => {
    it('should create a new report', async () => {
      const dto = {
        title: 'Sales Report Q4',
        content: 'Sales increased by 20%',
        author: 'John Doe',
        category: 'Sales'
      };

      const report = await createReportUseCase.execute(dto);

      expect(report.id).toBeTruthy();
      expect(report.title).toBe(dto.title);
      expect(report.content).toBe(dto.content);
      expect(report.author).toBe(dto.author);
      expect(report.category).toBe(dto.category);
      expect(typeof report.date).toBe('string'); // DTO serializes dates as strings
    });

    it('should validate required fields', async () => {
      const dto = {
        title: '',
        content: 'content',
        author: 'author'
      };

      await expect(createReportUseCase.execute(dto)).rejects.toThrow(
        'title cannot be empty'
      );
    });

    it('should store report in repository', async () => {
      const dto = {
        title: 'Test Report',
        content: 'Test content',
        author: 'Tester'
      };

      await createReportUseCase.execute(dto);

      const reports = await getAllReportsUseCase.execute();
      expect(reports).toHaveLength(1);
      expect(reports[0].title).toBe(dto.title);
    });
  });

  describe('GetAllReportsUseCase', () => {
    it('should return empty array when no reports', async () => {
      const reports = await getAllReportsUseCase.execute();
      expect(reports).toEqual([]);
    });

    it('should return all reports', async () => {
      // Crear varios reportes
      await createReportUseCase.execute({
        title: 'Report 1',
        content: 'Content 1',
        author: 'Author 1'
      });

      await createReportUseCase.execute({
        title: 'Report 2',
        content: 'Content 2',
        author: 'Author 2'
      });

      const reports = await getAllReportsUseCase.execute();

      expect(reports).toHaveLength(2);
      expect(reports[0].title).toBe('Report 1');
      expect(reports[1].title).toBe('Report 2');
    });
  });

  describe('ExportReportUseCase', () => {
    let reportId: string;

    beforeEach(async () => {
      // Crear un reporte para exportar
      const report = await createReportUseCase.execute({
        title: 'Test Export Report',
        content: 'Content to export',
        author: 'Exporter'
      });
      reportId = report.id;
    });

    it('should export report as PDF using PdfExporterFactory', async () => {
      const factory = new PdfExporterFactory();
      const useCase = new ExportReportUseCase(repository, factory);

      const result = await useCase.execute(reportId);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.format).toBe('pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.filename).toContain('.pdf');
    });

    it('should export report as Excel using ExcelExporterFactory', async () => {
      const factory = new ExcelExporterFactory();
      const useCase = new ExportReportUseCase(repository, factory);

      const result = await useCase.execute(reportId);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.format).toBe('xlsx');
      expect(result.mimeType).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(result.filename).toContain('.xlsx');
    });

    it('should throw error if report not found', async () => {
      const factory = new PdfExporterFactory();
      const useCase = new ExportReportUseCase(repository, factory);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        'not found'
      );
    });

    it('should use the injected factory (dependency injection)', async () => {
      // Este test demuestra el poder del Factory Method Pattern:
      // El caso de uso NO sabe qué tipo de exporter se usa
      // Eso se decide al inyectar la factory

      const pdfFactory = new PdfExporterFactory();
      const excelFactory = new ExcelExporterFactory();

      const pdfUseCase = new ExportReportUseCase(repository, pdfFactory);
      const excelUseCase = new ExportReportUseCase(repository, excelFactory);

      const pdfResult = await pdfUseCase.execute(reportId);
      const excelResult = await excelUseCase.execute(reportId);

      // Mismo reporte, diferentes formatos
      expect(pdfResult.format).toBe('pdf');
      expect(excelResult.format).toBe('xlsx');

      // El caso de uso es el mismo, solo cambia la factory inyectada
    });
  });

  describe('Integration: Create and Export', () => {
    it('should create a report and export it to multiple formats', async () => {
      // 1. Crear reporte
      const report = await createReportUseCase.execute({
        title: 'Multi-Format Report',
        content: 'This report will be exported to multiple formats',
        author: 'El Profe Millo',
        category: 'Example'
      });

      // 2. Exportar a PDF
      const pdfFactory = new PdfExporterFactory();
      const pdfUseCase = new ExportReportUseCase(repository, pdfFactory);
      const pdfResult = await pdfUseCase.execute(report.id);

      expect(pdfResult.format).toBe('pdf');
      expect(pdfResult.buffer.toString()).toContain('Multi-Format Report');

      // 3. Exportar a Excel
      const excelFactory = new ExcelExporterFactory();
      const excelUseCase = new ExportReportUseCase(repository, excelFactory);
      const excelResult = await excelUseCase.execute(report.id);

      expect(excelResult.format).toBe('xlsx');
      expect(excelResult.buffer.toString()).toContain('Multi-Format Report');

      // Mismo reporte, múltiples formatos - ¡El poder del Factory Method!
    });
  });
});
