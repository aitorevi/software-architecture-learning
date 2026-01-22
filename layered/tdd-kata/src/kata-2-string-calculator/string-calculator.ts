/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🎯 KATA 2: STRING CALCULATOR - TDD CON REQUISITOS INCREMENTALES          ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • TDD con requisitos que van creciendo                                ║
 * ║     • Cómo manejar errores con test-first                                 ║
 * ║     • Refactorización continua a medida que añades features               ║
 * ║     • Tests que documentan casos edge                                     ║
 * ║                                                                           ║
 * ║  🎯 EL PROBLEMA:                                                          ║
 * ║     Crea una función add(numbers: string): number que:                    ║
 * ║     • add("") → 0 (string vacío devuelve 0)                               ║
 * ║     • add("1") → 1 (un número)                                            ║
 * ║     • add("1,2") → 3 (dos números separados por coma)                     ║
 * ║     • add("1,2,3") → 6 (múltiples números)                                ║
 * ║     • add("1\n2,3") → 6 (permite \n como delimitador)                     ║
 * ║     • add("1,-2") → Error (no permite negativos)                          ║
 * ║                                                                           ║
 * ║  💡 CONSEJO:                                                              ║
 * ║     No leas todo el código de golpe. Ve a los tests primero.             ║
 * ║     Implementa requisito por requisito.                                   ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ============================================
 * STRING CALCULATOR: Implementación con TDD
 * ============================================
 *
 * El Profe Millo te cuenta el proceso:
 *
 * ITERACIÓN 1: Empty string
 * ----------------
 * Test: add("") → 0
 * Código mínimo:
 *   export function add(numbers: string): number {
 *     return 0;
 *   }
 *
 * ITERACIÓN 2: Un número
 * ----------------
 * Test: add("1") → 1
 * Código mínimo:
 *   export function add(numbers: string): number {
 *     if (numbers === '') return 0;
 *     return Number(numbers);
 *   }
 *
 * ITERACIÓN 3: Dos números
 * ----------------
 * Test: add("1,2") → 3
 * Ahora necesitamos parsear el string:
 *   export function add(numbers: string): number {
 *     if (numbers === '') return 0;
 *     const parts = numbers.split(',');
 *     return parts.reduce((sum, n) => sum + Number(n), 0);
 *   }
 *
 * ... Y así continúa. Cada test añade un requisito nuevo.
 *
 * REFACTORIZACIÓN CONTINUA:
 * - Extraer funciones auxiliares cuando hay duplicación
 * - Renombrar para claridad
 * - Simplificar condicionales
 * - SIEMPRE manteniendo los tests verdes
 */

/**
 * StringCalculator - Versión final después del ciclo TDD
 *
 * Esta clase emergió naturalmente de los tests.
 * No la diseñamos de antemano. Los tests nos guiaron.
 */
export class StringCalculator {
  /**
   * Suma números contenidos en un string
   *
   * @param numbers - String con números separados por comas o \n
   * @returns La suma de los números
   * @throws Error si hay números negativos
   *
   * Ejemplos:
   * - add("") → 0
   * - add("1") → 1
   * - add("1,2,3") → 6
   * - add("1\n2,3") → 6
   */
  add(numbers: string): number {
    // CASO BASE: String vacío
    if (numbers === '') {
      return 0;
    }

    // Parsear los números del string
    const nums = this.parseNumbers(numbers);

    // VALIDACIÓN: No permitir negativos
    this.validateNoNegatives(nums);

    // Sumar todos los números
    return nums.reduce((sum, n) => sum + n, 0);
  }

  /**
   * Parsea el string y extrae los números
   *
   * Esta función emergió durante la refactorización.
   * Cuando vimos que había lógica de parsing repetida,
   * la extrajimos aquí.
   *
   * El Profe Millo dice: "No extraigas funciones porque sí.
   * Hazlo cuando VES duplicación o complejidad."
   */
  private parseNumbers(numbers: string): number[] {
    // Soportamos tanto comas como \n como delimitadores
    // Usamos una regex para split por ambos
    const parts = numbers.split(/[,\n]/);

    // Convertimos cada parte a número
    return parts.map((part) => Number(part));
  }

  /**
   * Valida que no haya números negativos
   *
   * Esta función apareció cuando añadimos el test de negativos.
   * El test nos forzó a añadir esta validación.
   *
   * Test-first → Código que lo hace pasar → Refactor
   */
  private validateNoNegatives(nums: number[]): void {
    const negatives = nums.filter((n) => n < 0);

    if (negatives.length > 0) {
      throw new Error(
        `Negativos no permitidos: ${negatives.join(', ')}`
      );
    }
  }
}

/**
 * También podríamos tener una función simple (no clase):
 *
 * Esta es una alternativa válida. Surgió de refactorizar.
 */
export function add(numbers: string): number {
  const calculator = new StringCalculator();
  return calculator.add(numbers);
}

/**
 * ============================================
 * EJERCICIO PARA TI:
 * ============================================
 *
 * 1. BORRA ESTE ARCHIVO COMPLETO
 *
 * 2. Ejecuta: npm run test:watch
 *
 * 3. Ve a tests/string-calculator.test.ts
 *
 * 4. Implementa requisito por requisito:
 *    - Empieza con el string vacío
 *    - Luego un número
 *    - Luego dos números
 *    - Etc.
 *
 * 5. NO te adelantes. Escribe SOLO el código que cada test pide.
 *
 * 6. REFACTORIZA cuando veas duplicación o complejidad.
 *    Pero solo cuando los tests estén verdes.
 *
 * El Profe Millo dice: "Este kata te enseña algo importante:
 * En TDD, los requisitos crecen. Empiezas simple y vas añadiendo.
 * No intentes resolver todo de golpe. Baby steps, mi niño/a."
 */

/**
 * ============================================
 * EXTENSIÓN: Más requisitos (para practicar)
 * ============================================
 *
 * Una vez domines lo básico, añade estos requisitos:
 *
 * 1. Ignorar números > 1000
 *    add("2,1001") → 2
 *
 * 2. Delimitadores personalizados
 *    add("//;\n1;2") → 3 (usa ; como delimitador)
 *
 * 3. Delimitadores de cualquier longitud
 *    add("//[***]\n1***2***3") → 6
 *
 * Recuerda: PRIMERO el test, LUEGO el código.
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL KATA 2                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • TDD con requisitos incrementales                                       ║
 * ║  • Cómo manejar errores con test-first                                    ║
 * ║  • Refactorización continua (extraer funciones)                           ║
 * ║  • Tests que fuerzan buenas validaciones                                  ║
 * ║  • El diseño emerge de los tests (no al revés)                            ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE PASO: Kata 3 - Shopping Cart                                ║
 * ║     Ruta: src/kata-3-shopping-cart/                                       ║
 * ║                                                                           ║
 * ║     (TDD con múltiples entidades y lógica de negocio real)                ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
