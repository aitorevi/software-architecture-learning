import { Entity, DomainEvent } from '@shared/kernel';
import { TaskId } from './TaskId';
import { TaskStatus, canTransition } from './TaskStatus';
import { Priority } from './Priority';

/**
 * TASK FEATURE - Task Entity
 *
 * VERTICAL SLICING KEY CONCEPT:
 * Notice how Task references a projectId (string) instead of importing
 * the Project entity directly. This keeps features loosely coupled.
 *
 * Cross-feature references use IDs, not direct entity references.
 * This is a key principle for maintaining feature independence.
 */

export interface TaskProps {
  id: TaskId;
  projectId: string; // Reference to Project by ID, not by entity
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  tagIds: string[]; // References to Tags by ID
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

// === Domain Events ===

export class TaskCreatedEvent implements DomainEvent {
  readonly eventName = 'task.created';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly title: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}

export class TaskCompletedEvent implements DomainEvent {
  readonly eventName = 'task.completed';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly taskId: string,
    public readonly projectId: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}

export class TaskStatusChangedEvent implements DomainEvent {
  readonly eventName = 'task.status_changed';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly taskId: string,
    public readonly fromStatus: TaskStatus,
    public readonly toStatus: TaskStatus
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}

/**
 * Task - The aggregate root for the Tasks feature
 *
 * Business Rules:
 * - Task title cannot be empty
 * - Task title must be at most 200 characters
 * - Status transitions must follow valid state machine
 * - Due date must be in the future when set
 * - A task belongs to exactly one project
 */
export class Task extends Entity<TaskId> {
  private props: Omit<TaskProps, 'id'>;

  private constructor(id: TaskId, props: Omit<TaskProps, 'id'>) {
    super(id);
    this.props = props;
  }

  // === Factory Methods ===

  static create(params: {
    id: TaskId;
    projectId: string;
    title: string;
    description?: string;
    priority?: Priority;
    dueDate?: Date;
  }): Task {
    Task.validateTitle(params.title);
    if (params.dueDate) {
      Task.validateDueDate(params.dueDate);
    }

    const now = new Date();
    const task = new Task(params.id, {
      projectId: params.projectId,
      title: params.title.trim(),
      description: params.description?.trim() ?? '',
      status: TaskStatus.TODO,
      priority: params.priority ?? Priority.MEDIUM,
      tagIds: [],
      dueDate: params.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    });

    task.addDomainEvent(
      new TaskCreatedEvent(params.id.value, params.projectId, params.title)
    );

    return task;
  }

  static reconstitute(props: TaskProps): Task {
    return new Task(props.id, {
      projectId: props.projectId,
      title: props.title,
      description: props.description,
      status: props.status,
      priority: props.priority,
      tagIds: [...props.tagIds],
      dueDate: props.dueDate,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      completedAt: props.completedAt,
    });
  }

  // === Validation ===

  private static validateTitle(title: string): void {
    if (!title || title.trim() === '') {
      throw new TaskValidationError('Task title cannot be empty');
    }
    if (title.length > 200) {
      throw new TaskValidationError('Task title must be at most 200 characters');
    }
  }

  private static validateDueDate(dueDate: Date): void {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < now) {
      throw new TaskValidationError('Due date cannot be in the past');
    }
  }

  // === Getters ===

  get projectId(): string {
    return this.props.projectId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get priority(): Priority {
    return this.props.priority;
  }

  get tagIds(): string[] {
    return [...this.props.tagIds];
  }

  get dueDate(): Date | null {
    return this.props.dueDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get isCompleted(): boolean {
    return this.props.status === TaskStatus.DONE;
  }

  get isOverdue(): boolean {
    if (!this.props.dueDate || this.isCompleted) {
      return false;
    }
    return new Date() > this.props.dueDate;
  }

  // === Behavior Methods ===

  /**
   * Changes the task status following valid transitions.
   */
  changeStatus(newStatus: TaskStatus): void {
    if (this.props.status === newStatus) {
      return; // No change needed
    }

    if (!canTransition(this.props.status, newStatus)) {
      throw new TaskValidationError(
        `Cannot transition from ${this.props.status} to ${newStatus}`
      );
    }

    const previousStatus = this.props.status;
    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    // Track completion time
    if (newStatus === TaskStatus.DONE) {
      this.props.completedAt = new Date();
      this.addDomainEvent(
        new TaskCompletedEvent(this.id.value, this.props.projectId)
      );
    } else if (previousStatus === TaskStatus.DONE) {
      this.props.completedAt = null; // Reopened
    }

    this.addDomainEvent(
      new TaskStatusChangedEvent(this.id.value, previousStatus, newStatus)
    );
  }

  /**
   * Starts working on the task (TODO -> IN_PROGRESS)
   */
  start(): void {
    this.changeStatus(TaskStatus.IN_PROGRESS);
  }

  /**
   * Marks the task as done
   */
  complete(): void {
    this.changeStatus(TaskStatus.DONE);
  }

  /**
   * Reopens a completed task
   */
  reopen(): void {
    this.changeStatus(TaskStatus.TODO);
  }

  /**
   * Updates task details (title, description, priority, dueDate)
   */
  update(params: {
    title?: string;
    description?: string;
    priority?: Priority;
    dueDate?: Date | null;
  }): void {
    if (params.title !== undefined) {
      Task.validateTitle(params.title);
      this.props.title = params.title.trim();
    }

    if (params.description !== undefined) {
      this.props.description = params.description.trim();
    }

    if (params.priority !== undefined) {
      this.props.priority = params.priority;
    }

    if (params.dueDate !== undefined) {
      if (params.dueDate !== null) {
        Task.validateDueDate(params.dueDate);
      }
      this.props.dueDate = params.dueDate;
    }

    this.props.updatedAt = new Date();
  }

  /**
   * Adds a tag to the task
   */
  addTag(tagId: string): void {
    if (!this.props.tagIds.includes(tagId)) {
      this.props.tagIds.push(tagId);
      this.props.updatedAt = new Date();
    }
  }

  /**
   * Removes a tag from the task
   */
  removeTag(tagId: string): void {
    const index = this.props.tagIds.indexOf(tagId);
    if (index !== -1) {
      this.props.tagIds.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }
}

// === Exceptions ===

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task with ID ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}
