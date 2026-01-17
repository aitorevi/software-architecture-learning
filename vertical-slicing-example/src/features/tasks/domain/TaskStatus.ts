/**
 * TASK FEATURE - TaskStatus Value Object
 *
 * Represents the lifecycle states of a task.
 * Using an enum provides type safety and auto-completion.
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

/**
 * Valid state transitions for tasks.
 * This is a simple state machine that prevents invalid transitions.
 *
 * TODO -> IN_PROGRESS -> DONE
 *   ^                      |
 *   +----------------------+ (reopen)
 */
export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.DONE],
  [TaskStatus.DONE]: [TaskStatus.TODO], // Can reopen a completed task
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
