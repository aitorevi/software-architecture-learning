import { Entity, DomainEvent } from '@shared/kernel';
import { ProjectId } from './ProjectId';

/**
 * PROJECT FEATURE - Project Entity
 *
 * In Vertical Slicing, each feature owns its complete domain model.
 * The Project entity is self-contained within this feature.
 *
 * VERTICAL SLICING KEY CONCEPT:
 * Unlike horizontal layering where ALL entities live in /domain/entities,
 * here the Project entity lives inside the projects feature folder.
 * This makes the feature more cohesive and easier to understand.
 *
 * Benefits:
 * - All Project-related code is in one place
 * - You can understand the whole feature by reading one folder
 * - Features can evolve independently
 * - Easier to delete or extract a feature
 */

export interface ProjectProps {
  id: ProjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ProjectCreatedEvent - Domain event emitted when a project is created
 *
 * This event is feature-specific. Other features can subscribe to it
 * through the event bus if they need to react to project creation.
 */
export class ProjectCreatedEvent implements DomainEvent {
  readonly eventName = 'project.created';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly projectId: string,
    public readonly projectName: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}

export class ProjectUpdatedEvent implements DomainEvent {
  readonly eventName = 'project.updated';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly projectId: string,
    public readonly changes: { name?: string; description?: string }
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}

/**
 * Project - The aggregate root for the Projects feature
 *
 * Business Rules:
 * - Project name cannot be empty
 * - Project name must be at most 100 characters
 * - Description is optional but limited to 500 characters
 */
export class Project extends Entity<ProjectId> {
  private props: Omit<ProjectProps, 'id'>;

  private constructor(id: ProjectId, props: Omit<ProjectProps, 'id'>) {
    super(id);
    this.props = props;
  }

  // === Factory Methods ===

  /**
   * Creates a NEW project - use this when creating from user input.
   * Emits ProjectCreatedEvent.
   */
  static create(params: {
    id: ProjectId;
    name: string;
    description?: string;
  }): Project {
    Project.validateName(params.name);
    const description = params.description ?? '';
    Project.validateDescription(description);

    const now = new Date();
    const project = new Project(params.id, {
      name: params.name.trim(),
      description: description.trim(),
      createdAt: now,
      updatedAt: now,
    });

    // Emit domain event for new projects
    project.addDomainEvent(
      new ProjectCreatedEvent(params.id.value, params.name)
    );

    return project;
  }

  /**
   * Reconstitutes a project from persistence - use this when loading from DB.
   * Does NOT emit events (the project already exists).
   */
  static reconstitute(props: ProjectProps): Project {
    return new Project(props.id, {
      name: props.name,
      description: props.description,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  // === Validation (private static methods) ===

  private static validateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new ProjectValidationError('Project name cannot be empty');
    }
    if (name.length > 100) {
      throw new ProjectValidationError(
        'Project name must be at most 100 characters'
      );
    }
  }

  private static validateDescription(description: string): void {
    if (description.length > 500) {
      throw new ProjectValidationError(
        'Project description must be at most 500 characters'
      );
    }
  }

  // === Getters (read-only access to properties) ===

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // === Behavior Methods ===

  /**
   * Updates the project's name and/or description.
   * Emits ProjectUpdatedEvent.
   */
  update(params: { name?: string; description?: string }): void {
    const changes: { name?: string; description?: string } = {};

    if (params.name !== undefined) {
      Project.validateName(params.name);
      this.props.name = params.name.trim();
      changes.name = this.props.name;
    }

    if (params.description !== undefined) {
      Project.validateDescription(params.description);
      this.props.description = params.description.trim();
      changes.description = this.props.description;
    }

    if (Object.keys(changes).length > 0) {
      this.props.updatedAt = new Date();
      this.addDomainEvent(new ProjectUpdatedEvent(this.id.value, changes));
    }
  }
}

/**
 * ProjectValidationError - Domain exception for validation failures
 *
 * Feature-specific exceptions live within the feature folder.
 * This keeps all Project-related code together.
 */
export class ProjectValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectValidationError';
  }
}

export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project with ID ${projectId} not found`);
    this.name = 'ProjectNotFoundError';
  }
}
