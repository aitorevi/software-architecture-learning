import { User, UserId, Email, UserRepository, IdGenerator } from '../../domain';
import { RegisterUserCommand, UserResponse } from '../dtos';

/**
 * RegisterUserUseCase
 *
 * Registra un nuevo usuario (socio) de la biblioteca.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserResponse> {
    // Crear Value Objects
    const email = Email.create(command.email);

    // Verificar si ya existe un usuario con este email
    const existingUser = await this.userRepository.existsByEmail(email);
    if (existingUser) {
      throw new Error(`User with email ${command.email} already exists`);
    }

    // Crear la entidad
    const user = User.create({
      id: UserId.create(this.idGenerator.generate()),
      email,
      name: command.name,
    });

    // Persistir
    await this.userRepository.save(user);

    // Retornar DTO
    return this.toResponse(user);
  }

  private toResponse(user: User): UserResponse {
    return {
      id: user.id.getValue(),
      email: user.email.getValue(),
      name: user.name,
      activeLoansCount: user.activeLoans.length,
      hasPenalties: user.hasPenalties(),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
