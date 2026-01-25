/**
 * DEMO - Singleton Pattern
 *
 * Este archivo demuestra el uso de las tres variantes de Singleton.
 * Ejecuta: tsx demo.ts
 */

import { Logger } from './src/infrastructure/singleton/Logger.js';
import { DatabaseConnection } from './src/infrastructure/singleton/DatabaseConnection.js';
import { ConfigManager } from './src/infrastructure/singleton/ConfigManager.js';
import { ConnectionConfig } from './src/domain/value-objects/ConnectionConfig.js';

console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║              🎯 SINGLETON PATTERN - DEMOSTRACIÓN                     ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`);

// ============================================================================
// 1. LAZY SINGLETON (Logger)
// ============================================================================

console.log('\n📝 1. LAZY SINGLETON - Logger\n');
console.log('   La instancia se crea cuando se pide por primera vez\n');

const logger1 = Logger.getInstance();
console.log('   ✅ logger1 = Logger.getInstance()');

const logger2 = Logger.getInstance();
console.log('   ✅ logger2 = Logger.getInstance()');

console.log(`\n   ¿Son la misma instancia? ${logger1 === logger2 ? '✅ SÍ' : '❌ NO'}`);

logger1.info('Mensaje desde logger1');
logger2.warn('Mensaje desde logger2');

console.log(`\n   Logs en logger1: ${logger1.getLogCount()}`);
console.log(`   Logs en logger2: ${logger2.getLogCount()}`);
console.log('   ✅ Ambos ven los mismos logs (estado compartido)\n');

// ============================================================================
// 2. EAGER SINGLETON (DatabaseConnection)
// ============================================================================

console.log('\n🗄️  2. EAGER SINGLETON - DatabaseConnection\n');
console.log('   La instancia se crea al cargar la clase\n');

const db1 = DatabaseConnection.getInstance();
console.log('   ✅ db1 = DatabaseConnection.getInstance()');

const db2 = DatabaseConnection.getInstance();
console.log('   ✅ db2 = DatabaseConnection.getInstance()');

console.log(`\n   ¿Son la misma instancia? ${db1 === db2 ? '✅ SÍ' : '❌ NO'}`);

// Configurar y conectar
const config = new ConnectionConfig({
  host: 'localhost',
  port: 5432,
  database: 'demo_db',
  username: 'demo_user',
  password: 'demo_password',
});

db1.configure(config);
await db1.connect();

console.log(`\n   Estado de db1: ${db1.isConnected() ? '✅ Conectada' : '❌ Desconectada'}`);
console.log(`   Estado de db2: ${db2.isConnected() ? '✅ Conectada' : '❌ Desconectada'}`);
console.log('   ✅ Ambas comparten el mismo estado de conexión\n');

await db1.disconnect();

// ============================================================================
// 3. THREAD-SAFE ASYNC SINGLETON (ConfigManager)
// ============================================================================

console.log('\n⚙️  3. THREAD-SAFE ASYNC SINGLETON - ConfigManager\n');
console.log('   Inicialización asíncrona segura contra race conditions\n');

// Simular múltiples inicializaciones concurrentes
console.log('   Lanzando 5 inicializaciones concurrentes...\n');

const initPromises = [
  ConfigManager.initializeAsync({
    environment: 'development',
    apiUrl: 'http://localhost:3000',
    apiKey: 'demo-key',
    features: {
      authentication: true,
      analytics: false,
      cache: true,
    },
  }),
  ConfigManager.initializeAsync(),
  ConfigManager.initializeAsync(),
  ConfigManager.initializeAsync(),
  ConfigManager.initializeAsync(),
];

const configs = await Promise.all(initPromises);

console.log('   ✅ Todas las inicializaciones completadas');

const allSame = configs.every(cfg => cfg === configs[0]);
console.log(`\n   ¿Todas devuelven la misma instancia? ${allSame ? '✅ SÍ' : '❌ NO'}`);

const config1 = ConfigManager.getInstance();
const config2 = ConfigManager.getInstance();

console.log(`\n   ¿config1 === config2? ${config1 === config2 ? '✅ SÍ' : '❌ NO'}`);

console.log('\n   Configuración cargada:');
console.log(`   - Entorno: ${config1.get('environment')}`);
console.log(`   - API URL: ${config1.get('apiUrl')}`);
console.log(`   - Autenticación: ${config1.isFeatureEnabled('authentication') ? '✅' : '❌'}`);
console.log(`   - Analytics: ${config1.isFeatureEnabled('analytics') ? '✅' : '❌'}`);
console.log(`   - Cache: ${config1.isFeatureEnabled('cache') ? '✅' : '❌'}`);

// ============================================================================
// COMPARACIÓN: CON vs SIN Singleton
// ============================================================================

console.log('\n\n📊 COMPARACIÓN: CON vs SIN Singleton\n');

console.log('   SIN Singleton (Logger.before.ts):');
console.log('   ❌ Cada módulo crea su propia instancia');
console.log('   ❌ Estado NO compartido');
console.log('   ❌ Logs fragmentados');
console.log('   ❌ Configuración inconsistente');
console.log('   ❌ Desperdicio de recursos\n');

console.log('   CON Singleton:');
console.log('   ✅ Una única instancia global');
console.log('   ✅ Estado compartido entre todos');
console.log('   ✅ Logs centralizados');
console.log('   ✅ Configuración consistente');
console.log('   ✅ Eficiente en recursos\n');

// ============================================================================
// RESUMEN
// ============================================================================

console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                           RESUMEN                                    ║
╚══════════════════════════════════════════════════════════════════════╝

  📌 LAZY SINGLETON (Logger)
     - Se crea cuando se pide por primera vez
     - Ahorra memoria si no se usa
     - ⚠️  No thread-safe por defecto

  📌 EAGER SINGLETON (DatabaseConnection)
     - Se crea al cargar la clase
     - Thread-safe por defecto
     - Siempre en memoria

  📌 THREAD-SAFE ASYNC (ConfigManager)
     - Inicialización asíncrona segura
     - Evita race conditions
     - Doble-check locking

╔══════════════════════════════════════════════════════════════════════╗
║                      CUÁNDO USAR SINGLETON                           ║
╚══════════════════════════════════════════════════════════════════════╝

  ✅ Logger              - Una sola fuente de logs
  ✅ Configuración       - Una sola fuente de verdad
  ✅ Pool de Conexiones  - Compartir conexiones
  ✅ Cache Manager       - Evitar duplicados
  ✅ Event Bus           - Punto central de comunicación

  ❌ Estado de negocio   - Usa state management
  ❌ Servicios normales  - Usa Dependency Injection
  ❌ "Compartir estado"  - Hay mejores formas

╔══════════════════════════════════════════════════════════════════════╗
║                      LA REGLA DE ORO                                 ║
╚══════════════════════════════════════════════════════════════════════╝

  "Si dudas si usar Singleton, probablemente NO deberías usarlo.
   Solo úsalo para recursos compartidos globales."

                                              -- El Profe Millo

`);
