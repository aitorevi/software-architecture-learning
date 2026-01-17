/**
 * TASK FEATURE - Priority Value Object
 *
 * Tasks can have different priority levels.
 * Using an enum provides type safety.
 */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * Returns a numeric value for sorting (higher number = higher priority)
 */
export function priorityValue(priority: Priority): number {
  switch (priority) {
    case Priority.HIGH:
      return 3;
    case Priority.MEDIUM:
      return 2;
    case Priority.LOW:
      return 1;
  }
}
