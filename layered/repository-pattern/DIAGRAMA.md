# 📐 Diagramas Visuales del Patrón Repository

## 🏗️ Arquitectura de 3 Capas

```
┌──────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                            │
│  (Detalles técnicos - Cómo se hace)                          │
│                                                              │
│  ┌────────────────────────┐      ┌──────────────────┐        │
│  │ InMemoryTaskRepository │      │    index.ts      │        │
│  │  (ADAPTADOR)           │      │ (Composición)    │        │
│  │                        │      │                  │        │
│  │ - Map<string, Task>    │      │ - new Repository │        │
│  │ - save()               │      │ - new Service    │        │
│  │ - findById()           │      │ - demo()         │        │
│  │ - findAll()            │      │                  │        │
│  └────────────────────────┘      └──────────────────┘        │
│            ▲                                                 │
│            │ implements                                      │
└────────────┼─────────────────────────────────────────────────┘
             │
┌────────────┼────────────────────────────────────────────────┐
│            │          APPLICATION                           │
│  (Casos de uso - Qué hacemos)                               │
│            │                                                │
│  ┌─────────┴──────────┐                                     │
│  │   TaskService      │                                     │
│  │                    │                                     │
│  │ - repository       │                                     │
│  │ - createTask()     │                                     │
│  │ - completeTask()   │                                     │
│  │ - getAllTasks()    │                                     │
│  │ - getPendingTasks()│                                     │
│  └─────────┬──────────┘                                     │
│            │ depends on (interface)                         │
└────────────┼────────────────────────────────────────────────┘
             │
┌────────────┼───────────────────────────────────────────────┐
│            ▼              DOMAIN                           │
│  (Reglas de negocio - Qué es)                              │
│                                                            │
│  ┌──────────────────┐        ┌────────────────────────┐    │
│  │      Task        │        │   TaskRepository       │    │
│  │   (ENTIDAD)      │        │   (PUERTO/Interface)   │    │
│  │                  │        │                        │    │
│  │ - id             │        │ + save(task)           │    │
│  │ - title          │        │ + findById(id)         │    │
│  │ - completed      │        │ + findAll()            │    │
│  │ - createdAt      │        │ + delete(id)           │    │
│  │                  │        │ + findByStatus(bool)   │    │
│  │ + complete()     │        │                        │    │
│  │ + uncomplete()   │        └────────────────────────┘    │
│  │ + isPending()    │                                      │
│  └──────────────────┘                                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### Crear una Tarea

```
Usuario
   │
   │ "Crear tarea: Aprender Repository"
   ▼
┌──────────────────┐
│  index.ts        │ ← Punto de entrada
│  (Infra)         │
└────────┬─────────┘
         │
         │ taskService.createTask("Aprender Repository")
         ▼
┌──────────────────┐
│  TaskService     │ ← Caso de uso
│  (Application)   │
└────────┬─────────┘
         │
         │ 1. new Task(id, title)
         ▼
┌──────────────────┐
│      Task        │ ← Entidad (valida reglas)
│   (Domain)       │
└────────┬─────────┘
         │
         │ 2. task creada ✅
         ▼
┌──────────────────┐
│  TaskService     │
│  (Application)   │
└────────┬─────────┘
         │
         │ 3. repository.save(task)
         ▼
┌──────────────────┐
│TaskRepository    │ ← Interface (PUERTO)
│   (Domain)       │
└────────┬─────────┘
         │
         │ implementación
         ▼
┌──────────────────┐
│InMemoryTask      │ ← Adaptador (guarda en Map)
│Repository        │
│(Infrastructure)  │
└────────┬─────────┘
         │
         │ 4. Guardado en memoria ✅
         ▼
      Usuario
```

### Completar una Tarea

```
Usuario
   │
   │ "Completar tarea con id X"
   ▼
TaskService.completeTask(id)
   │
   ├─► 1. repository.findById(id)
   │        │
   │        └─► InMemoryTaskRepository
   │                 │
   │                 └─► Devuelve Task o null
   │
   ├─► 2. task.complete() ← Usa método del DOMINIO
   │        │
   │        └─► Task valida (no completar 2 veces)
   │
   └─► 3. repository.save(task)
            │
            └─► InMemoryTaskRepository guarda cambios
```

## 🔌 Inversión de Dependencias Explicada

### SIN Inversión de Dependencias (❌ Mal)

```
┌─────────────────┐
│  TaskService    │
│  (Application)  │
└────────┬────────┘
         │
         │ depende de ⬇️ (clase concreta)
         ▼
┌─────────────────────┐
│InMemoryTaskRepo     │
│(Infrastructure)     │
└─────────────────────┘

Problema:
- Si cambias a MongoDB, rompes TaskService
- No puedes testear sin la implementación concreta
- Acoplamiento alto
```

### CON Inversión de Dependencias (✅ Bien)

```
┌─────────────────┐
│  TaskService    │
│  (Application)  │
└────────┬────────┘
         │
         │ depende de ⬇️ (abstracción)
         ▼
┌─────────────────────┐
│  TaskRepository     │ ← INTERFACE (Puerto)
│  (Domain)           │
└─────────┬───────────┘
          ▲
          │ implementa
          │
┌─────────┴───────────┐
│InMemoryTaskRepo     │
│(Infrastructure)     │
└─────────────────────┘

Ventajas:
- TaskService solo conoce la interface
- Puedes cambiar implementación fácilmente
- Testeable (pasas un mock)
- Bajo acoplamiento
```

## 🧪 Testabilidad

### Código de Producción

```typescript
// Usa implementación real
const repo = new InMemoryTaskRepository();
const service = new TaskService(repo);
```

### Código de Tests

```typescript
// Usa la MISMA implementación (rápida, en memoria)
const repo = new InMemoryTaskRepository();
const service = new TaskService(repo);

// O podrías usar un mock:
const mockRepo = {
  save: async () => {},
  findById: async () => new Task("123", "Test"),
  // ...
};
const service = new TaskService(mockRepo);
```

## 📦 Cambiar de Implementación

Solo cambias UNA línea en `index.ts`:

```typescript
// Antes (memoria)
const repository = new InMemoryTaskRepository();

// Después (MongoDB) - TODO LO DEMÁS SIGUE IGUAL
const repository = new MongoTaskRepository(mongoClient);

// O PostgreSQL
const repository = new PostgresTaskRepository(pgPool);

// O archivo JSON
const repository = new FileTaskRepository("./tasks.json");
```

**¡El resto del código NO CAMBIA!** Eso es el poder del patrón Repository.

## 🎯 Resumen Visual

```
Principio: El dominio define QUÉ necesita (interface)
           La infraestructura implementa CÓMO se hace

┌─────────────────────────────────────────┐
│  DOMINIO (el QUÉ)                       │
│  - Entidades (Task)                     │
│  - Interfaces (TaskRepository)          │
│  - Reglas de negocio                    │
│                                         │
│  "Necesito guardar y recuperar tareas"  │
└──────────────┬──────────────────────────┘
               │
               │ define contrato
               ▼
┌──────────────────────────────────────────┐
│  INFRAESTRUCTURA (el CÓMO)               │
│  - Implementaciones concretas            │
│  - Base de datos, APIs, archivos...      │
│                                          │
│  "Así es CÓMO lo guardo (en memoria)"    │
└──────────────────────────────────────────┘
```

---

**El Profe Millo dice:**
_"Si entiendes estos diagramas, entiendes el patrón Repository. Lo demás es practicar, mi niño/a."_
