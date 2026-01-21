import { SimpleId } from '@shared/kernel';

/**
 * TASK FEATURE - TaskId Value Object
 *
 * Feature-specific ID that prevents accidentally passing
 * a ProjectId or TagId where a TaskId is expected.
 */
export class TaskId extends SimpleId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): TaskId {
    return new TaskId(value);
  }
}
