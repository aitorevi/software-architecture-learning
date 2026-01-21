# Task Manager - Vertical Slicing Architecture 📋

Buenas, mi niño. Bienvenido al mundo del **Vertical Slicing** (Cortes Verticales). Si en el proyecto library-system cortamos el pastel en capas horizontales (dominio, aplicación, infraestructura), aquí lo cortamos en rebanadas verticales, cada una representando una **feature completa**.

Sistema de gestión de tareas que demuestra la arquitectura de **Vertical Slicing** como alternativa a la organización horizontal tradicional por capas.

## ¿Qué es Vertical Slicing?

Vertical Slicing organiza el código por **funcionalidades** en lugar de **capas técnicas**. Cada funcionalidad contiene su implementación completa: dominio, aplicación e infraestructura.

### Comparación

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPAS HORIZONTALES                               │
│                    (estilo library-system)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   src/                                                              │
│   ├── domain/                    ← Todas las entidades juntas       │
│   │   ├── entities/                                                 │
│   │   │   ├── Book.ts                                               │
│   │   │   ├── User.ts                                               │
│   │   │   └── Loan.ts                                               │
│   │   └── repositories/                                             │
│   ├── application/               ← Todos los casos de uso juntos    │
│   │   └── use-cases/                                                │
│   └── infrastructure/            ← Todos los adaptadores juntos     │
│       ├── persistence/                                              │
│       └── controllers/                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    VERTICAL SLICING                                 │
│                    (este proyecto)                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   src/                                                              │
│   ├── features/                                                     │
│   │   ├── projects/              ← Funcionalidad Proyectos completa │
│   │   │   ├── domain/                                               │
│   │   │   ├── application/                                          │
│   │   │   └── infrastructure/                                       │
│   │   ├── tasks/                 ← Funcionalidad Tareas completa    │
│   │   │   ├── domain/                                               │
│   │   │   ├── application/                                          │
│   │   │   └── infrastructure/                                       │
│   │   └── tags/                  ← Funcionalidad Etiquetas completa │
│   │       ├── domain/                                               │
│   │       ├── application/                                          │
│   │       └── infrastructure/                                       │
│   └── shared/                    ← Código compartido mínimo         │
│       └── kernel/                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Beneficios de Vertical Slicing

| Aspecto | Capas Horizontales | Vertical Slicing |
|---------|-------------------|------------------|
| **Entender una funcionalidad** | Navegar múltiples carpetas | Todo en una carpeta |
| **Añadir una funcionalidad** | Tocar múltiples capas | Crear una carpeta |
| **Eliminar una funcionalidad** | Buscar en todo el código | Eliminar una carpeta |
| **Propiedad de equipos** | Código compartido, necesita coordinación | Equipos son dueños de funcionalidades completas |
| **Acoplamiento** | Las capas dependen entre sí | Las funcionalidades son independientes |
| **Escalar el código** | Las carpetas crecen linealmente | Las funcionalidades pueden convertirse en microservicios |

## Cuándo Usar Cada Enfoque

### Usa Capas Horizontales cuando:
- Codebase pequeño a mediano
- Las funcionalidades comparten lógica de dominio significativa
- Un solo equipo trabaja en el proyecto
- Dominio estable que no cambia mucho

### Usa Vertical Slicing cuando:
- Codebase grande con muchas funcionalidades
- Las funcionalidades son relativamente independientes
- Múltiples equipos necesitan propiedad clara
- Las funcionalidades podrían convertirse en servicios separados
- El dominio evoluciona rápidamente

## Estructura del Proyecto

```
vertical-slicing-example/
├── src/
│   ├── features/
│   │   ├── projects/           # Funcionalidad de gestión de proyectos
│   │   │   ├── domain/
│   │   │   │   ├── Project.ts
│   │   │   │   ├── ProjectId.ts
│   │   │   │   └── ProjectRepository.ts
│   │   │   ├── application/
│   │   │   │   ├── CreateProjectUseCase.ts
│   │   │   │   └── ...
│   │   │   └── infrastructure/
│   │   │       ├── InMemoryProjectRepository.ts
│   │   │       └── ProjectController.ts
│   │   │
│   │   ├── tasks/              # Funcionalidad de gestión de tareas
│   │   │   ├── domain/
│   │   │   │   ├── Task.ts
│   │   │   │   ├── TaskStatus.ts
│   │   │   │   └── Priority.ts
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   │
│   │   └── tags/               # Funcionalidad de gestión de etiquetas
│   │       ├── domain/
│   │       ├── application/
│   │       └── infrastructure/
│   │
│   └── shared/
│       └── kernel/             # Código verdaderamente compartido (¡mínimo!)
│           ├── Entity.ts
│           ├── ValueObject.ts
│           └── IdGenerator.ts
│
└── tests/
    └── unit/
        ├── projects/
        ├── tasks/
        └── tags/
```

## Patrones Clave Demostrados

### 1. Módulos por Funcionalidad
Cada funcionalidad expone una API pública a través de su archivo index:

```typescript
// features/projects/index.ts
export { ProjectId } from './domain';
export { CreateProjectUseCase, ProjectResponse } from './application';
export { InMemoryProjectRepository, ProjectController } from './infrastructure';
```

### 2. Referencias Entre Funcionalidades por ID
Las funcionalidades se referencian entre sí por ID, no por entidad:

```typescript
// Task almacena projectId como string, no como entidad Project
interface TaskProps {
  projectId: string;  // Referencia por ID
  tagIds: string[];   // Referencias por ID
}
```

### 3. Shared Kernel Mínimo
Solo el código verdaderamente universal va en el shared kernel:

```typescript
// shared/kernel/Entity.ts - Clase base para todas las entidades
// shared/kernel/ValueObject.ts - Clase base para value objects
// shared/kernel/IdGenerator.ts - Interfaz para generación de IDs
```

### 4. Independencia de Funcionalidades
Cada funcionalidad puede:
- Usar diferentes implementaciones de repositorio
- Tener DTOs específicos de la funcionalidad
- Definir sus propias excepciones
- Ser extraída a un microservicio

## Endpoints de la API

### Proyectos
```
POST   /api/projects          Crear un proyecto
GET    /api/projects          Listar todos los proyectos
GET    /api/projects/:id      Obtener un proyecto
PUT    /api/projects/:id      Actualizar un proyecto
DELETE /api/projects/:id      Eliminar un proyecto
```

### Tareas
```
POST   /api/tasks                    Crear una tarea
GET    /api/tasks/:id                Obtener una tarea
PUT    /api/tasks/:id                Actualizar una tarea
DELETE /api/tasks/:id                Eliminar una tarea
GET    /api/tasks/project/:projectId Listar tareas por proyecto
GET    /api/tasks/status/:status     Listar tareas por estado
GET    /api/tasks/filter/overdue     Listar tareas vencidas
POST   /api/tasks/:id/start          Iniciar una tarea
POST   /api/tasks/:id/complete       Completar una tarea
POST   /api/tasks/:id/reopen         Reabrir una tarea
POST   /api/tasks/:id/tags/:tagId    Añadir etiqueta a tarea
DELETE /api/tasks/:id/tags/:tagId    Quitar etiqueta de tarea
```

### Etiquetas
```
POST   /api/tags          Crear una etiqueta
GET    /api/tags          Listar todas las etiquetas
GET    /api/tags/:id      Obtener una etiqueta
PUT    /api/tags/:id      Actualizar una etiqueta
DELETE /api/tags/:id      Eliminar una etiqueta
```

## Comenzar

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Compilar para producción
npm run build
```

## Ejemplo de Uso

```bash
# Crear un proyecto
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Mi Proyecto", "description": "Un gran proyecto"}'

# Crear una etiqueta
curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "Urgente", "color": "#FF0000"}'

# Crear una tarea en el proyecto
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"projectId": "PROJECT_ID", "title": "Primera Tarea", "priority": "HIGH"}'

# Añadir etiqueta a la tarea
curl -X POST http://localhost:3000/api/tasks/TASK_ID/tags/TAG_ID

# Completar la tarea
curl -X POST http://localhost:3000/api/tasks/TASK_ID/start
curl -X POST http://localhost:3000/api/tasks/TASK_ID/complete
```

## Principios Clave Explicados a Fondo

### ¿Por qué solo IDs y no entidades completas?

Mira tú, esto es súper importante. Cuando una feature necesita referenciar otra, usamos SOLO el ID:

```typescript
// ❌ MALO - Acoplamiento fuerte
import { Project } from '../../projects/domain/Project';

export class Task {
  constructor(
    private project: Project  // Importas toda la entidad
  ) {}
}

// ✅ BUENO - Acoplamiento débil
export class Task {
  constructor(
    private projectId: string  // Solo guardas el ID
  ) {}
}
```

**¿Por qué es mejor así?**
1. Las features permanecen independientes
2. Puedes mover `projects` a otro servicio sin tocar `tasks`
3. No hay imports cruzados (menos enredos)
4. Testing más simple (no necesitas crear proyectos para testear tareas)

### El Shared Kernel - Solo lo Esencial

El `shared/kernel` es como el mojo de las papas arrugadas: le da sabor a todo, pero no ES la comida. Solo pones aquí lo que REALMENTE es común:

```typescript
// ✅ VA en shared/kernel
- Entity<TId> (clase base para todas las entidades)
- ValueObject<T> (clase base para VOs)
- DomainEvent (interface para eventos)
- IdGenerator (interface para generar IDs)

// ❌ NO VA en shared/kernel
- Lógica específica de Tasks
- Helpers que solo usa una feature
- Entidades concretas
```

**Regla de oro**: Si solo una o dos features lo usan, NO va en shared.

### Comunicación entre Features

Cuando una feature necesita hablar con otra, tienes varias opciones. Venga, que las vemos:

#### Opción 1: Solo IDs (Preferida)

```typescript
// Task solo guarda el projectId
export class Task {
  constructor(private projectId: string) {}
}

// El cliente hace dos peticiones si necesita ambos
GET /tasks/123 → { id: '123', projectId: 'abc', title: '...' }
GET /projects/abc → { id: 'abc', name: 'Mi Proyecto' }
```

**Ventajas**:
- Features totalmente independientes
- Fácil de escalar (pueden vivir en servicios separados)

**Desventaja**:
- Dos peticiones HTTP (pero hay soluciones: GraphQL, BFF)

#### Opción 2: DTO Enriquecido

```typescript
// Caso de uso que consulta ambas features
export class GetTaskWithProjectUseCase {
  async execute(taskId: string): Promise<TaskWithProjectDTO> {
    const task = await taskRepository.findById(taskId);
    const project = await projectRepository.findById(task.projectId);

    return {
      id: task.id,
      title: task.title,
      project: {  // Incluido en la respuesta
        id: project.id,
        name: project.name
      }
    };
  }
}
```

**Ventajas**:
- Una sola petición HTTP
- Eficiente para el frontend

**Desventaja**:
- Acoplamiento (pero solo en aplicación, no en dominio)

#### Opción 3: Eventos (Eventual Consistency)

```typescript
// Cuando se borra un proyecto
class Project {
  delete(): void {
    this.addDomainEvent(new ProjectDeletedEvent(this.id));
  }
}

// Tasks escucha y limpia tareas huérfanas
class DeleteOrphanTasksHandler {
  async handle(event: ProjectDeletedEvent) {
    const tasks = await taskRepo.findByProject(event.projectId);
    for (const task of tasks) {
      await taskRepo.delete(task.id);
    }
  }
}
```

**Ventajas**:
- Desacoplamiento total
- Preparado para distributed systems

**Desventaja**:
- Complejidad (asincronía, eventual consistency)

## Errores Comunes al Hacer Vertical Slicing

### 1. Importar entre features directamente

```typescript
// ❌ MAL - Rompes el desacoplamiento
import { Project } from '../../projects/domain/Project';

// ✅ BIEN - Solo IDs
private projectId: string;
```

### 2. Shared Kernel gigante

```typescript
// ❌ MAL - Poner cosas específicas en shared
// shared/helpers/TaskHelpers.ts
export class TaskHelpers {
  static isOverdue(task: Task): boolean { ... }
}

// ✅ BIEN - Métodos en la entidad
// features/tasks/domain/Task.ts
export class Task {
  get isOverdue(): boolean { ... }
}
```

### 3. Features demasiado grandes

```typescript
// ❌ MAL - Feature que hace de todo
features/
└── project-management/  ← Tasks, Projects, Tags, Users, todo junto
    ├── domain/
    └── ...

// ✅ BIEN - Features pequeñas y enfocadas
features/
├── tasks/
├── projects/
├── tags/
└── users/
```

**Regla**: Si una feature tiene más de 10 entidades, probablemente debas dividirla.

### 4. No pensar en boundaries

```typescript
// ❌ MAL - Task conoce internals de Project
export class Task {
  canBeAddedTo(project: Project): boolean {
    return project.status === 'active' && project.tasks.length < 100;
  }
}

// ✅ BIEN - Task solo conoce el ID
export class Task {
  // La validación la hace el caso de uso consultando ambas features
}
```

## Migrando de Capas a Slices

No te rayes, mi niño. No tienes que migrar todo de golpe. Puedes hacerlo gradualmente:

### Paso 1: Identifica Features

Mira tu código actual y agrupa entidades por capacidad de negocio:
- ¿Qué entidades van siempre juntas?
- ¿Qué casos de uso solo trabajan con ciertas entidades?

### Paso 2: Empieza con una Feature Nueva

```
src/
├── features/           ← Nueva feature en slice
│   └── notifications/
│       ├── domain/
│       ├── application/
│       └── infrastructure/
│
└── legacy/             ← Código viejo en capas
    ├── domain/
    ├── application/
    └── infrastructure/
```

### Paso 3: Migra Feature por Feature

Cada sprint, mueve una feature del legacy a features/:
1. Crea la carpeta en features/
2. Mueve las entidades relacionadas
3. Mueve los casos de uso
4. Mueve los controladores
5. Actualiza imports
6. ¡Listo!

### Paso 4: Cuando legacy/ esté vacío, bórralo

Eso está fetén, ¿no?

## Testing en Vertical Slicing

Una de las mayores ventajas: cada feature se testea de forma independiente.

```
tests/
├── unit/
│   ├── tasks/
│   │   ├── Task.test.ts
│   │   └── CreateTaskUseCase.test.ts
│   ├── projects/
│   │   ├── Project.test.ts
│   │   └── CreateProjectUseCase.test.ts
│   └── tags/
│       └── Tag.test.ts
│
└── integration/
    ├── tasks/
    │   └── TaskController.test.ts
    └── projects/
        └── ProjectController.test.ts
```

**Ventajas**:
- Tests organizados por feature
- Si cambias Tasks, solo re-ejecutas tests de Tasks
- Fácil saber qué testear

## Cuándo Vertical Slicing NO es la Respuesta

No te dejes enredar, mi niño. Vertical slicing no siempre es la mejor opción:

❌ **NO uses vertical slicing si**:
- Tu proyecto tiene < 3 features
- Hay MUCHA lógica compartida entre features
- Estás aprendiendo y aún no conoces bien el dominio
- El equipo es muy pequeño (1-2 devs)

✅ **SÍ usa vertical slicing si**:
- Proyecto grande (> 5 features)
- Features relativamente independientes
- Múltiples equipos
- Preparando para microservicios
- Features cambian a diferentes ritmos

## Próximos Pasos

Una vez domines vertical slicing, puedes explorar:

1. **[cqrs-example](../cqrs-example)** - Separar comandos de queries
2. **[event-driven-example](../event-driven-example)** - Comunicación entre features vía eventos
3. **[bounded-contexts-example](../bounded-contexts-example)** - Features que se convierten en bounded contexts

## Resumen Rápido

**Vertical Slicing = Organizar por capacidad de negocio, no por capa técnica**

```
Tradicional:  Cortes horizontales (capas)
Vertical:     Cortes verticales (features)

Tradicional:  domain/ application/ infrastructure/
Vertical:     tasks/ projects/ tags/

Tradicional:  Imports entre capas
Vertical:     Imports solo dentro de feature

Tradicional:  Difícil extraer a microservicio
Vertical:     Cada feature es un microservicio potencial
```

Recuerda, mi niño: **piensa en features, no en capas. Cada feature es una rebanada completa de funcionalidad**.

¿Te quedó clarito o le damos otra vuelta? 🚀

## Proyectos Relacionados

- **[library-system](../hexagonal)**: Enfoque de capas horizontales
- **[cqrs-example](../cqrs-example)**: Patrón CQRS
- **[event-driven-example](../event-driven-example)**: Arquitectura dirigida por eventos
- **[bounded-contexts-example](../bounded-contexts-example)**: Múltiples bounded contexts
