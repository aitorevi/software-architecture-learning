/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  CONTROLLER-SERVICE - PASO 2 de 7: EL PUERTO (INTERFACE)                  ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/domain/Task.ts                                         ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Qué es un PUERTO (interface)                                        ║
 * ║     • Por qué el puerto está en DOMAIN y no en INFRASTRUCTURE             ║
 * ║     • Cómo los VALUE OBJECTS mejoran la firma del contrato                ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { Task } from './Task.js';
import { TaskId } from './TaskId.js';

/**
 * PUERTO: TaskRepository
 *
 * Esta interface define QUÉ operaciones necesitamos para persistir tareas.
 * NO dice CÓMO se hacen. Eso lo decide el ADAPTADOR (en infrastructure).
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 VALUE OBJECTS EN LOS PUERTOS                                          ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  ANTES:  findById(id: string): Promise<Task | null>                       ║
 * ║  AHORA:  findById(id: TaskId): Promise<Task | null>                       ║
 * ║                                                                           ║
 * ║  ¿Por qué es mejor?                                                       ║
 * ║  • El tipo COMUNICA: "espero un ID válido, no cualquier string"           ║
 * ║  • Si llega un TaskId, SABEMOS que es válido                              ║
 * ║  • El compilador ayuda a detectar errores                                 ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * El Profe Millo dice: "El dominio DEFINE lo que necesita.
 * La infraestructura PROVEE la implementación."
 */
export interface TaskRepository {
  /**
   * Guarda una tarea nueva o actualiza una existente
   */
  save(task: Task): Promise<void>;

  /**
   * Busca una tarea por su ID
   *
   * Nota: Recibe TaskId, no string.
   * Esto hace explícito que esperamos un ID válido.
   *
   * @returns La tarea si existe, null si no
   */
  findById(id: TaskId): Promise<Task | null>;

  /**
   * Devuelve todas las tareas
   */
  findAll(): Promise<Task[]>;

  /**
   * Elimina una tarea por su ID
   *
   * @returns true si se eliminó, false si no existía
   */
  delete(id: TaskId): Promise<boolean>;
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 2                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has visto:                                                               ║
 * ║  • TaskRepository es el PUERTO - define el contrato                       ║
 * ║  • Está en domain porque el dominio define QUÉ necesita                   ║
 * ║  • Usa TaskId en lugar de string para mayor expresividad                  ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/infrastructure/persistence/InMemoryTaskRepository.ts   ║
 * ║     (El ADAPTADOR - la implementación concreta)                           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
