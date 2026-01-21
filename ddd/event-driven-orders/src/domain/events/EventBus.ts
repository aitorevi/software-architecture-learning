import { DomainEvent } from './DomainEvent';

/**
 * EVENT-DRIVEN EXAMPLE - Event Bus Interface (Port)
 *
 * EVENT-DRIVEN KEY CONCEPT:
 * The Event Bus is a secondary port (driven port) that allows
 * the application to publish events without knowing who subscribes.
 *
 * This decouples:
 * - Publishers (domain/application) from Subscribers (event handlers)
 * - The "what happened" from "what to do about it"
 *
 * Implementations could be:
 * - In-memory (this example)
 * - Message queue (RabbitMQ, Kafka)
 * - Event store (EventStoreDB)
 */

/**
 * Event handler function type
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T
) => Promise<void>;

/**
 * EventBus - Port for publishing and subscribing to domain events
 */
export interface EventBus {
  /**
   * Publishes an event to all registered handlers.
   * Handlers are called asynchronously.
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * Publishes multiple events in order.
   */
  publishAll(events: DomainEvent[]): Promise<void>;

  /**
   * Subscribes a handler to events of a specific type.
   * @param eventName The event name to subscribe to
   * @param handler The function to call when the event occurs
   */
  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void;

  /**
   * Unsubscribes a handler from events.
   */
  unsubscribe(eventName: string, handler: EventHandler): void;
}
