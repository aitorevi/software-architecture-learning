/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ERROR HANDLING - PASO 3: EMAIL VALUE OBJECT                              ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/domain/errors/DomainError.ts                           ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • ¿Cómo validar en un Value Object con Result?                        ║
 * ║     • ¿Por qué el constructor es privado?                                 ║
 * ║     • Fail Fast - validar en el boundary                                  ║
 * ║                                                                           ║
 * ║  ⭐ AQUÍ VES RESULT EN ACCIÓN ⭐                                          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { Result } from '../Result.js';
import { ValidationError } from '../errors/DomainError.js';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 EMAIL VALUE OBJECT                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  El Email es un VALUE OBJECT - un objeto pequeño que:                     ║
 * ║                                                                           ║
 * ║  1. Es INMUTABLE (no cambia después de crearse)                           ║
 * ║  2. Se compara por VALOR (no por referencia)                              ║
 * ║  3. Es VÁLIDO siempre (imposible crear uno inválido)                      ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Si tienes un Email, es válido. Punto.              ║
 * ║  No necesitas validar después. La validación ya pasó en create()."        ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export class Email {
  /**
   * CONSTRUCTOR PRIVADO
   *
   * ¿Por qué privado? Para OBLIGAR a usar el factory method create().
   *
   * Esto garantiza que NUNCA puedes crear un Email inválido.
   * Si tienes un Email, es válido. Siempre.
   *
   * ❌ new Email('basura') → NO COMPILA (constructor privado)
   * ✅ Email.create('millo@laspalmas.com') → Result<Email, ValidationError>
   */
  private constructor(private readonly value: string) {}

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  FACTORY METHOD: create()                                                 ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Este es el ÚNICO lugar donde validamos el email.                         ║
   * ║                                                                           ║
   * ║  Si pasa todas las validaciones → Result.ok(email)                        ║
   * ║  Si falla alguna validación → Result.fail(error)                          ║
   * ║                                                                           ║
   * ║  Esto es FAIL FAST - validamos en el boundary (entrada del dominio).      ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   *
   * Uso:
   *   const emailResult = Email.create('millo@laspalmas.com');
   *
   *   if (emailResult.isOk()) {
   *     // emailResult.value es Email - GARANTIZADO válido
   *     const user = new User(emailResult.value);
   *   } else {
   *     // emailResult.error es ValidationError
   *     console.log(emailResult.error.message);
   *   }
   */
  static create(value: string): Result<Email, ValidationError> {
    // Validación 1: No puede estar vacío
    if (!value || value.trim().length === 0) {
      return Result.fail(
        ValidationError.forField('email', 'no puede estar vacío')
      );
    }

    // Limpiamos espacios
    const trimmedValue = value.trim();

    // Validación 2: Debe contener @
    if (!trimmedValue.includes('@')) {
      return Result.fail(
        ValidationError.forField('email', 'debe contener @')
      );
    }

    // Validación 3: Formato básico user@domain
    const parts = trimmedValue.split('@');
    if (parts.length !== 2) {
      return Result.fail(
        ValidationError.forField('email', 'formato inválido')
      );
    }

    const [localPart, domainPart] = parts;

    // Validación 4: Parte local no vacía
    if (localPart.length === 0) {
      return Result.fail(
        ValidationError.forField('email', 'parte local no puede estar vacía')
      );
    }

    // Validación 5: Dominio no vacío
    if (domainPart.length === 0) {
      return Result.fail(
        ValidationError.forField('email', 'dominio no puede estar vacío')
      );
    }

    // Validación 6: Dominio debe tener al menos un punto
    if (!domainPart.includes('.')) {
      return Result.fail(
        ValidationError.forField('email', 'dominio debe tener extensión (ej: .com)')
      );
    }

    // Validación 7: No puede empezar o terminar con punto
    if (trimmedValue.startsWith('.') || trimmedValue.endsWith('.')) {
      return Result.fail(
        ValidationError.forField('email', 'no puede empezar o terminar con punto')
      );
    }

    // ✅ Todas las validaciones pasaron - crear Email
    return Result.ok(new Email(trimmedValue.toLowerCase()));
  }

  /**
   * ╔═══════════════════════════════════════════════════════════════════════════╗
   * ║  EQUALITY: equals()                                                       ║
   * ╠═══════════════════════════════════════════════════════════════════════════╣
   * ║                                                                           ║
   * ║  Los Value Objects se comparan por VALOR, no por referencia.              ║
   * ║                                                                           ║
   * ║  Ejemplo:                                                                 ║
   * ║    const email1 = Email.create('millo@laspalmas.com').value;              ║
   * ║    const email2 = Email.create('millo@laspalmas.com').value;              ║
   * ║    email1 === email2        // false (referencias diferentes)             ║
   * ║    email1.equals(email2)    // true (mismo valor)                         ║
   * ║                                                                           ║
   * ╚═══════════════════════════════════════════════════════════════════════════╝
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Devuelve el valor como string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Getter para acceder al valor (útil para serialización)
   */
  getValue(): string {
    return this.value;
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 3                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • Value Object con constructor PRIVADO                                   ║
 * ║  • Factory method create() que retorna Result<Email, ValidationError>     ║
 * ║  • Validación FAIL FAST en el boundary                                    ║
 * ║  • Si tienes un Email, es válido (imposible crear uno inválido)           ║
 * ║  • Value Objects se comparan por valor, no por referencia                 ║
 * ║                                                                           ║
 * ║  GARANTÍAS:                                                               ║
 * ║  ┌────────────────────────────────────────────────────────────────────┐   ║
 * ║  │ function registerUser(email: Email) {                              │   ║
 * ║  │   // ✅ email es válido - no necesitas validar de nuevo            │   ║
 * ║  │   // ✅ email tiene @ - garantizado                                │   ║
 * ║  │   // ✅ email tiene dominio - garantizado                          │   ║
 * ║  │ }                                                                  │   ║
 * ║  │                                                                    │   ║
 * ║  │ // Para llamar a registerUser:                                     │   ║
 * ║  │ const emailResult = Email.create(rawEmail);                        │   ║
 * ║  │ if (emailResult.isOk()) {                                          │   ║
 * ║  │   registerUser(emailResult.value); // Seguro                       │   ║
 * ║  │ }                                                                  │   ║
 * ║  └────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/domain/value-objects/Password.ts                       ║
 * ║     (Otro Value Object con validación más compleja)                       ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
