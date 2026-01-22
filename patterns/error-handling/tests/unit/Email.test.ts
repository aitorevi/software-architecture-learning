/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  TESTS: EMAIL VALUE OBJECT                                                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Tests de validación con Result.                                          ║
 * ║                                                                           ║
 * ║  Fíjate que testeamos CASOS DE ERROR como parte del flujo normal.         ║
 * ║  No son "excepciones" - son valores esperados.                            ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect } from 'vitest';
import { Email } from '../../src/domain/value-objects/Email.js';

describe('Email', () => {
  describe('create - casos de error', () => {
    it('devuelve error si el email está vacío', () => {
      const result = Email.create('');

      expect(result.isError()).toBe(true);
      expect(result.error.name).toBe('ValidationError');
      expect(result.error.message).toContain('no puede estar vacío');
    });

    it('devuelve error si el email es solo espacios', () => {
      const result = Email.create('   ');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('no puede estar vacío');
    });

    it('devuelve error si no contiene @', () => {
      const result = Email.create('no-es-email');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('debe contener @');
    });

    it('devuelve error si tiene múltiples @', () => {
      const result = Email.create('doble@@email.com');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('formato inválido');
    });

    it('devuelve error si la parte local está vacía', () => {
      const result = Email.create('@example.com');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('parte local no puede estar vacía');
    });

    it('devuelve error si el dominio está vacío', () => {
      const result = Email.create('user@');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('dominio no puede estar vacío');
    });

    it('devuelve error si el dominio no tiene punto', () => {
      const result = Email.create('user@domain');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('dominio debe tener extensión');
    });

    it('devuelve error si empieza con punto', () => {
      const result = Email.create('.user@example.com');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('no puede empezar o terminar con punto');
    });

    it('devuelve error si termina con punto', () => {
      const result = Email.create('user@example.com.');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('no puede empezar o terminar con punto');
    });
  });

  describe('create - casos de éxito', () => {
    it('crea email válido simple', () => {
      const result = Email.create('user@example.com');

      expect(result.isOk()).toBe(true);
      expect(result.value.toString()).toBe('user@example.com');
    });

    it('crea email con múltiples puntos en dominio', () => {
      const result = Email.create('user@mail.example.com');

      expect(result.isOk()).toBe(true);
      expect(result.value.toString()).toBe('user@mail.example.com');
    });

    it('crea email con números', () => {
      const result = Email.create('user123@example123.com');

      expect(result.isOk()).toBe(true);
      expect(result.value.toString()).toBe('user123@example123.com');
    });

    it('crea email con guiones', () => {
      const result = Email.create('user-name@example-domain.com');

      expect(result.isOk()).toBe(true);
      expect(result.value.toString()).toBe('user-name@example-domain.com');
    });

    it('normaliza a minúsculas', () => {
      const result = Email.create('USER@EXAMPLE.COM');

      expect(result.isOk()).toBe(true);
      expect(result.value.toString()).toBe('user@example.com');
    });

    it('elimina espacios', () => {
      const result = Email.create('  user@example.com  ');

      expect(result.isOk()).toBe(true);
      expect(result.value.toString()).toBe('user@example.com');
    });
  });

  describe('equals', () => {
    it('retorna true para emails iguales', () => {
      const email1 = Email.create('millo@laspalmas.com').value;
      const email2 = Email.create('millo@laspalmas.com').value;

      expect(email1.equals(email2)).toBe(true);
    });

    it('retorna false para emails diferentes', () => {
      const email1 = Email.create('millo@laspalmas.com').value;
      const email2 = Email.create('otro@laspalmas.com').value;

      expect(email1.equals(email2)).toBe(false);
    });

    it('es case-insensitive', () => {
      const email1 = Email.create('Millo@LasPalmas.com').value;
      const email2 = Email.create('millo@laspalmas.com').value;

      expect(email1.equals(email2)).toBe(true);
    });
  });

  describe('getValue', () => {
    it('retorna el valor como string', () => {
      const email = Email.create('millo@laspalmas.com').value;

      expect(email.getValue()).toBe('millo@laspalmas.com');
    });
  });

  describe('integration: flujo de validación', () => {
    it('permite encadenar con otros Results', () => {
      function validateAndProcess(rawEmail: string): string {
        const emailResult = Email.create(rawEmail);

        if (emailResult.isError()) {
          return `Error: ${emailResult.error.message}`;
        }

        return `Email válido: ${emailResult.value.toString()}`;
      }

      expect(validateAndProcess('millo@laspalmas.com'))
        .toBe('Email válido: millo@laspalmas.com');

      expect(validateAndProcess('invalido'))
        .toContain('Error:');
    });

    it('se puede usar con match', () => {
      const emailResult = Email.create('millo@laspalmas.com');

      const message = emailResult.match({
        ok: email => `Bienvenido ${email.toString()}`,
        error: err => `Error de validación: ${err.message}`,
      });

      expect(message).toBe('Bienvenido millo@laspalmas.com');
    });
  });
});
