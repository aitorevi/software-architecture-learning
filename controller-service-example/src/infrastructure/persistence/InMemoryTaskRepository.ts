/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  CONTROLLER-SERVICE - PASO 3 de 7: EL ADAPTADOR DE SALIDA                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/domain/TaskRepository.ts                               ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Qué es un ADAPTADOR DE SALIDA (implementación del puerto)           ║
 * ║     • Por qué está en infrastructure/persistence                          ║
 * ║     • Cómo el adaptador trabaja con Value Objects                         ║
 * ║                                                                           ║
 * ║  🔌 TIPOS DE ADAPTADORES:                                                 ║
 * ║     • ENTRADA: Reciben peticiones del exterior (Controller, CLI, etc.)    ║
 * ║     • SALIDA: Se conectan a sistemas externos (BD, APIs, archivos)        ║
 * ║                                                                           ║
 * ║     Este es un adaptador de SALIDA porque guarda datos "hacia afuera".    ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { Task } from '../../domain/Task.js';
import { TaskId } from '../../domain/TaskId.js';
import { TaskRepository } from '../../domain/TaskRepository.js';

/**
 * ADAPTADOR: InMemoryTaskRepository
 *
 * Implementa el puerto TaskRepository guardando datos en memoria.
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 ADAPTADOR Y VALUE OBJECTS                                             ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  El adaptador recibe TaskId (Value Object) pero internamente usa          ║
 * ║  string como clave del Map. Esto es normal:                               ║
 * ║                                                                           ║
 * ║  • El DOMINIO trabaja con Value Objects (TaskId)                          ║
 * ║  • La INFRAESTRUCTURA traduce a primitivos cuando es necesario            ║
 * ║                                                                           ║
 * ║  El adaptador es el TRADUCTOR entre el lenguaje del dominio               ║
 * ║  y el lenguaje de la tecnología (en este caso, un Map de JS).             ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * El Profe Millo dice: "Mañana podrías crear MongoTaskRepository
 * o PostgresTaskRepository. El resto del código NO cambiaría."
 */
export class InMemoryTaskRepository implements TaskRepository {
  /**
   * Usamos string como clave del Map.
   * El TaskId se convierte a string con getValue().
   */
  private tasks: Map<string, Task> = new Map();

  async save(task: Task): Promise<void> {
    // Extraemos el valor primitivo del TaskId para usar como clave
    this.tasks.set(task.id.getValue(), task);
  }

  async findById(id: TaskId): Promise<Task | null> {
    // Convertimos el TaskId a string para buscar en el Map
    const task = this.tasks.get(id.getValue());
    return task || null;
  }

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async delete(id: TaskId): Promise<boolean> {
    // Convertimos el TaskId a string para eliminar del Map
    return this.tasks.delete(id.getValue());
  }

  /**
   * Método extra para tests - limpia todo
   */
  clear(): void {
    this.tasks.clear();
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 3                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has visto:                                                               ║
 * ║  • InMemoryTaskRepository es un ADAPTADOR DE SALIDA                       ║
 * ║  • Implementa la interface (puerto) definida en el dominio                ║
 * ║  • Traduce TaskId → string para trabajar con el Map                       ║
 * ║  • Está en infrastructure porque es un detalle técnico                    ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/application/TaskService.ts                             ║
 * ║     (El SERVICE - el orquestador de la lógica)                            ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
