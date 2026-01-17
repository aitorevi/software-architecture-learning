import { Task } from './Task';
import { TaskId } from './TaskId';
import { TaskStatus } from './TaskStatus';

/**
 * TASK FEATURE - Repository Interface (Port)
 *
 * Task-specific repository with queries tailored to task management needs.
 * Notice the project-specific queries - this is the advantage of
 * feature-specific repositories.
 */
export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByTagId(tagId: string): Promise<Task[]>;
  findOverdue(): Promise<Task[]>;
  delete(id: TaskId): Promise<void>;
  deleteByProjectId(projectId: string): Promise<void>;
}
