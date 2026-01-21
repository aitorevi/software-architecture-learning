# Features - Rebanadas Verticales 🍰

Buenas, mi niño. Aquí están las **features** del sistema, cada una es una rebanada vertical completa que incluye dominio, aplicación e infraestructura.

## ¿Qué es una Feature?

Una feature es una **capacidad de negocio completa**. No es una capa técnica, es una funcionalidad que el usuario puede usar.

Ejemplos:
- ✅ **tasks** - Capacidad de gestionar tareas
- ✅ **projects** - Capacidad de gestionar proyectos
- ✅ **tags** - Capacidad de gestionar etiquetas
- ❌ **repositories** - Esto es una capa técnica, no una feature
- ❌ **controllers** - Esto es una capa técnica, no una feature

## Estructura de una Feature

Cada feature sigue esta estructura:

```
feature-name/
├── domain/              # El núcleo de la feature
│   ├── Entity.ts        # Aggregate roots y entidades
│   ├── ValueObject.ts   # Value objects
│   ├── Repository.ts    # Interfaces (puertos)
│   └── index.ts         # Exportaciones del dominio
│
├── application/         # Casos de uso de la feature
│   ├── CreateUseCase.ts
│   ├── UpdateUseCase.ts
│   ├── ListUseCase.ts
│   └── index.ts         # Exportaciones de aplicación
│
├── infrastructure/      # Adaptadores de la feature
│   ├── Controller.ts    # REST endpoints
│   ├── Repository.ts    # Implementación de persistencia
│   └── index.ts         # Exportaciones de infraestructura
│
└── index.ts             # API PÚBLICA de la feature
```

## Features en este Proyecto

### 1. Tasks (Tareas)

**Responsabilidad**: Gestionar tareas dentro de proyectos

**Entidades principales**:
- `Task` - Aggregate Root
- `TaskId` - Value Object (ID)
- `TaskStatus` - Value Object (TODO, IN_PROGRESS, DONE)
- `Priority` - Value Object (LOW, MEDIUM, HIGH)

**Casos de uso principales**:
- CreateTaskUseCase - Crear nueva tarea
- UpdateTaskUseCase - Actualizar tarea
- UpdateTaskStatusUseCase - Cambiar estado
- ManageTaskTagsUseCase - Añadir/quitar etiquetas
- ListTasksUseCase - Listar tareas (por proyecto, por estado, vencidas)

**Referencias a otras features**:
- `projectId: string` - Referencia a Projects
- `tagIds: string[]` - Referencias a Tags

### 2. Projects (Proyectos)

**Responsabilidad**: Gestionar proyectos

**Entidades principales**:
- `Project` - Aggregate Root
- `ProjectId` - Value Object (ID)

**Casos de uso principales**:
- CreateProjectUseCase - Crear proyecto
- UpdateProjectUseCase - Actualizar proyecto
- ListProjectsUseCase - Listar proyectos
- DeleteProjectUseCase - Eliminar proyecto

**Referencias a otras features**:
- Ninguna (Projects no referencia otras features)

### 3. Tags (Etiquetas)

**Responsabilidad**: Gestionar etiquetas para organizar tareas

**Entidades principales**:
- `Tag` - Aggregate Root
- `TagId` - Value Object (ID)
- `Color` - Value Object (color hex)

**Casos de uso principales**:
- CreateTagUseCase - Crear etiqueta
- UpdateTagUseCase - Actualizar etiqueta
- ListTagsUseCase - Listar etiquetas
- DeleteTagUseCase - Eliminar etiqueta

**Referencias a otras features**:
- Ninguna (Tags no referencia otras features)

## Reglas de Comunicación entre Features

### Regla 1: Solo Referencias por ID

Cuando una feature necesita referenciar otra, usa SOLO el ID:

```typescript
// ✅ BUENO - Solo ID
export class Task {
  constructor(
    private projectId: string,
    private tagIds: string[]
  ) {}
}

// ❌ MALO - Importar entidad de otra feature
import { Project } from '../../projects/domain/Project';

export class Task {
  constructor(
    private project: Project  // ¡NO!
  ) {}
}
```

### Regla 2: Imports Solo desde index.ts

Nunca importes directamente de archivos internos de otra feature. Usa siempre el `index.ts`:

```typescript
// ❌ MALO
import { Project } from '../projects/domain/Project';
import { CreateProjectUseCase } from '../projects/application/CreateProjectUseCase';

// ✅ BUENO
import { Project, CreateProjectUseCase } from '../projects';
```

### Regla 3: API Pública Explícita

El `index.ts` de cada feature define qué se puede usar desde fuera:

```typescript
// features/tasks/index.ts
// Solo exportamos lo que queremos exponer

// Domain - público
export * from './domain/Task';
export * from './domain/TaskId';
export * from './domain/TaskStatus';
export * from './domain/Priority';
export * from './domain/TaskRepository';

// Application - público
export * from './application/CreateTaskUseCase';
export * from './application/UpdateTaskUseCase';
// ... más casos de uso

// Infrastructure - NO exportado (privado de la feature)
// NO exponemos TaskController ni InMemoryTaskRepository
// Eso lo maneja el bootstrap
```

**¿Por qué?**
- Control: decides qué exponer
- Refactoring: puedes cambiar internals sin romper otros
- Claridad: la API pública está explícita

### Regla 4: No Conocer Internals

Una feature NO debe conocer los detalles de implementación de otra:

```typescript
// ❌ MALO - Task conoce internals de Project
export class Task {
  canBeAddedTo(project: Project): boolean {
    // Accedes a propiedades internas de Project
    return project.isActive && project.tasks.length < 100;
  }
}

// ✅ BUENO - Task solo conoce su projectId
export class Task {
  constructor(
    private projectId: string  // Solo el ID
  ) {}
}

// La validación se hace en el caso de uso si es necesario
export class CreateTaskUseCase {
  async execute(command: CreateTaskCommand) {
    // Opcionalmente valida el proyecto
    const project = await projectRepository.findById(command.projectId);
    if (!project) throw new ProjectNotFoundError();

    // Crear la task
    const task = Task.create({ projectId: command.projectId, ... });
    await taskRepository.save(task);
  }
}
```

## Añadir una Nueva Feature

Cuando necesites añadir una nueva feature, sigue estos pasos:

### 1. Crea la carpeta con estructura

```bash
mkdir -p features/nueva-feature/{domain,application,infrastructure}
touch features/nueva-feature/domain/index.ts
touch features/nueva-feature/application/index.ts
touch features/nueva-feature/infrastructure/index.ts
touch features/nueva-feature/index.ts
```

### 2. Define el dominio

```typescript
// features/nueva-feature/domain/NuevaFeature.ts
import { Entity } from '@shared/kernel';

export class NuevaFeature extends Entity<NuevaFeatureId> {
  // Tu lógica de dominio
}

// features/nueva-feature/domain/index.ts
export * from './NuevaFeature';
export * from './NuevaFeatureId';
export * from './NuevaFeatureRepository';
```

### 3. Crea los casos de uso

```typescript
// features/nueva-feature/application/CreateNuevaFeatureUseCase.ts
export class CreateNuevaFeatureUseCase {
  async execute(command: CreateCommand): Promise<Response> {
    // Tu lógica
  }
}

// features/nueva-feature/application/index.ts
export * from './CreateNuevaFeatureUseCase';
```

### 4. Implementa los adaptadores

```typescript
// features/nueva-feature/infrastructure/NuevaFeatureController.ts
export class NuevaFeatureController {
  // REST endpoints
}

// features/nueva-feature/infrastructure/InMemoryNuevaFeatureRepository.ts
export class InMemoryNuevaFeatureRepository implements NuevaFeatureRepository {
  // Implementación
}

// features/nueva-feature/infrastructure/index.ts
export * from './NuevaFeatureController';
export * from './InMemoryNuevaFeatureRepository';
```

### 5. Define la API pública

```typescript
// features/nueva-feature/index.ts
export * from './domain';
export * from './application';
// NO exportes infrastructure, eso lo maneja el bootstrap
```

### 6. Registra en el servidor

```typescript
// index.ts (root)
import { NuevaFeatureController } from './features/nueva-feature/infrastructure';

// Registrar el controller
const nuevaFeatureController = new NuevaFeatureController(/* inject use cases */);
app.use('/api/nueva-feature', nuevaFeatureController.router);
```

## Ejemplos de Comunicación entre Features

### Caso 1: Task referencia Project

```typescript
// tasks/domain/Task.ts
export class Task {
  constructor(
    private projectId: string  // Solo el ID
  ) {}

  get projectId(): string {
    return this.projectId;
  }
}

// El frontend hace dos llamadas si necesita ambos
const task = await fetch('/api/tasks/123');
// { id: '123', projectId: 'abc', title: 'Mi tarea' }

const project = await fetch('/api/projects/abc');
// { id: 'abc', name: 'Mi proyecto' }
```

### Caso 2: Task necesita validar que Project existe

```typescript
// Option A: Validación en el caso de uso (acoplamiento)
export class CreateTaskUseCase {
  constructor(
    private taskRepository: TaskRepository,
    private projectRepository: ProjectRepository  // Import de Projects
  ) {}

  async execute(command: CreateTaskCommand) {
    // Validar que el proyecto existe
    const project = await this.projectRepository.findById(command.projectId);
    if (!project) {
      throw new ProjectNotFoundError(command.projectId);
    }

    // Crear la task
    const task = Task.create({ projectId: command.projectId, ... });
    await this.taskRepository.save(task);
  }
}

// Option B: Eventual consistency (preferible)
export class CreateTaskUseCase {
  constructor(
    private taskRepository: TaskRepository
    // NO importa ProjectRepository
  ) {}

  async execute(command: CreateTaskCommand) {
    // Crear la task sin validar el proyecto
    // Si el proyecto no existe, un proceso background lo manejará
    const task = Task.create({ projectId: command.projectId, ... });
    await this.taskRepository.save(task);
  }
}

// Proceso background que limpia tareas huérfanas
export class CleanOrphanTasksJob {
  async execute() {
    const allTasks = await taskRepository.findAll();
    for (const task of allTasks) {
      const project = await projectRepository.findById(task.projectId);
      if (!project) {
        await taskRepository.delete(task.id);
      }
    }
  }
}
```

### Caso 3: Task añade Tags

```typescript
// tasks/domain/Task.ts
export class Task {
  private tagIds: string[] = [];

  addTag(tagId: string): void {
    if (!this.tagIds.includes(tagId)) {
      this.tagIds.push(tagId);
    }
  }

  removeTag(tagId: string): void {
    this.tagIds = this.tagIds.filter(id => id !== tagId);
  }

  get tagIds(): string[] {
    return [...this.tagIds];
  }
}

// tasks/application/ManageTaskTagsUseCase.ts
export class AddTagToTaskUseCase {
  async execute(command: { taskId: string; tagId: string }) {
    const task = await taskRepository.findById(command.taskId);
    if (!task) throw new TaskNotFoundError();

    // Opcionalmente validar que el tag existe
    const tag = await tagRepository.findById(command.tagId);
    if (!tag) throw new TagNotFoundError();

    task.addTag(command.tagId);
    await taskRepository.save(task);
  }
}
```

## Ventajas de esta Organización

1. **Alta cohesión**: Todo lo relacionado está junto
   - Dominio de tasks
   - Casos de uso de tasks
   - Adaptadores de tasks
   - ¡Todo en `/features/tasks`!

2. **Bajo acoplamiento**: Features independientes
   - Tasks no importa entidades de Projects
   - Solo referencias por ID
   - Cada feature puede cambiar sin afectar otras

3. **Fácil navegación**
   - ¿Dónde está la lógica de tasks? → `/features/tasks`
   - ¿Dónde están los endpoints de tasks? → `/features/tasks/infrastructure/TaskController.ts`

4. **Teams autónomos**
   - Team A trabaja en `tasks/`
   - Team B trabaja en `projects/`
   - No se pisan

5. **Preparado para microservicios**
   - Cada feature puede extraerse a un servicio
   - Ya están desacopladas
   - Solo necesitas cambiar HTTP calls en lugar de function calls

## Resumen

- Una feature = una capacidad de negocio completa
- Cada feature tiene domain/ application/ infrastructure/
- Las features se comunican por IDs, no por entidades
- Solo importas desde el index.ts de la feature
- Alta cohesión dentro, bajo acoplamiento entre

Recuerda, mi niño: **las features son autónomas. Piensa en ellas como mini-aplicaciones dentro de tu aplicación**.

¿Te quedó clarito o le damos otra vuelta? 🚀
