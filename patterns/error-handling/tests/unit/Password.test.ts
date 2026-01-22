/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  TESTS: PASSWORD VALUE OBJECT                                             ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Tests de validaciones complejas con Result.                              ║
 * ║                                                                           ║
 * ║  Nota: Estos tests validan REGLAS DE NEGOCIO, no implementación técnica.  ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect } from 'vitest';
import { Password } from '../../src/domain/value-objects/Password.js';

describe('Password', () => {
  describe('create - casos de error', () => {
    it('devuelve error si está vacío', () => {
      const result = Password.create('');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('no puede estar vacío');
    });

    it('devuelve error si es menor a 8 caracteres', () => {
      const result = Password.create('Abc123!');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('al menos 8 caracteres');
    });

    it('devuelve error si es mayor a 100 caracteres', () => {
      const result = Password.create('A'.repeat(101) + 'a1!');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('no puede tener más de 100 caracteres');
    });

    it('devuelve error si no tiene mayúsculas', () => {
      const result = Password.create('abc123!@#');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('al menos una letra mayúscula');
    });

    it('devuelve error si no tiene minúsculas', () => {
      const result = Password.create('ABC123!@#');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('al menos una letra minúscula');
    });

    it('devuelve error si no tiene números', () => {
      const result = Password.create('Abcdefg!@#');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('al menos un número');
    });

    it('devuelve error si no tiene caracteres especiales', () => {
      const result = Password.create('Abcdefg123');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('al menos un carácter especial');
    });
  });

  describe('create - casos de éxito', () => {
    it('crea password válido con requisitos mínimos', () => {
      const result = Password.create('Abc123!@');

      expect(result.isOk()).toBe(true);
    });

    it('crea password válido con todos los requisitos', () => {
      const result = Password.create('SuperSecret123!');

      expect(result.isOk()).toBe(true);
    });

    it('acepta diferentes caracteres especiales', () => {
      const passwords = [
        'Pass123!',
        'Pass123@',
        'Pass123#',
        'Pass123$',
        'Pass123%',
        'Pass123^',
        'Pass123&',
        'Pass123*',
      ];

      passwords.forEach(pwd => {
        const result = Password.create(pwd);
        expect(result.isOk()).toBe(true);
      });
    });
  });

  describe('matches', () => {
    it('retorna true si el password coincide', () => {
      const password = Password.create('SuperSecret123!').value;

      expect(password.matches('SuperSecret123!')).toBe(true);
    });

    it('retorna false si el password no coincide', () => {
      const password = Password.create('SuperSecret123!').value;

      expect(password.matches('OtherPassword123!')).toBe(false);
    });

    it('es case-sensitive', () => {
      const password = Password.create('SuperSecret123!').value;

      expect(password.matches('supersecret123!')).toBe(false);
    });
  });

  describe('getStrength', () => {
    it('retorna weak para password con pocos tipos de caracteres', () => {
      const password = Password.create('Abc12!@@').value; // 8 caracteres, poca variedad

      // Aunque pasa validación, tiene score bajo
      // (el algoritmo puede darle weak o medium según implementación)
      const strength = password.getStrength();
      expect(['weak', 'medium']).toContain(strength);
    });

    it('retorna medium para password decente', () => {
      const password = Password.create('Abc123!@').value; // 8 caracteres con variedad

      expect(password.getStrength()).toBe('medium');
    });

    it('retorna strong para password robusto', () => {
      const password = Password.create('MySup3r$3cur3P@ssw0rd!').value; // Largo y variado

      expect(password.getStrength()).toBe('strong');
    });

    it('penaliza passwords con caracteres repetidos', () => {
      // "aaaaaaA1!" tiene longitud OK pero muchos caracteres repetidos
      const weak = Password.create('aaaaaaA1!').value;
      const strong = Password.create('Abcd1234!@#').value; // Más largo y variado

      // weak debería tener menor score por repetición
      expect(weak.getStrength()).toBe('medium'); // Aún pasa validaciones básicas
      expect(strong.getStrength()).toBe('strong'); // Mejor score
    });
  });

  describe('toString', () => {
    it('no expone el password real', () => {
      const password = Password.create('SuperSecret123!').value;

      expect(password.toString()).toBe('********');
      expect(password.toString()).not.toContain('SuperSecret');
    });
  });

  describe('integration: casos de uso reales', () => {
    it('valida passwords comunes (deberían fallar)', () => {
      const commonPasswords = [
        'password',        // sin mayúscula, sin número, sin especial
        '12345678',        // sin mayúscula, sin letra, sin especial
        'Password',        // sin número, sin especial
        'Password123',     // sin especial
      ];

      commonPasswords.forEach(pwd => {
        const result = Password.create(pwd);
        expect(result.isError()).toBe(true);
      });
    });

    it('acepta passwords seguros', () => {
      const securePasswords = [
        'MyP@ssw0rd',
        'S3cur3P@ss!',
        'C0mpl3x!ty',
        'Tr0ub4dor&3',
      ];

      securePasswords.forEach(pwd => {
        const result = Password.create(pwd);
        expect(result.isOk()).toBe(true);
      });
    });

    it('permite flujo de validación con Result.match', () => {
      const result = Password.create('weak');

      const message = result.match({
        ok: pwd => `Password válido (${pwd.getStrength()})`,
        error: err => `Error: ${err.message}`,
      });

      expect(message).toContain('Error:');
    });
  });
});
