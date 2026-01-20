/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  VALUE OBJECT: TaskTitle                                                  ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 ¿POR QUÉ UN VALUE OBJECT PARA EL TÍTULO?                              ║
 * ║                                                                           ║
 * ║  El título de una tarea tiene REGLAS DE NEGOCIO:                          ║
 * ║  • No puede estar vacío                                                   ║
 * ║  • Podríamos añadir más reglas: longitud máxima, caracteres válidos...    ║
 * ║                                                                           ║
 * ║  Encapsular estas reglas en un Value Object:                              ║
 * ║  • Centraliza la validación (un solo lugar)                               ║
 * ║  • Garantiza consistencia (si existe, es válido)                          ║
 * ║  • Documenta las reglas del negocio en código                             ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Imagínate que mañana el negocio dice               ║
 * ║  'los títulos no pueden tener más de 100 caracteres'.                     ║
 * ║  ¿Dónde prefieres cambiar eso? ¿En 50 sitios o en UNO?"                   ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export class TaskTitle {
  /**
   * Constructor PRIVADO
   *
   * Igual que TaskId, forzamos que la creación pase por `create()`.
   */
  private constructor(private readonly value: string) {}

  /**
   * FACTORY METHOD: create()
   *
   * Valida y crea un TaskTitle.
   *
   * La excepción aquí es ESPERADA si el título no cumple las reglas.
   * No es una sorpresa - estamos definiendo las reglas del dominio.
   */
  static create(title: string): TaskTitle {
    if (!title || title.trim() === '') {
      throw new Error('El título de la tarea no puede estar vacío');
    }

    const trimmedTitle = title.trim();

    // Aquí podrías añadir más validaciones de negocio:
    // if (trimmedTitle.length > 100) {
    //   throw new Error('El título no puede tener más de 100 caracteres');
    // }

    return new TaskTitle(trimmedTitle);
  }

  /**
   * Obtiene el valor primitivo.
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compara dos TaskTitle por valor.
   */
  equals(other: TaskTitle): boolean {
    return this.value === other.value;
  }

  /**
   * Representación string del VO.
   */
  toString(): string {
    return this.value;
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 DIFERENCIA ENTRE VALIDACIÓN DE FORMATO Y REGLAS DE NEGOCIO            ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  El CONTROLLER valida FORMATO:                                            ║
 * ║  - ¿Es un string? ¿Viene el campo?                                        ║
 * ║  - Validación técnica de la petición HTTP                                 ║
 * ║                                                                           ║
 * ║  El VALUE OBJECT valida REGLAS DE NEGOCIO:                                ║
 * ║  - ¿Está vacío? ¿Es demasiado largo?                                      ║
 * ║  - Reglas que define el DOMINIO                                           ║
 * ║                                                                           ║
 * ║  Esto puede parecer duplicado, pero tiene sentido:                        ║
 * ║  - El Controller protege la API de peticiones malformadas                 ║
 * ║  - El VO protege el dominio de datos inválidos                            ║
 * ║                                                                           ║
 * ║  Si mañana añades una CLI, la CLI validará formato a su manera,           ║
 * ║  pero el VO seguirá validando las reglas de negocio.                      ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
