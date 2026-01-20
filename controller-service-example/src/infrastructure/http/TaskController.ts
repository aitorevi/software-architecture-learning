/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  CONTROLLER-SERVICE - PASO 5 de 7: EL CONTROLLER (ADAPTADOR DE ENTRADA)   ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/application/TaskService.ts                             ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • ¿Qué es un CONTROLLER y para qué sirve?                             ║
 * ║     • ¿Por qué es un ADAPTADOR DE ENTRADA?                                ║
 * ║     • ¿Cómo traduce HTTP → Service → HTTP?                                ║
 * ║     • ¿Cómo manejar errores y convertirlos a códigos HTTP?                ║
 * ║     • ¿Cómo se serializan los VALUE OBJECTS a JSON?                       ║
 * ║                                                                           ║
 * ║  ⭐ ESTE ES EL CONCEPTO NUEVO MÁS IMPORTANTE ⭐                           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { Request, Response, Router } from 'express';
import { TaskService } from '../../application/TaskService.js';
import { Task } from '../../domain/Task.js';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 ¿QUÉ ES UN CONTROLLER?                                                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  El Controller es un ADAPTADOR DE ENTRADA.                                ║
 * ║                                                                           ║
 * ║  Su trabajo es TRADUCIR:                                                  ║
 * ║  • Peticiones HTTP → llamadas al Service                                  ║
 * ║  • Respuestas del Service → respuestas HTTP                               ║
 * ║  • Value Objects → JSON (primitivos)                                      ║
 * ║                                                                           ║
 * ║  El Controller SABE de:                                                   ║
 * ║  • Request, Response                                                      ║
 * ║  • Códigos HTTP (200, 201, 404, 500...)                                   ║
 * ║  • JSON, parámetros de URL, body                                          ║
 * ║                                                                           ║
 * ║  El Controller NO SABE de:                                                ║
 * ║  • Lógica de negocio (eso es del DOMINIO)                                 ║
 * ║  • Cómo se guardan los datos (eso es del REPOSITORY)                      ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "El Controller es como un recepcionista.            ║
 * ║  Recibe al visitante (petición), lo dirige al departamento correcto       ║
 * ║  (Service), y despide al visitante con una respuesta (HTTP Response)."    ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🔄 FLUJO COMPLETO DE UNA PETICIÓN                                        ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║   Cliente                                                                 ║
 * ║      │                                                                    ║
 * ║      │ POST /tasks {"title": "Comprar leche"}                             ║
 * ║      ▼                                                                    ║
 * ║  ┌─────────────────┐                                                      ║
 * ║  │   CONTROLLER    │  ← Extrae "title" del body                           ║
 * ║  │  (Adaptador de  │  ← Llama a service.createTask(title)                 ║
 * ║  │    entrada)     │  ← Convierte Task (con VOs) a JSON (primitivos)      ║
 * ║  └────────┬────────┘  ← Responde con 201 Created                          ║
 * ║           │                                                               ║
 * ║           ▼                                                               ║
 * ║  ┌─────────────────┐                                                      ║
 * ║  │    SERVICE      │  ← Crea TaskId y TaskTitle (Value Objects)           ║
 * ║  │  (Orquestador)  │  ← Crea entidad Task                                 ║
 * ║  │                 │  ← Guarda en repositorio                             ║
 * ║  └────────┬────────┘                                                      ║
 * ║           │                                                               ║
 * ║           ▼                                                               ║
 * ║  ┌─────────────────┐                                                      ║
 * ║  │   REPOSITORY    │  ← Almacena en memoria/BD                            ║
 * ║  │  (Adaptador de  │                                                      ║
 * ║  │    salida)      │                                                      ║
 * ║  └─────────────────┘                                                      ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export class TaskController {
  public router: Router;

  /**
   * INYECCIÓN DE DEPENDENCIAS
   *
   * El Controller recibe el Service, no lo crea.
   * Así podemos testearlo fácilmente con un Service mock.
   */
  constructor(private readonly taskService: TaskService) {
    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Configura las rutas del controller.
   *
   * Cada ruta conecta una URL + método HTTP con un handler.
   */
  private setupRoutes(): void {
    this.router.post('/tasks', this.createTask.bind(this));
    this.router.get('/tasks', this.getAllTasks.bind(this));
    this.router.get('/tasks/:id', this.getTaskById.bind(this));
    this.router.post('/tasks/:id/complete', this.completeTask.bind(this));
    this.router.delete('/tasks/:id', this.deleteTask.bind(this));
  }

  /**
   * HELPER: Convierte una Task (con Value Objects) a JSON plano
   *
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  💡 SERIALIZACIÓN DE VALUE OBJECTS                                        ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  El dominio usa Value Objects (TaskId, TaskTitle).                        ║
   * ║  La API devuelve JSON con primitivos (strings).                           ║
   * ║                                                                           ║
   * ║  El Controller es quien hace esta TRADUCCIÓN.                             ║
   * ║  Es parte de su trabajo como adaptador.                                   ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  private taskToJson(task: Task) {
    return {
      id: task.id.getValue(),           // TaskId → string
      title: task.title.getValue(),     // TaskTitle → string
      completed: task.completed,
      createdAt: task.createdAt,
    };
  }

  /**
   * POST /tasks
   *
   * Crea una nueva tarea.
   *
   * El Controller:
   * 1. Extrae el "title" del body
   * 2. Valida que exista
   * 3. Llama al Service
   * 4. Responde con 201 Created
   */
  private async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { title } = req.body;

      // Validación de entrada (responsabilidad del Controller)
      if (!title || typeof title !== 'string') {
        res.status(400).json({
          error: 'El campo "title" es requerido y debe ser un string',
        });
        return;
      }

      // Llamamos al Service
      const task = await this.taskService.createTask(title);

      // Respondemos con 201 Created, convirtiendo VOs a JSON
      res.status(201).json(this.taskToJson(task));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /tasks
   *
   * Obtiene todas las tareas.
   */
  private async getAllTasks(_req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.taskService.getAllTasks();

      // Convertimos cada Task a JSON
      res.json(tasks.map((task) => this.taskToJson(task)));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /tasks/:id
   *
   * Obtiene una tarea por su ID.
   *
   * Ejemplo de traducir errores de dominio a HTTP:
   * - Si no existe → 404 Not Found
   */
  private async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);

      if (!task) {
        res.status(404).json({ error: `No existe la tarea con id ${id}` });
        return;
      }

      res.json(this.taskToJson(task));
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /tasks/:id/complete
   *
   * Marca una tarea como completada.
   *
   * Ejemplo de manejar errores del Service:
   * - Si la tarea no existe → 404
   * - Si ya está completada → 400 (error de dominio)
   */
  private async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.completeTask(id);

      res.json(this.taskToJson(task));
    } catch (error) {
      // Traducimos errores de dominio a códigos HTTP apropiados
      if (error instanceof Error) {
        if (error.message.includes('No existe')) {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message.includes('ya está completada')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      this.handleError(res, error);
    }
  }

  /**
   * DELETE /tasks/:id
   *
   * Elimina una tarea.
   */
  private async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.taskService.deleteTask(id);

      if (!deleted) {
        res.status(404).json({ error: `No existe la tarea con id ${id}` });
        return;
      }

      // 204 No Content es típico para DELETE exitoso
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * MANEJADOR DE ERRORES GENÉRICO
   *
   * El Controller traduce errores a respuestas HTTP.
   * Si es un error inesperado, devolvemos 500.
   */
  private handleError(res: Response, error: unknown): void {
    console.error('Error:', error);

    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 5                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • El Controller es un ADAPTADOR DE ENTRADA (traduce HTTP → Service)      ║
 * ║  • Valida datos de entrada (formato, campos requeridos)                   ║
 * ║  • Traduce errores del Service/dominio a códigos HTTP                     ║
 * ║  • Serializa Value Objects a JSON (primitivos)                            ║
 * ║  • NO contiene lógica de negocio, solo orquesta peticiones                ║
 * ║                                                                           ║
 * ║  RESPONSABILIDADES DEL CONTROLLER:                                        ║
 * ║  ┌─────────────────────────────────────────────────────────────────┐      ║
 * ║  │  1. Extraer datos de la petición (params, body, query)          │      ║
 * ║  │  2. Validar formato de entrada                                  │      ║
 * ║  │  3. Llamar al Service correspondiente                           │      ║
 * ║  │  4. Convertir Value Objects a JSON                              │      ║
 * ║  │  5. Asignar código HTTP apropiado                               │      ║
 * ║  │  6. Manejar errores y traducirlos a HTTP                        │      ║
 * ║  └─────────────────────────────────────────────────────────────────┘      ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/infrastructure/http/server.ts                          ║
 * ║     (Configuración del servidor Express)                                  ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
