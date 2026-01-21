/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  📚 PATRÓN REPOSITORY - PASO 2 de 6: EL PUERTO (INTERFACE)                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/domain/Task.ts (la entidad de dominio)                 ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Qué es una interface y por qué es un CONTRATO                       ║
 * ║     • Por qué el puerto está en DOMAIN y no en INFRASTRUCTURE             ║
 * ║     • Cómo funciona la INVERSIÓN DE DEPENDENCIAS                          ║
 * ║     • La diferencia entre PUERTO (qué) y ADAPTADOR (cómo)                 ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ============================================
 * PUERTO (Interface): TaskRepository
 * ============================================
 *
 * ¡ATENTOS QUE ESTO ES IMPORTANTE, MI NIÑO/A!
 *
 * Esta es una INTERFACE, no una clase. Es un CONTRATO.
 * Define QUÉ operaciones necesitamos para guardar/recuperar tareas,
 * pero NO dice CÓMO se hacen.
 *
 * ¿Por qué está en domain/?
 * Porque el DOMINIO es el que DEFINE qué necesita.
 * El dominio dice: "Necesito poder guardar tareas y recuperarlas".
 * Pero no le importa si usas MongoDB, PostgreSQL, memoria, ficheros...
 *
 * Esto es lo que llamamos INVERSIÓN DE DEPENDENCIAS:
 * - El dominio NO depende de la infraestructura
 * - La infraestructura depende del dominio (implementa esta interface)
 *
 * Mira tú, esto es como un enchufe:
 * - La interface es el "formato del enchufe" (PUERTO)
 * - La implementación es el "aparato que enchufas" (ADAPTADOR)
 * - Da igual si enchufas una tostadora o una radio,
 *   mientras cumpla el contrato del enchufe.
 *
 * El Profe Millo dice: "Si entiendes esto, has entendido
 * el 80% de la arquitectura hexagonal. No te rayes con más."
 */

import { Task } from './Task.js';

export interface TaskRepository {
  /**
   * Guarda una tarea nueva o actualiza una existente.
   *
   * @param task - La tarea a guardar
   * @returns Una promesa que se resuelve cuando se guardó
   *
   * Nota: Usamos Promise porque en la vida real los repositorios
   * suelen ser asíncronos (van a BD, APIs, etc.)
   */
  save(task: Task): Promise<void>;

  /**
   * Busca una tarea por su ID.
   *
   * @param id - El identificador único de la tarea
   * @returns La tarea si existe, null si no existe
   *
   * Nota del Profe: Algunos prefieren lanzar un error si no existe,
   * otros devolver null. Aquí usamos null porque es más simple
   * para un principiante. En proyectos reales, tú decides.
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Devuelve TODAS las tareas que tenemos.
   *
   * @returns Array con todas las tareas (puede estar vacío)
   *
   * Advertencia del Profe: En producción real, NUNCA hagas un
   * "findAll" sin paginación si tienes muchos datos.
   * Pero para aprender, está fetén así.
   */
  findAll(): Promise<Task[]>;

  /**
   * Elimina una tarea por su ID.
   *
   * @param id - El identificador de la tarea a eliminar
   * @returns true si se eliminó, false si no existía
   */
  delete(id: string): Promise<boolean>;

  /**
   * OPCIONAL: Busca tareas por su estado (completadas o pendientes)
   *
   * Este método demuestra que puedes añadir operaciones específicas
   * de tu negocio. No todos los repositorios tienen los mismos métodos.
   */
  findByStatus(completed: boolean): Promise<Task[]>;
}

/**
 * ============================================
 * RESUMEN PARA QUE TE QUEDE CLARITO:
 * ============================================
 *
 * 1. Esta interface está en DOMAIN porque el dominio
 *    define qué necesita, no cómo se implementa.
 *
 * 2. Las clases de INFRASTRUCTURE implementarán esta
 *    interface (InMemoryTaskRepository, MongoTaskRepository, etc.)
 *
 * 3. Los casos de uso (APPLICATION) recibirán esta interface,
 *    no la implementación concreta. Eso es INVERSIÓN DE DEPENDENCIAS.
 *
 * 4. Esto permite TESTEAR fácilmente: puedes pasar un
 *    repositorio falso (mock) en los tests.
 *
 * ¿Te quedó clarito o le damos otra vuelta?
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 2                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • La interface TaskRepository es el PUERTO del patrón hexagonal          ║
 * ║  • El dominio define QUÉ necesita, no CÓMO se hace                        ║
 * ║  • Esta interface permite cambiar implementaciones sin tocar el dominio   ║
 * ║  • Esto es INVERSIÓN DE DEPENDENCIAS en acción, mi niño/a                 ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE PASO: src/infrastructure/InMemoryTaskRepository.ts          ║
 * ║     Ruta completa: /Users/aitorevi/Dev/hexagonal/                         ║
 * ║                    repository-pattern-example/src/infrastructure/         ║
 * ║                    InMemoryTaskRepository.ts                              ║
 * ║                                                                           ║
 * ║     (Aprenderás cómo se IMPLEMENTA el puerto - el ADAPTADOR)              ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
