/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🎯 TESTS KATA 1: FIZZBUZZ                                                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Cómo escribir tests que guían el desarrollo                         ║
 * ║     • El patrón AAA (Arrange-Act-Assert)                                  ║
 * ║     • Naming conventions para tests claros                                ║
 * ║     • Cómo cada test añade un requisito nuevo                             ║
 * ║                                                                           ║
 * ║  💡 PARA PRACTICAR TDD:                                                   ║
 * ║     1. Borra el código de fizzbuzz.ts                                     ║
 * ║     2. Ejecuta: npm run test:watch                                        ║
 * ║     3. Sigue estos tests UNO POR UNO                                      ║
 * ║     4. Escribe solo el código que cada test pide                          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { fizzbuzz } from './fizzbuzz';

/**
 * ============================================
 * TESTS: FizzBuzz con TDD
 * ============================================
 *
 * Estos tests están ordenados para guiarte en el desarrollo.
 * NO los cambies de orden. Cada test añade complejidad gradualmente.
 *
 * El Profe Millo dice: "Estos tests son tu mapa. Síguelos y
 * llegarás a buen puerto sin perderte en el camino."
 */

/**
 * TEST 1: El caso más simple
 *
 * ¿Por qué empezar por esto?
 * Porque es LO MÁS SIMPLE posible. No tiene ninguna regla especial.
 * Solo devuelve el número como string.
 *
 * 🎯 OBJETIVO DE ESTE TEST:
 * - Definir la firma de la función
 * - Establecer el caso base
 */
test('displays the number itself when number is not special', () => {
  // ARRANGE: Preparamos el input
  const input = 1;

  // ACT: Ejecutamos la función
  const result = fizzbuzz(input);

  // ASSERT: Verificamos el resultado
  assert.strictEqual(result, '1');
});

/**
 * TEST 2: Otro número normal
 *
 * ¿Por qué este test?
 * Para forzarnos a GENERALIZAR. Si solo tuviéramos el test anterior,
 * podríamos hacer trampa y devolver '1' siempre.
 *
 * Este test nos obliga a devolver String(n).
 */
test('displays the number itself for other regular numbers', () => {
  const result = fizzbuzz(2);
  assert.strictEqual(result, '2');
});

/**
 * TEST 3: Primera regla especial - Fizz
 *
 * Ahora introducimos la primera regla de negocio:
 * Si el número es divisible por 3, devuelve "Fizz".
 *
 * 🎯 OBJETIVO:
 * Forzar la primera condicional (if).
 */
test('displays Fizz when number is multiple of three', () => {
  const result = fizzbuzz(3);
  assert.strictEqual(result, 'Fizz');
});

/**
 * TEST 4: Generalizar Fizz
 *
 * ¿Por qué este test?
 * Porque el anterior podría resolverse con if (n === 3).
 * Este test nos obliga a usar if (n % 3 === 0).
 *
 * El Profe Millo dice: "Un solo ejemplo no basta para
 * extraer la regla general. Necesitas al menos dos."
 */
test('displays Fizz for other multiples of three', () => {
  const result = fizzbuzz(6);
  assert.strictEqual(result, 'Fizz');
});

/**
 * TEST 5: Más casos de Fizz
 *
 * Asegurémonos de que la regla funciona para cualquier múltiplo de 3.
 */
test('confirms Fizz rule for larger multiples of three', () => {
  const result = fizzbuzz(9);
  assert.strictEqual(result, 'Fizz');
});

/**
 * TEST 6: Segunda regla - Buzz
 *
 * Ahora introducimos la regla de Buzz:
 * Si el número es divisible por 5, devuelve "Buzz".
 */
test('displays Buzz when number is multiple of five', () => {
  const result = fizzbuzz(5);
  assert.strictEqual(result, 'Buzz');
});

/**
 * TEST 7: Generalizar Buzz
 */
test('displays Buzz for other multiples of five', () => {
  const result = fizzbuzz(10);
  assert.strictEqual(result, 'Buzz');
});

/**
 * TEST 8: La regla compleja - FizzBuzz
 *
 * Este es el caso interesante: un número divisible por 3 Y por 5.
 *
 * 🎯 IMPORTANTE:
 * Este test te obligará a poner la condición de FizzBuzz ANTES
 * que las de Fizz y Buzz. Si no, el 15 sería atrapado por Fizz.
 *
 * Esta es una lección de TDD: el test te dice DÓNDE poner el código.
 */
test('displays FizzBuzz when number is multiple of both three and five', () => {
  const result = fizzbuzz(15);
  assert.strictEqual(result, 'FizzBuzz');
});

/**
 * TEST 9: Generalizar FizzBuzz
 */
test('displays FizzBuzz for other multiples of both three and five', () => {
  const result = fizzbuzz(30);
  assert.strictEqual(result, 'FizzBuzz');
});

/**
 * TEST 10: Verificar que no rompimos nada
 *
 * Después de añadir la lógica de FizzBuzz, vamos a verificar
 * que los casos normales siguen funcionando.
 */
test('preserves regular numbers after adding special rules', () => {
  const result = fizzbuzz(7);
  assert.strictEqual(result, '7');
});

/**
 * TEST 11: Más verificaciones
 *
 * Verificamos un número que podría confundirse:
 * 4 no es divisible ni por 3 ni por 5.
 */
test('handles numbers that could be confused with special cases', () => {
  const result = fizzbuzz(4);
  assert.strictEqual(result, '4');
});

/**
 * ============================================
 * TESTS ADICIONALES (Casos Edge)
 * ============================================
 *
 * Estos tests cubren casos extremos que podrían olvidarse.
 * En TDD, no escribirías estos tests hasta que necesitaras
 * manejar estos casos.
 */

/**
 * TEST 12: El número más interesante
 *
 * 45 es divisible por 3, 5, 9 y 15. Es un buen caso de prueba.
 */
test('handles numbers with multiple divisors correctly', () => {
  const result = fizzbuzz(45);
  assert.strictEqual(result, 'FizzBuzz');
});

/**
 * TEST 13: Números grandes
 *
 * ¿Funciona con números grandes? Verifiquémoslo.
 */
test('handles large multiples of three', () => {
  const result = fizzbuzz(99);
  assert.strictEqual(result, 'Fizz');
});

test('handles large multiples of five', () => {
  const result = fizzbuzz(100);
  assert.strictEqual(result, 'Buzz');
});

/**
 * ============================================
 * REFLEXIÓN SOBRE ESTOS TESTS:
 * ============================================
 *
 * ¿Te diste cuenta del patrón?
 *
 * 1. Empezamos con lo más simple (1, 2)
 * 2. Añadimos la primera regla (Fizz)
 * 3. Generalizamos la regla (más casos de Fizz)
 * 4. Añadimos la segunda regla (Buzz)
 * 5. Combinamos ambas reglas (FizzBuzz)
 * 6. Verificamos que nada se rompió (casos normales)
 * 7. Casos edge (números grandes)
 *
 * Esta progresión NO es accidental. Es el flujo natural de TDD:
 * - Baby steps
 * - De lo simple a lo complejo
 * - Generalizar cuando hay al menos 2 ejemplos
 * - Verificar regresiones
 *
 * El Profe Millo dice: "Los tests no solo verifican que el código
 * funciona. Te GUÍAN en cómo escribirlo. Son tu brújula, mi niño/a."
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DE LOS TESTS DE FIZZBUZZ                                      ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has visto:                                                               ║
 * ║  • Tests ordenados de simple a complejo                                   ║
 * ║  • Patrón AAA en cada test (Arrange-Act-Assert)                           ║
 * ║  • Naming descriptivo (se lee como documentación)                         ║
 * ║  • Cómo cada test añade un requisito nuevo                                ║
 * ║  • Verificación de casos edge                                             ║
 * ║                                                                           ║
 * ║  🎯 EJERCICIO:                                                            ║
 * ║     Borra el código de fizzbuzz.ts y reimpleméntalo                       ║
 * ║     siguiendo estos tests UNO POR UNO.                                    ║
 * ║                                                                           ║
 * ║     npm run test:watch                                                    ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: Kata 2 - String Calculator                                 ║
 * ║     (Requisitos más complejos y manejo de errores)                        ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
