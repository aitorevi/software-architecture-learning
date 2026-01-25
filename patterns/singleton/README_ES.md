# Singleton Pattern - Una Única Instancia Global 🎯

Bienvenido, mi niño. Este proyecto te va a enseñar el **Singleton Pattern**, uno de los patrones de diseño más famosos (y controvertidos) del mundo del desarrollo. Es simple de entender pero fácil de abusar, así que vamos a aprender cuándo usarlo y cuándo NO.

## ¿Qué vas a aprender?

El Singleton Pattern garantiza que una clase tenga **UNA Y SOLO UNA instancia** en toda la aplicación, y proporciona un punto de acceso global a ella.

Imagínate que tienes un Logger. Si cada módulo de tu aplicación crea su propio logger, acabas con:
- 10 archivos de log diferentes
- 10 buffers en memoria
- Logs fragmentados y desordenados
- Configuración inconsistente entre loggers

Con Singleton, **todos usan el mismo logger**, el mismo archivo, la misma configuración.

### Conceptos clave que dominarás

1. **Singleton Pattern** - Garantizar una única instancia
2. **Lazy Initialization** - Crear la instancia cuando se necesita
3. **Eager Initialization** - Crear la instancia al cargar la clase
4. **Thread-Safety** - Evitar múltiples instancias en código concurrente
5. **Cuándo usar y cuándo NO** - La parte más importante
6. **Testing de Singletons** - Cómo testear algo global
7. **Alternativas modernas** - DI, módulos ES6, etc.

## El Problema

### Sin Singleton Pattern ❌

Mira tú, esto es lo que NO queremos:

```typescript
// ModuloA.ts
const logger = new Logger('INFO');
logger.info('Usuario se loguea');

// ModuloB.ts
const logger = new Logger('DEBUG');  // ❌ OTRA instancia
logger.debug('Procesando pago');

// ModuloC.ts
const logger = new Logger('ERROR');  // ❌ OTRA instancia
logger.error('Fallo en conexión');
```

**Problemas:**

1. **Múltiples instancias independientes**
   - Cada módulo tiene su propio logger
   - Estado no compartido
   - Logs fragmentados

2. **Desperdicio de recursos**
   - 3 arrays de logs en memoria
   - 3 archivos abiertos (en un logger real)
   - 3 buffers de escritura

3. **Configuración inconsistente**
   - Un logger en INFO, otro en DEBUG, otro en ERROR
   - Difícil de controlar globalmente
   - Comportamiento impredecible

4. **Imposible tener visión global**
   - No puedes ver todos los logs en un solo lugar
   - Debugging complicado
   - Análisis de logs imposible

### Con Singleton Pattern ✅

Ahora mira esto, mi niño:

```typescript
// ModuloA.ts
const logger = Logger.getInstance();
logger.info('Usuario se loguea');

// ModuloB.ts
const logger = Logger.getInstance();  // ✅ MISMA instancia
logger.debug('Procesando pago');

// ModuloC.ts
const logger = Logger.getInstance();  // ✅ MISMA instancia
logger.error('Fallo en conexión');

// Todos usan el MISMO logger
// Todos ven los MISMOS logs
// Una SOLA configuración
```

**Ventajas:**

- Una única instancia en toda la aplicación
- Estado compartido entre todos los módulos
- Configuración centralizada y consistente
- Visión global de todos los logs
- Ahorro de recursos (memoria, archivos, etc.)
- Fácil cambiar configuración globalmente

## Arquitectura - Las Tres Variantes

El Singleton Pattern tiene tres variantes principales, cada una para casos de uso diferentes:

```
┌─────────────────────────────────────────────────────────────┐
│  VARIANTE 1: LAZY INITIALIZATION (Logger)                  │
│                                                             │
│  class Logger {                                             │
│    private static instance: Logger | null = null;          │
│                                                             │
│    private constructor() { }  // Constructor privado       │
│                                                             │
│    static getInstance(): Logger {                          │
│      if (!Logger.instance) {                               │
│        Logger.instance = new Logger();  // Crear lazy      │
│      }                                                      │
│      return Logger.instance;                               │
│    }                                                        │
│  }                                                          │
│                                                             │
│  ✅ Se crea cuando se necesita                             │
│  ✅ Ahorra memoria si no se usa                            │
│  ⚠️  No thread-safe por defecto                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  VARIANTE 2: EAGER INITIALIZATION (DatabaseConnection)     │
│                                                             │
│  class DatabaseConnection {                                 │
│    private static instance =                                │
│      new DatabaseConnection();  // Ya creada               │
│                                                             │
│    private constructor() { }                                │
│                                                             │
│    static getInstance(): DatabaseConnection {              │
│      return DatabaseConnection.instance;                   │
│    }                                                        │
│  }                                                          │
│                                                             │
│  ✅ Se crea al cargar la clase                             │
│  ✅ Thread-safe por defecto                                │
│  ⚠️  Siempre en memoria (aunque no se use)                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  VARIANTE 3: THREAD-SAFE ASYNC (ConfigManager)             │
│                                                             │
│  class ConfigManager {                                      │
│    private static instance: ConfigManager | null = null;   │
│    private static initPromise: Promise | null = null;      │
│                                                             │
│    private constructor() { }                                │
│                                                             │
│    static async initializeAsync(): Promise<ConfigManager> {│
│      if (ConfigManager.instance) return instance;          │
│      if (ConfigManager.initPromise) return initPromise;    │
│                                                             │
│      ConfigManager.initPromise = (async () => {            │
│        // Doble-check locking                              │
│        if (ConfigManager.instance) return instance;        │
│        const instance = new ConfigManager();               │
│        await instance.loadConfig();                        │
│        ConfigManager.instance = instance;                  │
│        return instance;                                    │
│      })();                                                  │
│                                                             │
│      return ConfigManager.initPromise;                     │
│    }                                                        │
│  }                                                          │
│                                                             │
│  ✅ Seguro en código asíncrono                             │
│  ✅ Evita race conditions                                  │
│  ✅ Inicialización costosa (I/O, red)                      │
│  ⚠️  Más complejo de implementar                          │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de Carpetas

```
src/
├── domain/                              # 🎯 EL NÚCLEO
│   ├── entities/
│   │   └── LogEntry.ts                  # Entrada de log
│   │
│   └── value-objects/
│       └── ConnectionConfig.ts          # Config de conexión
│
├── application/                         # Casos de Uso
│   ├── use-cases/
│   │   ├── LogMessageUseCase.ts         # Loguear mensaje
│   │   ├── ConnectDatabaseUseCase.ts    # Conectar BD
│   │   └── GetConfigUseCase.ts          # Obtener config
│   │
│   └── dtos/
│       └── LogDTO.ts                    # DTO de logs
│
└── infrastructure/                      # Adaptadores
    ├── singleton/
    │   ├── Logger.before.ts             # ❌ SIN singleton (problema)
    │   ├── Logger.ts                    # ✅ Lazy Singleton
    │   ├── DatabaseConnection.ts        # ✅ Eager Singleton
    │   └── ConfigManager.ts             # ✅ Thread-Safe Singleton
    │
    └── http/
        └── index.ts                     # Express server
```

## El Patrón en Detalle

### 1. Lazy Initialization (Logger)

La instancia se crea **cuando se pide por primera vez**, no antes.

```typescript
export class Logger {
  // La instancia es null al principio
  private static instance: Logger | null = null;

  // Constructor PRIVADO - clave del patrón
  private constructor(logLevel: LogLevel = 'INFO') {
    this.logLevel = logLevel;
  }

  // Punto de acceso único
  public static getInstance(logLevel?: LogLevel): Logger {
    // LAZY: Crear solo si no existe
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel ?? 'INFO');
    }
    return Logger.instance;
  }

  // Métodos del logger
  info(message: string): void {
    // ... logging logic
  }
}
```

**Uso:**

```typescript
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();

// logger1 === logger2  ✅ Misma instancia
```

**Cuándo usar Lazy:**

- ✅ La inicialización es rápida
- ✅ Puede que no se use en todos los casos
- ✅ Quieres control sobre cuándo se crea
- ❌ Necesitas thread-safety garantizado

### 2. Eager Initialization (DatabaseConnection)

La instancia se crea **inmediatamente** al cargar la clase.

```typescript
export class DatabaseConnection {
  // Se crea YA, no espera a getInstance()
  private static instance: DatabaseConnection = new DatabaseConnection();

  private constructor() {
    // Constructor privado
  }

  public static getInstance(): DatabaseConnection {
    // Ya está creada, solo devuélvela
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    // ... connection logic
  }
}
```

**Cuándo usar Eager:**

- ✅ Siempre se va a usar
- ✅ La inicialización es rápida
- ✅ Quieres que falle rápido si hay error
- ✅ Thread-safe por defecto
- ❌ La inicialización es costosa
- ❌ Puede que no se use

### 3. Thread-Safe Async (ConfigManager)

Para inicializaciones **asíncronas** y **costosas**, con protección contra race conditions.

```typescript
export class ConfigManager {
  private static instance: ConfigManager | null = null;
  private static initializationPromise: Promise<ConfigManager> | null = null;

  private constructor() { }

  public static async initializeAsync(): Promise<ConfigManager> {
    // PRIMER CHECK: ¿Ya existe?
    if (ConfigManager.instance) {
      return ConfigManager.instance;
    }

    // SEGUNDO CHECK: ¿Ya se está inicializando?
    if (ConfigManager.initializationPromise) {
      return ConfigManager.initializationPromise;
    }

    // Crear promesa de inicialización (actúa como "lock")
    ConfigManager.initializationPromise = (async () => {
      // TERCER CHECK: Por si acaso otra llamada creó la instancia
      if (ConfigManager.instance) {
        return ConfigManager.instance;
      }

      const instance = new ConfigManager();
      await instance.loadConfig();  // Operación async costosa

      ConfigManager.instance = instance;
      return instance;
    })();

    try {
      return await ConfigManager.initializationPromise;
    } finally {
      // Limpiar la promesa
      ConfigManager.initializationPromise = null;
    }
  }
}
```

**Patrón Doble-Check Locking:**

1. Check rápido: ¿Ya existe? → Devolver
2. Check de lock: ¿Ya se está creando? → Esperar
3. Crear nueva inicialización
4. Check dentro del lock: ¿Alguien más la creó? → Usar esa
5. Crear y devolver

**Cuándo usar Thread-Safe Async:**

- ✅ Inicialización asíncrona (I/O, red, disco)
- ✅ Inicialización costosa (tiempo, CPU)
- ✅ Necesitas evitar race conditions
- ✅ Worker Threads o código muy concurrente
- ❌ Inicialización síncrona simple

## Cuándo Usar Singleton

### ✅ Buenos Casos de Uso

**1. Logger / Sistema de Logs**
```typescript
const logger = Logger.getInstance();
logger.info('Usuario autenticado');
```
- Un solo archivo de log
- Configuración centralizada
- Visión global de eventos

**2. Configuración de Aplicación**
```typescript
const config = ConfigManager.getInstance();
const apiKey = config.get('apiKey');
```
- Una sola fuente de verdad
- Misma config en toda la app
- Fácil de cambiar globalmente

**3. Pool de Conexiones a BD**
```typescript
const db = DatabaseConnection.getInstance();
await db.query('SELECT * FROM users');
```
- Compartir conexiones es eficiente
- Evita abrir/cerrar constantemente
- Control de límites de conexiones

**4. Cache Manager**
```typescript
const cache = CacheManager.getInstance();
cache.set('user:123', userData);
```
- Una sola cache compartida
- Evita duplicados
- Ahorro de memoria

**5. Event Bus / Message Broker**
```typescript
const eventBus = EventBus.getInstance();
eventBus.emit('user.created', { userId: 123 });
```
- Punto central de comunicación
- Todos publican/suscriben al mismo bus

### ❌ Malos Casos de Uso (Anti-patrones)

**1. Estado de Negocio**
```typescript
// ❌ MAL
class CartManager {
  private static instance: CartManager;
  private cart: CartItem[] = [];  // Estado de negocio
}

// ✅ BIEN - Usa Dependency Injection
class Cart {
  constructor(private items: CartItem[]) { }
}
```

**2. Servicios que deberían ser inyectables**
```typescript
// ❌ MAL
class UserService {
  private static instance: UserService;
  
  getUser(id: string): User {
    // Difícil de testear
    // Acoplamiento global
  }
}

// ✅ BIEN
class UserService {
  constructor(private userRepo: UserRepository) { }
}
// Inyectado donde se necesite
```

**3. Datos Mutables Compartidos**
```typescript
// ❌ MAL - Variable global disfrazada
class StateManager {
  private static instance: StateManager;
  public data: any = {};  // ¡Desastre!
}

// ✅ BIEN - State management apropiado (Redux, etc.)
```

## Testing de Singletons

Testear Singletons es tramposo porque el estado persiste entre tests. Aquí te enseño cómo hacerlo bien.

### Problema: Estado Persistente

```typescript
// test1.ts
it('should log messages', () => {
  const logger = Logger.getInstance();
  logger.info('Test message');
  
  expect(logger.getLogCount()).toBe(1);  // ✅ Pasa
});

// test2.ts
it('should start with empty logs', () => {
  const logger = Logger.getInstance();
  
  // ❌ FALLA - El logger sigue teniendo el log del test anterior
  expect(logger.getLogCount()).toBe(0);
});
```

### Solución 1: Método Reset

```typescript
export class Logger {
  // ...

  public static resetInstance(): void {
    Logger.instance = null;
  }
}

// En tests
beforeEach(() => {
  Logger.resetInstance();
});
```

### Solución 2: Limpiar Estado

```typescript
beforeEach(() => {
  const logger = Logger.getInstance();
  logger.clearLogs();
});
```

### Solución 3: Inyección de Dependencias en Tests

```typescript
// En lugar de usar el singleton directamente
class UserService {
  constructor(private logger: Logger = Logger.getInstance()) { }
}

// En tests, inyecta un mock
const mockLogger = { info: vi.fn(), error: vi.fn() };
const service = new UserService(mockLogger);
```

## Ventajas y Desventajas

### ✅ Ventajas

1. **Control estricto** sobre la instancia única
2. **Ahorro de recursos** (memoria, handles, etc.)
3. **Acceso global** controlado
4. **Estado centralizado** para recursos compartidos
5. **Lazy initialization** posible (ahorro si no se usa)
6. **Thread-safety** posible (en variante async)

### ⚠️ Desventajas

1. **Acoplamiento global** - Todo el código depende de esa instancia
2. **Difícil de testear** - Estado global que persiste entre tests
3. **Viola SRP** - La clase controla su creación Y su funcionalidad
4. **Oculta dependencias** - No se ven en constructores
5. **Dificulta paralelismo** - Un solo punto de acceso
6. **Abuso frecuente** - Se usa donde no debería

## Alternativas Modernas

### 1. Módulos ES6 (TypeScript/JavaScript)

En Node.js, los módulos ya son singleton por naturaleza:

```typescript
// logger.ts
class Logger {
  // Constructor normal, NO privado
  constructor() { }

  info(message: string): void {
    console.log(message);
  }
}

// Exportar UNA instancia
export const logger = new Logger();
```

```typescript
// moduleA.ts
import { logger } from './logger';
logger.info('From module A');

// moduleB.ts
import { logger } from './logger';
logger.info('From module B');

// ✅ Ambos usan la misma instancia
// Node.js cachea los módulos
```

**Ventajas:**
- Más simple (no necesitas getInstance())
- Funciona naturalmente en Node.js
- Fácil de testear (puedes mockear el módulo)

**Cuándo usar:**
- Aplicaciones Node.js modernas
- No necesitas lazy initialization
- No necesitas control sobre la creación

### 2. Dependency Injection

Usa un framework DI (InversifyJS, tsyringe, etc.):

```typescript
// logger.ts
@injectable()
export class Logger {
  constructor() { }
}

// container.ts
container.bind(Logger).toSelf().inSingletonScope();

// userService.ts
@injectable()
export class UserService {
  constructor(
    private logger: Logger  // ✅ Se inyecta automáticamente
  ) { }
}
```

**Ventajas:**
- Desacopla el código
- Fácil de testear (inyectas mocks)
- Declarativo y explícito
- Control fino sobre el scope

**Cuándo usar:**
- Aplicaciones grandes
- Equipos que usan DI
- Necesitas testability máxima

### 3. React Context (frontend)

```typescript
const ConfigContext = React.createContext(null);

function App() {
  const config = useMemo(() => loadConfig(), []);
  
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

// Uso
const config = useContext(ConfigContext);
```

## Comparación: Singleton vs Alternativas

| Aspecto | Singleton | Módulo ES6 | DI Framework |
|---------|-----------|------------|--------------|
| Simplicidad | Media | Alta | Baja |
| Testability | Baja | Media | Alta |
| Lazy Init | Sí | No | Sí |
| Acoplamiento | Alto | Medio | Bajo |
| Explícito | No | Sí | Sí |
| TypeScript | Sí | Sí | Sí |
| Curva aprendizaje | Baja | Muy baja | Alta |

## Preguntas Frecuentes

### ¿Es el Singleton un anti-patrón?

No. Es un patrón legítimo, pero **se abusa de él**. Es anti-patrón cuando:
- Lo usas como variable global disfrazada
- Ocultas dependencias
- Lo usas para estado de negocio
- Dificulta el testing

Pero es perfecto para Logger, Config, Pool de Conexiones, etc.

### ¿Por qué el constructor es privado?

Para que nadie pueda hacer `new Logger()`. Así garantizas que solo hay una instancia, creada por `getInstance()`.

### ¿Cómo funciona en JavaScript si no hay modificadores de acceso?

En JavaScript puro (sin TypeScript), puedes usar closures:

```javascript
const Logger = (() => {
  let instance;
  
  function Logger() {
    if (instance) throw new Error('Use getInstance()');
    // ...
  }
  
  return {
    getInstance() {
      if (!instance) instance = new Logger();
      return instance;
    }
  };
})();
```

### ¿Es thread-safe el Singleton en Node.js?

Node.js es single-threaded (event loop), así que la variante lazy básica es "segura". PERO:
- Con Worker Threads sí hay problemas
- Con código asíncrono puedes tener race conditions
- La variante Thread-Safe Async soluciona esto

### ¿Puedo tener múltiples Singletons del mismo tipo?

Sí, puedes tener Singletons con "llave":

```typescript
class Logger {
  private static instances = new Map<string, Logger>();
  
  static getInstance(key: string): Logger {
    if (!Logger.instances.has(key)) {
      Logger.instances.set(key, new Logger(key));
    }
    return Logger.instances.get(key)!;
  }
}

const apiLogger = Logger.getInstance('api');
const dbLogger = Logger.getInstance('db');
```

Pero esto ya no es realmente un Singleton puro.

## Resumen - Cuándo Usar Qué

### Usa Singleton Lazy cuando:
- Logger simple
- Config que puede no usarse
- Inicialización rápida
- No te importa thread-safety avanzado

### Usa Singleton Eager cuando:
- Pool de conexiones
- Siempre se va a usar
- Quieres que falle rápido
- Necesitas thread-safety por defecto

### Usa Singleton Thread-Safe cuando:
- Config con carga async (archivos, red)
- Worker Threads
- Inicialización costosa
- Necesitas evitar race conditions

### NO uses Singleton cuando:
- Estado de negocio
- Servicios normales (usa DI)
- Lo puedes hacer con módulos ES6
- Dificulta el testing
- Solo quieres "compartir estado" (hay mejores formas)

## Conclusión

El Singleton Pattern es como el tabasco, mi niño: en su justa medida le da sabor al código, pero si te pasas, lo arruinas todo.

Úsalo para **recursos globales compartidos** (Logger, Config, Pool de Conexiones), pero NO para todo lo demás. Y siempre pregúntate: "¿No sería mejor usar Dependency Injection o módulos ES6?"

La clave está en entender:
1. **Qué problema resuelve** (garantizar una única instancia)
2. **Cuándo usarlo** (recursos compartidos globales)
3. **Cuándo NO usarlo** (estado de negocio, servicios normales)
4. **Cómo testearlo** (reset entre tests)
5. **Alternativas modernas** (DI, módulos ES6)

Domina esto y ya sabrás más que el 80% de los desarrolladores sobre Singleton.

¡Venga, a darle caña!

---

**Profe Millo**
_"Un Singleton bien usado es elegante. Cien Singletons son un desastre global."_
