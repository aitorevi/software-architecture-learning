/**
 * TASK FEATURE - Public API
 *
 * Exports what other features and the main app need.
 */

// Domain exports
export { TaskId } from './domain';
export { TaskStatus, Priority } from './domain';
export {
  TaskCreatedEvent,
  TaskCompletedEvent,
  TaskStatusChangedEvent,
} from './domain';

// Application exports
export {
  CreateTaskUseCase,
  CreateTaskCommand,
  TaskResponse,
  GetTaskUseCase,
  GetTaskQuery,
  ListTasksUseCase,
  ListTasksByProjectQuery,
  ListTasksByStatusQuery,
  UpdateTaskUseCase,
  UpdateTaskCommand,
  UpdateTaskStatusUseCase,
  UpdateTaskStatusCommand,
  StartTaskUseCase,
  CompleteTaskUseCase,
  ReopenTaskUseCase,
  TaskIdCommand,
  AddTagToTaskUseCase,
  RemoveTagFromTaskUseCase,
  AddTagToTaskCommand,
  RemoveTagFromTaskCommand,
  DeleteTaskUseCase,
  DeleteTaskCommand,
} from './application';

// Infrastructure exports
export { InMemoryTaskRepository, TaskController } from './infrastructure';

// Re-export repository interface
export { TaskRepository } from './domain';
