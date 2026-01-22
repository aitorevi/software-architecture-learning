/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🎯 TESTS KATA 2: STRING CALCULATOR                                       ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Tests con requisitos incrementales                                  ║
 * ║     • Cómo testear manejo de errores                                      ║
 * ║     • Testing de casos edge (vacío, un elemento, múltiples)               ║
 * ║     • Cómo los tests documentan la funcionalidad                          ║
 * ║                                                                           ║
 * ║  💡 PARA PRACTICAR TDD:                                                   ║
 * ║     1. Borra el código de string-calculator.ts                            ║
 * ║     2. Ejecuta: npm run test:watch                                        ║
 * ║     3. Implementa requisito por requisito                                 ║
 * ║     4. Refactoriza cuando veas duplicación                                ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { StringCalculator, add } from './string-calculator';

/**
 * ============================================
 * TESTS: String Calculator con TDD
 * ============================================
 *
 * Estos tests representan requisitos reales que crecen con el tiempo.
 * Así es como funciona el desarrollo real: no conoces todos los
 * requisitos por adelantado.
 *
 * El Profe Millo dice: "En la vida real, los requisitos cambian.
 * El TDD te permite adaptarte sin miedo porque tienes una red de tests."
 */

/**
 * ============================================
 * REQUISITO 1: String vacío devuelve 0
 * ============================================
 *
 * ¿Por qué empezar por el string vacío?
 * Porque es el caso más simple. Es el caso base.
 *
 * En TDD SIEMPRE empiezas por el caso más simple.
 */
test('treats empty input as zero', () => {
  // ARRANGE
  const calculator = new StringCalculator();

  // ACT
  const result = calculator.add('');

  // ASSERT
  assert.strictEqual(result, 0);
});

/**
 * ============================================
 * REQUISITO 2: Un número devuelve ese número
 * ============================================
 *
 * Este test nos obliga a parsear el string a número.
 */
test('accepts a single number', () => {
  const calculator = new StringCalculator();

  assert.strictEqual(calculator.add('1'), 1);
  assert.strictEqual(calculator.add('5'), 5);
  assert.strictEqual(calculator.add('42'), 42);
});

/**
 * ============================================
 * REQUISITO 3: Dos números separados por coma
 * ============================================
 *
 * Ahora las cosas se ponen interesantes.
 * Este test nos fuerza a hacer split(',') y sumar.
 */
test('sums two numbers separated by comma', () => {
  const calculator = new StringCalculator();

  assert.strictEqual(calculator.add('1,2'), 3);
  assert.strictEqual(calculator.add('10,20'), 30);
  assert.strictEqual(calculator.add('5,7'), 12);
});

/**
 * ============================================
 * REQUISITO 4: Múltiples números
 * ============================================
 *
 * ¿Funciona con más de dos números? Verifiquémoslo.
 *
 * 🎯 NOTA: Este test NO nos obliga a cambiar el código
 * si ya usamos reduce(). Pero es bueno tenerlo para
 * documentar el comportamiento esperado.
 */
test('sums multiple numbers', () => {
  const calculator = new StringCalculator();

  assert.strictEqual(calculator.add('1,2,3'), 6);
  assert.strictEqual(calculator.add('1,2,3,4,5'), 15);
  assert.strictEqual(calculator.add('10,20,30,40'), 100);
});

/**
 * ============================================
 * REQUISITO 5: Soporte para \n como delimitador
 * ============================================
 *
 * Nuevo requisito: además de comas, los números pueden
 * estar separados por saltos de línea.
 *
 * Este test nos obliga a cambiar el split(',') por split(/[,\n]/)
 */
test('accepts newline as delimiter', () => {
  const calculator = new StringCalculator();

  assert.strictEqual(calculator.add('1\n2,3'), 6);
  assert.strictEqual(calculator.add('1\n2\n3'), 6);
  assert.strictEqual(calculator.add('10\n20'), 30);
});

/**
 * ============================================
 * REQUISITO 6: No permitir negativos
 * ============================================
 *
 * Nuevo requisito de negocio: los números negativos no
 * están permitidos. La función debe lanzar un error.
 *
 * 🎯 ESTO ES TDD EN ACCIÓN:
 * Primero escribimos el test que espera el error.
 * Luego añadimos el código que lanza el error.
 *
 * ¿Cómo testeamos errores?
 * Con assert.throws() para funciones síncronas.
 */
test('rejects negative numbers', () => {
  const calculator = new StringCalculator();

  // Verificamos que lanza un error
  assert.throws(
    () => calculator.add('1,-2,3'),
    /Negativos no permitidos/
  );
});

/**
 * TEST ADICIONAL: El mensaje de error debe incluir los negativos
 *
 * No solo queremos que lance un error, queremos que el mensaje
 * sea útil y muestre QUÉ números negativos encontró.
 */
test('includes rejected numbers in error message', () => {
  const calculator = new StringCalculator();

  assert.throws(
    () => calculator.add('1,-2,-5,3'),
    /Negativos no permitidos: -2, -5/
  );
});

/**
 * ============================================
 * TESTS DE CASOS EDGE
 * ============================================
 *
 * Estos tests cubren casos que podrían olvidarse.
 * Son tests de "¿qué pasa si...?"
 */

/**
 * Caso edge: Solo un negativo
 */
test('rejects a single negative number', () => {
  const calculator = new StringCalculator();

  assert.throws(
    () => calculator.add('-1'),
    /Negativos no permitidos: -1/
  );
});

/**
 * Caso edge: Ceros
 *
 * Los ceros están permitidos (no son negativos).
 */
test('accepts zeros as valid numbers', () => {
  const calculator = new StringCalculator();

  assert.strictEqual(calculator.add('0'), 0);
  assert.strictEqual(calculator.add('0,0,0'), 0);
  assert.strictEqual(calculator.add('1,0,2'), 3);
});

/**
 * Caso edge: Números grandes
 */
test('handles large numbers', () => {
  const calculator = new StringCalculator();

  assert.strictEqual(calculator.add('1000,2000'), 3000);
  assert.strictEqual(calculator.add('999,1'), 1000);
});

/**
 * ============================================
 * TESTS DE LA FUNCIÓN HELPER add()
 * ============================================
 *
 * Si exportamos una función helper además de la clase,
 * también la testeamos. Pero estos tests son redundantes
 * porque internamente usa StringCalculator.
 *
 * En TDD pragmático, podríamos omitir estos tests
 * y confiar en los de la clase.
 */
test('provides a helper function with same behavior', () => {
  assert.strictEqual(add(''), 0);
  assert.strictEqual(add('1'), 1);
  assert.strictEqual(add('1,2,3'), 6);

  assert.throws(
    () => add('1,-2'),
    /Negativos no permitidos/
  );
});

/**
 * ============================================
 * REFLEXIÓN SOBRE ESTOS TESTS:
 * ============================================
 *
 * ¿Notaste la progresión?
 *
 * 1. Caso más simple (string vacío)
 * 2. Caso con un elemento
 * 3. Caso con dos elementos (introduce split)
 * 4. Caso con múltiples elementos (verifica que funciona)
 * 5. Nuevo requisito (delimitador adicional)
 * 6. Requisito de validación (no negativos)
 * 7. Casos edge (ceros, grandes, etc.)
 *
 * Esta es la progresión NATURAL de TDD:
 * - Empiezas simple
 * - Añades complejidad gradualmente
 * - Cada test añade un requisito o verifica un caso edge
 * - Refactorizas cuando los tests están verdes
 *
 * El Profe Millo dice: "Estos tests no solo verifican que
 * el código funciona. SON LA ESPECIFICACIÓN. Si alguien nuevo
 * llega al proyecto, puede leer los tests y entender exactamente
 * qué hace el código y por qué. Eso es documentación viva."
 */

/**
 * ============================================
 * EJERCICIO: Añade nuevos requisitos
 * ============================================
 *
 * Practica TDD añadiendo estos requisitos (test-first):
 *
 * 1. Ignorar números mayores que 1000
 *    Test: add("2,1001") → 2
 *    Implementa el código mínimo que lo haga pasar.
 *
 * 2. Soporte para delimitadores personalizados
 *    Test: add("//;\n1;2") → 3
 *    El formato es: //[delimitador]\n[números]
 *
 * 3. Delimitadores de múltiples caracteres
 *    Test: add("//[***]\n1***2***3") → 6
 *
 * Recuerda:
 * - ❌ RED: Escribe el test que falla
 * - ✅ GREEN: Código mínimo que lo hace pasar
 * - ♻️ REFACTOR: Mejora el código con tests verdes
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DE LOS TESTS DE STRING CALCULATOR                             ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has visto:                                                               ║
 * ║  • Tests con requisitos incrementales                                     ║
 * ║  • Cómo testear errores (assert.throws)                                   ║
 * ║  • Testing de casos edge (vacío, ceros, grandes)                          ║
 * ║  • Cómo los tests documentan la funcionalidad                             ║
 * ║  • Progresión natural: simple → complejo                                  ║
 * ║                                                                           ║
 * ║  🎯 EJERCICIO:                                                            ║
 * ║     Borra string-calculator.ts y reimpleméntalo                           ║
 * ║     siguiendo estos tests uno por uno.                                    ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: Kata 3 - Shopping Cart                                     ║
 * ║     (TDD con múltiples clases y lógica de negocio real)                   ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
