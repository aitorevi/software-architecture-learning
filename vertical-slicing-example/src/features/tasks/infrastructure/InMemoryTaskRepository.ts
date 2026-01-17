import {
  Task,
  TaskId,
  TaskRepository,
  TaskProps,
  TaskStatus,
} from '../domain';

/**
 * TASK FEATURE - In-Memory Repository Implementation
 */
export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, TaskProps> = new Map();

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id.value, {
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      tagIds: [...task.tagIds],
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    });
  }

  async findById(id: TaskId): Promise<Task | null> {
    const data = this.tasks.get(id.value);
    if (!data) {
      return null;
    }
    return Task.reconstitute(data);
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((data) => data.projectId === projectId)
      .map((data) => Task.reconstitute(data));
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((data) => data.status === status)
      .map((data) => Task.reconstitute(data));
  }

  async findByTagId(tagId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((data) => data.tagIds.includes(tagId))
      .map((data) => Task.reconstitute(data));
  }

  async findOverdue(): Promise<Task[]> {
    const now = new Date();
    return Array.from(this.tasks.values())
      .filter(
        (data) =>
          data.dueDate !== null &&
          data.dueDate < now &&
          data.status !== TaskStatus.DONE
      )
      .map((data) => Task.reconstitute(data));
  }

  async delete(id: TaskId): Promise<void> {
    this.tasks.delete(id.value);
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    for (const [id, data] of this.tasks.entries()) {
      if (data.projectId === projectId) {
        this.tasks.delete(id);
      }
    }
  }

  // === Test Helpers ===

  clear(): void {
    this.tasks.clear();
  }

  count(): number {
    return this.tasks.size;
  }
}
