# Quickstart - Vertical Slicing Tasks

## 1. Instalar y ejecutar

```bash
cd slicing/vertical-slicing-tasks
npm install
npm run dev
```

Deberías ver:

```
Server running on http://localhost:3000

Available endpoints:
  Projects: POST/GET /api/projects, GET/PUT/DELETE /api/projects/:id
  Tasks:    POST /api/tasks, GET/PUT/DELETE /api/tasks/:id
  Tags:     POST/GET /api/tags, GET/PUT/DELETE /api/tags/:id
```

## 2. Probar la API

Abre otra terminal y ejecuta:

```bash
# Crear un proyecto
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Mi Proyecto", "description": "Un proyecto de prueba"}'

# Crear una etiqueta
curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "Urgente", "color": "#FF0000"}'

# Crear una tarea (usa el ID del proyecto)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJECT_ID",
    "title": "Primera tarea",
    "priority": "HIGH"
  }'

# Iniciar y completar la tarea
curl -X POST http://localhost:3000/api/tasks/TASK_ID/start
curl -X POST http://localhost:3000/api/tasks/TASK_ID/complete
```

## 3. Ejecutar tests

```bash
npm test
```

## 4. Entender la estructura

La clave de Vertical Slicing: **cada feature es una carpeta completa**.

```
src/
├── features/
│   ├── projects/              ← Feature completa
│   │   ├── domain/           # Entidades, VOs
│   │   ├── application/      # Casos de uso
│   │   └── infrastructure/   # Controller, Repo
│   │
│   ├── tasks/                 ← Feature completa
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   │
│   └── tags/                  ← Feature completa
│       ├── domain/
│       ├── application/
│       └── infrastructure/
│
└── shared/
    └── kernel/                ← Solo lo verdaderamente común
```

### Leer el código en este orden

1. `src/features/projects/domain/Project.ts` - Una entidad en su feature
2. `src/features/tasks/domain/Task.ts` - Observa cómo referencia a Projects solo por ID
3. `src/shared/kernel/Entity.ts` - Base class compartida (mínima)
4. `src/features/projects/index.ts` - API pública de la feature

## 5. Concepto clave: Referencias por ID

```typescript
// Cada feature es independiente
// Task NO importa Project, solo guarda su ID

export class Task {
  constructor(
    private projectId: string,  // Solo el ID, no la entidad
    private tagIds: string[]    // Solo IDs
  ) {}
}
```

Esto permite:
- Features independientes
- Fácil extracción a microservicios
- Sin imports cruzados

## 6. Experimentar

Ideas para practicar:

1. **Crear una nueva feature:** `comments/` para comentarios en tareas
2. **Añadir un endpoint cruzado:** `GET /tasks/:id/with-project` que devuelva la tarea con info del proyecto
3. **Implementar eventos:** Cuando se borra un proyecto, borrar sus tareas

## 7. Siguiente paso

Una vez domines este proyecto:

→ **[Event-Driven Orders](../../ddd/event-driven-orders)** - Arquitectura dirigida por eventos

¡A darle caña!
