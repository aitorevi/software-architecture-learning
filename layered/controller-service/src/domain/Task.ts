/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  CONTROLLER-SERVICE - PASO 1 de 7: LA ENTIDAD                             ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: Ninguno (¡Este es el inicio!)                              ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Qué es una entidad de dominio                                       ║
 * ║     • Cómo usar VALUE OBJECTS para proteger invariantes                   ║
 * ║     • Por qué las entidades encapsulan datos Y comportamiento             ║
 * ║                                                                           ║
 * ║  💡 NOVEDAD: Esta entidad usa Value Objects (TaskId, TaskTitle)           ║
 * ║     para encapsular la validación. ¡Revísalos primero si quieres!         ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { TaskId } from './TaskId.js';
import { TaskTitle } from './TaskTitle.js';

/**
 * ENTIDAD: Task (Tarea)
 *
 * Una entidad es un objeto que tiene IDENTIDAD (el id) y representa
 * algo importante para nuestro negocio.
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 PRINCIPIO DE MENOR SORPRESA CON VALUE OBJECTS                         ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  ANTES (sin Value Objects):                                               ║
 * ║  ```                                                                      ║
 * ║  constructor(id: string, title: string) {                                 ║
 * ║    if (!id || id.trim() === '') throw new Error('...');  // 💥 Sorpresa?  ║
 * ║    if (!title || title.trim() === '') throw new Error('...');             ║
 * ║  }                                                                        ║
 * ║  ```                                                                      ║
 * ║                                                                           ║
 * ║  AHORA (con Value Objects):                                               ║
 * ║  ```                                                                      ║
 * ║  constructor(id: TaskId, title: TaskTitle) {                              ║
 * ║    this.id = id;      // Si existe, es válido ✅                          ║
 * ║    this.title = title; // Si existe, es válido ✅                         ║
 * ║  }                                                                        ║
 * ║  ```                                                                      ║
 * ║                                                                           ║
 * ║  El constructor ya NO lanza excepciones. No hay sorpresas.                ║
 * ║  Las validaciones ocurren al CREAR los Value Objects,                     ║
 * ║  que es donde tiene sentido que fallen.                                   ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * El Profe Millo dice: "La entidad es CONOCIMIENTO DEL NEGOCIO puro.
 * No sabe nada de HTTP, bases de datos ni frameworks."
 */
export class Task {
  readonly id: TaskId;
  private _title: TaskTitle;
  private _completed: boolean;
  readonly createdAt: Date;

  /**
   * Constructor que recibe VALUE OBJECTS ya validados.
   *
   * Este constructor NO puede fallar por validación.
   * Si recibes un TaskId y un TaskTitle, sabes que son válidos.
   *
   * ¿Dónde se valida entonces? En los factory methods de los VOs:
   * - TaskId.create("") → lanza excepción
   * - TaskTitle.create("") → lanza excepción
   */
  constructor(id: TaskId, title: TaskTitle, completed: boolean = false, createdAt?: Date) {
    this.id = id;
    this._title = title;
    this._completed = completed;
    this.createdAt = createdAt || new Date();
  }

  /**
   * Getter para el título.
   * Devuelve el Value Object, no el string primitivo.
   */
  get title(): TaskTitle {
    return this._title;
  }

  /**
   * Getter para el estado de completado.
   */
  get completed(): boolean {
    return this._completed;
  }

  /**
   * MÉTODO DE DOMINIO: complete()
   *
   * Expresamos una ACCIÓN del negocio: "completar una tarea".
   * No hacemos task.completed = true directamente.
   */
  complete(): void {
    if (this._completed) {
      throw new Error('Esta tarea ya está completada');
    }
    this._completed = true;
  }

  /**
   * Desmarcar una tarea completada
   */
  uncomplete(): void {
    if (!this._completed) {
      throw new Error('Esta tarea ya está pendiente');
    }
    this._completed = false;
  }

  /**
   * Método útil para verificar estado
   */
  isPending(): boolean {
    return !this._completed;
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 1                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has visto:                                                               ║
 * ║  • La entidad Task usa VALUE OBJECTS (TaskId, TaskTitle)                  ║
 * ║  • El constructor ya NO valida - los VOs garantizan datos válidos         ║
 * ║  • Los métodos como complete() expresan ACCIONES del negocio              ║
 * ║                                                                           ║
 * ║  BENEFICIO DEL PRINCIPIO DE MENOR SORPRESA:                               ║
 * ║  • new Task(id, title) NO puede fallar si los VOs existen                 ║
 * ║  • TaskId.create("") SÍ falla - pero eso es esperado en un factory        ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/domain/TaskRepository.ts                               ║
 * ║     (El PUERTO - la interface que define qué necesitamos)                 ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
