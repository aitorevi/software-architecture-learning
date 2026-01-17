import { v4 as uuidv4 } from 'uuid';
import { IdGenerator } from '../../../domain';

/**
 * UuidIdGenerator
 *
 * Implementación de IdGenerator usando UUID v4.
 *
 * ¿Por qué la interface IdGenerator está en el dominio?
 * - El dominio necesita generar IDs
 * - Pero no quiere depender de la librería uuid
 * - Esta implementación en infraestructura hace el "puente"
 */
export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}
