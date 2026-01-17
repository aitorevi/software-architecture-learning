import { IdGenerator } from '../../../src/domain';

/**
 * FakeIdGenerator para tests
 *
 * Genera IDs predecibles para testing
 */
export class FakeIdGenerator implements IdGenerator {
  private counter = 0;
  private prefix: string;

  constructor(prefix: string = 'test') {
    this.prefix = prefix;
  }

  generate(): string {
    this.counter++;
    return `${this.prefix}-${this.counter}`;
  }

  reset(): void {
    this.counter = 0;
  }
}
