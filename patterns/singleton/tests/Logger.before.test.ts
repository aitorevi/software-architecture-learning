/**
 * Tests para LoggerBefore - Demostración del PROBLEMA sin Singleton
 *
 * Estos tests demuestran POR QUÉ necesitamos Singleton:
 * - Múltiples instancias independientes
 * - Estado NO compartido
 * - Desperdicio de recursos
 */

import { describe, it, expect } from 'vitest';
import { LoggerBefore } from '../src/infrastructure/singleton/Logger.before.js';

describe('LoggerBefore - SIN Singleton Pattern (El Problema)', () => {
  describe('Multiple Instances Problem', () => {
    it('should create different instances every time', () => {
      // ARRANGE & ACT
      const logger1 = new LoggerBefore();
      const logger2 = new LoggerBefore();
      const logger3 = new LoggerBefore();

      // ASSERT - ❌ Son instancias DIFERENTES
      expect(logger1).not.toBe(logger2);
      expect(logger2).not.toBe(logger3);
      expect(logger1).not.toBe(logger3);

      // Esto es un PROBLEMA porque:
      // - Consume más memoria (3 instancias en lugar de 1)
      // - Cada una tiene su propio estado independiente
      // - Si una cambia configuración, las otras no se enteran
    });

    it('should NOT share state between instances', () => {
      // ARRANGE
      const logger1 = new LoggerBefore();
      const logger2 = new LoggerBefore();

      // ACT
      logger1.info('Message from logger1');
      logger2.info('Message from logger2');

      // ASSERT - ❌ Cada una tiene sus propios logs
      const logs1 = logger1.getLogs();
      const logs2 = logger2.getLogs();

      expect(logs1).toHaveLength(1); // Solo ve su propio mensaje
      expect(logs2).toHaveLength(1); // Solo ve su propio mensaje
      expect(logs1[0]).not.toBe(logs2[0]); // Son objetos diferentes

      // Esto es un PROBLEMA porque:
      // - Los logs están fragmentados entre instancias
      // - No puedes ver el historial completo
      // - Dificulta el debugging
    });

    it('should have independent configuration', () => {
      // ARRANGE
      const logger1 = new LoggerBefore('DEBUG');
      const logger2 = new LoggerBefore('ERROR');

      // ACT
      logger1.debug('Debug message');
      logger2.debug('This will not appear');

      // ASSERT
      const logs1 = logger1.getLogs();
      const logs2 = logger2.getLogs();

      expect(logs1).toHaveLength(1); // logger1 vio el DEBUG
      expect(logs2).toHaveLength(0); // logger2 lo filtró

      // Esto es un PROBLEMA porque:
      // - Configuración inconsistente en la aplicación
      // - Cada módulo puede tener su propio nivel de log
      // - Difícil de controlar globalmente
    });

    it('should waste resources with multiple instances', () => {
      // ARRANGE & ACT
      // Imagina que esto pasa en una app real con 50 módulos
      const loggers = Array(50)
        .fill(null)
        .map(() => new LoggerBefore());

      // ASSERT - ❌ 50 instancias diferentes
      const uniqueInstances = new Set(loggers);
      expect(uniqueInstances.size).toBe(50);

      // Esto es un PROBLEMA porque:
      // - 50 arrays de logs en memoria
      // - 50 objetos ocupando espacio
      // - En un Logger real: 50 archivos abiertos, 50 buffers, etc.
      // - Todo esto cuando solo necesitas UNA instancia
    });

    it('should demonstrate configuration drift', () => {
      // ARRANGE
      const logger1 = new LoggerBefore('INFO');
      const logger2 = new LoggerBefore('INFO');

      logger1.info('Initial message');

      // ACT - Cambiar configuración en una instancia
      logger1.setLogLevel('ERROR');

      // ASSERT - ❌ logger2 NO se entera del cambio
      logger1.warn('This will not appear'); // Filtrado por ERROR
      logger2.warn('This WILL appear'); // Sigue en INFO

      expect(logger1.getLogs()).toHaveLength(1); // Solo el inicial
      expect(logger2.getLogs()).toHaveLength(1); // Inicial + warn

      // Esto es un PROBLEMA porque:
      // - Las instancias se "dessincronizan"
      // - No hay una "fuente de verdad" única
      // - Comportamiento impredecible
    });
  });

  describe('Why Singleton is Needed', () => {
    it('should show the need for global state', () => {
      // ARRANGE
      const logger1 = new LoggerBefore();

      // Simular que un módulo loguea algo
      logger1.info('User logged in');

      // ACT
      // Otro módulo crea su propio logger y quiere ver los logs
      const logger2 = new LoggerBefore();

      // ASSERT - ❌ No puede ver los logs previos
      expect(logger2.getLogs()).toHaveLength(0);

      // CON SINGLETON:
      // const logger1 = Logger.getInstance();
      // logger1.info('User logged in');
      // const logger2 = Logger.getInstance(); // Misma instancia
      // expect(logger2.getLogs()).toHaveLength(1); // ✅ Ve los logs previos
    });

    it('should show memory waste', () => {
      // ARRANGE & ACT
      const instances = Array(100)
        .fill(null)
        .map(() => {
          const logger = new LoggerBefore();
          logger.info('Test message');
          logger.info('Another message');
          logger.info('One more message');
          return logger;
        });

      // ASSERT
      // Cada instancia tiene 3 logs = 300 LogEntry objects en total
      const totalLogs = instances.reduce((sum, logger) => sum + logger.getLogs().length, 0);
      expect(totalLogs).toBe(300);

      // CON SINGLETON:
      // const logger = Logger.getInstance();
      // ... 100 llamadas desde diferentes módulos ...
      // Total: 300 LogEntry objects, pero en UNA sola instancia
      // Mismo resultado, menos memoria desperdiciada
    });
  });
});
