/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ERROR HANDLING - PASO 2: DOMAIN ERRORS                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/domain/Result.ts                                       ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • ¿Qué es un Domain Error?                                            ║
 * ║     • ¿Cuál es la diferencia entre errores de dominio e infraestructura?  ║
 * ║     • ¿Cómo crear una jerarquía de errores útil?                          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 DOMAIN ERROR vs INFRASTRUCTURE ERROR                                  ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  DOMAIN ERROR (esperado, parte del negocio):                              ║
 * ║  • Email inválido                                                         ║
 * ║  • Password muy corto                                                     ║
 * ║  • Usuario ya existe                                                      ║
 * ║  • Términos no aceptados                                                  ║
 * ║  → Se MODELAN con Result.fail()                                           ║
 * ║  → HTTP 4xx (error del cliente)                                           ║
 * ║                                                                           ║
 * ║  INFRASTRUCTURE ERROR (inesperado, técnico):                              ║
 * ║  • Base de datos caída                                                    ║
 * ║  • Timeout de red                                                         ║
 * ║  • Disco lleno                                                            ║
 * ║  • OutOfMemory                                                            ║
 * ║  → Se LANZAN como exception                                               ║
 * ║  → HTTP 5xx (error del servidor)                                          ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Si es algo que ESPERAS que pase, es Domain Error.  ║
 * ║  Si es algo que NO debería pasar, es Infrastructure Error. ¿Clarito?"     ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * CLASE BASE: DomainError
 *
 * Todos los errores de dominio heredan de esta clase.
 *
 * Ventajas:
 * 1. Fácil distinguir errores de dominio de otros errores
 * 2. Puedes hacer instanceof DomainError
 * 3. Metadata común para todos los errores
 */
export abstract class DomainError extends Error {
  /**
   * El nombre del error (ej: "ValidationError", "UserAlreadyExistsError")
   */
  abstract override readonly name: string;

  /**
   * Metadata adicional que puede ser útil para logs o debugging
   */
  public readonly metadata: Record<string, unknown>;

  /**
   * Timestamp de cuándo ocurrió el error
   */
  public readonly timestamp: Date;

  constructor(message: string, metadata: Record<string, unknown> = {}) {
    super(message);

    // Esto es necesario en TypeScript para que instanceof funcione correctamente
    Object.setPrototypeOf(this, new.target.prototype);

    this.metadata = metadata;
    this.timestamp = new Date();

    // Capturar stack trace (útil para debugging)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializa el error a un objeto plano (útil para HTTP responses)
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  VALIDATION ERROR                                                         ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Error de validación de datos.                                            ║
 * ║                                                                           ║
 * ║  Ejemplos:                                                                ║
 * ║  • Email inválido                                                         ║
 * ║  • Password muy corto                                                     ║
 * ║  • Campo requerido vacío                                                  ║
 * ║                                                                           ║
 * ║  HTTP Status Code: 400 Bad Request                                        ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export class ValidationError extends DomainError {
  public readonly name = 'ValidationError';

  constructor(message: string, metadata: Record<string, unknown> = {}) {
    super(message, metadata);
  }

  /**
   * Factory method para crear errores de campo específicos
   */
  static forField(field: string, reason: string): ValidationError {
    return new ValidationError(`${field}: ${reason}`, { field, reason });
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  USER ALREADY EXISTS ERROR                                                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Error cuando intentas crear un usuario que ya existe.                    ║
 * ║                                                                           ║
 * ║  Esto NO es un error de validación (el email es válido).                  ║
 * ║  Es un error de ESTADO - el recurso ya existe.                            ║
 * ║                                                                           ║
 * ║  HTTP Status Code: 409 Conflict                                           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export class UserAlreadyExistsError extends DomainError {
  public readonly name = 'UserAlreadyExistsError';

  constructor(email: string) {
    super(`Ya existe un usuario con el email ${email}`, { email });
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  TERMS NOT ACCEPTED ERROR                                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Error cuando el usuario no acepta los términos y condiciones.            ║
 * ║                                                                           ║
 * ║  Esto es una regla de NEGOCIO - no puedes registrarte sin aceptar.        ║
 * ║                                                                           ║
 * ║  HTTP Status Code: 403 Forbidden                                          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export class TermsNotAcceptedError extends DomainError {
  public readonly name = 'TermsNotAcceptedError';

  constructor() {
    super('Debes aceptar los términos y condiciones para registrarte', {
      requiredField: 'acceptedTerms',
      expectedValue: true,
    });
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  USER NOT FOUND ERROR                                                     ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Error cuando buscas un usuario que no existe.                            ║
 * ║                                                                           ║
 * ║  HTTP Status Code: 404 Not Found                                          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
export class UserNotFoundError extends DomainError {
  public readonly name = 'UserNotFoundError';

  constructor(identifier: string) {
    super(`No se encontró el usuario ${identifier}`, { identifier });
  }
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 2                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • DomainError es la clase base para errores de negocio                   ║
 * ║  • ValidationError para validaciones (HTTP 400)                           ║
 * ║  • UserAlreadyExistsError para conflictos (HTTP 409)                      ║
 * ║  • TermsNotAcceptedError para reglas de negocio (HTTP 403)                ║
 * ║  • UserNotFoundError para recursos no encontrados (HTTP 404)              ║
 * ║                                                                           ║
 * ║  JERARQUÍA:                                                               ║
 * ║  ┌────────────────┐                                                       ║
 * ║  │  DomainError   │  (base)                                               ║
 * ║  └────────┬───────┘                                                       ║
 * ║           │                                                               ║
 * ║     ┌─────┴─────┬──────────────┬───────────────────┐                     ║
 * ║     │           │              │                   │                     ║
 * ║  ┌──▼────┐  ┌───▼─────┐  ┌────▼────────┐  ┌───────▼─────┐               ║
 * ║  │Valida │  │UserAlr  │  │TermsNotAcce │  │UserNotFound │               ║
 * ║  │tion   │  │eadyExis │  │pted         │  │             │               ║
 * ║  └───────┘  └─────────┘  └─────────────┘  └─────────────┘               ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/domain/value-objects/Email.ts                          ║
 * ║     (Value Object con validación usando Result)                           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
