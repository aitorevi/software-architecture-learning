/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  INTEGRATION TESTS: API                                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Tests end-to-end de la API HTTP.                                         ║
 * ║                                                                           ║
 * ║  Estos tests verifican el flujo completo:                                 ║
 * ║  HTTP Request → Controller → UseCase → Repository → HTTP Response         ║
 * ║                                                                           ║
 * ║  Y especialmente: cómo los errores de dominio se traducen a HTTP.         ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { InMemoryUserRepository } from '../../src/infrastructure/persistence/InMemoryUserRepository.js';
import { RegisterUserUseCase } from '../../src/application/RegisterUserUseCase.js';
import { UserController } from '../../src/infrastructure/http/UserController.js';
import { createApp } from '../../src/infrastructure/http/server.js';

describe('API /users', () => {
  let app: Express;
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    // Crear instancias frescas para cada test
    repository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(repository);
    const controller = new UserController(useCase);
    app = createApp(controller);
  });

  describe('POST /users - caso de éxito', () => {
    it('registra un usuario con datos válidos y retorna 201', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'millo@laspalmas.com');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('hasAcceptedTerms', true);
      expect(response.body).not.toHaveProperty('password'); // Nunca exponer password
    });

    it('el usuario queda persistido', async () => {
      await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(201);

      const users = await repository.findAll();
      expect(users).toHaveLength(1);
      expect(users[0].getEmail().toString()).toBe('millo@laspalmas.com');
    });
  });

  describe('POST /users - validación de email', () => {
    it('retorna 400 si el email está vacío', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: '',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('email');
      expect(response.body.message).toContain('no puede estar vacío');
    });

    it('retorna 400 si el email no tiene @', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'no-es-email',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('debe contener @');
    });

    it('retorna 400 si el email no tiene dominio válido', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'user@domain',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('dominio');
    });
  });

  describe('POST /users - validación de password', () => {
    it('retorna 400 si el password es muy corto', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'Abc1!',
          acceptedTerms: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('al menos 8 caracteres');
    });

    it('retorna 400 si el password no tiene mayúsculas', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'abc123!@#',
          acceptedTerms: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('mayúscula');
    });

    it('retorna 400 si el password no tiene minúsculas', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'ABC123!@#',
          acceptedTerms: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('minúscula');
    });

    it('retorna 400 si el password no tiene números', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'Abcdefgh!@#',
          acceptedTerms: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('número');
    });

    it('retorna 400 si el password no tiene caracteres especiales', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'Abcdefgh123',
          acceptedTerms: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ValidationError');
      expect(response.body.message).toContain('carácter especial');
    });
  });

  describe('POST /users - términos no aceptados', () => {
    it('retorna 403 si no acepta términos', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'SuperSecret123!',
          acceptedTerms: false,
        })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'TermsNotAcceptedError');
      expect(response.body.message).toContain('términos');
    });
  });

  describe('POST /users - usuario duplicado', () => {
    it('retorna 409 si el email ya existe', async () => {
      // Primer registro - OK
      await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(201);

      // Segundo registro - CONFLICT
      const response = await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'OtherPassword123!',
          acceptedTerms: true,
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'UserAlreadyExistsError');
      expect(response.body.message).toContain('Ya existe un usuario');
      expect(response.body.message).toContain('millo@laspalmas.com');
    });

    it('permite usuarios con emails diferentes', async () => {
      await request(app)
        .post('/users')
        .send({
          email: 'user1@example.com',
          password: 'Password123!',
          acceptedTerms: true,
        })
        .expect(201);

      await request(app)
        .post('/users')
        .send({
          email: 'user2@example.com',
          password: 'Password123!',
          acceptedTerms: true,
        })
        .expect(201);

      const users = await repository.findAll();
      expect(users).toHaveLength(2);
    });
  });

  describe('GET /health', () => {
    it('retorna 200 y status ok', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('mapeo de errores a status codes', () => {
    it('ValidationError → 400', async () => {
      await request(app)
        .post('/users')
        .send({
          email: '',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(400);
    });

    it('TermsNotAcceptedError → 403', async () => {
      await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'SuperSecret123!',
          acceptedTerms: false,
        })
        .expect(403);
    });

    it('UserAlreadyExistsError → 409', async () => {
      // Primer usuario
      await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(201);

      // Segundo intento con mismo email
      await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(409);
    });
  });

  describe('estructura de respuestas de error', () => {
    it('incluye error name, message y details', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'invalid',
          password: 'SuperSecret123!',
          acceptedTerms: true,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.error).toBe('string');
      expect(typeof response.body.message).toBe('string');
    });

    it('no expone información sensible en errores', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'millo@laspalmas.com',
          password: 'weak',
          acceptedTerms: true,
        })
        .expect(400);

      // No debe exponer el password en el error
      expect(response.body.message).not.toContain('weak');
      expect(JSON.stringify(response.body)).not.toContain('weak');
    });
  });
});
