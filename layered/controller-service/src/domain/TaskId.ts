/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  VALUE OBJECT: TaskId                                                     ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 ¿QUÉ ES UN VALUE OBJECT?                                              ║
 * ║                                                                           ║
 * ║  Un Value Object es un objeto que:                                        ║
 * ║  • Se identifica por su VALOR, no por una identidad                       ║
 * ║  • Es INMUTABLE - una vez creado, no cambia                               ║
 * ║  • Encapsula VALIDACIÓN - si existe, es válido                            ║
 * ║  • Dos VOs con el mismo valor son considerados iguales                    ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "El Value Object es como una moneda de euro.        ║
 * ║  No te importa CUÁL moneda tienes, solo que valga un euro."               ║
 * ║                                                                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  💡 ¿POR QUÉ USAR VALUE OBJECTS?                                          ║
 * ║                                                                           ║
 * ║  1. PRINCIPIO DE MENOR SORPRESA:                                          ║
 * ║     Si recibes un TaskId, SABES que es válido. No hay sorpresas.          ║
 * ║     La validación ya ocurrió en el momento de creación.                   ║
 * ║                                                                           ║
 * ║  2. CÓDIGO AUTODOCUMENTADO:                                               ║
 * ║     findById(id: TaskId) es más expresivo que findById(id: string)        ║
 * ║     El tipo COMUNICA la intención.                                        ║
 * ║                                                                           ║
 * ║  3. EVITA "PRIMITIVE OBSESSION":                                          ║
 * ║     En lugar de pasar strings por todos lados, usamos tipos               ║
 * ║     específicos del dominio. Más seguro, más claro.                       ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export class TaskId {
  /**
   * Constructor PRIVADO
   *
   * Forzamos que la creación pase por el método estático `create()`.
   * Así garantizamos que SIEMPRE se valide el valor.
   *
   * Este patrón se llama "Named Constructor" o "Factory Method".
   */
  private constructor(private readonly value: string) {}

  /**
   * FACTORY METHOD: create()
   *
   * Este es el ÚNICO punto de entrada para crear un TaskId.
   * Si el id no es válido, lanza una excepción AQUÍ,
   * no en la entidad Task.
   *
   * La excepción en el factory method NO es sorpresiva porque:
   * - El nombre `create` implica que puede fallar
   * - Estamos en el momento de construcción, no de uso
   * - El dominio define sus propias reglas
   */
  static create(id: string): TaskId {
    if (!id || id.trim() === '') {
      throw new Error('El id de la tarea no puede estar vacío');
    }
    return new TaskId(id.trim());
  }

  /**
   * Obtiene el valor primitivo.
   *
   * Útil cuando necesitas el string real, por ejemplo
   * para guardarlo en la base de datos o devolverlo en JSON.
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compara dos TaskId por valor.
   *
   * Los Value Objects se comparan por VALOR, no por referencia.
   */
  equals(other: TaskId): boolean {
    return this.value === other.value;
  }

  /**
   * Representación string del VO.
   * Útil para logs y debugging.
   */
  toString(): string {
    return this.value;
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ BENEFICIOS DE ESTE DISEÑO                                             ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  ANTES (con string):                                                      ║
 * ║  ```                                                                      ║
 * ║  function findTask(id: string) { ... }                                    ║
 * ║  findTask("");  // Compila, pero es inválido 💥                           ║
 * ║  findTask("abc");  // ¿Es un id válido? No lo sabemos 🤷                  ║
 * ║  ```                                                                      ║
 * ║                                                                           ║
 * ║  AHORA (con TaskId):                                                      ║
 * ║  ```                                                                      ║
 * ║  function findTask(id: TaskId) { ... }                                    ║
 * ║  findTask(TaskId.create(""));  // Lanza excepción al crear ✅             ║
 * ║  findTask(TaskId.create("abc"));  // Si existe, es válido ✅              ║
 * ║  ```                                                                      ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Si el TaskId existe, está bien.                    ║
 * ║  No hay que andar dudando ni validando por todos lados."                  ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
