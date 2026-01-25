# Singleton Pattern - Guía de Presentación 🎤

Esta guía te ayuda a presentar el Singleton Pattern a tu equipo, estudiantes, o en una charla técnica.

## Estructura de la Presentación (45-60 min)

### 1. Introducción (5 min)

**Hook:**
> "¿Cuántos de ustedes han usado `Logger.getInstance()`? 
> Felicidades, han usado un Singleton. 
> ¿Pero saben por qué funciona así y cuándo NO deberían usarlo?"

**Definición:**
El Singleton Pattern garantiza que una clase tenga **UNA Y SOLO UNA instancia** en toda la aplicación, y proporciona un punto de acceso global a ella.

**Origen:**
- Gang of Four (1994) - "Design Patterns: Elements of Reusable Object-Oriented Software"
- Uno de los 23 patrones originales
- Categoría: Creacional

---

### 2. El Problema (10 min)

**Demostración en vivo:**

```typescript
// Mostrar Logger.before.ts
const logger1 = new LoggerBefore('INFO');
const logger2 = new LoggerBefore('DEBUG');

logger1.info('From logger1');
logger2.info('From logger2');

console.log(logger1.getLogs().length);  // 1
console.log(logger2.getLogs().length);  // 1
// ❌ Logs fragmentados
```

**Ejecutar tests:**
```bash
npm test Logger.before.test.ts
```

**Problemas que destacar:**
1. Múltiples instancias independientes
2. Estado no compartido
3. Desperdicio de recursos
4. Configuración inconsistente

**Pregunta al público:**
> "¿Qué problemas ven aquí? ¿Qué pasa si tenemos 50 módulos, cada uno con su logger?"

---

### 3. La Solución: Singleton (15 min)

#### 3.1 Implementación Básica (Lazy)

**Mostrar código:**

```typescript
class Logger {
  private static instance: Logger | null = null;
  
  private constructor() {  // 🔑 Constructor privado
    // ...
  }
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
}
```

**Los 3 elementos clave:**
1. ✅ Constructor privado
2. ✅ Instancia estática privada
3. ✅ Método público estático `getInstance()`

**Demostración:**
```typescript
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();

console.log(logger1 === logger2);  // true ✅
```

**Ejecutar tests:**
```bash
npm test Logger.test.ts
```

#### 3.2 Las Tres Variantes

**Mostrar diagrama:**

```
LAZY              EAGER            THREAD-SAFE
(Logger)          (Database)       (Config)
                                   
instance = null   instance = new   instance = null
                                   + initPromise
                                   
Crea cuando       Crea al cargar   Crea async con
se pide           la clase         doble-check
```

**Comparar código lado a lado:**
- `Logger.ts` (lazy)
- `DatabaseConnection.ts` (eager)
- `ConfigManager.ts` (thread-safe)

---

### 4. Cuándo Usar y Cuándo NO (10 min)

**✅ Buenos casos de uso:**

| Caso | Por qué |
|------|---------|
| Logger | Una sola fuente de logs |
| Configuración | Una sola fuente de verdad |
| Pool de Conexiones | Compartir conexiones eficientemente |
| Cache Manager | Evitar duplicados en memoria |
| Event Bus | Punto central de comunicación |

**❌ Malos casos de uso (anti-patrones):**

```typescript
// ❌ MAL - Estado de negocio
class ShoppingCart {
  private static instance: ShoppingCart;
  private items: Item[] = [];  // ¡NO!
}

// ❌ MAL - Servicio que debería ser inyectable
class UserService {
  private static instance: UserService;
  // Dificulta testing, acoplamiento global
}
```

**Regla de oro:**
> "Si dudas si usar Singleton, probablemente NO deberías usarlo.
> Solo úsalo para recursos compartidos globales."

---

### 5. Testing (5 min)

**Mostrar el problema:**

```typescript
it('test 1', () => {
  const logger = Logger.getInstance();
  logger.info('Test');
  expect(logger.getLogCount()).toBe(1);  // ✅
});

it('test 2', () => {
  const logger = Logger.getInstance();
  // ❌ El estado persiste del test anterior
  expect(logger.getLogCount()).toBe(0);  // FALLA
});
```

**Solución: Reset entre tests:**

```typescript
beforeEach(() => {
  Logger.resetInstance();
});
```

**Demostración:**
```bash
npm test
```

---

### 6. Alternativas Modernas (5 min)

#### 6.1 Módulos ES6

```typescript
// logger.ts
export const logger = new Logger();  // Singleton natural

// moduleA.ts
import { logger } from './logger';  // Misma instancia

// moduleB.ts
import { logger } from './logger';  // Misma instancia
```

**Ventajas:**
- Más simple
- Funciona naturalmente en Node.js
- Fácil de mockear

#### 6.2 Dependency Injection

```typescript
@injectable()
class UserService {
  constructor(
    private logger: Logger  // Inyectado
  ) { }
}
```

**Cuándo usar cada uno:**
- **Singleton clásico:** Logger, Config en apps pequeñas
- **Módulo ES6:** Mayoría de casos en Node.js moderno
- **DI:** Apps grandes, equipos que usan DI

---

### 7. Demo en Vivo (10 min)

**Arrancar el servidor:**
```bash
npm run dev
```

**Demostrar endpoints:**

1. **Probar que es Singleton:**
```bash
curl http://localhost:3000/demo/singleton-proof
```

2. **Crear logs:**
```bash
curl -X POST http://localhost:3000/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "INFO", "message": "Demo log"}'
```

3. **Ver logs acumulados:**
```bash
curl http://localhost:3000/logs
```

4. **Conectar base de datos:**
```bash
curl -X POST http://localhost:3000/database/connect \
  -H "Content-Type: application/json" \
  -d '{
    "host": "localhost",
    "port": 5432,
    "database": "demo",
    "username": "user",
    "password": "pass"
  }'
```

5. **Ver estado:**
```bash
curl http://localhost:3000/database/status
```

**Mostrar:**
- Todos los requests usan la misma instancia
- Los logs se acumulan
- El estado persiste

---

### 8. Conclusiones y Q&A (5 min)

**Puntos clave:**

1. ✅ **Qué es:** Garantiza una única instancia global
2. ✅ **Cuándo usar:** Logger, Config, Pool de Conexiones
3. ❌ **Cuándo NO:** Estado de negocio, servicios normales
4. 🔧 **Cómo testear:** Reset entre tests
5. 💡 **Alternativas:** Módulos ES6, DI

**Mensaje final:**
> "El Singleton es como el tabasco: en su justa medida le da sabor,
> pero si te pasas, lo arruinas todo. Úsalo con criterio."

**Recursos para profundizar:**
- Este repositorio: `patterns/singleton/`
- README_ES.md - Tutorial completo
- Tests - Ejemplos funcionando
- Gang of Four - Libro original

---

## Tips para el Presentador

### Preparación

1. **Ejecuta todo antes:**
   ```bash
   npm install
   npm test
   npm run dev
   ```

2. **Ten abiertas estas pestañas:**
   - Editor con `Logger.before.ts`
   - Editor con `Logger.ts`
   - Terminal con `npm run dev`
   - Terminal con `npm test`
   - Browser/Postman para demos

3. **Prepara snippets de código** para copiar/pegar rápido

### Durante la Presentación

**DO:**
- ✅ Usa ejemplos del mundo real (Logger, Config)
- ✅ Muestra código funcionando (tests, server)
- ✅ Compara con alternativas (módulos ES6)
- ✅ Destaca cuándo NO usarlo
- ✅ Interactúa con el público

**DON'T:**
- ❌ No asumas que todos conocen OOP avanzado
- ❌ No te quedes solo en la teoría
- ❌ No presentes Singleton como "la solución a todo"
- ❌ No ignores las críticas al patrón (aborda el anti-patrón)

### Preguntas Frecuentes a Preparar

**P: ¿Es el Singleton un anti-patrón?**
R: No. Es anti-patrón cuando se abusa, pero es legítimo para recursos compartidos globales.

**P: ¿Por qué no simplemente usar una variable global?**
R: El Singleton controla la creación (lazy/eager), puede tener lógica de inicialización, y es extensible.

**P: ¿Cómo funciona con módulos ES6?**
R: En Node.js, los módulos ya son singleton. Exportar una instancia es suficiente para la mayoría de casos.

**P: ¿Y si necesito dos instancias?**
R: Entonces no necesitas Singleton. Usa DI o simplemente crea instancias normales.

**P: ¿Es thread-safe?**
R: Depende de la variante. Lazy básico no, Eager sí, Thread-Safe Async también.

**P: ¿Cómo se testea?**
R: Con método `resetInstance()` o inyección de dependencias en tests.

---

## Variantes de Presentación

### Versión Corta (15 min)

1. Problema (3 min)
2. Solución Lazy (5 min)
3. Cuándo usar/no usar (4 min)
4. Demo rápida (3 min)

### Versión Completa (60 min)

Añadir a la estructura base:
- Deep dive en las 3 variantes (10 min extra)
- Thread-safety y concurrencia (5 min extra)
- Comparación con patrones relacionados (5 min extra)
- Ejercicio práctico en grupos (15 min)

### Versión Workshop (2-3 horas)

1. Presentación base (45 min)
2. Ejercicio 1: Implementar CacheManager (30 min)
3. Ejercicio 2: Convertir servicio a Singleton (30 min)
4. Ejercicio 3: Escribir tests (30 min)
5. Review y discusión (15 min)

---

## Recursos Adicionales

### Diapositivas Sugeridas

1. Título
2. ¿Qué es Singleton?
3. El Problema (código)
4. La Solución (código)
5. Las 3 Variantes (comparación)
6. Cuándo Usar ✅
7. Cuándo NO Usar ❌
8. Testing
9. Alternativas Modernas
10. Demo
11. Conclusiones
12. Q&A

### Ejercicios para el Público

**Ejercicio 1: Identificar**
> "¿Cuáles de estos deberían ser Singleton?"
> - Logger ✅
> - UserService ❌
> - Database Pool ✅
> - ShoppingCart ❌
> - ConfigManager ✅

**Ejercicio 2: Implementar**
> "Implementa un CacheManager como Singleton"

**Ejercicio 3: Refactorizar**
> "Este código usa múltiples instancias. Conviértelo a Singleton."

---

¡Buena suerte con tu presentación, mi niño!

Recuerda: el objetivo no es que todos salgan usando Singleton en todo,
sino que sepan CUÁNDO usarlo y CUÁNDO NO.

-- El Profe Millo
