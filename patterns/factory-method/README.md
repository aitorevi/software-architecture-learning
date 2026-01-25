# Factory Method Pattern - Document Exporter

> **English README** - [Versión en Español](./README_ES.md)

A pedagogical project to learn the **Factory Method Pattern** through a practical document export system.

## What is Factory Method Pattern?

The Factory Method Pattern is a creational design pattern that delegates object creation to subclasses. Instead of calling `new` directly and coupling your code to concrete classes, you use a factory method that subclasses override to decide which class to instantiate.

### The Problem

```typescript
// ❌ Without Factory Method - Coupled to concrete classes
class ReportService {
  exportReport(data: Report, format: string): Buffer {
    let exporter;

    switch(format) {
      case 'pdf': exporter = new PdfExporter(); break;
      case 'excel': exporter = new ExcelExporter(); break;
      case 'csv': exporter = new CsvExporter(); break;
      default: throw new Error('Unsupported format');
    }

    return exporter.export(data);
  }
}

// Problems:
// - Switch grows with every new format
// - Violates Open/Closed Principle
// - Hard to test
// - Strong coupling
```

### The Solution

```typescript
// ✅ With Factory Method - Decoupled and extensible
abstract class ExporterFactory {
  abstract createExporter(): DocumentExporter;

  exportReport(data: Report): ExportResult {
    const exporter = this.createExporter();
    return exporter.export(data);
  }
}

class PdfExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    return new PdfExporter();
  }
}

// Usage
const factory = new PdfExporterFactory();
const result = factory.exportReport(data);
```

## Quick Start

### Installation

```bash
cd patterns/factory-method
npm install
```

### Run the Server

```bash
npm run dev
```

You should see:

```
🏭 FACTORY METHOD PATTERN - API SERVER
🚀 Server running on: http://localhost:3000
```

### Try the API

#### 1. Create a Report

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q4 2024 Sales Report",
    "content": "This quarter showed exceptional growth in all departments. Sales increased by 35% compared to the previous quarter.",
    "author": "John Doe",
    "category": "Sales"
  }'
```

Response:

```json
{
  "id": "report-1738012345678-abc123",
  "title": "Q4 2024 Sales Report",
  "content": "This quarter showed exceptional growth...",
  "author": "John Doe",
  "category": "Sales",
  "date": "2024-01-27T12:00:00.000Z"
}
```

Save the `id` for the next steps.

#### 2. Export to PDF

```bash
curl "http://localhost:3000/api/reports/YOUR_REPORT_ID/export?format=pdf" \
  --output report.pdf
```

#### 3. Export to Excel

```bash
curl "http://localhost:3000/api/reports/YOUR_REPORT_ID/export?format=excel" \
  --output report.xlsx
```

#### 4. Export to CSV

```bash
curl "http://localhost:3000/api/reports/YOUR_REPORT_ID/export?format=csv" \
  --output report.csv
```

#### 5. List All Reports

```bash
curl http://localhost:3000/api/reports
```

#### 6. Get Supported Formats

```bash
curl http://localhost:3000/api/formats
```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         DOMAIN (Products & Factories)               │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │   DocumentExporter (Product Interface)        │  │
│  │   ├── export(data): Buffer                    │  │
│  │   ├── getFormat(): string                     │  │
│  │   └── getMimeType(): string                   │  │
│  └───────────────────────────────────────────────┘  │
│                        △                             │
│                        │ implements                  │
│           ┌────────────┼────────────┐                │
│           │            │            │                │
│  ┌────────▼───┐  ┌────▼──────┐  ┌──▼─────────┐      │
│  │PdfExporter │  │ExcelExport│  │CsvExporter │      │
│  └────────────┘  └───────────┘  └────────────┘      │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │   ExporterFactory (Creator Abstract)          │  │
│  │   ├── createExporter(): DocumentExporter      │  │ ← Factory Method
│  │   └── exportReport(data): ExportResult        │  │
│  └───────────────────────────────────────────────┘  │
│                        △                             │
│                        │ extends                     │
│           ┌────────────┼────────────┐                │
│  ┌────────▼──────┐  ┌─▼──────────┐ ┌▼────────────┐  │
│  │PdfExporterFact│  │ExcelExporter│ │CsvExporter  │  │
│  │ory            │  │Factory      │ │Factory      │  │
│  └───────────────┘  └─────────────┘ └─────────────┘  │
└──────────────────────────────────────────────────────┘
                        ↑
                        │ uses
                        │
┌──────────────────────────────────────────────────────┐
│         APPLICATION (Use Cases)                      │
│  ┌───────────────────────────────────────────────┐  │
│  │   ExportReportUseCase                         │  │
│  │   - Receives factory (injection)              │  │
│  │   - Calls exportReport()                      │  │
│  │   - Doesn't know concrete exporter type       │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── domain/                              # 🎯 THE CORE
│   ├── entities/
│   │   └── Report.ts                   # Report entity
│   │
│   ├── exporters/                      # Products
│   │   ├── DocumentExporter.ts         # Product interface
│   │   ├── PdfExporter.ts              # Concrete product
│   │   ├── ExcelExporter.ts            # Concrete product
│   │   └── CsvExporter.ts              # Concrete product
│   │
│   ├── factories/                      # Creators
│   │   ├── ExporterFactory.ts          # Creator abstract (Factory Method)
│   │   ├── PdfExporterFactory.ts       # Concrete creator
│   │   ├── ExcelExporterFactory.ts     # Concrete creator
│   │   └── CsvExporterFactory.ts       # Concrete creator
│   │
│   └── repositories/
│       └── ReportRepository.ts         # Port (interface)
│
├── application/                        # Use Cases
│   ├── use-cases/
│   │   ├── ExportReportUseCase.ts      # Export with factory
│   │   ├── CreateReportUseCase.ts      # Create report
│   │   └── GetAllReportsUseCase.ts     # List reports
│   │
│   └── dtos/
│       └── ReportDTO.ts                # Data Transfer Objects
│
└── infrastructure/                     # Adapters
    ├── persistence/
    │   └── InMemoryReportRepository.ts # In-memory repo
    │
    ├── exporters/
    │   └── FactoryProvider.ts          # Maps format -> factory
    │
    └── http/
        ├── ExportController.ts         # REST controller
        ├── ReportController.ts         # REST controller
        ├── routes.ts                   # Routes configuration
        └── index.ts                    # Express app

tests/
├── domain/
│   ├── exporters.test.ts               # Test products
│   └── factories.test.ts               # Test factory method
├── application/
│   └── use-cases.test.ts               # Test use cases
└── infrastructure/
    └── factory-provider.test.ts        # Test provider
```

## Key Concepts

### 1. Product Interface

All exporters implement this common interface:

```typescript
interface DocumentExporter {
  export(data: Report): Buffer;
  getFormat(): string;
  getMimeType(): string;
}
```

### 2. Concrete Products

Each format has its own implementation:

```typescript
class PdfExporter implements DocumentExporter {
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
}
```

### 3. Creator Abstract (Factory Method)

```typescript
abstract class ExporterFactory {
  // The FACTORY METHOD - subclasses implement this
  abstract createExporter(): DocumentExporter;

  // Template method that uses the factory method
  exportReport(data: Report): ExportResult {
    const exporter = this.createExporter();
    return {
      buffer: exporter.export(data),
      format: exporter.getFormat(),
      mimeType: exporter.getMimeType(),
      filename: `${data.title}.${exporter.getFormat()}`
    };
  }
}
```

### 4. Concrete Creators

Each factory creates its specific exporter:

```typescript
class PdfExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    return new PdfExporter();
  }
}
```

### 5. Usage in Use Cases

The use case receives the factory through dependency injection:

```typescript
class ExportReportUseCase {
  constructor(
    private reportRepository: ReportRepository,
    private exporterFactory: ExporterFactory  // ← Injected
  ) {}

  async execute(reportId: string): Promise<ExportResult> {
    const report = await this.reportRepository.findById(reportId);
    return this.exporterFactory.exportReport(report);
  }
}
```

## Benefits

✅ **Open/Closed Principle**: Add new formats without modifying existing code
✅ **Single Responsibility**: Creation is separated from usage
✅ **Decoupling**: Client code doesn't depend on concrete classes
✅ **Testability**: Easy to inject fake factories in tests
✅ **Polymorphism**: Leverage inheritance and polymorphism

## When to Use

### ✅ Use Factory Method when:

- You don't know beforehand the exact type of object you'll need
- You want subclasses to choose the type of object to create
- You need **extensibility** without modifying existing code
- Creation logic is **complex** and deserves encapsulation
- You work with **families of related objects**

### ❌ Don't use when:

- You only have **one type of object** (YAGNI)
- Creation is **trivial** (simple `new` is enough)
- You don't need **extensibility**
- Overhead of additional classes doesn't add value

## Exercises

1. **Add JSON Format**: Implement `JsonExporter` and `JsonExporterFactory`
2. **Configuration**: Add page size configuration to PDF exporter
3. **Validation**: Add format-specific validation before export
4. **Notification System**: Use Factory Method for Email/SMS/Push notifications
5. **Logger Factory**: Create factories for different log destinations

## Learn More

- [Design Patterns - Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns)
- [Refactoring Guru - Factory Method](https://refactoring.guru/design-patterns/factory-method)
- [Head First Design Patterns](https://www.oreilly.com/library/view/head-first-design/0596007124/)

---

**El Profe Millo**
_"Don't 'new' everything. Delegate creation and decouple your code."_
