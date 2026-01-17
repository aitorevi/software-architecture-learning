/**
 * EVENT-DRIVEN EXAMPLE - Domain Event Interface
 *
 * EVENT-DRIVEN KEY CONCEPT:
 * Domain events represent something that HAPPENED in the domain.
 * They are facts - immutable records of past occurrences.
 *
 * Events:
 * - Are named in past tense: "OrderCreated", "PaymentReceived"
 * - Are immutable (can't be changed after creation)
 * - Contain all information needed to describe what happened
 * - Can be published to multiple subscribers
 */

export interface DomainEvent {
  /**
   * Unique identifier for this event instance
   */
  readonly eventId: string;

  /**
   * When this event occurred
   */
  readonly occurredOn: Date;

  /**
   * The name/type of the event (e.g., "order.created")
   */
  readonly eventName: string;

  /**
   * ID of the aggregate that emitted this event
   */
  readonly aggregateId: string;
}

/**
 * Base class for domain events with common functionality
 */
export abstract class BaseDomainEvent implements DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  abstract readonly eventName: string;
  abstract readonly aggregateId: string;

  constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }

  /**
   * Serializes the event for transport/storage
   */
  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      occurredOn: this.occurredOn.toISOString(),
      aggregateId: this.aggregateId,
      ...this.getPayload(),
    };
  }

  /**
   * Override in subclasses to add event-specific data
   */
  protected abstract getPayload(): Record<string, unknown>;
}
