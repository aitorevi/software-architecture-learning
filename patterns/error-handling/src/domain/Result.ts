/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ERROR HANDLING - PASO 1: RESULT PATTERN                                  ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • ¿Qué es el patrón Result/Either?                                    ║
 * ║     • ¿Por qué los errores deberían ser valores, no excepciones?          ║
 * ║     • ¿Cómo hacer código más composable y testeable?                      ║
 * ║                                                                           ║
 * ║  ⭐ ESTE ES EL CORAZÓN DEL PROYECTO ⭐                                    ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 ¿QUÉ ES RESULT?                                                       ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Result es un contenedor que puede tener DOS estados:                     ║
 * ║                                                                           ║
 * ║  1. OK (éxito)    → Contiene un VALUE                                     ║
 * ║  2. ERROR (fallo) → Contiene un ERROR                                     ║
 * ║                                                                           ║
 * ║  Es como una caja de Schrödinger:                                         ║
 * ║  - Hasta que la abres (isOk/isError), no sabes qué hay dentro            ║
 * ║  - Pero cuando la abres, el compilador te obliga a manejar ambos casos   ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🆚 RESULT vs EXCEPCIONES                                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  EXCEPCIONES (lo típico):                                                 ║
 * ║  ❌ Rompen el flujo del programa (throw salta a catch)                    ║
 * ║  ❌ No están en el tipo (la función no dice que puede fallar)             ║
 * ║  ❌ Difíciles de testear (necesitas try/catch)                            ║
 * ║  ❌ No composables (no puedes encadenar)                                  ║
 * ║                                                                           ║
 * ║  RESULT (funcional):                                                      ║
 * ║  ✅ Flujo normal (no hay throw, todo es return)                           ║
 * ║  ✅ Está en el tipo (Result<User, ValidationError> dice "puede fallar")   ║
 * ║  ✅ Fácil de testear (solo verificas isOk/isError)                        ║
 * ║  ✅ Composable (puedes encadenar con map, flatMap)                        ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Si la función puede fallar por razones de         ║
 * ║  NEGOCIO (email inválido), usa Result. Si puede fallar por razones       ║
 * ║  TÉCNICAS (BD caída), usa exception. ¿Te quedó clarito?"                 ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export class Result<T, E = Error> {
  /**
   * CONSTRUCTOR PRIVADO
   *
   * ¿Por qué privado? Para obligar a usar los factory methods:
   * - Result.ok()
   * - Result.fail()
   *
   * Esto garantiza que siempre se crea correctamente.
   */
  private constructor(
    private readonly _value: T | null,
    private readonly _error: E | null,
    private readonly success: boolean
  ) {
    // Invariante: O hay valor O hay error, nunca ambos ni ninguno
    if (success && _error !== null) {
      throw new Error('Invariante violado: Result.ok no puede tener error');
    }
    if (!success && _value !== null) {
      throw new Error('Invariante violado: Result.fail no puede tener valor');
    }
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  FACTORY METHOD: ok()                                                     ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Crea un Result de ÉXITO.                                                 ║
   * ║                                                                           ║
   * ║  Uso:                                                                     ║
   * ║    const result = Result.ok(user);                                        ║
   * ║    // result.isOk() === true                                              ║
   * ║    // result.value === user                                               ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(value, null, true);
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  FACTORY METHOD: fail()                                                   ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Crea un Result de ERROR.                                                 ║
   * ║                                                                           ║
   * ║  Uso:                                                                     ║
   * ║    const result = Result.fail(new ValidationError('Email inválido'));     ║
   * ║    // result.isError() === true                                           ║
   * ║    // result.error === ValidationError                                    ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  static fail<E>(error: E): Result<never, E> {
    return new Result<never, E>(null, error, false);
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  VERIFICADORES: isOk() e isError()                                        ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Estos métodos te permiten verificar el estado del Result.                ║
   * ║                                                                           ║
   * ║  SIEMPRE debes verificar antes de acceder a value o error.                ║
   * ║                                                                           ║
   * ║  Patrón típico:                                                           ║
   * ║    if (result.isOk()) {                                                   ║
   * ║      console.log(result.value); // ✅ Seguro                              ║
   * ║    } else {                                                               ║
   * ║      console.log(result.error); // ✅ Seguro                              ║
   * ║    }                                                                      ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  isOk(): this is Result<T, never> {
    return this.success;
  }

  isError(): this is Result<never, E> {
    return !this.success;
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  GETTERS: value y error                                                   ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Estos getters lanzan exception si intentas acceder al campo incorrecto:  ║
   * ║                                                                           ║
   * ║  - result.value cuando isError() → Exception                              ║
   * ║  - result.error cuando isOk() → Exception                                 ║
   * ║                                                                           ║
   * ║  Esto te obliga a verificar el estado primero.                            ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  get value(): T {
    if (!this.success) {
      throw new Error('No puedes acceder a value en un Result.fail()');
    }
    return this._value as T;
  }

  get error(): E {
    if (this.success) {
      throw new Error('No puedes acceder a error en un Result.ok()');
    }
    return this._error as E;
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  TRANSFORMACIÓN: map()                                                    ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Transforma el VALUE de un Result.ok() sin tocar Result.fail()            ║
   * ║                                                                           ║
   * ║  Ejemplo:                                                                 ║
   * ║    const result = Result.ok(5);                                           ║
   * ║    const doubled = result.map(n => n * 2);                                ║
   * ║    // doubled.value === 10                                                ║
   * ║                                                                           ║
   * ║  Si el Result es fail(), map() no hace nada:                              ║
   * ║    const error = Result.fail(new Error('Boom'));                          ║
   * ║    const doubled = error.map(n => n * 2);                                 ║
   * ║    // doubled.error === Error('Boom') (sin cambios)                       ║
   * ║                                                                           ║
   * ║  Esto es COMPOSICIÓN - puedes encadenar transformaciones:                 ║
   * ║    Result.ok(5)                                                           ║
   * ║      .map(n => n * 2)    // 10                                            ║
   * ║      .map(n => n + 1)    // 11                                            ║
   * ║      .map(n => n.toString()) // "11"                                      ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isError()) {
      return Result.fail(this.error);
    }
    return Result.ok(fn(this.value));
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  TRANSFORMACIÓN: flatMap()                                                ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Como map(), pero la función retorna un Result.                           ║
   * ║                                                                           ║
   * ║  Úsalo cuando la transformación puede fallar:                             ║
   * ║                                                                           ║
   * ║    Result.ok('millo@laspalmas.com')                                       ║
   * ║      .flatMap(email => Email.create(email))                               ║
   * ║      .flatMap(email => User.create(email))                                ║
   * ║                                                                           ║
   * ║  Si CUALQUIER paso falla, todo el chain retorna Result.fail()             ║
   * ║  Esto es RAILWAY ORIENTED PROGRAMMING 🚂                                  ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isError()) {
      return Result.fail(this.error);
    }
    return fn(this.value);
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  UTILIDAD: getOrElse()                                                    ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Devuelve el valor si es ok(), o un valor por defecto si es error().      ║
   * ║                                                                           ║
   * ║  Uso:                                                                     ║
   * ║    const email = emailResult.getOrElse('unknown@example.com');            ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  getOrElse(defaultValue: T): T {
    if (this.isError()) {
      return defaultValue;
    }
    return this.value;
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  UTILIDAD: match()                                                        ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Pattern matching - maneja ambos casos en un solo lugar.                  ║
   * ║                                                                           ║
   * ║  Uso:                                                                     ║
   * ║    const message = result.match({                                         ║
   * ║      ok: (user) => `Usuario creado: ${user.email}`,                       ║
   * ║      error: (err) => `Error: ${err.message}`                              ║
   * ║    });                                                                    ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  match<U>(handlers: { ok: (value: T) => U; error: (error: E) => U }): U {
    if (this.isOk()) {
      return handlers.ok(this.value);
    }
    return handlers.error(this.error);
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 1                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • Result<T, E> es un contenedor de éxito o error                         ║
 * ║  • Result.ok(value) crea un resultado exitoso                             ║
 * ║  • Result.fail(error) crea un resultado fallido                           ║
 * ║  • isOk() e isError() verifican el estado                                 ║
 * ║  • map() y flatMap() permiten composición                                 ║
 * ║  • Los errores son VALORES, no excepciones                                ║
 * ║                                                                           ║
 * ║  EJEMPLO COMPLETO:                                                        ║
 * ║  ┌────────────────────────────────────────────────────────────────────┐   ║
 * ║  │ function divide(a: number, b: number): Result<number, string> {   │   ║
 * ║  │   if (b === 0) {                                                   │   ║
 * ║  │     return Result.fail('División por cero');                       │   ║
 * ║  │   }                                                                │   ║
 * ║  │   return Result.ok(a / b);                                         │   ║
 * ║  │ }                                                                  │   ║
 * ║  │                                                                    │   ║
 * ║  │ const result = divide(10, 2);                                      │   ║
 * ║  │ if (result.isOk()) {                                               │   ║
 * ║  │   console.log('Resultado:', result.value); // 5                    │   ║
 * ║  │ } else {                                                           │   ║
 * ║  │   console.log('Error:', result.error);                             │   ║
 * ║  │ }                                                                  │   ║
 * ║  └────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/domain/errors/DomainError.ts                           ║
 * ║     (Jerarquía de errores de dominio)                                     ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
