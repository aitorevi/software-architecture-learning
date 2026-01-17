import { TaskId, TaskRepository, TaskNotFoundError } from '../domain';

export interface DeleteTaskCommand {
  taskId: string;
}

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    const task = await this.taskRepository.findById(
      TaskId.create(command.taskId)
    );

    if (!task) {
      throw new TaskNotFoundError(command.taskId);
    }

    await this.taskRepository.delete(TaskId.create(command.taskId));
  }
}
