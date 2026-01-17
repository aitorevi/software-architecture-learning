import { SimpleId } from '@shared/kernel';

/**
 * PROJECT FEATURE - ProjectId Value Object
 *
 * This ID is specific to the Projects feature.
 * By having feature-specific IDs, we prevent accidentally
 * passing a TaskId where a ProjectId is expected.
 *
 * This is type safety at the domain level:
 *   project.addTask(taskId)     // ✓ Correct
 *   project.addTask(projectId)  // ✗ Compile error!
 */
export class ProjectId extends SimpleId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): ProjectId {
    return new ProjectId(value);
  }
}
