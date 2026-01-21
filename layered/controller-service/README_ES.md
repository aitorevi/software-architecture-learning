# Controller-Service Example

> **Nivel:** Intermedio-básico
> **Prerrequisito:** [repository-pattern-example](../repository-pattern-example)
> **Siguiente paso:** [hexagonal (library-system)](../hexagonal)

## ¿Qué aprenderás?

Este proyecto te enseña **qué es un Controller** y **qué es un Service**, llenando el hueco pedagógico entre:

- `repository-pattern-example` (sin HTTP, demo en consola)
- `hexagonal` (demasiado complejo para empezar)

```
┌─────────────────────────────────────────────────────────────────┐
│  PROGRESIÓN DE APRENDIZAJE                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Nivel 0: repository-pattern-example                            │
│           (Entity + Repository, sin HTTP)                       │
│                        ↓                                        │
│  Nivel 1: controller-service-example  ← ESTÁS AQUÍ              │
│           (+ Controller + Service + HTTP)                       │
│                        ↓                                        │
│  Nivel 2: hexagonal (library-system)                            │
│           (+ Value Objects, DTOs, Eventos)                      │
│                        ↓                                        │
│  Nivel 3+: cqrs, event-driven, bounded-contexts                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Conceptos clave

### ¿Qué es un SERVICE?

El **Service** es el **orquestador** de la aplicación:

- **NO contiene lógica de negocio** (eso va en el DOMINIO)
- **NO sabe de HTTP** (eso es del CONTROLLER)
- **SÍ coordina** las operaciones entre dominio y repositorio

```
Piensa en un director de orquesta:
- No toca ningún instrumento (no tiene lógica de negocio)
- Coordina a los músicos (coordina dominio y repositorio)
- No le importa si el público ve el concierto en vivo o por TV (HTTP)
```

### ¿Qué es un CONTROLLER?

El **Controller** es un **adaptador de entrada**:

- **Traduce** peticiones HTTP → llamadas al Service
- **Sabe de** Request, Response, códigos HTTP
- **Valida** datos de entrada (formato, campos requeridos)
- **Convierte** errores a respuestas HTTP

```
Piensa en un recepcionista:
- Recibe al visitante (petición HTTP)
- Lo dirige al departamento correcto (Service)
- Despide al visitante con una respuesta (HTTP Response)
```

## Flujo de una petición

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO: POST /tasks {"title": "Comprar leche"}                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Cliente                                                        │
│     │                                                           │
│     │ POST /tasks {"title": "Comprar leche"}                    │
│     ▼                                                           │
│  ┌─────────────────┐                                            │
│  │   CONTROLLER    │  ← Extrae "title" del body                 │
│  │  (Adaptador de  │  ← Llama a service.createTask(title)       │
│  │    entrada)     │  ← Convierte Task a JSON                   │
│  └────────┬────────┘  ← Responde con 201 Created                │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │    SERVICE      │  ← Crea ID único                           │
│  │  (Orquestador)  │  ← Crea entidad Task                       │
│  │                 │  ← Guarda en repositorio                   │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │   REPOSITORY    │  ← Almacena en memoria/BD                  │
│  │  (Adaptador de  │                                            │
│  │    salida)      │                                            │
│  └─────────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Estructura del proyecto

```
controller-service-example/
├── src/
│   ├── domain/                              # Conocimiento del negocio
│   │   ├── Task.ts                          # Entidad
│   │   └── TaskRepository.ts                # Puerto (interface)
│   │
│   ├── application/
│   │   └── TaskService.ts                   # El SERVICE (orquestador)
│   │
│   └── infrastructure/
│       ├── persistence/
│       │   └── InMemoryTaskRepository.ts    # Adaptador de SALIDA
│       │
│       ├── http/
│       │   ├── TaskController.ts            # Adaptador de ENTRADA
│       │   └── server.ts                    # Configuración Express
│       │
│       └── index.ts                         # Composición (conecta todo)
│
├── tests/
│   ├── unit/
│   │   ├── TaskService.test.ts
│   │   └── TaskController.test.ts
│   └── integration/
│       └── api.test.ts
│
├── package.json
├── tsconfig.json
└── README_ES.md
```

## Orden de lectura recomendado

Lee los archivos en este orden para seguir el flujo pedagógico:

| Paso | Archivo | Qué aprenderás |
|------|---------|----------------|
| 1 | `src/domain/Task.ts` | La entidad (repaso) |
| 2 | `src/domain/TaskRepository.ts` | El puerto/interface (repaso) |
| 3 | `src/infrastructure/persistence/InMemoryTaskRepository.ts` | Adaptador de SALIDA |
| 4 | `src/application/TaskService.ts` | **EL SERVICE** (orquestador) |
| 5 | `src/infrastructure/http/TaskController.ts` | **EL CONTROLLER** (adaptador HTTP) |
| 6 | `src/infrastructure/http/server.ts` | Configuración Express |
| 7 | `src/infrastructure/index.ts` | Composición (conecta todo) |

## Endpoints disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/tasks` | Crear una tarea |
| GET | `/tasks` | Listar todas las tareas |
| GET | `/tasks/:id` | Obtener una tarea por ID |
| POST | `/tasks/:id/complete` | Marcar tarea como completada |
| DELETE | `/tasks/:id` | Eliminar una tarea |
| GET | `/health` | Health check |

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Compilar para producción
npm run build
npm start
```

## Ejemplos con curl

```bash
# Crear una tarea
curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Aprender arquitectura hexagonal"}'

# Listar todas las tareas
curl http://localhost:3000/tasks

# Obtener una tarea por ID
curl http://localhost:3000/tasks/{id}

# Completar una tarea
curl -X POST http://localhost:3000/tasks/{id}/complete

# Eliminar una tarea
curl -X DELETE http://localhost:3000/tasks/{id}
```

## Resumen de responsabilidades

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Domain** | `Task.ts` | Encapsula datos y comportamiento del negocio |
| **Domain** | `TaskRepository.ts` | Define QUÉ operaciones se necesitan (interface) |
| **Infrastructure** | `InMemoryTaskRepository.ts` | Implementa CÓMO se guardan los datos |
| **Application** | `TaskService.ts` | Orquesta casos de uso, NO sabe de HTTP |
| **Infrastructure** | `TaskController.ts` | Traduce HTTP ↔ Service |
| **Infrastructure** | `server.ts` | Configura Express |
| **Infrastructure** | `index.ts` | Conecta todas las piezas |

## El Profe Millo dice...

> "Si entiendes el flujo HTTP → Controller → Service → Repository,
> ya sabes el 80% de cómo funcionan las aplicaciones web modernas.
> El resto son detalles. ¡Ea, a darle chicha!"
