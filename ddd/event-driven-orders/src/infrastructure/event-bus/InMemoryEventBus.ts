import { DomainEvent, EventBus, EventHandler } from '../../domain';

/**
 * EVENT-DRIVEN EXAMPLE - In-Memory Event Bus
 *
 * EVENT-DRIVEN KEY CONCEPT:
 * The Event Bus is the central hub for publishing and subscribing to events.
 *
 * This in-memory implementation:
 * - Keeps handlers in memory
 * - Processes events synchronously (in production, use async)
 * - Is perfect for single-process applications
 *
 * Production alternatives:
 * - RabbitMQ / Kafka for distributed systems
 * - Redis Pub/Sub for simple distributed cases
 * - AWS EventBridge / Azure Event Grid for cloud
 */

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName) || [];

    console.log(
      `[EventBus] Publishing ${event.eventName} (${eventHandlers.length} handlers)`
    );

    // Execute all handlers (in parallel for speed)
    const promises = eventHandlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        // In production, you'd want better error handling:
        // - Retry logic
        // - Dead letter queue
        // - Alerting
        console.error(
          `[EventBus] Handler failed for ${event.eventName}:`,
          error
        );
      }
    });

    await Promise.all(promises);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    const existing = this.handlers.get(eventName) || [];
    existing.push(handler as EventHandler);
    this.handlers.set(eventName, existing);

    console.log(`[EventBus] Subscribed handler to ${eventName}`);
  }

  unsubscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) || [];
    const index = existing.indexOf(handler);
    if (index !== -1) {
      existing.splice(index, 1);
      this.handlers.set(eventName, existing);
    }
  }

  /**
   * Returns the count of handlers for testing/debugging
   */
  getHandlerCount(eventName: string): number {
    return (this.handlers.get(eventName) || []).length;
  }

  /**
   * Clears all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
  }
}
