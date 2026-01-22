/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ERROR HANDLING - PASO 4: PASSWORD VALUE OBJECT                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/domain/value-objects/Email.ts                          ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Validaciones más complejas con Result                               ║
 * ║     • Cómo retornar el PRIMER error encontrado                            ║
 * ║     • Reglas de negocio en Value Objects                                  ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { Result } from '../Result.js';
import { ValidationError } from '../errors/DomainError.js';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 PASSWORD VALUE OBJECT                                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  El Password tiene validaciones más COMPLEJAS que el Email:                ║
 * ║                                                                           ║
 * ║  • Longitud mínima                                                        ║
 * ║  • Al menos una mayúscula                                                 ║
 * ║  • Al menos una minúscula                                                 ║
 * ║  • Al menos un número                                                     ║
 * ║  • Al menos un carácter especial                                          ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Mira tú, aquí ves cómo validaciones complejas      ║
 * ║  se manejan con Result. Si falla una, ya retornamos. Fail Fast."          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export class Password {
  /**
   * Reglas de negocio para passwords
   */
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 100;

  /**
   * CONSTRUCTOR PRIVADO
   *
   * El valor se almacena como string.
   * En producción, aquí probablemente tendrías el HASH del password,
   * no el password en texto plano.
   *
   * Pero para este ejemplo pedagógico, lo dejamos como string.
   */
  private constructor(private readonly value: string) {}

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  FACTORY METHOD: create()                                                 ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Validaciones múltiples.                                                  ║
   * ║                                                                           ║
   * ║  Fíjate cómo retornamos INMEDIATAMENTE al encontrar un error.             ║
   * ║  No acumulamos errores - retornamos el PRIMERO (Fail Fast).               ║
   * ║                                                                           ║
   * ║  ¿Por qué? Porque queremos que el usuario corrija UN problema a la vez.   ║
   * ║  Si le tiras 5 errores a la vez, se abruma.                               ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  static create(value: string): Result<Password, ValidationError> {
    // Validación 1: No puede estar vacío
    if (!value || value.trim().length === 0) {
      return Result.fail(
        ValidationError.forField('password', 'no puede estar vacío')
      );
    }

    // Validación 2: Longitud mínima
    if (value.length < this.MIN_LENGTH) {
      return Result.fail(
        ValidationError.forField(
          'password',
          `debe tener al menos ${this.MIN_LENGTH} caracteres`
        )
      );
    }

    // Validación 3: Longitud máxima
    if (value.length > this.MAX_LENGTH) {
      return Result.fail(
        ValidationError.forField(
          'password',
          `no puede tener más de ${this.MAX_LENGTH} caracteres`
        )
      );
    }

    // Validación 4: Al menos una mayúscula
    if (!/[A-Z]/.test(value)) {
      return Result.fail(
        ValidationError.forField(
          'password',
          'debe contener al menos una letra mayúscula'
        )
      );
    }

    // Validación 5: Al menos una minúscula
    if (!/[a-z]/.test(value)) {
      return Result.fail(
        ValidationError.forField(
          'password',
          'debe contener al menos una letra minúscula'
        )
      );
    }

    // Validación 6: Al menos un número
    if (!/\d/.test(value)) {
      return Result.fail(
        ValidationError.forField(
          'password',
          'debe contener al menos un número'
        )
      );
    }

    // Validación 7: Al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return Result.fail(
        ValidationError.forField(
          'password',
          'debe contener al menos un carácter especial (!@#$%^&*...)'
        )
      );
    }

    // ✅ Todas las validaciones pasaron - crear Password
    return Result.ok(new Password(value));
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  VERIFICACIÓN: matches()                                                  ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Verifica si un password en texto plano coincide con este Password.       ║
   * ║                                                                           ║
   * ║  En producción, esto sería:                                               ║
   * ║    bcrypt.compare(plainTextPassword, this.hashedValue)                    ║
   * ║                                                                           ║
   * ║  Pero para el ejemplo, lo hacemos simple.                                 ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  matches(plainTextPassword: string): boolean {
    return this.value === plainTextPassword;
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  FORTALEZA: getStrength()                                                 ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Calcula la fortaleza del password.                                       ║
   * ║                                                                           ║
   * ║  Esto es un ejemplo de LÓGICA DE DOMINIO en el Value Object.              ║
   * ║  No es solo almacenamiento - tiene comportamiento útil.                   ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  getStrength(): 'weak' | 'medium' | 'strong' {
    let score = 0;

    // Puntos por longitud
    if (this.value.length >= 12) score += 2;
    else if (this.value.length >= 10) score += 1;

    // Puntos por variedad de caracteres
    if (/[A-Z]/.test(this.value)) score += 1;
    if (/[a-z]/.test(this.value)) score += 1;
    if (/\d/.test(this.value)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(this.value)) score += 1;

    // Puntos por caracteres repetidos (resta puntos)
    const uniqueChars = new Set(this.value).size;
    if (uniqueChars < this.value.length * 0.5) score -= 1;

    // Clasificar
    if (score >= 5) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
  }

  /**
   * Equality
   */
  equals(other: Password): boolean {
    return this.value === other.value;
  }

  /**
   * NO exponemos getValue() para passwords.
   *
   * ¿Por qué? Porque queremos minimizar la exposición del password
   * en texto plano. Solo lo exponemos cuando realmente es necesario.
   *
   * En producción, probablemente ni siquiera almacenarías el valor,
   * solo el hash.
   */
  toString(): string {
    return '********'; // Nunca expongas el password real
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 4                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • Validaciones múltiples con Result                                      ║
 * ║  • Fail Fast - retornar el PRIMER error encontrado                        ║
 * ║  • Value Objects pueden tener COMPORTAMIENTO (getStrength)                ║
 * ║  • Reglas de negocio como constantes (MIN_LENGTH, MAX_LENGTH)             ║
 * ║  • Seguridad - no expongas passwords en texto plano                       ║
 * ║                                                                           ║
 * ║  COMPARACIÓN CON EMAIL:                                                   ║
 * ║  ┌────────────────────────────────────────────────────────────────────┐   ║
 * ║  │ Email                         Password                            │   ║
 * ║  │ • Validaciones simples        • Validaciones complejas            │   ║
 * ║  │ • Sin comportamiento extra    • getStrength(), matches()          │   ║
 * ║  │ • getValue() público          • getValue() NO expuesto            │   ║
 * ║  │ • toString() muestra valor    • toString() muestra ********       │   ║
 * ║  └────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║  PATRON COMÚN:                                                            ║
 * ║  ┌────────────────────────────────────────────────────────────────────┐   ║
 * ║  │ const emailResult = Email.create(rawEmail);                        │   ║
 * ║  │ if (emailResult.isError()) {                                       │   ║
 * ║  │   return Result.fail(emailResult.error); // Propagar error         │   ║
 * ║  │ }                                                                  │   ║
 * ║  │                                                                    │   ║
 * ║  │ const passwordResult = Password.create(rawPassword);               │   ║
 * ║  │ if (passwordResult.isError()) {                                    │   ║
 * ║  │   return Result.fail(passwordResult.error); // Propagar error      │   ║
 * ║  │ }                                                                  │   ║
 * ║  │                                                                    │   ║
 * ║  │ // Aquí ambos son válidos - continuar                              │   ║
 * ║  │ const user = new User(emailResult.value, passwordResult.value);    │   ║
 * ║  └────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/domain/User.ts                                         ║
 * ║     (Aggregate Root que usa Value Objects ya validados)                   ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
