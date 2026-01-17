import { TaskId, TaskRepository, TaskNotFoundError } from '../domain';
import { TaskResponse, toTaskResponse } from './CreateTaskUseCase';

/**
 * TASK FEATURE - Manage Task Tags Use Case
 *
 * Handles adding and removing tags from tasks.
 *
 * VERTICAL SLICING KEY CONCEPT:
 * Notice we only store tagIds (strings), not Tag entities.
 * The Tasks feature doesn't depend on the Tags feature's domain.
 *
 * This keeps features loosely coupled:
 * - Tasks can have tagIds even if the Tags feature is disabled
 * - Tag validation happens in the Tags feature, not here
 */

export interface AddTagToTaskCommand {
  taskId: string;
  tagId: string;
}

export interface RemoveTagFromTaskCommand {
  taskId: string;
  tagId: string;
}

export class AddTagToTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: AddTagToTaskCommand): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(
      TaskId.create(command.taskId)
    );

    if (!task) {
      throw new TaskNotFoundError(command.taskId);
    }

    task.addTag(command.tagId);
    await this.taskRepository.save(task);

    return toTaskResponse(task);
  }
}

export class RemoveTagFromTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: RemoveTagFromTaskCommand): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(
      TaskId.create(command.taskId)
    );

    if (!task) {
      throw new TaskNotFoundError(command.taskId);
    }

    task.removeTag(command.tagId);
    await this.taskRepository.save(task);

    return toTaskResponse(task);
  }
}
