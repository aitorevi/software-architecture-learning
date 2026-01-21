# Quickstart - Controller-Service Example

## 1. Instalar y ejecutar

```bash
cd controller-service-example
npm install
npm run dev
```

Deberías ver:

```
╔═══════════════════════════════════════════════════════════════╗
║  🚀 Servidor corriendo en http://localhost:3000               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Endpoints disponibles:                                       ║
║                                                               ║
║  POST   /tasks              → Crear tarea                     ║
║  GET    /tasks              → Listar todas                    ║
║  GET    /tasks/:id          → Obtener por ID                  ║
║  POST   /tasks/:id/complete → Completar tarea                 ║
║  DELETE /tasks/:id          → Eliminar tarea                  ║
...
```

## 2. Probar la API

Abre otra terminal y ejecuta:

```bash
# Crear una tarea
curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Mi primera tarea"}'

# Verás algo como:
# {"id":"abc123...","title":"Mi primera tarea","completed":false,"createdAt":"..."}

# Listar todas las tareas
curl http://localhost:3000/tasks

# Completar la tarea (usa el ID que obtuviste)
curl -X POST http://localhost:3000/tasks/{id}/complete

# Eliminar la tarea
curl -X DELETE http://localhost:3000/tasks/{id}
```

## 3. Ejecutar tests

```bash
npm test
```

Deberías ver todos los tests pasando.

## 4. Leer el código

Sigue este orden:

1. `src/domain/Task.ts` - La entidad
2. `src/domain/TaskRepository.ts` - El puerto
3. `src/infrastructure/persistence/InMemoryTaskRepository.ts` - Adaptador de salida
4. `src/application/TaskService.ts` - **EL SERVICE** (lo nuevo)
5. `src/infrastructure/http/TaskController.ts` - **EL CONTROLLER** (lo nuevo)
6. `src/infrastructure/http/server.ts` - Express config
7. `src/infrastructure/index.ts` - Composición

## 5. Experimentar

Ideas para practicar:

1. **Añadir un endpoint nuevo:** `PATCH /tasks/:id` para cambiar el título
2. **Añadir validaciones:** que el título tenga mínimo 3 caracteres
3. **Cambiar el repositorio:** guardar en un archivo JSON en vez de memoria

¡A darle chicha!
