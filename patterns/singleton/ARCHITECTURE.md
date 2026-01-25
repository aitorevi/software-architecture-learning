# Singleton Pattern - Decisiones de Arquitectura

Este documento explica las decisiones arquitectónicas tomadas en la implementación de este proyecto pedagógico.

---

## 🏗️ Arquitectura Limpia

### ¿Por qué usar Clean Architecture para un patrón de diseño?

Aunque el Singleton es un patrón simple, usamos arquitectura limpia por:

1. **Consistencia con el repositorio** - Todos los ejemplos siguen el mismo estilo
2. **Demostrar integración** - Cómo se usa Singleton en una arquitectura real
3. **Separación de responsabilidades** - Logger vs LogEntry vs LogDTO
4. **Testabilidad** - Casos de uso testeables independientemente

### Capas Implementadas

```
┌─────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE (Adaptadores)                           │
│  - HTTP (Express API)                                   │
│  - Singleton (Logger, DB, Config)  ← Aquí está el      │
│                                       patrón            │
└─────────────────────────────────────────────────────────┘
                        ↓ usa
┌─────────────────────────────────────────────────────────┐
│  APPLICATION (Casos de Uso)                             │
│  - LogMessageUseCase                                    │
│  - ConnectDatabaseUseCase                               │
│  - GetConfigUseCase                                     │
└─────────────────────────────────────────────────────────┘
                        ↓ usa
┌─────────────────────────────────────────────────────────┐
│  DOMAIN (Núcleo)                                        │
│  - Entities: LogEntry                                   │
│  - Value Objects: ConnectionConfig                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Decisiones de Diseño

### 1. Tres Variantes del Patrón

**Decisión:** Implementar Lazy, Eager y Thread-Safe en lugar de solo una.

**Razón:**
- Cada variante tiene casos de uso específicos
- Pedagógicamente, muestra que no hay "una forma correcta"
- En producción, elegirías la variante apropiada

**Trade-offs:**
- ✅ Más completo y educativo
- ✅ Muestra diferencias sutiles
- ❌ Más código para mantener
- ❌ Puede confundir a principiantes (mitigado con docs)

### 2. Logger como Lazy Singleton

**Decisión:** Implementar Logger con lazy initialization.

**Razón:**
- Patrón más común para Logger
- Demuestra el concepto básico claramente
- Fácil de entender para principiantes
- Puede que no se use en todos los casos

**Alternativas consideradas:**
- Eager: Menos flexible, siempre en memoria
- Thread-Safe Async: Overkill para logging simple

### 3. DatabaseConnection como Eager Singleton

**Decisión:** Implementar DB con eager initialization.

**Razón:**
- Pool de conexiones siempre se usa
- Thread-safe por defecto
- Falla rápido si hay error
- Demuestra la diferencia con Lazy

**Alternativas consideradas:**
- Lazy: No aprovecha thread-safety por defecto
- Thread-Safe Async: Innecesario si no hay I/O en construcción

### 4. ConfigManager como Thread-Safe Async

**Decisión:** Implementar Config con doble-check locking async.

**Razón:**
- Demuestra patrón avanzado
- Simula carga desde archivo/red
- Educativo sobre concurrencia
- Previene race conditions

**Alternativas consideradas:**
- Lazy simple: No es seguro con async
- Eager: No permite carga asíncrona

---

## 🧪 Decisiones de Testing

### 1. Tests del "Antes" (Logger.before.test.ts)

**Decisión:** Incluir tests que demuestran el problema SIN Singleton.

**Razón:**
- Pedagógico: mostrar POR QUÉ necesitamos el patrón
- Contraste: problema vs solución
- Evidencia concreta del desperdicio de recursos

**Implementación:**
```typescript
it('should create different instances every time', () => {
  const logger1 = new LoggerBefore();
  const logger2 = new LoggerBefore();
  
  expect(logger1).not.toBe(logger2);  // ❌ Problema
});
```

### 2. Reset entre Tests

**Decisión:** Proveer método `resetInstance()` para testing.

**Razón:**
- Estado global persiste entre tests
- Sin reset, tests fallan o se afectan entre sí
- Alternativa (inyección de dependencias) es más compleja

**Implementación:**
```typescript
public static resetInstance(): void {
  Logger.instance = null;
}

beforeEach(() => {
  Logger.resetInstance();
});
```

**Trade-offs:**
- ✅ Simple y efectivo
- ✅ No afecta código de producción
- ❌ Método extra solo para testing
- ❌ No elimina el acoplamiento global

### 3. Tests de Concurrencia

**Decisión:** Incluir tests de inicialización concurrente.

**Razón:**
- Demuestra thread-safety
- Valida doble-check locking
- Educativo sobre race conditions

**Implementación:**
```typescript
it('should handle concurrent initializations', async () => {
  const promises = Array(10).fill(null)
    .map(() => ConfigManager.initializeAsync());
  
  const instances = await Promise.all(promises);
  
  instances.forEach(instance => {
    expect(instance).toBe(instances[0]);
  });
});
```

---

## 📐 Decisiones de Estructura

### 1. Logger.before.ts vs Logger.ts

**Decisión:** Archivos separados para versión sin patrón y con patrón.

**Razón:**
- Comparación lado a lado
- No contamina la implementación correcta
- Puede ejecutarse y fallar de forma controlada

**Alternativa descartada:**
- Un solo archivo con comentarios: Menos claro visualmente

### 2. Casos de Uso para Singletons

**Decisión:** Wrappear Singletons en casos de uso de aplicación.

**Razón:**
- Demuestra integración en arquitectura real
- Separa lógica de negocio de infraestructura
- Testeable independientemente (inyectando mocks)

**Ejemplo:**
```typescript
export class LogMessageUseCase {
  constructor() {
    this.logger = Logger.getInstance();  // Singleton
  }
  
  execute(request: LogMessageRequest): void {
    // Lógica de negocio aquí
  }
}
```

**Trade-off:**
- ✅ Separación de responsabilidades
- ✅ Más realista
- ❌ Más código (casos de uso + singletons)

### 3. API REST Completa

**Decisión:** Implementar servidor Express con endpoints REST.

**Razón:**
- Demuestra uso en contexto real
- Permite testing manual con curl
- Demo en vivo en presentaciones
- Muestra que el estado persiste entre requests

**Endpoints diseñados:**
- CRUD para logs (POST, GET, DELETE)
- Gestión de BD (connect, disconnect, status)
- Configuración (get config, check features)
- Demo (singleton-proof)

---

## 🎓 Decisiones Pedagógicas

### 1. Documentación Multinivel

**Decisión:** 5 archivos de documentación con diferentes niveles.

**Estructura:**
- `WELCOME.txt` → 2 min, overview visual
- `QUICKSTART.md` → 5 min, comandos copy-paste
- `README_ES.md` → 60 min, tutorial completo
- `PRESENTATION.md` → Guía para enseñar
- `PROJECT_SUMMARY.md` → Resumen técnico

**Razón:**
- Diferentes niveles de experiencia
- Diferentes objetivos (aprender vs enseñar)
- Diferentes tiempos disponibles

### 2. Script demo.ts Ejecutable

**Decisión:** Demo interactiva en lugar de solo docs.

**Razón:**
- Aprendizaje activo > pasivo
- Demuestra el patrón en acción
- Visualiza diferencias entre variantes
- Ejecutable en workshops

**Contenido:**
```typescript
// 1. Demuestra Lazy Singleton
// 2. Demuestra Eager Singleton  
// 3. Demuestra Thread-Safe Async
// 4. Compara CON vs SIN Singleton
// 5. Resumen visual
```

### 3. Comentarios Extensivos en Código

**Decisión:** Comentarios pedagógicos inline, no solo docs.

**Ejemplo:**
```typescript
/**
 * getInstance - PUNTO DE ACCESO ÚNICO
 * 
 * Este método controla la creación de la instancia.
 * Si ya existe, la devuelve. Si no, la crea primero.
 * 
 * LAZY INITIALIZATION: La instancia no se crea hasta que alguien
 * la pide por primera vez.
 */
public static getInstance(): Logger {
  // LAZY: Crear solo si no existe
  if (!Logger.instance) {
    Logger.instance = new Logger();
  }
  return Logger.instance;
}
```

**Razón:**
- Código auto-documentado
- Entendimiento in-situ
- Explicación del "por qué", no solo el "qué"

---

## 🚫 Decisiones de NO Implementación

### 1. NO Implementar Visitor para SQL

**Decisión:** NO incluir traducción de Singletons a queries SQL.

**Razón:**
- Fuera del scope del patrón Singleton
- Complejidad innecesaria para el objetivo pedagógico
- El Specification Pattern ya cubre esto

**Mencionado en docs como:**
- Concepto avanzado
- Ejemplo conceptual (no funcional)
- Referencia al patrón Specification

### 2. NO Implementar Singleton "Keyed"

**Decisión:** NO incluir Singleton con múltiples instancias por clave.

**Razón:**
- Ya no es realmente un Singleton puro
- Confunde el concepto principal
- Puede implementarse como ejercicio avanzado

**Mencionado en README como:**
```typescript
// Posible, pero no un Singleton puro
class Logger {
  private static instances = new Map<string, Logger>();
  
  static getInstance(key: string): Logger {
    // ...
  }
}
```

### 3. NO Implementar Destructor/Cleanup

**Decisión:** NO incluir método para destruir el Singleton.

**Razón:**
- Va contra el concepto de instancia única
- En Node.js, el GC se encarga
- Solo útil en casos muy específicos
- `resetInstance()` es suficiente para testing

---

## 🔄 Patrones Relacionados

### Factory Method

**Relación:** Singleton puede usar Factory internamente.

**Decisión:** NO mezclar patrones en este ejemplo.

**Razón:**
- Mantener foco en Singleton
- Factory Method tiene su propio ejemplo
- Evitar confusión

### Dependency Injection

**Relación:** Alternativa a Singleton en muchos casos.

**Decisión:** Mencionar DI como alternativa, no implementarla.

**Razón:**
- DI requiere framework (InversifyJS, etc.)
- Aumenta complejidad
- Mejor ejemplo separado

**Incluido en README:**
- Comparación Singleton vs DI
- Cuándo preferir DI
- Snippet de ejemplo

---

## 📊 Métricas del Proyecto

**Código Fuente:**
- ~800 líneas de código (src/)
- ~1200 líneas de tests
- Ratio tests/código: 1.5x

**Documentación:**
- ~3000 líneas de documentación
- 5 archivos de docs
- Múltiples niveles de profundidad

**Cobertura:**
- 48 tests unitarios
- 4 test suites
- 100% de funcionalidad crítica cubierta

**Complejidad:**
- Nivel: Intermedio
- Conceptos: 8 principales
- Tiempo de lectura: 60-90 min
- Tiempo de implementación: 4-6 horas

---

## 🎯 Objetivos Cumplidos

1. ✅ Implementar las 3 variantes principales de Singleton
2. ✅ Demostrar el problema sin el patrón
3. ✅ Casos de uso del mundo real
4. ✅ Tests exhaustivos
5. ✅ Documentación pedagógica multinivel
6. ✅ Integración en arquitectura limpia
7. ✅ API REST funcional
8. ✅ Demo interactiva
9. ✅ Guía de presentación
10. ✅ Advertencias sobre mal uso

---

## 🔮 Posibles Extensiones Futuras

### Para Estudiantes Avanzados:

1. **Singleton con Registro**
   - Múltiples instancias con registry
   - Named singletons

2. **Serialización/Deserialización**
   - Mantener Singleton tras serialización
   - Pattern Object Serialization

3. **Singleton en Worker Threads**
   - Implementación real thread-safe
   - Shared memory

4. **Singleton con Reflection**
   - Prevenir creación via reflection
   - Prototype cloning prevention

5. **Comparación de Performance**
   - Lazy vs Eager benchmarks
   - Memory profiling

---

**Documento creado por:** El Profe Millo  
**Última actualización:** Enero 2026  
**Versión:** 1.0.0
