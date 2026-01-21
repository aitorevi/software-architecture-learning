/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  📚 PATRÓN REPOSITORY - PASO 1 de 6: LA ENTIDAD                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: Ninguno (¡Este es el inicio, mi niño/a!)                   ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Qué es una entidad de dominio y por qué es importante               ║
 * ║     • Cómo las entidades encapsulan datos Y comportamiento                ║
 * ║     • Por qué el dominio no depende de la infraestructura                 ║
 * ║     • Métodos de negocio vs. setters simples                              ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ============================================
 * ENTIDAD: Task (Tarea)
 * ============================================
 *
 * Mira tú, esto es lo que llamamos una ENTIDAD en el dominio.
 * Es un objeto que tiene IDENTIDAD (el id) y representa algo
 * importante para nuestro negocio.
 *
 * ¿Por qué está en domain/?
 * Porque esta clase representa CONOCIMIENTO DEL NEGOCIO,
 * no depende de bases de datos, frameworks ni nada externo.
 * Es pura chicha, mi niño/a.
 *
 * El Profe Millo dice: "Si mañana cambias de BD o framework,
 * esta clase NO debe cambiar. Eso es separación de responsabilidades fetén."
 */

export class Task {
  // El id es lo que hace que esta Task sea ÚNICA
  // Dos tareas con el mismo título pueden existir,
  // pero nunca dos con el mismo id
  readonly id: string;

  // Los datos de negocio que nos importan
  title: string;
  completed: boolean;
  readonly createdAt: Date;

  constructor(id: string, title: string, completed: boolean = false, createdAt?: Date) {
    // Validaciones básicas - ¡el dominio debe protegerse!
    if (!id || id.trim() === '') {
      throw new Error('El id de la tarea no puede estar vacío, mi niño/a');
    }

    if (!title || title.trim() === '') {
      throw new Error('El título de la tarea no puede estar vacío');
    }

    this.id = id;
    this.title = title;
    this.completed = completed;
    this.createdAt = createdAt || new Date();
  }

  /**
   * MÉTODO DE DOMINIO: complete()
   *
   * Este es un método de NEGOCIO. No solo cambiamos completed = true,
   * sino que expresamos una ACCIÓN del dominio: "completar una tarea".
   *
   * ¿Por qué así y no task.completed = true?
   * Porque mañana quizás completar una tarea implique:
   * - Registrar la fecha de completado
   * - Validar que no esté ya completada
   * - Lanzar un evento de dominio
   *
   * Encapsulamos el comportamiento aquí, en el dominio.
   */
  complete(): void {
    if (this.completed) {
      throw new Error('Esta tarea ya está completada, no te dejes enredar');
    }
    this.completed = true;
  }

  /**
   * Por si acaso necesitamos desmarcar una tarea
   */
  uncomplete(): void {
    if (!this.completed) {
      throw new Error('Esta tarea ya está pendiente');
    }
    this.completed = false;
  }

  /**
   * Método útil para ver si la tarea está pendiente
   */
  isPending(): boolean {
    return !this.completed;
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 1                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • La entidad Task encapsula datos Y comportamiento de negocio            ║
 * ║  • El dominio contiene REGLAS, no detalles técnicos                       ║
 * ║  • Los métodos como complete() expresan ACCIONES del negocio              ║
 * ║  • Las validaciones protegen la integridad del dominio                    ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE PASO: src/domain/TaskRepository.ts                          ║
 * ║     Ruta completa: /Users/aitorevi/Dev/hexagonal/                         ║
 * ║                    repository-pattern-example/src/domain/TaskRepository.ts║
 * ║                                                                           ║
 * ║     (Aprenderás qué es el PUERTO - la interface del Repository)           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
