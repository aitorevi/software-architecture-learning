/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  USER ID - VALUE OBJECT                                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  El UserId es un Value Object simple que encapsula un UUID.               ║
 * ║                                                                           ║
 * ║  ¿Por qué no usar string directamente?                                    ║
 * ║  • Type safety - no confundes UserId con TaskId o PostId                  ║
 * ║  • Validación centralizada - solo se pueden crear UUIDs válidos           ║
 * ║  • Semántica clara - es un ID de usuario, no un string cualquiera         ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { Result } from './Result.js';
import { ValidationError } from './errors/DomainError.js';

export class UserId {
  private constructor(private readonly value: string) {}

  /**
   * Crea un UserId a partir de un string
   */
  static create(value: string): Result<UserId, ValidationError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(
        ValidationError.forField('userId', 'no puede estar vacío')
      );
    }

    // Validación básica de UUID v4
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(value)) {
      return Result.fail(
        ValidationError.forField('userId', 'debe ser un UUID válido')
      );
    }

    return Result.ok(new UserId(value));
  }

  /**
   * Genera un nuevo UserId aleatorio
   */
  static generate(): UserId {
    // Genera un UUID v4 simple
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );

    // Usamos Result.ok().value porque sabemos que es válido
    return UserId.create(uuid).value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}
