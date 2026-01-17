import {
  TaskId,
  TaskRepository,
  TaskNotFoundError,
  TaskStatus,
} from '../domain';
import { TaskResponse, toTaskResponse } from './CreateTaskUseCase';

/**
 * TASK FEATURE - Update Task Status Use Case
 *
 * Separate use case for status changes because:
 * 1. Status changes have specific business rules (state machine)
 * 2. Status changes emit specific domain events
 * 3. Status changes might trigger notifications/integrations
 *
 * Keeping this separate from general updates makes the intent clear.
 */

export interface UpdateTaskStatusCommand {
  taskId: string;
  status: TaskStatus;
}

export class UpdateTaskStatusUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: UpdateTaskStatusCommand): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(
      TaskId.create(command.taskId)
    );

    if (!task) {
      throw new TaskNotFoundError(command.taskId);
    }

    task.changeStatus(command.status);
    await this.taskRepository.save(task);

    return toTaskResponse(task);
  }
}

// Convenience use cases for common status changes

export interface TaskIdCommand {
  taskId: string;
}

export class StartTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: TaskIdCommand): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(
      TaskId.create(command.taskId)
    );

    if (!task) {
      throw new TaskNotFoundError(command.taskId);
    }

    task.start();
    await this.taskRepository.save(task);

    return toTaskResponse(task);
  }
}

export class CompleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: TaskIdCommand): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(
      TaskId.create(command.taskId)
    );

    if (!task) {
      throw new TaskNotFoundError(command.taskId);
    }

    task.complete();
    await this.taskRepository.save(task);

    return toTaskResponse(task);
  }
}

export class ReopenTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: TaskIdCommand): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(
      TaskId.create(command.taskId)
    );

    if (!task) {
      throw new TaskNotFoundError(command.taskId);
    }

    task.reopen();
    await this.taskRepository.save(task);

    return toTaskResponse(task);
  }
}
