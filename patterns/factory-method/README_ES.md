# Factory Method Pattern - Creación Flexible 🏭

Buenas, mi niño. Este proyecto te va a enseñar el **Factory Method Pattern**, un patrón creacional que delega la creación de objetos a subclases. Es como tener una fábrica que sabe crear diferentes tipos de productos sin que el cliente tenga que saber los detalles.

## ¿Qué vas a aprender?

Imagínate que tienes un sistema que exporta reportes en diferentes formatos: PDF, Excel, CSV. Sin Factory Method, acabas con un código lleno de `new` y `switch` statements que es un infierno de mantener. Con este patrón, cada formato tiene su propia "fábrica" que sabe cómo crearse.

### Conceptos clave que dominarás

1. **Factory Method** - Delegar la creación a un método que las subclases sobrescriben
2. **Product** - La interface común de los objetos creados
3. **Concrete Products** - Las implementaciones específicas
4. **Creator** - La clase que declara el factory method
5. **Concrete Creators** - Las subclases que implementan el factory method
6. **Desacoplamiento** - El cliente no depende de clases concretas

## El Problema

### Sin Factory Method ❌

Mira tú, esto es lo que NO queremos:

```typescript
class ReportService {
  exportReport(data: Report, format: string): Buffer {
    let exporter;

    // Un switch horrible que crece sin control
    switch(format.toLowerCase()) {
      case 'pdf':
        exporter = new PdfExporter();
        break;
      case 'excel':
        exporter = new ExcelExporter();
        break;
      case 'csv':
        exporter = new CsvExporter();
        break;
      case 'json':
        exporter = new JsonExporter();
        break;
      case 'xml':
        exporter = new XmlExporter();
        break;
      default:
        throw new Error('Unsupported format');
    }

    return exporter.export(data);
  }
}

// Para añadir un nuevo formato, tocas el switch (Open/Closed violation)
// El servicio depende directamente de todas las clases concretas
// Imposible extender sin modificar código existente
```

**Problemas:**
- Violación del principio Open/Closed (abierto a extensión, cerrado a modificación)
- Acoplamiento fuerte con todas las clases concretas
- El switch crece sin control con cada nuevo formato
- Difícil de testear (muchas dependencias directas)
- No puedes cambiar la lógica de creación fácilmente

### Con Factory Method ✅

Ahora mira esto, mi niño:

```typescript
// La interface del producto
interface DocumentExporter {
  export(data: Report): Buffer;
  getFormat(): string;
}

// El factory method abstracto
abstract class ExporterFactory {
  // El factory method que las subclases implementan
  abstract createExporter(): DocumentExporter;

  // El método que usa el factory method
  exportReport(data: Report): Buffer {
    const exporter = this.createExporter();
    return exporter.export(data);
  }
}

// Concrete factories
class PdfExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    return new PdfExporter();
  }
}

class ExcelExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    return new ExcelExporter();
  }
}

// Uso simple
const factory = new PdfExporterFactory();
const result = factory.exportReport(data);

// Para añadir un formato nuevo: creas una nueva factory
// No tocas código existente
```

**Ventajas:**
- Principio Open/Closed: extiendes sin modificar
- Desacoplamiento: el cliente solo conoce la interface
- Single Responsibility: cada factory crea un tipo de objeto
- Fácil de testear (mocks de factories)
- Lógica de creación centralizada y reutilizable

## Arquitectura - El Patrón en Acción

```
┌─────────────────────────────────────────────────────┐
│         DOMINIO (Productos y Factories)             │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │   DocumentExporter (Product Interface)        │  │
│  │   ├── export(data): Buffer                    │  │
│  │   └── getFormat(): string                     │  │
│  └───────────────────────────────────────────────┘  │
│                        △                             │
│                        │ implementan                 │
│           ┌────────────┼────────────┐                │
│           │            │            │                │
│  ┌────────▼───┐  ┌────▼──────┐  ┌──▼─────────┐      │
│  │PdfExporter │  │ExcelExport│  │CsvExporter │      │
│  └────────────┘  └───────────┘  └────────────┘      │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │   ExporterFactory (Creator Abstract)          │  │
│  │   ├── createExporter(): DocumentExporter      │  │ <- Factory Method
│  │   └── exportReport(data): Buffer              │  │
│  └───────────────────────────────────────────────┘  │
│                        △                             │
│                        │ extends                     │
│           ┌────────────┼────────────┐                │
│           │            │            │                │
│  ┌────────▼──────┐  ┌─▼──────────┐ ┌▼────────────┐  │
│  │PdfExporterFact│  │ExcelExporter│ │CsvExporter  │  │
│  │ory            │  │Factory      │ │Factory      │  │
│  └───────────────┘  └─────────────┘ └─────────────┘  │
└──────────────────────────────────────────────────────┘
                        ↑
                        │ usa
                        │
┌──────────────────────────────────────────────────────┐
│         APLICACIÓN (Casos de Uso)                    │
│  ┌───────────────────────────────────────────────┐  │
│  │   ExportReportUseCase                         │  │
│  │   - Recibe el factory (inyección)             │  │
│  │   - Llama exportReport()                      │  │
│  │   - No sabe qué tipo de exporter se crea      │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                        ↑
                        │ usa
                        │
┌──────────────────────────────────────────────────────┐
│         INFRAESTRUCTURA (Configuración)              │
│  ┌───────────────────────────────────────────────┐  │
│  │   FactoryProvider                             │  │
│  │   - Mapea formato -> factory                  │  │
│  │   - getFactory(format): ExporterFactory       │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │   ExportController                            │  │
│  │   - Recibe request                            │  │
│  │   - Obtiene factory del provider              │  │
│  │   - Ejecuta caso de uso                       │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### ¿Por qué esta estructura, Profe?

Buena pregunta, mi niño. Mira tú:

1. **Dominio limpio** - Las factories y productos están en el dominio
2. **Polimorfismo** - El cliente trabaja con interfaces, no clases concretas
3. **Extensible** - Añades nuevos exporters sin tocar código existente
4. **Testeable** - Inyectas factories fake en los tests
5. **Flexible** - Puedes cambiar qué factory usar en runtime

## Estructura de Carpetas

```
src/
├── domain/                              # 🎯 EL NÚCLEO
│   ├── entities/
│   │   └── Report.ts                    # La entidad Reporte
│   │
│   ├── exporters/
│   │   ├── DocumentExporter.ts          # Product interface
│   │   ├── PdfExporter.ts               # Concrete product
│   │   ├── ExcelExporter.ts             # Concrete product
│   │   └── CsvExporter.ts               # Concrete product
│   │
│   ├── factories/
│   │   ├── ExporterFactory.ts           # Creator abstract
│   │   ├── PdfExporterFactory.ts        # Concrete creator
│   │   ├── ExcelExporterFactory.ts      # Concrete creator
│   │   └── CsvExporterFactory.ts        # Concrete creator
│   │
│   └── repositories/
│       └── ReportRepository.ts          # Puerto (interface)
│
├── application/                         # Casos de Uso
│   ├── use-cases/
│   │   ├── ExportReportUseCase.ts       # Exportar con factory
│   │   └── CreateReportUseCase.ts       # Crear reporte
│   │
│   └── dtos/
│       └── ReportDTO.ts                 # DTO de reporte
│
└── infrastructure/                      # Adaptadores
    ├── persistence/
    │   └── InMemoryReportRepository.ts  # Repo en memoria
    │
    ├── exporters/
    │   └── FactoryProvider.ts           # Mapea formato -> factory
    │
    └── http/
        ├── ExportController.ts          # REST controller
        └── index.ts                     # Express app
```

## El Patrón en Detalle

### 1. La Interface del Producto: DocumentExporter

Todo empieza aquí, mi niño:

```typescript
// src/domain/exporters/DocumentExporter.ts

export interface DocumentExporter {
  // El método principal de exportación
  export(data: Report): Buffer;

  // Obtener el formato que exporta
  getFormat(): string;

  // Obtener el MIME type del formato
  getMimeType(): string;
}
```

**La clave:** Todos los exporters implementan esta interface, permitiendo polimorfismo.

### 2. Productos Concretos: Los Exporters

Cada uno encapsula la lógica de exportación a un formato:

```typescript
// src/domain/exporters/PdfExporter.ts

export class PdfExporter implements DocumentExporter {
  export(data: Report): Buffer {
    // Lógica específica para generar PDF
    const pdfContent = this.generatePdfContent(data);
    return Buffer.from(pdfContent, 'utf-8');
  }

  getFormat(): string {
    return 'pdf';
  }

  getMimeType(): string {
    return 'application/pdf';
  }

  private generatePdfContent(data: Report): string {
    return `
      PDF DOCUMENT
      ============
      Title: ${data.title}
      Date: ${data.date.toISOString()}
      Author: ${data.author}

      CONTENT:
      ${data.content}

      --- End of PDF ---
    `;
  }
}
```

### 3. El Creator Abstracto: ExporterFactory

Aquí está el Factory Method:

```typescript
// src/domain/factories/ExporterFactory.ts

export abstract class ExporterFactory {
  // El FACTORY METHOD - las subclases lo implementan
  abstract createExporter(): DocumentExporter;

  // Método de alto nivel que usa el factory method
  exportReport(data: Report): ExportResult {
    // Crear el exporter (delegado a subclases)
    const exporter = this.createExporter();

    // Usar el exporter (lógica común)
    const buffer = exporter.export(data);

    return {
      buffer,
      format: exporter.getFormat(),
      mimeType: exporter.getMimeType(),
      filename: `${data.title}_${Date.now()}.${exporter.getFormat()}`
    };
  }

  // Método helper para validar antes de exportar
  protected validateReport(data: Report): void {
    if (!data.title) {
      throw new Error('Report must have a title');
    }
    if (!data.content) {
      throw new Error('Report must have content');
    }
  }
}
```

**Lo importante:** El método `exportReport` usa `createExporter()` sin saber qué tipo de exporter se creará.

### 4. Concrete Creators: Las Factories Específicas

Cada una crea su tipo de exporter:

```typescript
// src/domain/factories/PdfExporterFactory.ts

export class PdfExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    // Aquí podrías pasar configuración específica
    return new PdfExporter();
  }
}

// src/domain/factories/ExcelExporterFactory.ts

export class ExcelExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    return new ExcelExporter();
  }
}

// src/domain/factories/CsvExporterFactory.ts

export class CsvExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    return new CsvExporter();
  }
}
```

**Extensión:** Para añadir JSON, solo creas `JsonExporter` y `JsonExporterFactory`. No tocas nada más.

### 5. Uso en Casos de Uso

Aquí ves cómo el caso de uso usa el factory sin conocer el tipo concreto:

```typescript
// src/application/use-cases/ExportReportUseCase.ts

export class ExportReportUseCase {
  constructor(
    private reportRepository: ReportRepository,
    private exporterFactory: ExporterFactory  // ← Inyección del factory
  ) {}

  async execute(reportId: string): Promise<ExportResult> {
    // 1. Obtener el reporte
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new Error('Report not found');
    }

    // 2. Exportar usando el factory
    // No sabemos si es PDF, Excel o CSV - ¡y no nos importa!
    return this.exporterFactory.exportReport(report);
  }
}
```

### 6. Configuración en Infraestructura

El `FactoryProvider` mapea formatos a factories:

```typescript
// src/infrastructure/exporters/FactoryProvider.ts

export class FactoryProvider {
  private factories: Map<string, ExporterFactory>;

  constructor() {
    this.factories = new Map();
    this.registerDefaultFactories();
  }

  private registerDefaultFactories(): void {
    this.factories.set('pdf', new PdfExporterFactory());
    this.factories.set('excel', new ExcelExporterFactory());
    this.factories.set('csv', new CsvExporterFactory());
  }

  getFactory(format: string): ExporterFactory {
    const factory = this.factories.get(format.toLowerCase());

    if (!factory) {
      throw new Error(`Unsupported export format: ${format}`);
    }

    return factory;
  }

  // Permite registrar nuevas factories en runtime
  registerFactory(format: string, factory: ExporterFactory): void {
    this.factories.set(format.toLowerCase(), factory);
  }
}
```

## Variante: Factory Method vs Simple Factory

### Simple Factory (no es Factory Method)

```typescript
// Esto NO es Factory Method, es un Simple Factory
class ExporterFactory {
  static create(format: string): DocumentExporter {
    switch(format) {
      case 'pdf': return new PdfExporter();
      case 'excel': return new ExcelExporter();
      case 'csv': return new CsvExporter();
      default: throw new Error('Unknown format');
    }
  }
}

// Uso
const exporter = ExporterFactory.create('pdf');
```

**Diferencia:** Simple Factory usa un método estático con switch. Factory Method usa herencia y polimorfismo.

**Factory Method es mejor cuando:**
- Necesitas extensibilidad (añadir tipos sin modificar código)
- La lógica de creación varía entre tipos
- Quieres testear con factories fake

## Casos de Uso Reales

### Sistema de Notificaciones

```typescript
// Product
interface Notification {
  send(message: string, recipient: string): void;
}

// Concrete Products
class EmailNotification implements Notification {
  send(message: string, recipient: string): void {
    console.log(`Email to ${recipient}: ${message}`);
  }
}

class SmsNotification implements Notification {
  send(message: string, recipient: string): void {
    console.log(`SMS to ${recipient}: ${message}`);
  }
}

class PushNotification implements Notification {
  send(message: string, recipient: string): void {
    console.log(`Push to ${recipient}: ${message}`);
  }
}

// Creator
abstract class NotificationFactory {
  abstract createNotification(): Notification;

  notify(message: string, recipient: string): void {
    const notification = this.createNotification();
    notification.send(message, recipient);
  }
}

// Concrete Creators
class EmailNotificationFactory extends NotificationFactory {
  createNotification(): Notification {
    return new EmailNotification();
  }
}

class SmsNotificationFactory extends NotificationFactory {
  createNotification(): Notification {
    return new SmsNotification();
  }
}
```

### Conexiones a Bases de Datos

```typescript
// Product
interface DatabaseConnection {
  connect(): void;
  query(sql: string): any[];
  disconnect(): void;
}

// Concrete Products
class PostgresConnection implements DatabaseConnection {
  connect(): void { /* postgres logic */ }
  query(sql: string): any[] { /* postgres query */ }
  disconnect(): void { /* postgres disconnect */ }
}

class MongoConnection implements DatabaseConnection {
  connect(): void { /* mongo logic */ }
  query(sql: string): any[] { /* mongo query */ }
  disconnect(): void { /* mongo disconnect */ }
}

// Creator
abstract class DatabaseFactory {
  abstract createConnection(): DatabaseConnection;

  executeQuery(sql: string): any[] {
    const conn = this.createConnection();
    conn.connect();
    const results = conn.query(sql);
    conn.disconnect();
    return results;
  }
}
```

## Ventajas y Desventajas

### ✅ Ventajas

1. **Open/Closed Principle**: Añades nuevos tipos sin modificar código existente
2. **Single Responsibility**: La creación está separada del uso
3. **Desacoplamiento**: El código cliente no depende de clases concretas
4. **Reutilización**: Lógica de creación centralizada
5. **Testeable**: Inyectas factories fake en tests
6. **Polimorfismo**: Aprovechas herencia y polimorfismo

### ⚠️ Desventajas

1. **Complejidad**: Más clases que con creación directa
2. **Indirección**: Un nivel extra de abstracción
3. **Overkill**: Para casos simples es excesivo

## ¿Cuándo Usar Factory Method?

### ✅ Úsalo cuando:

- No sabes de antemano qué tipo exacto de objeto necesitarás
- Quieres que las subclases puedan elegir el tipo de objeto a crear
- Necesitas **extensibilidad** sin modificar código existente
- La lógica de creación es **compleja** y merece encapsulación
- Trabajas con **familias de objetos relacionados**
- Quieres **desacoplar** el cliente de las clases concretas

### ❌ No lo uses cuando:

- Solo tienes **un tipo de objeto** (YAGNI - You Aren't Gonna Need It)
- La creación es **trivial** (un simple `new` basta)
- No necesitas **extensibilidad**
- El overhead de clases adicionales no aporta valor

## Comparación con Otros Patrones

### vs Abstract Factory

```typescript
// Factory Method: crea UN tipo de objeto
abstract class ExporterFactory {
  abstract createExporter(): DocumentExporter;
}

// Abstract Factory: crea FAMILIAS de objetos relacionados
interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
  createTextInput(): TextInput;
}
```

**Factory Method:** Un factory method, un tipo de producto.
**Abstract Factory:** Múltiples factory methods, familia de productos.

### vs Builder

```typescript
// Factory Method: crea objetos de diferentes tipos
const factory = new PdfExporterFactory();
const exporter = factory.createExporter();

// Builder: construye un objeto complejo paso a paso
const report = new ReportBuilder()
  .setTitle('Sales Report')
  .setAuthor('John')
  .setContent('...')
  .build();
```

**Factory Method:** Crea variantes de un tipo.
**Builder:** Construye un objeto complejo paso a paso.

### vs Simple Factory

```typescript
// Simple Factory: método estático con switch
class ExporterFactory {
  static create(type: string): DocumentExporter {
    switch(type) { /* ... */ }
  }
}

// Factory Method: herencia y polimorfismo
abstract class ExporterFactory {
  abstract createExporter(): DocumentExporter;
}
```

**Simple Factory:** Más simple pero menos extensible (switch crece).
**Factory Method:** Más complejo pero extensible (Open/Closed).

## Testing del Factory Method

Una de las grandes ventajas es lo fácil que es testear:

```typescript
describe('ExportReportUseCase', () => {
  it('should export report using provided factory', async () => {
    // Arrange
    const mockReport = new Report({
      id: '1',
      title: 'Test Report',
      content: 'Test content',
      author: 'John',
      date: new Date()
    });

    const mockRepo = {
      findById: vi.fn().mockResolvedValue(mockReport)
    };

    // Factory fake que devuelve un exporter fake
    class FakeExporterFactory extends ExporterFactory {
      createExporter(): DocumentExporter {
        return {
          export: vi.fn().mockReturnValue(Buffer.from('fake')),
          getFormat: () => 'fake',
          getMimeType: () => 'application/fake'
        };
      }
    }

    const useCase = new ExportReportUseCase(
      mockRepo,
      new FakeExporterFactory()
    );

    // Act
    const result = await useCase.execute('1');

    // Assert
    expect(result.format).toBe('fake');
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
  });
});
```

## Ejercicios Prácticos

### Ejercicio 1: Nuevo Formato
Añade soporte para exportar a JSON. Crea `JsonExporter` y `JsonExporterFactory`.

### Ejercicio 2: Configuración
Modifica las factories para aceptar configuración (ej: tamaño de página para PDF).

### Ejercicio 3: Sistema de Notificaciones
Implementa un sistema de notificaciones usando Factory Method (Email, SMS, Push).

### Ejercicio 4: Logger Factory
Crea un sistema de logging con diferentes destinos (File, Console, Remote) usando Factory Method.

### Ejercicio 5: Validación
Añade validación específica por formato antes de exportar.

## Preguntas Frecuentes

### ¿Es lo mismo que el patrón Strategy?

No. **Strategy** encapsula algoritmos intercambiables en runtime. **Factory Method** encapsula la **creación** de objetos. Puedes combinarlos: usar Factory Method para crear diferentes Strategies.

### ¿Cuándo uso Factory Method vs Simple Factory?

**Simple Factory:** Cuando no necesitas extensibilidad. Es más simple.
**Factory Method:** Cuando necesitas que sea extensible sin modificar código (Open/Closed).

### ¿Puedo usar Factory Method sin herencia?

Sí. Puedes usar composición en lugar de herencia:

```typescript
class ExporterFactory {
  constructor(private creator: () => DocumentExporter) {}

  createExporter(): DocumentExporter {
    return this.creator();
  }
}

// Uso
const pdfFactory = new ExporterFactory(() => new PdfExporter());
```

Pero pierdes el polimorfismo de subclases.

### ¿Qué pasa si necesito pasar parámetros al constructor?

Pásalos a la factory:

```typescript
class PdfExporterFactory extends ExporterFactory {
  constructor(private pageSize: string) {
    super();
  }

  createExporter(): DocumentExporter {
    return new PdfExporter(this.pageSize);
  }
}
```

## Recursos Adicionales

- **Libro**: "Design Patterns" - Gang of Four (Capítulo Factory Method)
- **Libro**: "Head First Design Patterns" (Factory Method explicado con pizzas)
- **Refactoring Guru**: Excelente visualización del patrón

## Conclusión

El Factory Method Pattern es como delegar la responsabilidad de decidir qué clase instanciar, mi niño. En lugar de usar `new` directamente y acoplarte a clases concretas, delegas esa decisión a un método que las subclases pueden sobreescribir.

No es para todos los casos. Si solo tienes un tipo de objeto, es overkill. Pero cuando empiezas a tener variantes y necesitas extensibilidad sin modificar código existente, este patrón te va a salvar de un acoplamiento horrible.

La clave está en la **delegación**: el código cliente trabaja con interfaces, y las subclases deciden qué clase concreta instanciar. Eso es polimorfismo en su máxima expresión.

¡Venga, a darle caña con las factories!

---

**Profe Millo**
_"No hagas 'new' de todo. Delega la creación y desacopla tu código."_
