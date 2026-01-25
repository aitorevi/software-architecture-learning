/**
 * Tests para DatabaseConnection - Eager Singleton
 *
 * Estos tests demuestran:
 * 1. Eager initialization (se crea al cargar la clase)
 * 2. Que siempre es la misma instancia
 * 3. Gestión de estado de conexión
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseConnection } from '../src/infrastructure/singleton/DatabaseConnection.js';
import { ConnectionConfig } from '../src/domain/value-objects/ConnectionConfig.js';

describe('DatabaseConnection - Eager Singleton', () => {
  beforeEach(() => {
    // Resetear estado entre tests
    DatabaseConnection.resetForTesting();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance every time', () => {
      // ARRANGE & ACT
      const db1 = DatabaseConnection.getInstance();
      const db2 = DatabaseConnection.getInstance();
      const db3 = DatabaseConnection.getInstance();

      // ASSERT
      expect(db1).toBe(db2);
      expect(db2).toBe(db3);
    });

    it('should share connection state across all references', async () => {
      // ARRANGE
      const db1 = DatabaseConnection.getInstance();
      const db2 = DatabaseConnection.getInstance();

      const config = new ConnectionConfig({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
      });

      // ACT
      db1.configure(config);
      await db1.connect();

      // ASSERT - db2 también ve la conexión
      expect(db2.isConnected()).toBe(true);
      expect(db2.getConnectionCount()).toBe(1);
    });
  });

  describe('Connection Lifecycle', () => {
    it('should connect successfully with valid config', async () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();
      const config = new ConnectionConfig({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
      });

      // ACT
      db.configure(config);
      await db.connect();

      // ASSERT
      expect(db.isConnected()).toBe(true);
      expect(db.getConnectionCount()).toBe(1);
    });

    it('should throw error if connecting without configuration', async () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();

      // ACT & ASSERT
      await expect(db.connect()).rejects.toThrow(
        'Database not configured. Call configure() first.'
      );
    });

    it('should not allow reconfiguration while connected', async () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();
      const config1 = new ConnectionConfig({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
      });
      const config2 = new ConnectionConfig({
        host: 'localhost',
        port: 5433,
        database: 'otherdb',
        username: 'user',
        password: 'pass',
      });

      db.configure(config1);
      await db.connect();

      // ACT & ASSERT
      expect(() => db.configure(config2)).toThrow(
        'Cannot reconfigure while connected. Disconnect first.'
      );
    });

    it('should disconnect successfully', async () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();
      const config = new ConnectionConfig({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
      });

      db.configure(config);
      await db.connect();

      // ACT
      await db.disconnect();

      // ASSERT
      expect(db.isConnected()).toBe(false);
    });

    it('should handle multiple connect/disconnect cycles', async () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();
      const config = new ConnectionConfig({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
      });

      db.configure(config);

      // ACT
      await db.connect();
      await db.disconnect();
      await db.connect();
      await db.disconnect();
      await db.connect();

      // ASSERT
      expect(db.isConnected()).toBe(true);
      expect(db.getConnectionCount()).toBe(3); // 3 conexiones realizadas
    });

    it('should not throw when disconnecting if not connected', async () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();

      // ACT & ASSERT
      await expect(db.disconnect()).resolves.not.toThrow();
    });

    it('should not throw when connecting if already connected', async () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();
      const config = new ConnectionConfig({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
      });

      db.configure(config);
      await db.connect();

      // ACT & ASSERT
      await expect(db.connect()).resolves.not.toThrow();
      expect(db.getConnectionCount()).toBe(1); // No incrementa el contador
    });
  });

  describe('Query Execution', () => {
    it('should execute queries when connected', async () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();
      const config = new ConnectionConfig({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
      });

      db.configure(config);
      await db.connect();

      // ACT
      const result = await db.query('SELECT * FROM users');

      // ASSERT
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw error when querying without connection', async () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();

      // ACT & ASSERT
      await expect(db.query('SELECT * FROM users')).rejects.toThrow(
        'Database not connected. Call connect() first.'
      );
    });
  });

  describe('Configuration', () => {
    it('should store and retrieve configuration', () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();
      const config = new ConnectionConfig({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
      });

      // ACT
      db.configure(config);
      const retrievedConfig = db.getConfig();

      // ASSERT
      expect(retrievedConfig).toBeDefined();
      expect(retrievedConfig?.host).toBe('localhost');
      expect(retrievedConfig?.port).toBe(5432);
      expect(retrievedConfig?.database).toBe('testdb');
    });

    it('should return null config if not configured', () => {
      // ARRANGE
      const db = DatabaseConnection.getInstance();

      // ACT
      const config = db.getConfig();

      // ASSERT
      expect(config).toBeNull();
    });
  });
});
