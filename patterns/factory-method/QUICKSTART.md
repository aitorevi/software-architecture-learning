# Quickstart - Factory Method Pattern

## 1. Instalar y ejecutar

```bash
cd patterns/factory-method
npm install
npm run dev
```

Deberías ver:

```
Server running on http://localhost:3000

Available endpoints:
  POST   /reports            → Create a report
  GET    /reports/:id/export → Export report (format as query param)
  GET    /reports            → Get all reports
```

## 2. Probar la API

Abre otra terminal y ejecuta:

```bash
# Crear un reporte
curl -X POST http://localhost:3000/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ventas Q4 2024",
    "content": "Las ventas del cuarto trimestre fueron excelentes...",
    "author": "El Profe Millo"
  }'

# Guarda el ID que te devuelve (ejemplo: "1")

# Exportar a PDF
curl "http://localhost:3000/reports/1/export?format=pdf" --output report.pdf

# Exportar a Excel
curl "http://localhost:3000/reports/1/export?format=excel" --output report.xlsx

# Exportar a CSV
curl "http://localhost:3000/reports/1/export?format=csv" --output report.csv
```

## 3. Ejecutar tests

```bash
# Todos los tests
npm test

# En modo watch
npm run test:watch
```

## 4. Leer el código

Sigue este orden para entender el patrón:

### Dominio (products y factories)
1. `src/domain/exporters/DocumentExporter.ts` - Product interface
2. `src/domain/exporters/PdfExporter.ts` - Concrete product (PDF)
3. `src/domain/exporters/ExcelExporter.ts` - Concrete product (Excel)
4. `src/domain/exporters/CsvExporter.ts` - Concrete product (CSV)
5. `src/domain/factories/ExporterFactory.ts` - Creator abstract (Factory Method)
6. `src/domain/factories/PdfExporterFactory.ts` - Concrete creator
7. `src/domain/entities/Report.ts` - La entidad

### Aplicación (casos de uso)
8. `src/application/use-cases/ExportReportUseCase.ts` - Usar el factory
9. `src/application/dtos/ReportDTO.ts` - DTOs

### Infraestructura
10. `src/infrastructure/exporters/FactoryProvider.ts` - Mapea formato -> factory
11. `src/infrastructure/persistence/InMemoryReportRepository.ts` - Repo en memoria
12. `src/infrastructure/http/ExportController.ts` - REST controller

## 5. Conceptos clave a observar

### Product Interface
```typescript
// La interface común de todos los exporters
interface DocumentExporter {
  export(data: Report): Buffer;
  getFormat(): string;
  getMimeType(): string;
}
```

### Factory Method
```typescript
// El creator abstracto con el factory method
abstract class ExporterFactory {
  // El factory method que las subclases implementan
  abstract createExporter(): DocumentExporter;

  // Método que usa el factory method
  exportReport(data: Report): ExportResult {
    const exporter = this.createExporter(); // ← Delegación
    return exporter.export(data);
  }
}
```

### Concrete Creator
```typescript
// Cada subclase decide qué tipo de exporter crear
class PdfExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    return new PdfExporter(); // ← La creación específica
  }
}
```

### Uso en Casos de Uso
```typescript
// El caso de uso recibe el factory por inyección
class ExportReportUseCase {
  constructor(
    private reportRepo: ReportRepository,
    private factory: ExporterFactory  // ← No sabe qué tipo concreto es
  ) {}

  async execute(reportId: string): Promise<ExportResult> {
    const report = await this.reportRepo.findById(reportId);
    return this.factory.exportReport(report); // ← Usa el factory
  }
}
```

## 6. El problema vs la solución

### ❌ SIN Factory Method (acoplamiento)
```typescript
// Código acoplado a clases concretas
class ReportService {
  export(data: Report, format: string): Buffer {
    let exporter;
    switch(format) {
      case 'pdf': exporter = new PdfExporter(); break;
      case 'excel': exporter = new ExcelExporter(); break;
      case 'csv': exporter = new CsvExporter(); break;
      default: throw new Error('Unknown format');
    }
    return exporter.export(data);
  }
}

// Problemas:
// - Switch crece con cada formato nuevo
// - Violación de Open/Closed
// - Difícil de testear
// - Acoplamiento fuerte
```

### ✅ CON Factory Method (desacoplado)
```typescript
// Código desacoplado que trabaja con abstracciones
abstract class ExporterFactory {
  abstract createExporter(): DocumentExporter;

  exportReport(data: Report): ExportResult {
    const exporter = this.createExporter();
    return exporter.export(data);
  }
}

// Uso
const factory = new PdfExporterFactory(); // Puedes cambiar esto fácilmente
const result = factory.exportReport(data);

// Ventajas:
// ✅ Extensible (añades nuevos formatos sin tocar código)
// ✅ Open/Closed principle
// ✅ Fácil de testear (inyectas factories fake)
// ✅ Desacoplamiento total
```

## 7. Experimentar

Ideas para practicar:

1. **Añadir nuevo formato:** Implementa `JsonExporter` y `JsonExporterFactory`
2. **Configuración:** Modifica `PdfExporter` para aceptar tamaño de página
3. **Validación:** Añade validación específica por formato antes de exportar
4. **Sistema de notificaciones:** Usa Factory Method para Email/SMS/Push
5. **Logger Factory:** Crea factories para diferentes destinos de logs

## 8. Patrones relacionados

- **Abstract Factory:** Crea familias de objetos (Factory Method crea un tipo)
- **Builder:** Construye objetos complejos paso a paso
- **Strategy:** Encapsula algoritmos (Factory Method los crea)
- **Template Method:** Similar estructura (método abstracto + método que lo usa)

## 9. Siguiente paso

Una vez domines Factory Method:

→ **[Abstract Factory](../abstract-factory)** - Familias de objetos relacionados (próximamente)
→ **[Builder Pattern](../builder)** - Construcción compleja paso a paso (próximamente)

¡A darle caña con las factories! 🏭
