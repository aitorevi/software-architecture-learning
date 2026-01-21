import { v4 as uuidv4 } from 'uuid';
import { IdGenerator } from '../kernel';

/**
 * UUID-based implementation of IdGenerator
 */
export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}
