import { DomainException } from './domain-exception';

/**
 * Se lanza cuando un usuario con penalizaciones activas
 * intenta realizar una acción restringida (como pedir un libro).
 */
export class UserHasPenaltiesException extends DomainException {
  constructor(
    public readonly userId: string,
    public readonly penaltyEndDate: Date
  ) {
    super(
      `User ${userId} has active penalties until ${penaltyEndDate.toISOString().split('T')[0]}`,
      'USER_HAS_PENALTIES'
    );
  }
}
