import express from 'express';
import { createRoutes } from './http/routes.js';
import { ReportController } from './http/ReportController.js';
import { ExportController } from './http/ExportController.js';
import { CreateReportUseCase } from '../application/use-cases/CreateReportUseCase.js';
import { GetAllReportsUseCase } from '../application/use-cases/GetAllReportsUseCase.js';
import { ExportReportUseCase } from '../application/use-cases/ExportReportUseCase.js';
import { InMemoryReportRepository } from './persistence/InMemoryReportRepository.js';
import { FactoryProvider } from './exporters/FactoryProvider.js';
import { PdfExporterFactory } from '../domain/factories/PdfExporterFactory.js';

/**
 * Punto de entrada de la aplicación
 *
 * Aquí se ensamblan todas las dependencias (Dependency Injection manual)
 */

// ========================================
// CONFIGURAR REPOSITORIO
// ========================================

const reportRepository = new InMemoryReportRepository();

// ========================================
// CONFIGURAR FACTORIES Y PROVIDER
// ========================================

const factoryProvider = new FactoryProvider();
const defaultFactory = new PdfExporterFactory(); // Factory por defecto

// ========================================
// CONFIGURAR CASOS DE USO
// ========================================

const createReportUseCase = new CreateReportUseCase(reportRepository);
const getAllReportsUseCase = new GetAllReportsUseCase(reportRepository);
const exportReportUseCase = new ExportReportUseCase(
  reportRepository,
  defaultFactory
);

// ========================================
// CONFIGURAR CONTROLLERS
// ========================================

const reportController = new ReportController(
  createReportUseCase,
  getAllReportsUseCase
);

const exportController = new ExportController(
  exportReportUseCase,
  factoryProvider
);

// ========================================
// CONFIGURAR EXPRESS
// ========================================

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', createRoutes(reportController, exportController));

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: '🏭 Factory Method Pattern - Report Exporter API',
    author: 'El Profe Millo',
    endpoints: {
      health: 'GET /api/health',
      formats: 'GET /api/formats',
      reports: {
        create: 'POST /api/reports',
        list: 'GET /api/reports',
        export: 'GET /api/reports/:id/export?format={pdf|excel|csv}'
      }
    },
    examples: {
      createReport: {
        method: 'POST',
        url: '/api/reports',
        body: {
          title: 'Sales Report Q4 2024',
          content: 'This quarter showed exceptional growth...',
          author: 'John Doe',
          category: 'Sales'
        }
      },
      exportReport: {
        method: 'GET',
        url: '/api/reports/{id}/export?format=pdf',
        note: 'Returns downloadable file'
      }
    }
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                                                       ║');
  console.log('║       🏭 FACTORY METHOD PATTERN - API SERVER          ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API Docs:          http://localhost:${PORT}/`);
  console.log(`❤️  Health Check:      http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST   /api/reports             - Create report');
  console.log('  GET    /api/reports             - List all reports');
  console.log('  GET    /api/reports/:id/export  - Export report');
  console.log('  GET    /api/formats             - Supported formats');
  console.log('');
  console.log('🎓 By El Profe Millo - ¡Venga, a darle caña!');
  console.log('');
});

export default app;
