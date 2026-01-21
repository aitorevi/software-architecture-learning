import { Entity, DomainEvent } from '@shared/kernel';
import { TagId } from './TagId';
import { Color } from './Color';

/**
 * TAG FEATURE - Tag Entity
 *
 * Tags are simple labels that can be attached to tasks.
 * Each tag has a name and a color for visual identification.
 *
 * Business Rules:
 * - Tag name cannot be empty
 * - Tag name must be at most 50 characters
 * - Tag name must be unique (enforced at application level)
 * - Color must be valid hex format
 */

export interface TagProps {
  id: TagId;
  name: string;
  color: Color;
  createdAt: Date;
}

export class TagCreatedEvent implements DomainEvent {
  readonly eventName = 'tag.created';
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly tagId: string,
    public readonly tagName: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}

export class Tag extends Entity<TagId> {
  private props: Omit<TagProps, 'id'>;

  private constructor(id: TagId, props: Omit<TagProps, 'id'>) {
    super(id);
    this.props = props;
  }

  // === Factory Methods ===

  static create(params: { id: TagId; name: string; color: Color }): Tag {
    Tag.validateName(params.name);

    const tag = new Tag(params.id, {
      name: params.name.trim(),
      color: params.color,
      createdAt: new Date(),
    });

    tag.addDomainEvent(new TagCreatedEvent(params.id.value, params.name));

    return tag;
  }

  static reconstitute(props: TagProps): Tag {
    return new Tag(props.id, {
      name: props.name,
      color: props.color,
      createdAt: props.createdAt,
    });
  }

  // === Validation ===

  private static validateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new TagValidationError('Tag name cannot be empty');
    }
    if (name.length > 50) {
      throw new TagValidationError('Tag name must be at most 50 characters');
    }
  }

  // === Getters ===

  get name(): string {
    return this.props.name;
  }

  get color(): Color {
    return this.props.color;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // === Behavior Methods ===

  updateName(name: string): void {
    Tag.validateName(name);
    this.props.name = name.trim();
  }

  updateColor(color: Color): void {
    this.props.color = color;
  }
}

// === Exceptions ===

export class TagValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TagValidationError';
  }
}

export class TagNotFoundError extends Error {
  constructor(tagId: string) {
    super(`Tag with ID ${tagId} not found`);
    this.name = 'TagNotFoundError';
  }
}
