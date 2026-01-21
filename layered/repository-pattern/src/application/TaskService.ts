/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  📚 PATRÓN REPOSITORY - PASO 4 de 6: LOS CASOS DE USO                     ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/infrastructure/InMemoryTaskRepository.ts               ║
 * ║                (el adaptador que implementa el puerto)                    ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Qué es la capa de APLICACIÓN y por qué existe                       ║
 * ║     • Cómo ORQUESTAR el dominio sin saber detalles de BD                  ║
 * ║     • Inyección de dependencias en acción                                 ║
 * ║     • La diferencia entre lógica de negocio y casos de uso                ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ============================================
 * CAPA DE APLICACIÓN: TaskService
 * ============================================
 *
 * Esta clase contiene los CASOS DE USO de nuestra aplicación.
 * Un caso de uso es "algo que un usuario quiere hacer".
 *
 * Ejemplos de casos de uso:
 * - "Crear una tarea nueva"
 * - "Marcar una tarea como completada"
 * - "Ver todas mis tareas"
 *
 * ¿Por qué no ponemos esto directamente en el dominio?
 * Porque el dominio son las REGLAS DE NEGOCIO (la entidad Task),
 * y la aplicación es ORQUESTAR esas reglas para hacer cosas útiles.
 *
 * Mira tú, piensa en una cocina:
 * - El dominio son los ingredientes y técnicas de cocina
 * - La aplicación son las RECETAS (cómo combinar ingredientes)
 *
 * ¡OJO CON ESTO, MI NIÑO/A!
 * Fíjate que esta clase NO SABE si el repositorio usa memoria,
 * MongoDB o palomas mensajeras. Solo sabe que recibe algo que
 * cumple el contrato TaskRepository. ¡ESO ES INVERSIÓN DE DEPENDENCIAS!
 */

import { Task } from '../domain/Task.js';
import { TaskRepository } from '../domain/TaskRepository.js';
import { randomUUID } from 'crypto';

export class TaskService {
  /**
   * INYECCIÓN DE DEPENDENCIAS
   *
   * Recibimos el repositorio por el constructor.
   * No lo creamos aquí dentro (new InMemoryTaskRepository()).
   * ¿Por qué? Porque así podemos:
   * 1. Cambiar la implementación sin tocar este código
   * 2. Pasar un repositorio falso en los tests
   * 3. Respetar el principio de Inversión de Dependencias
   *
   * El Profe Millo dice: "Quien crea las dependencias no es
   * quien las usa. Separa responsabilidades, mi niño/a."
   */
  constructor(private readonly repository: TaskRepository) {}

  /**
   * CASO DE USO: Crear una tarea nueva
   *
   * Pasos:
   * 1. Generamos un ID único (aquí usamos UUID)
   * 2. Creamos la entidad Task con los datos
   * 3. Guardamos en el repositorio
   * 4. Devolvemos la tarea creada
   *
   * Nota: En este ejemplo simple devolvemos la entidad directamente.
   * En proyectos más complejos podrías devolver un DTO (Data Transfer Object)
   * para no exponer la entidad completa. Pero eso es nivel siguiente.
   */
  async createTask(title: string): Promise<Task> {
    // Generamos un ID único
    const id = randomUUID();

    // Creamos la entidad - aquí se valida que el título no esté vacío
    const task = new Task(id, title);

    // Guardamos usando el repositorio
    await this.repository.save(task);

    // Devolvemos la tarea creada
    return task;
  }

  /**
   * CASO DE USO: Completar una tarea
   *
   * Este es un ejemplo perfecto de ORQUESTAR el dominio:
   * 1. Recuperamos la tarea del repositorio
   * 2. Llamamos al método de dominio complete()
   * 3. Guardamos los cambios
   *
   * ¿Ves? No hacemos task.completed = true aquí.
   * Usamos el método del dominio. Así centralizamos la lógica.
   */
  async completeTask(id: string): Promise<void> {
    // Buscamos la tarea
    const task = await this.repository.findById(id);

    // Si no existe, error
    if (!task) {
      throw new Error(`No existe ninguna tarea con id ${id}, anda p'allá`);
    }

    // Usamos el método del dominio
    task.complete();

    // Guardamos los cambios
    await this.repository.save(task);
  }

  /**
   * CASO DE USO: Desmarcar una tarea completada
   */
  async uncompleteTask(id: string): Promise<void> {
    const task = await this.repository.findById(id);

    if (!task) {
      throw new Error(`No existe ninguna tarea con id ${id}`);
    }

    task.uncomplete();
    await this.repository.save(task);
  }

  /**
   * CASO DE USO: Obtener todas las tareas
   *
   * Simple y directo. Delegamos al repositorio.
   */
  async getAllTasks(): Promise<Task[]> {
    return await this.repository.findAll();
  }

  /**
   * CASO DE USO: Obtener una tarea por ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    return await this.repository.findById(id);
  }

  /**
   * CASO DE USO: Obtener solo las tareas pendientes
   *
   * Aquí usamos el método findByStatus del repositorio
   */
  async getPendingTasks(): Promise<Task[]> {
    return await this.repository.findByStatus(false);
  }

  /**
   * CASO DE USO: Obtener solo las tareas completadas
   */
  async getCompletedTasks(): Promise<Task[]> {
    return await this.repository.findByStatus(true);
  }

  /**
   * CASO DE USO: Eliminar una tarea
   */
  async deleteTask(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }
}

/**
 * ============================================
 * RESUMEN DE ESTA CAPA:
 * ============================================
 *
 * La capa de aplicación:
 * - Orquesta el dominio para hacer cosas útiles
 * - NO contiene lógica de negocio (eso va en el dominio)
 * - NO sabe nada de bases de datos, HTTP, etc.
 * - Recibe dependencias por inyección
 * - Es fácil de testear (pasas un repositorio falso)
 *
 * El Profe Millo dice: "Si ves que tu caso de uso tiene
 * mucha lógica de negocio, seguramente deberías moverla
 * al dominio. Los casos de uso orquestan, no deciden."
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 4                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • TaskService ORQUESTA el dominio usando el repositorio                  ║
 * ║  • La aplicación NO sabe qué implementación de repositorio usa            ║
 * ║  • Inyección de dependencias permite flexibilidad y testabilidad          ║
 * ║  • Los casos de uso coordinan, no contienen lógica de negocio             ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE PASO: src/infrastructure/index.ts                           ║
 * ║     Ruta completa: /Users/aitorevi/Dev/hexagonal/                         ║
 * ║                    repository-pattern-example/src/infrastructure/index.ts ║
 * ║                                                                           ║
 * ║     (Verás cómo CONECTAR todas las piezas - la COMPOSICIÓN)               ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
