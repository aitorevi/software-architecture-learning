import { DomainEvent } from './domain-event';

export class PenaltyAppliedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly loanId: string,
    public readonly daysOverdue: number,
    public readonly penaltyEndDate: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'penalty.applied';
  }
}
