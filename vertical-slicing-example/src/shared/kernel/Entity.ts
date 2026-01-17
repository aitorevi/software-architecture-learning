/**
 * SHARED KERNEL - Entity Base Class
 *
 * The Shared Kernel contains code that is truly shared between features.
 * This is minimal and carefully controlled - too much shared code defeats
 * the purpose of vertical slicing.
 *
 * What belongs in Shared Kernel:
 * - Base classes like Entity
 * - Truly universal value objects (like ID generation)
 * - Cross-cutting concerns (like event interfaces)
 *
 * What does NOT belong here:
 * - Business logic specific to any feature
 * - DTOs or commands (each feature owns its own)
 * - Repository interfaces (each feature defines its own ports)
 */

/**
 * DomainEvent interface - base for all domain events across features
 */
export interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventName: string;
}

/**
 * Entity - Abstract base class providing identity and domain events
 *
 * Each feature's entities extend this to get:
 * - Identity comparison (equals method)
 * - Domain event management (emit, pull events)
 *
 * Note: In vertical slicing, entities are feature-specific. This base class
 * provides common infrastructure without leaking business logic.
 */
export abstract class Entity<IdType> {
  protected readonly domainEvents: DomainEvent[] = [];

  constructor(protected readonly _id: IdType) {}

  get id(): IdType {
    return this._id;
  }

  /**
   * Compares entities by identity, not by value.
   * Two entities with the same ID are the same entity,
   * regardless of their other properties.
   */
  equals(other: Entity<IdType>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    // Compare IDs (assuming they have toString or are primitives)
    return JSON.stringify(this._id) === JSON.stringify(other._id);
  }

  /**
   * Records a domain event to be published later.
   * Events are collected during entity operations and
   * published after successful persistence.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Returns and clears all pending domain events.
   * Called by application layer after persisting changes.
   */
  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}
