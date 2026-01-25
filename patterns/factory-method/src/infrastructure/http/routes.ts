import { Router } from 'express';
import { ReportController } from './ReportController.js';
import { ExportController } from './ExportController.js';

/**
 * Configura las rutas HTTP
 */
export function createRoutes(
  reportController: ReportController,
  exportController: ExportController
): Router {
  const router = Router();

  // ========================================
  // REPORTS CRUD
  // ========================================

  // POST /reports - Crear nuevo reporte
  router.post('/reports', (req, res) => reportController.create(req, res));

  // GET /reports - Listar todos los reportes
  router.get('/reports', (req, res) => reportController.getAll(req, res));

  // ========================================
  // EXPORT (Factory Method Pattern)
  // ========================================

  // GET /reports/:id/export?format=pdf - Exportar reporte
  router.get('/reports/:id/export', (req, res) =>
    exportController.exportReport(req, res)
  );

  // GET /formats - Formatos de exportación disponibles
  router.get('/formats', (req, res) =>
    exportController.getSupportedFormats(req, res)
  );

  // ========================================
  // HEALTH CHECK
  // ========================================

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Factory Method Pattern - Report Exporter'
    });
  });

  return router;
}
