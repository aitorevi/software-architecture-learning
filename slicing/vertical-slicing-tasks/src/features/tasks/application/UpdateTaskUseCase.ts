import {
  TaskId,
  TaskRepository,
  TaskNotFoundError,
  Priority,
} from '../domain';
import { TaskResponse, toTaskResponse } from './CreateTaskUseCase';

export interface UpdateTaskCommand {
  taskId: string;
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null; // ISO date string, null to clear
}

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: UpdateTaskCommand): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(
      TaskId.create(command.taskId)
    );

    if (!task) {
      throw new TaskNotFoundError(command.taskId);
    }

    task.update({
      title: command.title,
      description: command.description,
      priority: command.priority,
      dueDate:
        command.dueDate === null
          ? null
          : command.dueDate
            ? new Date(command.dueDate)
            : undefined,
    });

    await this.taskRepository.save(task);

    return toTaskResponse(task);
  }
}
