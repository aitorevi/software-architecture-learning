/**
 * Tests para ConfigManager - Thread-Safe Async Singleton
 *
 * Estos tests demuestran:
 * 1. Inicialización asíncrona
 * 2. Thread-safety (doble-check locking)
 * 3. Que múltiples inicializaciones concurrentes no crean múltiples instancias
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigManager } from '../src/infrastructure/singleton/ConfigManager.js';

describe('ConfigManager - Thread-Safe Async Singleton', () => {
  beforeEach(() => {
    // Resetear el singleton entre tests
    ConfigManager.resetForTesting();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance after initialization', async () => {
      // ARRANGE
      await ConfigManager.initializeAsync();

      // ACT
      const config1 = ConfigManager.getInstance();
      const config2 = ConfigManager.getInstance();

      // ASSERT
      expect(config1).toBe(config2);
    });

    it('should throw error if getInstance is called before initialization', () => {
      // ACT & ASSERT
      expect(() => ConfigManager.getInstance()).toThrow(
        'ConfigManager not initialized. Call initializeAsync() first.'
      );
    });

    it('should handle multiple concurrent initializations', async () => {
      // ARRANGE & ACT
      // Simular múltiples llamadas concurrentes a initializeAsync
      const promises = Array(10)
        .fill(null)
        .map(() => ConfigManager.initializeAsync());

      const instances = await Promise.all(promises);

      // ASSERT - Todas deben ser la misma instancia
      const firstInstance = instances[0];
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });

    it('should return existing instance if already initialized', async () => {
      // ARRANGE
      const instance1 = await ConfigManager.initializeAsync();

      // ACT
      const instance2 = await ConfigManager.initializeAsync();

      // ASSERT
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration Loading', () => {
    it('should load default configuration', async () => {
      // ARRANGE & ACT
      await ConfigManager.initializeAsync();
      const config = ConfigManager.getInstance();
      const appConfig = config.getConfig();

      // ASSERT
      expect(appConfig).toBeDefined();
      expect(appConfig.environment).toBe('development');
      expect(appConfig.apiUrl).toBe('http://localhost:3000');
      expect(appConfig.apiKey).toBe('dev-key-123');
    });

    it('should load custom configuration', async () => {
      // ARRANGE
      const customConfig = {
        environment: 'production' as const,
        apiUrl: 'https://api.production.com',
        apiKey: 'prod-key-xyz',
        features: {
          authentication: true,
          analytics: true,
          cache: true,
        },
      };

      // ACT
      await ConfigManager.initializeAsync(customConfig);
      const config = ConfigManager.getInstance();
      const appConfig = config.getConfig();

      // ASSERT
      expect(appConfig.environment).toBe('production');
      expect(appConfig.apiUrl).toBe('https://api.production.com');
      expect(appConfig.apiKey).toBe('prod-key-xyz');
      expect(appConfig.features.analytics).toBe(true);
    });

    it('should merge partial configuration with defaults', async () => {
      // ARRANGE
      const partialConfig = {
        environment: 'staging' as const,
        apiUrl: 'https://api.staging.com',
      };

      // ACT
      await ConfigManager.initializeAsync(partialConfig);
      const config = ConfigManager.getInstance();
      const appConfig = config.getConfig();

      // ASSERT
      expect(appConfig.environment).toBe('staging');
      expect(appConfig.apiUrl).toBe('https://api.staging.com');
      expect(appConfig.apiKey).toBe('dev-key-123'); // Default
      expect(appConfig.features.authentication).toBe(true); // Default
    });
  });

  describe('Configuration Access', () => {
    beforeEach(async () => {
      await ConfigManager.initializeAsync({
        environment: 'development',
        apiUrl: 'http://localhost:3000',
        apiKey: 'test-key',
        features: {
          authentication: true,
          analytics: false,
          cache: true,
        },
      });
    });

    it('should get specific config value', () => {
      // ARRANGE
      const config = ConfigManager.getInstance();

      // ACT
      const environment = config.get('environment');
      const apiUrl = config.get('apiUrl');

      // ASSERT
      expect(environment).toBe('development');
      expect(apiUrl).toBe('http://localhost:3000');
    });

    it('should check if feature is enabled', () => {
      // ARRANGE
      const config = ConfigManager.getInstance();

      // ACT
      const authEnabled = config.isFeatureEnabled('authentication');
      const analyticsEnabled = config.isFeatureEnabled('analytics');
      const cacheEnabled = config.isFeatureEnabled('cache');

      // ASSERT
      expect(authEnabled).toBe(true);
      expect(analyticsEnabled).toBe(false);
      expect(cacheEnabled).toBe(true);
    });

    it('should check if development environment', () => {
      // ARRANGE
      const config = ConfigManager.getInstance();

      // ACT & ASSERT
      expect(config.isDevelopment()).toBe(true);
      expect(config.isProduction()).toBe(false);
    });

    it('should return immutable config copy', () => {
      // ARRANGE
      const config = ConfigManager.getInstance();

      // ACT
      const appConfig1 = config.getConfig();
      const appConfig2 = config.getConfig();

      // Intentar modificar la config
      appConfig1.environment = 'production';

      // ASSERT
      expect(appConfig2.environment).toBe('development'); // No ha cambiado
      expect(config.get('environment')).toBe('development'); // Config interna no ha cambiado
    });
  });

  describe('Error Handling', () => {
    it('should throw error when accessing config before initialization', () => {
      // ACT & ASSERT
      expect(() => ConfigManager.getInstance()).toThrow();
    });

    it('should throw error when getting config before load', async () => {
      // ARRANGE
      ConfigManager.resetForTesting();

      // ACT & ASSERT
      expect(() => {
        ConfigManager.getInstance();
      }).toThrow('ConfigManager not initialized');
    });
  });

  describe('Async Behavior', () => {
    it('should wait for initialization to complete', async () => {
      // ARRANGE
      let initialized = false;

      // ACT
      const initPromise = ConfigManager.initializeAsync().then(() => {
        initialized = true;
      });

      // Antes de que termine, initialized debería ser false
      expect(initialized).toBe(false);

      await initPromise;

      // Después de que termine, initialized debería ser true
      expect(initialized).toBe(true);
    });

    it('should handle concurrent access during initialization', async () => {
      // ARRANGE & ACT
      const initPromise = ConfigManager.initializeAsync();

      // Intentar obtener la instancia mientras se inicializa
      const getInstancePromises = Array(5)
        .fill(null)
        .map(async () => {
          await initPromise;
          return ConfigManager.getInstance();
        });

      const instances = await Promise.all(getInstancePromises);

      // ASSERT
      const firstInstance = instances[0];
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });
  });

  describe('Production Environment', () => {
    it('should detect production environment correctly', async () => {
      // ARRANGE
      await ConfigManager.initializeAsync({
        environment: 'production',
        apiUrl: 'https://api.prod.com',
        apiKey: 'prod-key',
        features: {
          authentication: true,
          analytics: true,
          cache: true,
        },
      });

      const config = ConfigManager.getInstance();

      // ACT & ASSERT
      expect(config.isProduction()).toBe(true);
      expect(config.isDevelopment()).toBe(false);
    });
  });
});
