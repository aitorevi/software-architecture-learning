/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  CONTROLLER-SERVICE - PASO 4 de 7: EL SERVICE (ORQUESTADOR)               ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/infrastructure/persistence/InMemoryTaskRepository.ts   ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • ¿Qué es un SERVICE y para qué sirve?                                ║
 * ║     • ¿Cuál es la diferencia entre Service y Controller?                  ║
 * ║     • ¿Por qué el Service NO sabe de HTTP?                                ║
 * ║     • ¿Dónde se crean los VALUE OBJECTS?                                  ║
 * ║                                                                           ║
 * ║  ⭐ ESTE ES UNO DE LOS CONCEPTOS CLAVE DE ESTE PROYECTO ⭐                ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { Task } from '../domain/Task.js';
import { TaskId } from '../domain/TaskId.js';
import { TaskTitle } from '../domain/TaskTitle.js';
import { TaskRepository } from '../domain/TaskRepository.js';
import { randomUUID } from 'crypto';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 ¿QUÉ ES UN SERVICE?                                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  El Service es el ORQUESTADOR de la aplicación.                           ║
 * ║                                                                           ║
 * ║  • NO contiene lógica de negocio (eso va en el DOMINIO)                   ║
 * ║  • NO sabe de HTTP, JSON ni peticiones (eso es del CONTROLLER)            ║
 * ║  • SÍ coordina las operaciones entre dominio y repositorio                ║
 * ║  • SÍ crea los VALUE OBJECTS a partir de datos primitivos                 ║
 * ║                                                                           ║
 * ║  Piensa en un director de orquesta:                                       ║
 * ║  - No toca ningún instrumento (no tiene lógica de negocio)                ║
 * ║  - Coordina a los músicos (coordina dominio y repositorio)                ║
 * ║  - No le importa si el público ve el concierto en vivo o por TV (HTTP)    ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🆚 SERVICE vs CONTROLLER                                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  CONTROLLER (Adaptador de ENTRADA):                                       ║
 * ║  - Traduce HTTP → llamadas al Service                                     ║
 * ║  - Sabe de Request, Response, códigos HTTP                                ║
 * ║  - Valida datos de entrada (formato, campos requeridos)                   ║
 * ║  - Convierte errores a respuestas HTTP                                    ║
 * ║                                                                           ║
 * ║  SERVICE (Capa de Aplicación):                                            ║
 * ║  - Ejecuta los casos de uso del negocio                                   ║
 * ║  - NO sabe de HTTP ni de ningún protocolo                                 ║
 * ║  - Coordina entidades y repositorios                                      ║
 * ║  - Puede ser llamado desde HTTP, CLI, tests, etc.                         ║
 * ║  - CREA los Value Objects a partir de primitivos                          ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Si mañana quieres una CLI además de la API,        ║
 * ║  la CLI llama al MISMO Service. El Service es REUTILIZABLE."              ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export class TaskService {
  /**
   * INYECCIÓN DE DEPENDENCIAS
   *
   * Recibimos el repositorio por el constructor.
   * No hacemos new InMemoryTaskRepository() aquí.
   *
   * ¿Por qué? Porque así:
   * 1. Podemos cambiar la implementación sin tocar este código
   * 2. Podemos pasar un mock en los tests
   * 3. Seguimos el principio de Inversión de Dependencias
   */
  constructor(private readonly repository: TaskRepository) {}

  /**
   * CASO DE USO: Crear una tarea
   *
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  💡 AQUÍ SE CREAN LOS VALUE OBJECTS                                       ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  El Service recibe PRIMITIVOS (string) y crea VALUE OBJECTS.              ║
   * ║  Esta es la "frontera" donde los datos se validan y encapsulan.           ║
   * ║                                                                           ║
   * ║  Si el título está vacío, TaskTitle.create() lanza excepción.             ║
   * ║  Esto es ESPERADO - estamos en un factory method, no en un getter.        ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   *
   * Flujo:
   * 1. Crear Value Objects (aquí puede fallar la validación)
   * 2. Crear la entidad Task (ya no puede fallar)
   * 3. Guardar en el repositorio
   * 4. Devolver la tarea creada
   */
  async createTask(title: string): Promise<Task> {
    // 1. Creamos los Value Objects - aquí ocurre la validación
    const taskId = TaskId.create(randomUUID());
    const taskTitle = TaskTitle.create(title);

    // 2. Creamos la entidad - esto ya NO puede fallar
    const task = new Task(taskId, taskTitle);

    // 3. Guardamos
    await this.repository.save(task);

    // 4. Devolvemos
    return task;
  }

  /**
   * CASO DE USO: Completar una tarea
   *
   * Ejemplo perfecto de ORQUESTACIÓN:
   * 1. Crear el TaskId a partir del string
   * 2. Recuperar la tarea del repositorio
   * 3. Llamar al método de dominio complete()
   * 4. Guardar los cambios
   */
  async completeTask(id: string): Promise<Task> {
    // Creamos el TaskId para buscar
    const taskId = TaskId.create(id);
    const task = await this.repository.findById(taskId);

    if (!task) {
      throw new Error(`No existe la tarea con id ${id}`);
    }

    task.complete();
    await this.repository.save(task);
    return task;
  }

  /**
   * CASO DE USO: Obtener todas las tareas
   */
  async getAllTasks(): Promise<Task[]> {
    return this.repository.findAll();
  }

  /**
   * CASO DE USO: Obtener una tarea por ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    const taskId = TaskId.create(id);
    return this.repository.findById(taskId);
  }

  /**
   * CASO DE USO: Eliminar una tarea
   */
  async deleteTask(id: string): Promise<boolean> {
    const taskId = TaskId.create(id);
    return this.repository.delete(taskId);
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 4                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • El Service ORQUESTA operaciones, no contiene lógica de negocio         ║
 * ║  • El Service NO sabe de HTTP - es reutilizable desde cualquier entrada   ║
 * ║  • El Service CREA los Value Objects a partir de primitivos               ║
 * ║  • Usa inyección de dependencias para recibir el repositorio              ║
 * ║  • Es la capa intermedia entre Controller y Repository                    ║
 * ║                                                                           ║
 * ║  FLUJO HASTA AHORA:                                                       ║
 * ║  ┌─────────────────────────────────────────────────────────────────┐      ║
 * ║  │  ??? → Service → Repository → (datos)                          │      ║
 * ║  │   ↑                                                             │      ║
 * ║  │   └── ¿Quién llama al Service? ¡EL CONTROLLER!                  │      ║
 * ║  └─────────────────────────────────────────────────────────────────┘      ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/infrastructure/http/TaskController.ts                  ║
 * ║     (El CONTROLLER - el adaptador de entrada HTTP)                        ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
