import { DomainEvent } from './domain-event';

export class BookRegisteredEvent extends DomainEvent {
  constructor(
    public readonly bookId: string,
    public readonly isbn: string,
    public readonly title: string
  ) {
    super();
  }

  get eventName(): string {
    return 'book.registered';
  }
}
