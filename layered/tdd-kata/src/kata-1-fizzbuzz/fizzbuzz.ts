/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🎯 KATA 1: FIZZBUZZ - TDD CLÁSICO                                        ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • El ciclo completo Red-Green-Refactor                                ║
 * ║     • Baby steps (pasos pequeños)                                         ║
 * ║     • Cómo cada test guía el diseño                                       ║
 * ║     • El poder de escribir código mínimo primero                          ║
 * ║                                                                           ║
 * ║  🎯 EL PROBLEMA:                                                          ║
 * ║     Escribe una función que:                                              ║
 * ║     • Devuelve "Fizz" si el número es divisible por 3                     ║
 * ║     • Devuelve "Buzz" si es divisible por 5                               ║
 * ║     • Devuelve "FizzBuzz" si es divisible por 3 y 5                       ║
 * ║     • Devuelve el número como string en cualquier otro caso               ║
 * ║                                                                           ║
 * ║  💡 CONSEJO:                                                              ║
 * ║     Lee los comentarios de abajo para ver cómo se desarrolló             ║
 * ║     esta función paso a paso siguiendo TDD.                               ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ============================================
 * FIZZBUZZ: Implementación con TDD
 * ============================================
 *
 * El Profe Millo te cuenta cómo se desarrolló esto:
 *
 * ITERACIÓN 1: ❌ RED
 * ----------------
 * Test: should return "1" for 1
 * Código: (no existe todavía)
 * Resultado: ❌ Falla - La función no existe
 *
 * ITERACIÓN 1: ✅ GREEN
 * ----------------
 * Escribí el código MÁS SIMPLE:
 *
 *   export function fizzbuzz(n: number): string {
 *     return '1';
 *   }
 *
 * Sí, literalmente devolvía '1'. ¿Por qué?
 * Porque el test SOLO pedía eso. Nada más.
 *
 * ITERACIÓN 2: ❌ RED
 * ----------------
 * Test: should return "2" for 2
 * Código: return '1' (siempre devuelve '1')
 * Resultado: ❌ Falla - Esperaba '2', recibió '1'
 *
 * ITERACIÓN 2: ✅ GREEN
 * ----------------
 * Ahora tuve que generalizar:
 *
 *   export function fizzbuzz(n: number): string {
 *     return String(n);
 *   }
 *
 * Esto hace pasar AMBOS tests.
 *
 * ITERACIÓN 3: ❌ RED
 * ----------------
 * Test: should return "Fizz" for 3
 * Código: return String(n)
 * Resultado: ❌ Falla - Esperaba 'Fizz', recibió '3'
 *
 * ITERACIÓN 3: ✅ GREEN
 * ----------------
 *   export function fizzbuzz(n: number): string {
 *     if (n === 3) return 'Fizz';
 *     return String(n);
 *   }
 *
 * Sí, literalmente n === 3. Baby steps, mi niño/a.
 *
 * ITERACIÓN 4: ❌ RED
 * ----------------
 * Test: should return "Fizz" for 6
 * Código: if (n === 3) return 'Fizz'
 * Resultado: ❌ Falla - Esperaba 'Fizz', recibió '6'
 *
 * ITERACIÓN 4: ✅ GREEN
 * ----------------
 * Ahora sí generalizamos la regla:
 *
 *   export function fizzbuzz(n: number): string {
 *     if (n % 3 === 0) return 'Fizz';
 *     return String(n);
 *   }
 *
 * ... Y así continúa hasta tener todas las reglas.
 *
 * ITERACIÓN FINAL: ♻️ REFACTOR
 * ---------------------------
 * Una vez TODOS los tests pasan, refactorizamos.
 * Mejoramos la legibilidad, eliminamos duplicación,
 * pero los tests siguen verdes.
 *
 * Esa es la MAGIA: puedes cambiar el código interno
 * sin miedo porque los tests te cubren.
 */

/**
 * FizzBuzz - Implementación final después del ciclo TDD
 *
 * Mira tú, esta es la versión final después de muchas iteraciones.
 * Cada línea existe porque un test la pidió.
 */
export function fizzbuzz(n: number): string {
  // Importante: FizzBuzz ANTES que Fizz o Buzz
  // ¿Por qué? Porque 15 es divisible por 3 Y por 5
  // Si chequeáramos Fizz primero, nunca llegaríamos a FizzBuzz
  if (n % 15 === 0) {
    return 'FizzBuzz';
  }

  // Divisible por 3 → Fizz
  if (n % 3 === 0) {
    return 'Fizz';
  }

  // Divisible por 5 → Buzz
  if (n % 5 === 0) {
    return 'Buzz';
  }

  // Cualquier otro caso → el número como string
  return String(n);
}

/**
 * ============================================
 * EJERCICIO PARA TI:
 * ============================================
 *
 * 1. BORRA ESTA FUNCIÓN COMPLETA
 *
 * 2. Ve a tests/fizzbuzz.test.ts y DESCOMENTA UN TEST
 *
 * 3. Ejecuta: npm run test:watch
 *
 * 4. Escribe el código MÁS SIMPLE que haga pasar ese test
 *
 * 5. Descomenta el siguiente test
 *
 * 6. Repite hasta completar todos
 *
 * 7. SIENTE el ciclo Red-Green-Refactor
 *
 * El Profe Millo dice: "No te saltes pasos. No te adelantes.
 * Escribe SOLO el código que los tests piden. Nada más.
 * Esa disciplina es la que te dará diseño limpio."
 */

/**
 * ============================================
 * VARIANTE: FizzBuzz con composición
 * ============================================
 *
 * Después de completar la versión básica, puedes refactorizar
 * a esta versión más elegante (pero no empieces por aquí):
 */
export function fizzbuzzComposed(n: number): string {
  let result = '';

  if (n % 3 === 0) result += 'Fizz';
  if (n % 5 === 0) result += 'Buzz';

  return result || String(n);
}

/**
 * Esta versión es más elegante porque:
 * - No necesitas el caso especial de 15 (se compone automáticamente)
 * - Es más fácil añadir nuevas reglas (Jazz para 7, etc.)
 *
 * Pero NO empieces por aquí. Llega a esta solución mediante
 * refactorización después de que todos los tests pasen.
 *
 * Ese es el poder del TDD: puedes evolucionar el diseño
 * con confianza porque los tests te protegen.
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL KATA 1                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • El ciclo Red-Green-Refactor en la práctica                             ║
 * ║  • Baby steps: código mínimo primero, generalizar después                 ║
 * ║  • Cómo los tests guían el diseño paso a paso                             ║
 * ║  • Refactorización segura con tests como red                              ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE PASO: Kata 2 - String Calculator                            ║
 * ║     Ruta: src/kata-2-string-calculator/string-calculator.ts               ║
 * ║                                                                           ║
 * ║     (Requisitos incrementales y manejo de errores)                        ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
