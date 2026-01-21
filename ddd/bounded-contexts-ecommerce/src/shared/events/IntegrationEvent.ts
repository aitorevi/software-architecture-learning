/**
 * BOUNDED CONTEXTS EXAMPLE - Integration Event
 *
 * BOUNDED CONTEXTS KEY CONCEPT:
 * Integration Events are used for communication BETWEEN bounded contexts.
 * They are different from Domain Events:
 *
 * Domain Events:
 * - Internal to a bounded context
 * - Use domain language of that context
 * - Can contain rich domain objects
 *
 * Integration Events:
 * - Cross context boundaries
 * - Use shared/neutral language
 * - Contain only primitive types (serializable)
 * - Form the "published language" between contexts
 */

export interface IntegrationEvent {
  readonly eventId: string;
  readonly occurredOn: string; // ISO string for serialization
  readonly eventType: string;
  readonly sourceContext: string;
}

export abstract class BaseIntegrationEvent implements IntegrationEvent {
  readonly eventId: string;
  readonly occurredOn: string;
  abstract readonly eventType: string;
  abstract readonly sourceContext: string;

  constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date().toISOString();
  }
}

/**
 * Integration Event Bus Interface
 *
 * This is the contract for publishing and subscribing to integration events
 * across bounded context boundaries.
 */
export type IntegrationEventHandler<T extends IntegrationEvent> = (
  event: T
) => Promise<void>;

export interface IntegrationEventBus {
  publish(event: IntegrationEvent): Promise<void>;
  subscribe<T extends IntegrationEvent>(
    eventType: string,
    handler: IntegrationEventHandler<T>
  ): void;
}
