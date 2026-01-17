/**
 * Email Value Object
 *
 * Encapsula y valida direcciones de correo electrónico.
 *
 * ¿Por qué un Value Object para Email?
 * - Garantiza que todos los emails en el sistema son válidos
 * - Evita strings arbitrarios donde esperamos un email
 * - Type safety: Email vs string
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    if (!Email.EMAIL_REGEX.test(value)) {
      throw new Error(`Invalid email format: ${value}`);
    }
  }

  static create(value: string): Email {
    return new Email(value.toLowerCase().trim());
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
