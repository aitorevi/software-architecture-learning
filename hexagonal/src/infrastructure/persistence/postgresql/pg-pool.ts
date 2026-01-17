import { Pool, PoolConfig } from 'pg';

/**
 * PostgreSQL Connection Pool
 *
 * Configuración centralizada del pool de conexiones.
 * Las credenciales vienen de variables de entorno.
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // Max connections in pool
}

let pool: Pool | null = null;

export function createPool(config: DatabaseConfig): Pool {
  const poolConfig: PoolConfig = {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: config.max ?? 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  pool = new Pool(poolConfig);

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error(
      'Database pool not initialized. Call createPool() first.'
    );
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Crea el pool desde variables de entorno
 */
export function createPoolFromEnv(): Pool {
  return createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'library',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    max: parseInt(process.env.DB_MAX_CONNECTIONS ?? '10', 10),
  });
}
