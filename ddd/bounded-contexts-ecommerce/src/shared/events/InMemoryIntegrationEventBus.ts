import {
  IntegrationEvent,
  IntegrationEventBus,
  IntegrationEventHandler,
} from './IntegrationEvent';

export class InMemoryIntegrationEventBus implements IntegrationEventBus {
  private handlers: Map<string, IntegrationEventHandler<any>[]> = new Map();

  async publish(event: IntegrationEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventType) || [];

    console.log(
      `[IntegrationBus] Publishing ${event.eventType} from ${event.sourceContext} (${eventHandlers.length} handlers)`
    );

    for (const handler of eventHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Handler failed for ${event.eventType}:`, error);
      }
    }
  }

  subscribe<T extends IntegrationEvent>(
    eventType: string,
    handler: IntegrationEventHandler<T>
  ): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
    console.log(`[IntegrationBus] Subscribed to ${eventType}`);
  }
}
