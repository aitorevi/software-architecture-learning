/**
 * Tests para Logger - Lazy Singleton
 *
 * Estos tests demuestran:
 * 1. Que siempre es la misma instancia
 * 2. Que se inicializa solo cuando se pide (lazy)
 * 3. Que el estado se comparte entre todas las referencias
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Logger } from '../src/infrastructure/singleton/Logger.js';

describe('Logger - Lazy Singleton', () => {
  beforeEach(() => {
    // Resetear el singleton entre tests
    Logger.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance every time', () => {
      // ARRANGE & ACT
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();
      const logger3 = Logger.getInstance();

      // ASSERT
      expect(logger1).toBe(logger2);
      expect(logger2).toBe(logger3);
      expect(logger1).toBe(logger3);
    });

    it('should share state across all references', () => {
      // ARRANGE
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();

      // ACT
      logger1.info('Message from logger1');
      logger2.info('Message from logger2');

      // ASSERT - Ambas referencias ven los mismos logs
      expect(logger1.getLogCount()).toBe(2);
      expect(logger2.getLogCount()).toBe(2);

      const logs1 = logger1.getLogs();
      const logs2 = logger2.getLogs();

      expect(logs1).toHaveLength(2);
      expect(logs2).toHaveLength(2);
      expect(logs1[0]).toBe(logs2[0]); // Mismo objeto en memoria
    });

    it('should maintain state after clearing and getting new reference', () => {
      // ARRANGE
      const logger1 = Logger.getInstance();
      logger1.info('First message');

      // ACT
      const logger2 = Logger.getInstance();
      logger2.info('Second message');

      // ASSERT
      expect(logger1.getLogCount()).toBe(2);
      expect(logger2.getLogCount()).toBe(2);
    });
  });

  describe('Logging Functionality', () => {
    it('should log messages at different levels', () => {
      // ARRANGE
      const logger = Logger.getInstance('DEBUG');

      // ACT
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // ASSERT
      const logs = logger.getLogs();
      expect(logs).toHaveLength(4);
      expect(logs[0].level).toBe('DEBUG');
      expect(logs[1].level).toBe('INFO');
      expect(logs[2].level).toBe('WARN');
      expect(logs[3].level).toBe('ERROR');
    });

    it('should respect log level filtering', () => {
      // ARRANGE
      const logger = Logger.getInstance('WARN'); // Solo WARN y ERROR

      // ACT
      logger.debug('Should not appear');
      logger.info('Should not appear');
      logger.warn('Should appear');
      logger.error('Should appear');

      // ASSERT
      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].level).toBe('WARN');
      expect(logs[1].level).toBe('ERROR');
    });

    it('should include metadata in logs', () => {
      // ARRANGE
      const logger = Logger.getInstance();
      const metadata = { userId: '123', action: 'login' };

      // ACT
      logger.info('User logged in', metadata);

      // ASSERT
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].metadata).toEqual(metadata);
    });

    it('should clear all logs', () => {
      // ARRANGE
      const logger = Logger.getInstance();
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');

      // ACT
      logger.clearLogs();

      // ASSERT
      expect(logger.getLogCount()).toBe(0);
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should allow changing log level', () => {
      // ARRANGE
      const logger = Logger.getInstance('INFO');

      // ACT
      logger.debug('Should not appear');
      logger.info('Should appear');

      logger.setLogLevel('DEBUG');

      logger.debug('Now should appear');

      // ASSERT
      const logs = logger.getLogs();
      expect(logs).toHaveLength(2); // INFO + DEBUG después del cambio
      expect(logs[0].level).toBe('INFO');
      expect(logs[1].level).toBe('DEBUG');
    });
  });

  describe('Thread Safety (simulated)', () => {
    it('should handle concurrent getInstance calls', async () => {
      // ARRANGE & ACT
      // Simular múltiples llamadas concurrentes
      const promises = Array(10)
        .fill(null)
        .map(() => Promise.resolve(Logger.getInstance()));

      const instances = await Promise.all(promises);

      // ASSERT - Todas deben ser la misma instancia
      const firstInstance = instances[0];
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', () => {
      // ARRANGE
      const logger = Logger.getInstance();

      // ACT
      logger.info('');

      // ASSERT
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('');
    });

    it('should handle logs without metadata', () => {
      // ARRANGE
      const logger = Logger.getInstance();

      // ACT
      logger.info('Message without metadata');

      // ASSERT
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].metadata).toBeUndefined();
    });

    it('should handle complex metadata objects', () => {
      // ARRANGE
      const logger = Logger.getInstance();
      const complexMetadata = {
        user: { id: 123, name: 'John' },
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3],
      };

      // ACT
      logger.info('Complex metadata', complexMetadata);

      // ASSERT
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].metadata).toEqual(complexMetadata);
    });
  });
});
