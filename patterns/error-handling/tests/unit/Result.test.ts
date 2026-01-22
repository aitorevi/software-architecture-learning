/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  TESTS: RESULT PATTERN                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Estos tests demuestran cómo usar Result.                                 ║
 * ║                                                                           ║
 * ║  Fíjate que NO necesitamos try/catch - los errores son valores.           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect } from 'vitest';
import { Result } from '../../src/domain/Result.js';

describe('Result', () => {
  describe('ok', () => {
    it('crea un Result exitoso', () => {
      const result = Result.ok(42);

      expect(result.isOk()).toBe(true);
      expect(result.isError()).toBe(false);
      expect(result.value).toBe(42);
    });

    it('puede contener cualquier tipo', () => {
      const stringResult = Result.ok('hello');
      const objectResult = Result.ok({ name: 'Millo' });
      const arrayResult = Result.ok([1, 2, 3]);

      expect(stringResult.value).toBe('hello');
      expect(objectResult.value).toEqual({ name: 'Millo' });
      expect(arrayResult.value).toEqual([1, 2, 3]);
    });
  });

  describe('fail', () => {
    it('crea un Result fallido', () => {
      const result = Result.fail('Error message');

      expect(result.isError()).toBe(true);
      expect(result.isOk()).toBe(false);
      expect(result.error).toBe('Error message');
    });

    it('puede contener objetos Error', () => {
      const error = new Error('Boom!');
      const result = Result.fail(error);

      expect(result.error).toBe(error);
      expect(result.error.message).toBe('Boom!');
    });
  });

  describe('value getter', () => {
    it('retorna el valor en Result.ok', () => {
      const result = Result.ok(100);

      expect(result.value).toBe(100);
    });

    it('lanza excepción si intentas acceder a value en Result.fail', () => {
      const result = Result.fail('error');

      expect(() => result.value).toThrow('No puedes acceder a value en un Result.fail()');
    });
  });

  describe('error getter', () => {
    it('retorna el error en Result.fail', () => {
      const result = Result.fail('error message');

      expect(result.error).toBe('error message');
    });

    it('lanza excepción si intentas acceder a error en Result.ok', () => {
      const result = Result.ok(42);

      expect(() => result.error).toThrow('No puedes acceder a error en un Result.ok()');
    });
  });

  describe('map', () => {
    it('transforma el valor en Result.ok', () => {
      const result = Result.ok(5);
      const doubled = result.map(n => n * 2);

      expect(doubled.isOk()).toBe(true);
      expect(doubled.value).toBe(10);
    });

    it('no hace nada en Result.fail', () => {
      const result = Result.fail<number, string>('error');
      const doubled = result.map(n => n * 2);

      expect(doubled.isError()).toBe(true);
      expect(doubled.error).toBe('error');
    });

    it('puede cambiar el tipo', () => {
      const result = Result.ok(42);
      const asString = result.map(n => n.toString());

      expect(asString.value).toBe('42');
    });

    it('puede encadenarse', () => {
      const result = Result.ok(5)
        .map(n => n * 2)     // 10
        .map(n => n + 1)     // 11
        .map(n => n.toString()); // "11"

      expect(result.value).toBe('11');
    });
  });

  describe('flatMap', () => {
    function divide(a: number, b: number): Result<number, string> {
      if (b === 0) {
        return Result.fail('División por cero');
      }
      return Result.ok(a / b);
    }

    it('encadena operaciones que retornan Result', () => {
      const result = Result.ok(10)
        .flatMap(n => divide(n, 2));

      expect(result.isOk()).toBe(true);
      expect(result.value).toBe(5);
    });

    it('propaga el error si flatMap falla', () => {
      const result = Result.ok(10)
        .flatMap(n => divide(n, 0)); // Falla aquí

      expect(result.isError()).toBe(true);
      expect(result.error).toBe('División por cero');
    });

    it('no ejecuta flatMap si el Result ya es error', () => {
      const result = Result.fail<number, string>('error inicial')
        .flatMap(n => divide(n, 2));

      expect(result.isError()).toBe(true);
      expect(result.error).toBe('error inicial');
    });

    it('puede encadenarse para Railway Oriented Programming', () => {
      const result = Result.ok(20)
        .flatMap(n => divide(n, 2))    // 10
        .flatMap(n => divide(n, 5))    // 2
        .map(n => n * 10);             // 20

      expect(result.isOk()).toBe(true);
      expect(result.value).toBe(20);
    });

    it('se detiene en el primer error (Railway)', () => {
      const result = Result.ok(20)
        .flatMap(n => divide(n, 2))    // ok: 10
        .flatMap(n => divide(n, 0))    // fail: división por cero
        .flatMap(n => divide(n, 5));   // no se ejecuta

      expect(result.isError()).toBe(true);
      expect(result.error).toBe('División por cero');
    });
  });

  describe('getOrElse', () => {
    it('retorna el valor si es Result.ok', () => {
      const result = Result.ok(42);

      expect(result.getOrElse(0)).toBe(42);
    });

    it('retorna el valor por defecto si es Result.fail', () => {
      const result = Result.fail<number, string>('error');

      expect(result.getOrElse(0)).toBe(0);
    });
  });

  describe('match', () => {
    it('ejecuta el handler ok cuando Result.ok', () => {
      const result = Result.ok(42);

      const message = result.match({
        ok: value => `Valor: ${value}`,
        error: err => `Error: ${err}`,
      });

      expect(message).toBe('Valor: 42');
    });

    it('ejecuta el handler error cuando Result.fail', () => {
      const result = Result.fail('Boom!');

      const message = result.match({
        ok: value => `Valor: ${value}`,
        error: err => `Error: ${err}`,
      });

      expect(message).toBe('Error: Boom!');
    });

    it('puede transformar a cualquier tipo', () => {
      const result = Result.ok(42);

      const status = result.match({
        ok: () => 200,
        error: () => 400,
      });

      expect(status).toBe(200);
    });
  });

  describe('example: división segura', () => {
    function safeDivide(a: number, b: number): Result<number, string> {
      if (b === 0) {
        return Result.fail('No se puede dividir por cero');
      }
      return Result.ok(a / b);
    }

    it('retorna ok cuando la división es válida', () => {
      const result = safeDivide(10, 2);

      expect(result.isOk()).toBe(true);
      expect(result.value).toBe(5);
    });

    it('retorna fail cuando se divide por cero', () => {
      const result = safeDivide(10, 0);

      expect(result.isError()).toBe(true);
      expect(result.error).toBe('No se puede dividir por cero');
    });

    it('se puede usar en condicionales', () => {
      const result = safeDivide(10, 2);

      if (result.isOk()) {
        expect(result.value).toBe(5);
      } else {
        // No debería llegar aquí
        expect.fail('Expected ok result');
      }
    });
  });
});
