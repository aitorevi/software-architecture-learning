import { DomainEvent } from './domain-event';

export class BookLoanedEvent extends DomainEvent {
  constructor(
    public readonly loanId: string,
    public readonly bookId: string,
    public readonly userId: string,
    public readonly dueDate: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'book.loaned';
  }
}
