/**
 * Base class for all domain exceptions.
 *
 * ¿Por qué excepciones de dominio personalizadas?
 * - Expresan conceptos del negocio
 * - Permiten catch específico por tipo de error
 * - Llevan información contextual del error
 * - Separan errores de negocio de errores técnicos
 */
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
