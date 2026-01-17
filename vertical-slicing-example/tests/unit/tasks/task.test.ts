import { describe, it, expect, beforeEach } from 'vitest';
import {
  Task,
  TaskId,
  TaskStatus,
  Priority,
  TaskValidationError,
  TaskCreatedEvent,
  TaskCompletedEvent,
} from '../../../src/features/tasks/domain';

describe('Task Entity', () => {
  describe('create', () => {
    it('should create a task with valid data', () => {
      const task = Task.create({
        id: TaskId.create('task-1'),
        projectId: 'project-1',
        title: 'My Task',
        description: 'A test task',
      });

      expect(task.title).toBe('My Task');
      expect(task.description).toBe('A test task');
      expect(task.projectId).toBe('project-1');
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.priority).toBe(Priority.MEDIUM);
    });

    it('should emit TaskCreatedEvent when created', () => {
      const task = Task.create({
        id: TaskId.create('task-1'),
        projectId: 'project-1',
        title: 'My Task',
      });

      const events = task.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TaskCreatedEvent);
    });

    it('should throw error for empty title', () => {
      expect(() =>
        Task.create({
          id: TaskId.create('task-1'),
          projectId: 'project-1',
          title: '',
        })
      ).toThrow(TaskValidationError);
    });

    it('should throw error for title exceeding 200 characters', () => {
      const longTitle = 'a'.repeat(201);
      expect(() =>
        Task.create({
          id: TaskId.create('task-1'),
          projectId: 'project-1',
          title: longTitle,
        })
      ).toThrow(TaskValidationError);
    });
  });

  describe('status transitions', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create({
        id: TaskId.create('task-1'),
        projectId: 'project-1',
        title: 'My Task',
      });
      task.pullDomainEvents(); // Clear creation event
    });

    it('should start a task (TODO -> IN_PROGRESS)', () => {
      task.start();
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should complete a task (IN_PROGRESS -> DONE)', () => {
      task.start();
      task.complete();
      expect(task.status).toBe(TaskStatus.DONE);
      expect(task.isCompleted).toBe(true);
      expect(task.completedAt).not.toBeNull();
    });

    it('should emit TaskCompletedEvent when completed', () => {
      task.start();
      task.pullDomainEvents(); // Clear start event
      task.complete();
      const events = task.pullDomainEvents();
      expect(events.some((e) => e instanceof TaskCompletedEvent)).toBe(true);
    });

    it('should reopen a completed task (DONE -> TODO)', () => {
      task.start();
      task.complete();
      task.reopen();
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.completedAt).toBeNull();
    });

    it('should not allow invalid transitions', () => {
      // Cannot go directly from TODO to DONE
      expect(() => task.complete()).toThrow(TaskValidationError);
    });
  });

  describe('tags', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create({
        id: TaskId.create('task-1'),
        projectId: 'project-1',
        title: 'My Task',
      });
    });

    it('should add a tag', () => {
      task.addTag('tag-1');
      expect(task.tagIds).toContain('tag-1');
    });

    it('should not add duplicate tag', () => {
      task.addTag('tag-1');
      task.addTag('tag-1');
      expect(task.tagIds.filter((id) => id === 'tag-1')).toHaveLength(1);
    });

    it('should remove a tag', () => {
      task.addTag('tag-1');
      task.removeTag('tag-1');
      expect(task.tagIds).not.toContain('tag-1');
    });
  });
});
