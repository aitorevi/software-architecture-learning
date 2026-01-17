import { DomainEvent } from './domain-event';

export class BookReturnedEvent extends DomainEvent {
  constructor(
    public readonly loanId: string,
    public readonly bookId: string,
    public readonly userId: string,
    public readonly daysOverdue: number
  ) {
    super();
  }

  get eventName(): string {
    return 'book.returned';
  }
}
