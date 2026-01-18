/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  📚 PATRÓN REPOSITORY - PASO 3 de 6: EL ADAPTADOR (IMPLEMENTACIÓN)        ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/domain/TaskRepository.ts (la interface del puerto)     ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Cómo implementar un puerto (interface) con un adaptador (clase)     ║
 * ║     • Por qué este código está en INFRASTRUCTURE                          ║
 * ║     • Cómo usar Map para almacenar datos en memoria                       ║
 * ║     • La belleza de poder cambiar implementaciones sin romper nada        ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ============================================
 * ADAPTADOR: InMemoryTaskRepository
 * ============================================
 *
 * ¡AQUÍ ESTÁ LA MAGIA, MI NIÑO/A!
 *
 * Esta clase IMPLEMENTA la interface TaskRepository que
 * definimos en el dominio. Es un ADAPTADOR.
 *
 * ¿Por qué está en infrastructure/?
 * Porque es un DETALLE DE IMPLEMENTACIÓN. Aquí decidimos
 * CÓMO guardamos los datos (en este caso, en memoria con un Map).
 *
 * Mañana podrías crear:
 * - MongoTaskRepository (guarda en MongoDB)
 * - PostgresTaskRepository (guarda en PostgreSQL)
 * - FileTaskRepository (guarda en archivos JSON)
 *
 * Y NINGUNA otra parte del código necesitaría cambiar.
 * Solo cambiarías QUÉ implementación inyectas en el TaskService.
 *
 * El Profe Millo dice: "Esto es como cambiar las ruedas del coche.
 * El coche (TaskService) sigue siendo el mismo, solo cambias
 * qué ruedas le pones (qué repositorio usas)."
 *
 * ¡ESO ES EL PATRÓN REPOSITORY EN ACCIÓN!
 */

import { Task } from '../domain/Task.js';
import { TaskRepository } from '../domain/TaskRepository.js';

export class InMemoryTaskRepository implements TaskRepository {
  /**
   * Usamos un Map para guardar las tareas en memoria.
   * La clave es el ID de la tarea, el valor es la tarea completa.
   *
   * Map<string, Task> significa:
   * - string: el tipo de las claves (el id)
   * - Task: el tipo de los valores (la tarea)
   *
   * ¿Por qué Map y no un array?
   * Porque buscar por ID en un Map es O(1) (instantáneo),
   * mientras que en un array sería O(n) (lento con muchos datos).
   */
  private tasks: Map<string, Task> = new Map();

  /**
   * IMPLEMENTACIÓN: save()
   *
   * Guardamos la tarea en el Map.
   * Si ya existe (mismo id), la sobrescribimos.
   * Si no existe, la añadimos.
   *
   * Nota: Devolvemos Promise.resolve() porque la interface
   * dice que save() devuelve Promise<void>. Aunque aquí es
   * síncrono, mantenemos el contrato para que sea compatible
   * con implementaciones asíncronas (BD reales).
   */
  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
    // Promise.resolve() convierte un valor en una promesa resuelta
    return Promise.resolve();
  }

  /**
   * IMPLEMENTACIÓN: findById()
   *
   * Buscamos la tarea en el Map por su ID.
   * Map.get() devuelve la tarea si existe, undefined si no.
   * Convertimos undefined a null para cumplir el contrato.
   */
  async findById(id: string): Promise<Task | null> {
    const task = this.tasks.get(id);
    return Promise.resolve(task || null);
  }

  /**
   * IMPLEMENTACIÓN: findAll()
   *
   * Devolvemos todas las tareas como un array.
   * Map.values() da un iterador, así que usamos Array.from()
   * para convertirlo en array.
   */
  async findAll(): Promise<Task[]> {
    return Promise.resolve(Array.from(this.tasks.values()));
  }

  /**
   * IMPLEMENTACIÓN: delete()
   *
   * Eliminamos la tarea del Map.
   * Map.delete() devuelve true si existía y se eliminó,
   * false si no existía.
   */
  async delete(id: string): Promise<boolean> {
    const existed = this.tasks.delete(id);
    return Promise.resolve(existed);
  }

  /**
   * IMPLEMENTACIÓN: findByStatus()
   *
   * Filtramos todas las tareas según su estado.
   * Array.filter() crea un nuevo array solo con las que cumplen la condición.
   */
  async findByStatus(completed: boolean): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    const filtered = allTasks.filter(task => task.completed === completed);
    return Promise.resolve(filtered);
  }

  /**
   * MÉTODO EXTRA (no está en la interface)
   *
   * Este método es específico de esta implementación.
   * Útil para tests o para resetear el estado.
   *
   * Nota del Profe: Los métodos que NO están en la interface
   * solo se pueden usar si trabajas directamente con esta clase.
   * Si usas la interface TaskRepository, no verás este método.
   * Eso está bien, porque es un detalle de implementación.
   */
  clear(): void {
    this.tasks.clear();
  }

  /**
   * Otro método extra: contar cuántas tareas hay
   */
  count(): number {
    return this.tasks.size;
  }
}

/**
 * ============================================
 * VENTAJAS DE USAR UN REPOSITORIO EN MEMORIA:
 * ============================================
 *
 * 1. RAPIDEZ: No necesitas levantar una BD para probar
 * 2. SIMPLICIDAD: Ideal para aprender el patrón
 * 3. TESTS: Perfecto para tests rápidos
 * 4. PROTOTIPADO: Arranca rápido, cambia a BD después
 *
 * ============================================
 * CUÁNDO CAMBIAR A UNA BD REAL:
 * ============================================
 *
 * - Cuando necesites PERSISTENCIA (que sobreviva al reinicio)
 * - Cuando múltiples procesos necesiten acceder a los datos
 * - Cuando tengas MUCHOS datos (millones de tareas)
 * - Cuando necesites consultas complejas (búsquedas, agregaciones)
 *
 * Pero para aprender el patrón, esto está fetén.
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 3                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • InMemoryTaskRepository IMPLEMENTA el puerto TaskRepository             ║
 * ║  • Los adaptadores viven en INFRASTRUCTURE (detalles técnicos)            ║
 * ║  • Puedes cambiar esta implementación sin tocar dominio ni aplicación     ║
 * ║  • Map es perfecto para almacenamiento rápido en memoria                  ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE PASO: src/application/TaskService.ts                        ║
 * ║     Ruta completa: /Users/aitorevi/Dev/hexagonal/                         ║
 * ║                    repository-pattern-example/src/application/            ║
 * ║                    TaskService.ts                                         ║
 * ║                                                                           ║
 * ║     (Aprenderás cómo USAR el repositorio - los CASOS DE USO)              ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
