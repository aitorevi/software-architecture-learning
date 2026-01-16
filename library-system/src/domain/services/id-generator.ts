/**
 * IdGenerator Interface
 *
 * Define cómo generar IDs únicos.
 * La implementación real usará uuid, pero el dominio no lo sabe.
 *
 * ¿Por qué una interface para esto?
 * - El dominio no debe depender de librerías externas (como uuid)
 * - Permite usar IDs determinísticos en tests
 * - Facilita migración a otros formatos de ID
 */
export interface IdGenerator {
  generate(): string;
}
