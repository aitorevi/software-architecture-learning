import { TaskRepository, TaskStatus } from '../domain';
import { TaskResponse, toTaskResponse } from './CreateTaskUseCase';

/**
 * TASK FEATURE - List Tasks Use Case
 *
 * Provides various ways to list tasks:
 * - By project
 * - By status
 * - Overdue tasks
 *
 * Each query is a separate method to keep the interface clear.
 */

export interface ListTasksByProjectQuery {
  projectId: string;
}

export interface ListTasksByStatusQuery {
  status: TaskStatus;
}

export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async byProject(query: ListTasksByProjectQuery): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.findByProjectId(query.projectId);
    return tasks.map(toTaskResponse);
  }

  async byStatus(query: ListTasksByStatusQuery): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.findByStatus(query.status);
    return tasks.map(toTaskResponse);
  }

  async overdue(): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.findOverdue();
    return tasks.map(toTaskResponse);
  }
}
