import { IdGenerator } from '@shared/kernel';
import {
  Task,
  TaskId,
  TaskRepository,
  Priority,
  TaskStatus,
} from '../domain';

/**
 * TASK FEATURE - Create Task Use Case
 *
 * Creates a new task within a project.
 *
 * Note: In a real app, we might validate that the projectId exists.
 * This could be done by:
 * 1. Querying the Projects feature (tighter coupling)
 * 2. Eventual consistency - handle "orphan" tasks gracefully
 *
 * For this example, we trust the caller provides a valid projectId.
 */

export interface CreateTaskCommand {
  projectId: string;
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string; // ISO date string
}

export interface TaskResponse {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  tagIds: string[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  isOverdue: boolean;
}

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: CreateTaskCommand): Promise<TaskResponse> {
    const task = Task.create({
      id: TaskId.create(this.idGenerator.generate()),
      projectId: command.projectId,
      title: command.title,
      description: command.description,
      priority: command.priority,
      dueDate: command.dueDate ? new Date(command.dueDate) : undefined,
    });

    await this.taskRepository.save(task);

    return toTaskResponse(task);
  }
}

// Shared response mapper
export function toTaskResponse(task: Task): TaskResponse {
  return {
    id: task.id.value,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    tagIds: task.tagIds,
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
    isOverdue: task.isOverdue,
  };
}
