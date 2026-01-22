/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  TESTS: REGISTER USER USE CASE                                            ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Tests del flujo completo de registro con Result.                         ║
 * ║                                                                           ║
 * ║  Fíjate cómo testeamos TODOS los casos de error como parte del diseño.    ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../src/application/RegisterUserUseCase.js';
import { InMemoryUserRepository } from '../../src/infrastructure/persistence/InMemoryUserRepository.js';
import {
  ValidationError,
  UserAlreadyExistsError,
  TermsNotAcceptedError,
} from '../../src/domain/errors/DomainError.js';

describe('RegisterUserUseCase', () => {
  let repository: InMemoryUserRepository;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new RegisterUserUseCase(repository);
  });

  describe('caso de éxito', () => {
    it('registra un usuario con datos válidos', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'SuperSecret123!',
        acceptedTerms: true,
      });

      expect(result.isOk()).toBe(true);
      expect(result.value.getEmail().toString()).toBe('millo@laspalmas.com');
      expect(result.value.hasAcceptedTerms()).toBe(true);
    });

    it('persiste el usuario en el repositorio', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'SuperSecret123!',
        acceptedTerms: true,
      });

      expect(result.isOk()).toBe(true);

      const savedUser = await repository.findById(result.value.getId());
      expect(savedUser).not.toBeNull();
      expect(savedUser!.getEmail().toString()).toBe('millo@laspalmas.com');
    });
  });

  describe('validación de email', () => {
    it('retorna error si el email está vacío', async () => {
      const result = await useCase.execute({
        email: '',
        password: 'SuperSecret123!',
        acceptedTerms: true,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('email');
      expect(result.error.message).toContain('no puede estar vacío');
    });

    it('retorna error si el email no tiene @', async () => {
      const result = await useCase.execute({
        email: 'no-es-email',
        password: 'SuperSecret123!',
        acceptedTerms: true,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('debe contener @');
    });

    it('retorna error si el email es inválido', async () => {
      const result = await useCase.execute({
        email: '@example.com',
        password: 'SuperSecret123!',
        acceptedTerms: true,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
    });
  });

  describe('validación de password', () => {
    it('retorna error si el password está vacío', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: '',
        acceptedTerms: true,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('password');
    });

    it('retorna error si el password es muy corto', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'Abc1!',
        acceptedTerms: true,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('al menos 8 caracteres');
    });

    it('retorna error si el password no tiene mayúsculas', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'abc123!@#',
        acceptedTerms: true,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('mayúscula');
    });

    it('retorna error si el password no tiene minúsculas', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'ABC123!@#',
        acceptedTerms: true,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('minúscula');
    });

    it('retorna error si el password no tiene números', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'Abcdefgh!@#',
        acceptedTerms: true,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('número');
    });

    it('retorna error si el password no tiene caracteres especiales', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'Abcdefgh123',
        acceptedTerms: true,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('carácter especial');
    });
  });

  describe('validación de términos', () => {
    it('retorna error si no acepta términos', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'SuperSecret123!',
        acceptedTerms: false,
      });

      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(TermsNotAcceptedError);
      expect(result.error.message).toContain('términos');
    });
  });

  describe('usuario duplicado', () => {
    it('retorna error si el email ya existe', async () => {
      // Primer registro - OK
      const first = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'SuperSecret123!',
        acceptedTerms: true,
      });
      expect(first.isOk()).toBe(true);

      // Segundo registro con mismo email - ERROR
      const second = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'OtherPassword123!',
        acceptedTerms: true,
      });

      expect(second.isError()).toBe(true);
      expect(second.error).toBeInstanceOf(UserAlreadyExistsError);
      expect(second.error.message).toContain('Ya existe un usuario');
      expect(second.error.message).toContain('millo@laspalmas.com');
    });

    it('no retorna error si el email es diferente', async () => {
      // Primer usuario
      await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'SuperSecret123!',
        acceptedTerms: true,
      });

      // Segundo usuario con email diferente - OK
      const result = await useCase.execute({
        email: 'otro@laspalmas.com',
        password: 'SuperSecret123!',
        acceptedTerms: true,
      });

      expect(result.isOk()).toBe(true);
    });
  });

  describe('fail fast - detención en primer error', () => {
    it('retorna el primer error encontrado (email)', async () => {
      const result = await useCase.execute({
        email: '', // ❌ Error aquí
        password: '', // ❌ Error también aquí, pero no se valida
        acceptedTerms: false, // ❌ Error también aquí, pero no se valida
      });

      expect(result.isError()).toBe(true);
      // Solo vemos el error de email
      expect(result.error.message).toContain('email');
      expect(result.error.message).not.toContain('password');
    });

    it('retorna error de password si email es válido', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com', // ✅ Válido
        password: '', // ❌ Error aquí
        acceptedTerms: false, // ❌ Error también aquí, pero no se valida
      });

      expect(result.isError()).toBe(true);
      // Solo vemos el error de password
      expect(result.error.message).toContain('password');
      expect(result.error.message).not.toContain('términos');
    });
  });

  describe('integration: flujo completo', () => {
    it('permite múltiples usuarios si los datos son diferentes', async () => {
      const user1 = await useCase.execute({
        email: 'user1@example.com',
        password: 'Password123!',
        acceptedTerms: true,
      });

      const user2 = await useCase.execute({
        email: 'user2@example.com',
        password: 'Password123!',
        acceptedTerms: true,
      });

      const user3 = await useCase.execute({
        email: 'user3@example.com',
        password: 'Password123!',
        acceptedTerms: true,
      });

      expect(user1.isOk()).toBe(true);
      expect(user2.isOk()).toBe(true);
      expect(user3.isOk()).toBe(true);

      const allUsers = await repository.findAll();
      expect(allUsers).toHaveLength(3);
    });

    it('verifica que el password se puede comprobar', async () => {
      const result = await useCase.execute({
        email: 'millo@laspalmas.com',
        password: 'SuperSecret123!',
        acceptedTerms: true,
      });

      expect(result.isOk()).toBe(true);

      const user = result.value;
      expect(user.checkPassword('SuperSecret123!')).toBe(true);
      expect(user.checkPassword('WrongPassword123!')).toBe(false);
    });
  });
});
