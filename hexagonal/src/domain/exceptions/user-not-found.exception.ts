import { DomainException } from './domain-exception';

/**
 * Se lanza cuando se busca un usuario que no existe en el sistema.
 */
export class UserNotFoundException extends DomainException {
  constructor(public readonly userId: string) {
    super(`User with id ${userId} not found`, 'USER_NOT_FOUND');
  }
}
