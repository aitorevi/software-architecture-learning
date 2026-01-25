# 🎓 Presentación: Factory Method Pattern

> **Una guía para presentar este patrón a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar el Factory Method Pattern: cómo delegar la creación de objetos a subclases para desacoplar el código y hacerlo extensible.

### Duración Recomendada
- **Express (30 min)**: Problema + Solución + Demo
- **Estándar (1 hora)**: Conceptos + Código + Ejercicios
- **Completo (2 horas)**: Workshop con implementación

### Prerrequisitos
- OOP básico (interfaces, herencia, polimorfismo)
- Entender el problema del acoplamiento

---

## 🎤 Estructura Sugerida

### 1. Introducción - El Problema (10 min)

**Pregunta inicial:** "¿Cómo crean objetos en sus aplicaciones?"

**Mostrar código problemático:**
```typescript
// ❌ El infierno del acoplamiento
class ReportService {
  exportReport(data: Report, format: string): Buffer {
    let exporter;

    // Un switch que viola Open/Closed
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
      default:
        throw new Error('Unsupported format');
    }

    return exporter.export(data);
  }
}

// Para añadir XML, tienes que modificar el switch
// ¡Violación del principio Open/Closed!
```

**Los problemas:**
1. **Violación de Open/Closed** - Modificas para extender
2. **Acoplamiento fuerte** - Dependes de todas las clases concretas
3. **Switch infinito** - Crece sin control con cada nuevo formato
4. **Difícil de testear** - Muchas dependencias directas
5. **No flexible** - No puedes cambiar la lógica de creación fácilmente

### 2. La Solución - Factory Method Pattern (15 min)

**Mostrar la transformación:**

```typescript
// ✅ Con Factory Method Pattern

// 1. Product Interface
interface DocumentExporter {
  export(data: Report): Buffer;
  getFormat(): string;
  getMimeType(): string;
}

// 2. Concrete Products
class PdfExporter implements DocumentExporter {
  export(data: Report): Buffer { /* ... */ }
  getFormat(): string { return 'pdf'; }
  getMimeType(): string { return 'application/pdf'; }
}

class ExcelExporter implements DocumentExporter {
  export(data: Report): Buffer { /* ... */ }
  getFormat(): string { return 'excel'; }
  getMimeType(): string { return 'application/vnd.ms-excel'; }
}

// 3. Creator (con Factory Method)
abstract class ExporterFactory {
  // El FACTORY METHOD - las subclases lo implementan
  abstract createExporter(): DocumentExporter;

  // Método que usa el factory method
  exportReport(data: Report): ExportResult {
    const exporter = this.createExporter(); // ← Delegación
    const buffer = exporter.export(data);

    return {
      buffer,
      format: exporter.getFormat(),
      mimeType: exporter.getMimeType()
    };
  }
}

// 4. Concrete Creators
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

// 5. Uso
const factory = new PdfExporterFactory();
const result = factory.exportReport(data);

// Para añadir XML: creas XmlExporter y XmlExporterFactory
// NO tocas código existente
```

**Conceptos clave:**
1. **Product:** Interface común (DocumentExporter)
2. **Concrete Products:** Implementaciones específicas (PdfExporter, ExcelExporter)
3. **Creator:** Clase abstracta con factory method
4. **Concrete Creators:** Subclases que implementan el factory method
5. **Delegación:** El creator delega la creación a subclases

### 3. La Anatomía del Patrón (15 min)

**Dibujar en la pizarra:**

```
Estructura del Factory Method Pattern

┌─────────────────────────────────────┐
│       Creator (Abstract)            │
│                                     │
│  + factoryMethod(): Product        │ ← Factory Method (abstracto)
│  + someOperation(): void            │
│      {                              │
│        product = factoryMethod()    │ ← Usa el factory method
│        // usa product               │
│      }                              │
└─────────────────────────────────────┘
           △
           │ extends
      ┌────┴────┬──────────┐
      │         │          │
┌─────▼─────┐ ┌▼────────┐ ┌▼─────────┐
│ConcreteA  │ │ConcreteB│ │ConcreteC │
│Factory    │ │Factory  │ │Factory   │
│           │ │         │ │          │
│+ factory  │ │+ factory│ │+ factory │
│  Method() │ │  Method()│ │  Method()│
│  return   │ │  return │ │  return  │
│  ProductA │ │  ProductB│ │  ProductC│
└───────────┘ └─────────┘ └──────────┘
      │            │            │
      │ creates    │ creates    │ creates
      ▼            ▼            ▼
┌───────────┐ ┌─────────┐ ┌──────────┐
│ProductA   │ │ProductB │ │ProductC  │
└───────────┘ └─────────┘ └──────────┘
           △
           │ implements
           │
┌──────────┴─────────────────────────┐
│         Product Interface          │
│                                    │
│  + operation(): void               │
└────────────────────────────────────┘
```

**Flujo:**
1. Cliente llama a `someOperation()` del Creator
2. Creator llama a `factoryMethod()` (implementado por subclases)
3. Subclase devuelve una instancia de Concrete Product
4. Creator usa el Product sin saber el tipo concreto

### 4. Demo en Vivo (20 min)

**Paso 1: Ejecutar el proyecto**
```bash
npm run dev
```

**Paso 2: Crear un reporte**
```bash
curl -X POST http://localhost:3000/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ventas Q4 2024",
    "content": "Las ventas del cuarto trimestre fueron excelentes. Crecimiento del 25%.",
    "author": "El Profe Millo"
  }'

# Guarda el ID devuelto (ejemplo: "1")
```

**Paso 3: Exportar en diferentes formatos**
```bash
# PDF
curl "http://localhost:3000/reports/1/export?format=pdf" --output report.pdf

# Excel
curl "http://localhost:3000/reports/1/export?format=excel" --output report.xlsx

# CSV
curl "http://localhost:3000/reports/1/export?format=csv" --output report.csv

# Formato no soportado (error)
curl "http://localhost:3000/reports/1/export?format=xml"
```

**Paso 4: Mostrar el código**

Navegar por el código en este orden:
1. `DocumentExporter.ts` - La product interface
2. `PdfExporter.ts` - Un concrete product
3. `ExporterFactory.ts` - El creator con factory method
4. `PdfExporterFactory.ts` - Un concrete creator
5. `ExportReportUseCase.ts` - Cómo se usa (inyección del factory)
6. `FactoryProvider.ts` - Cómo se mapean formatos a factories

**Paso 5: Añadir nuevo formato en vivo**

Implementar `JsonExporter` y `JsonExporterFactory`:

```typescript
// 1. Concrete Product
export class JsonExporter implements DocumentExporter {
  export(data: Report): Buffer {
    const json = JSON.stringify({
      title: data.title,
      author: data.author,
      date: data.date,
      content: data.content
    }, null, 2);

    return Buffer.from(json, 'utf-8');
  }

  getFormat(): string {
    return 'json';
  }

  getMimeType(): string {
    return 'application/json';
  }
}

// 2. Concrete Creator
export class JsonExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    return new JsonExporter();
  }
}

// 3. Registrar en FactoryProvider
this.factories.set('json', new JsonExporterFactory());
```

**Reiniciar servidor y probar:**
```bash
curl "http://localhost:3000/reports/1/export?format=json"
```

**Punto clave:** No tocamos código existente, solo añadimos nuevas clases.

### 5. Factory Method vs Alternativas (10 min)

**vs Simple Factory**

```typescript
// ❌ Simple Factory (no es Factory Method)
class ExporterFactory {
  static create(format: string): DocumentExporter {
    switch(format) {
      case 'pdf': return new PdfExporter();
      case 'excel': return new ExcelExporter();
      default: throw new Error('Unknown');
    }
  }
}

// Problema: switch crece, violación de Open/Closed
```

```typescript
// ✅ Factory Method
abstract class ExporterFactory {
  abstract createExporter(): DocumentExporter;
}

class PdfExporterFactory extends ExporterFactory {
  createExporter(): DocumentExporter {
    return new PdfExporter();
  }
}

// Ventaja: extensible sin modificar código
```

**vs Creación Directa**

```typescript
// ❌ Creación directa (acoplamiento)
const exporter = new PdfExporter();
exporter.export(data);

// Problema: acoplado a PdfExporter
```

```typescript
// ✅ Factory Method (desacoplado)
const factory: ExporterFactory = getFactoryFromConfig();
const result = factory.exportReport(data);

// Ventaja: no sabes (ni te importa) qué tipo de exporter es
```

### 6. Ejercicio Práctico (15 min)

**Ejercicio:**
"Implementen un sistema de notificaciones usando Factory Method. Soportar Email, SMS y Push."

**Estructura:**
```typescript
// Product
interface Notification {
  send(message: string, recipient: string): void;
}

// Concrete Products
class EmailNotification implements Notification { /* ... */ }
class SmsNotification implements Notification { /* ... */ }
class PushNotification implements Notification { /* ... */ }

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

// ... (SMS, Push)
```

**Uso:**
```typescript
// Inyectar factory según preferencia del usuario
const factory = user.prefersEmail
  ? new EmailNotificationFactory()
  : new SmsNotificationFactory();

factory.notify('Hola!', user.contact);
```

**Solución (revelar después):**
Proveer implementación completa en `examples/notification-system/`

---

## 💡 Puntos Clave

### Las Tres Ventajas Principales

1. **Open/Closed Principle**: Extensible sin modificar código existente
2. **Desacoplamiento**: Cliente no depende de clases concretas
3. **Single Responsibility**: Creación separada del uso

### ¿Cuándo Usarlo?

✅ **SÍ** cuando:
- No sabes el tipo exacto en compile time
- Necesitas extensibilidad (añadir tipos sin modificar código)
- La lógica de creación es compleja
- Trabajas con familias de objetos relacionados

❌ **NO** cuando:
- Solo tienes un tipo de objeto (YAGNI)
- La creación es trivial
- No necesitas extensibilidad

### Comparación Rápida

| Sin Factory Method | Con Factory Method |
|-------------------|-------------------|
| Switch/if crece sin control | Subclases específicas |
| Violación Open/Closed | Cumple Open/Closed |
| Acoplamiento fuerte | Desacoplamiento |
| Difícil testear | Fácil testear (inyectas factory fake) |
| Lógica creación dispersa | Lógica centralizada |

---

## ❓ Preguntas Frecuentes

### "¿No es demasiado código para un simple 'new'?"

Para UN objeto, sí. Pero cuando tienes múltiples tipos y necesitas extensibilidad, Factory Method reduce la complejidad total drásticamente.

### "¿Cuál es la diferencia con Abstract Factory?"

**Factory Method:** UN factory method, UN tipo de producto.
**Abstract Factory:** MÚLTIPLES factory methods, FAMILIA de productos relacionados.

```typescript
// Factory Method
abstract class ExporterFactory {
  abstract createExporter(): DocumentExporter;
}

// Abstract Factory
interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
  createTextInput(): TextInput;
}
```

### "¿Es lo mismo que el patrón Strategy?"

No. **Strategy** encapsula algoritmos intercambiables. **Factory Method** encapsula la **creación** de objetos. Puedes combinarlos: Factory Method crea diferentes Strategies.

### "¿Puedo usar Factory Method sin herencia?"

Sí, con composición:

```typescript
class ExporterFactory {
  constructor(private creator: () => DocumentExporter) {}

  createExporter(): DocumentExporter {
    return this.creator();
  }
}

const pdfFactory = new ExporterFactory(() => new PdfExporter());
```

Pero pierdes el polimorfismo de subclases.

---

## 📋 Checklist de Presentación

Antes:
- [ ] Proyecto ejecutándose
- [ ] Tests pasando
- [ ] Ejemplos curl listos
- [ ] Diagramas preparados
- [ ] Ejemplo de código "malo" listo

Durante:
- [ ] Mostrar el problema (switch, acoplamiento)
- [ ] Explicar la solución (delegación a subclases)
- [ ] Demostrar polimorfismo (diferentes factories)
- [ ] Demo en vivo
- [ ] Añadir nuevo tipo en vivo
- [ ] Ejercicio práctico
- [ ] Comparar con alternativas

Después:
- [ ] Compartir recursos adicionales
- [ ] Responder dudas
- [ ] Sugerir ejercicios para practicar

---

## 🏆 Mensaje Final

"El Factory Method Pattern trata sobre una idea poderosa:

**No hagas 'new' de todo. Delega la creación a un método que las subclases pueden sobreescribir.**

Esto te permite:
- Trabajar con interfaces en lugar de clases concretas
- Extender sin modificar código existente (Open/Closed)
- Centralizar y encapsular la lógica de creación

No es la solución para todo. Si solo tienes un tipo de objeto, es overkill. Pero cuando empiezas a tener variantes y necesitas extensibilidad, este patrón te va a cambiar la forma de pensar sobre la creación de objetos.

Recuerden: **delegación** > **creación directa**."

---

## 📚 Ejemplos Adicionales para Mencionar

### Casos Reales de Uso

1. **Frameworks UI**
```typescript
// Botones para diferentes plataformas
abstract class ButtonFactory {
  abstract createButton(): Button;
}

class WindowsButtonFactory extends ButtonFactory {
  createButton(): Button { return new WindowsButton(); }
}

class MacButtonFactory extends ButtonFactory {
  createButton(): Button { return new MacButton(); }
}
```

2. **Bases de Datos**
```typescript
// Conexiones a diferentes BDs
abstract class DatabaseFactory {
  abstract createConnection(): DatabaseConnection;
}

class PostgresFactory extends DatabaseFactory {
  createConnection(): DatabaseConnection {
    return new PostgresConnection();
  }
}

class MongoFactory extends DatabaseFactory {
  createConnection(): DatabaseConnection {
    return new MongoConnection();
  }
}
```

3. **Loggers**
```typescript
// Diferentes destinos de logs
abstract class LoggerFactory {
  abstract createLogger(): Logger;
}

class FileLoggerFactory extends LoggerFactory {
  createLogger(): Logger { return new FileLogger(); }
}

class ConsoleLoggerFactory extends LoggerFactory {
  createLogger(): Logger { return new ConsoleLogger(); }
}

class RemoteLoggerFactory extends LoggerFactory {
  createLogger(): Logger { return new RemoteLogger(); }
}
```

---

**Profe Millo**
_"No hagas 'new' de todo. Delega la creación y desacopla tu código."_
