import { TaskId, TaskRepository, TaskNotFoundError } from '../domain';
import { TaskResponse, toTaskResponse } from './CreateTaskUseCase';

export interface GetTaskQuery {
  taskId: string;
}

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(query: GetTaskQuery): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(
      TaskId.create(query.taskId)
    );

    if (!task) {
      throw new TaskNotFoundError(query.taskId);
    }

    return toTaskResponse(task);
  }
}
