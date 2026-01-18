# ⚡ QUICKSTART - 5 Minutos

> Para los que tienen prisa, mi niño/a

## 🚀 Instalar y Ejecutar

```bash
npm install
npm run dev     # Ver la demo
npm test        # Ejecutar tests
```

## 📁 Archivos Importantes (en orden de lectura)

1. **src/domain/Task.ts** - La entidad (15 líneas importantes)
2. **src/domain/TaskRepository.ts** - La interface/puerto (20 líneas)
3. **src/infrastructure/InMemoryTaskRepository.ts** - La implementación (40 líneas)
4. **src/application/TaskService.ts** - Los casos de uso (50 líneas)
5. **src/infrastructure/index.ts** - Donde se junta todo (demo)

**Total: ~150 líneas de código (sin comentarios)**

## 🎯 La Idea en 30 Segundos

```typescript
// 1. DOMINIO define QUÉ necesita (interface)
interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
}

// 2. INFRAESTRUCTURA implementa CÓMO (clase concreta)
class InMemoryTaskRepository implements TaskRepository {
  private tasks = new Map<string, Task>();
  async save(task: Task) { this.tasks.set(task.id, task); }
  async findById(id: string) { return this.tasks.get(id) || null; }
}

// 3. APPLICATION usa la interface (no la clase concreta)
class TaskService {
  constructor(private repo: TaskRepository) {} // ← Interface

  async createTask(title: string) {
    const task = new Task(generateId(), title);
    await this.repo.save(task); // No sabe CÓMO se guarda
    return task;
  }
}

// 4. COMPOSICIÓN: decides qué implementación usar
const repo = new InMemoryTaskRepository(); // ← Única línea que cambia
const service = new TaskService(repo);
```

## 💡 Beneficios Clave

✅ Cambias de BD cambiando 1 línea
✅ Tests sin BD real (rápidos)
✅ Dominio protegido de detalles técnicos
✅ Fácil de mantener y extender

## 📚 Para Profundizar

Lee **README_ES.md** para la explicación completa.
Lee **DIAGRAMA.md** para los diagramas visuales.

## 🎓 La Regla de Oro

> **El dominio define QUÉ necesita.**
> **La infraestructura implementa CÓMO.**
> **La aplicación orquesta el dominio.**

Eso es todo. Ahora ve y lee el código.

---

El Profe Millo
