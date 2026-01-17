import { DomainEvent } from './domain-event';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string
  ) {
    super();
  }

  get eventName(): string {
    return 'user.registered';
  }
}
