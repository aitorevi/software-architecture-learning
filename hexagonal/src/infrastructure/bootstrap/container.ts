/**
 * ============================================================================
 * 🔧 PATRÓN REPOSITORY - PASO 8: CONTAINER (Composition Root / Inyección)
 * ============================================================================
 *
 * ¡Anda p'allá, mi niño! Aquí es donde se unen TODAS las piezas del puzzle.
 * Este es el COMPOSITION ROOT (raíz de composición) de la aplicación.
 *
 * ¿QUÉ ES UN COMPOSITION ROOT?
 * ───────────────────────────
 * Es el ÚNICO lugar en tu aplicación donde:
 * - Creas instancias (new InMemoryBookRepository, new PostgresBookRepository)
 * - Conectas dependencias (UseCase recibe Repository)
 * - Decides qué implementación usar (InMemory vs PostgreSQL)
 *
 * Analogía:
 * El resto de tu código son "componentes sueltos" (CPU, RAM, disco).
 * El Composition Root es la "placa base" que los conecta todos.
 *
 * INYECCIÓN DE DEPENDENCIAS:
 * ─────────────────────────
 *
 *   Controller ──necesita──> UseCase ──necesita──> Repository
 *                                                       ↑
 *                                                       │
 *                                         ¿Cuál implementación?
 *                                         - InMemoryBookRepository
 *                                         - PostgresBookRepository
 *
 * El Container DECIDE y CONECTA:
 *
 *   const repo = new PostgresBookRepository(pool);  ← Crear
 *   const useCase = new RegisterBookUseCase(repo);  ← Inyectar
 *   const controller = new BookController(useCase); ← Inyectar
 *
 * Ninguna de estas clases se crea a sí misma.
 * Todas RECIBEN sus dependencias por constructor.
 *
 * LO MÁGICO DEL PATRÓN REPOSITORY:
 * ───────────────────────────────
 *
 *   if (config.persistence === 'postgresql') {
 *     bookRepository = new PostgresBookRepository(pool);  ← PostgreSQL
 *   } else {
 *     bookRepository = new InMemoryBookRepository();      ← InMemory
 *   }
 *
 * Solo cambiando UNA variable (config.persistence), toda la aplicación
 * usa PostgreSQL o InMemory.
 *
 * El UseCase NO SABE cuál está usando (solo conoce la interface).
 * Eso está fetén!
 *
 * VENTAJAS DEL CONTAINER MANUAL:
 * ─────────────────────────────
 * 1. TRANSPARENTE: Ves exactamente qué depende de qué
 * 2. SIN MAGIA: No hay decoradores mágicos (@Injectable)
 * 3. TIPADO: TypeScript detecta errores en compilación
 * 4. SIMPLE: No necesitas librería de DI (para proyectos pequeños)
 *
 * ALTERNATIVAS (para proyectos grandes):
 * ─────────────────────────────────────
 * - InversifyJS (con decoradores)
 * - tsyringe (de Microsoft)
 * - awilix (más funcional)
 *
 * ESTA ES LA CLAVE DE LA ARQUITECTURA HEXAGONAL:
 * ──────────────────────────────────────────────
 * Toda la magia de "puedes cambiar de BD sin tocar código"
 * se reduce a ESTE archivo.
 *
 * Cambia config.persistence de 'memory' a 'postgresql':
 * - El dominio: NO cambia
 * - Los casos de uso: NO cambian
 * - Los controladores: NO cambian
 * - Solo cambia: la implementación del Repository que se inyecta
 *
 * ¡Eso es inversión de dependencias en acción!
 * ============================================================================
 */

import { Pool } from 'pg';
import {
  BookRepository,
  UserRepository,
  LoanRepository,
  IdGenerator,
} from '../../domain';
import {
  RegisterBookUseCase,
  RegisterUserUseCase,
  LoanBookUseCase,
  ReturnBookUseCase,
  GetAvailableBooksUseCase,
  GetUserLoansUseCase,
} from '../../application';
import {
  InMemoryBookRepository,
  InMemoryUserRepository,
  InMemoryLoanRepository,
  UuidIdGenerator,
} from '../persistence/in-memory';
import {
  PostgresBookRepository,
  PostgresUserRepository,
  PostgresLoanRepository,
  createPoolFromEnv,
} from '../persistence/postgresql';
import {
  BookController,
  UserController,
  LoanController,
} from '../controllers/rest';

/**
 * TIPOS DE PERSISTENCIA
 * ────────────────────
 * Solo hay dos opciones:
 * - 'memory': InMemoryBookRepository, InMemoryUserRepository...
 * - 'postgresql': PostgresBookRepository, PostgresUserRepository...
 *
 * Podrías añadir más:
 * - 'mongodb'
 * - 'redis'
 * - 'filesystem'
 */
export type PersistenceType = 'memory' | 'postgresql';

/**
 * CONFIGURACIÓN DEL CONTAINER
 * ──────────────────────────
 * Por ahora solo configura qué tipo de persistencia usar.
 * Podrías añadir más opciones:
 * - logging: boolean
 * - eventBusType: 'memory' | 'rabbitmq'
 * - cacheType: 'memory' | 'redis'
 */
export interface ContainerConfig {
  persistence: PersistenceType;
}

/**
 * INTERFACE DEL CONTAINER
 * ──────────────────────
 * Define qué expone el container.
 * Todo lo que necesitas acceder desde fuera está aquí.
 *
 * CAPAS (fíjate en el orden):
 * 1. Repositories (capa más baja - infraestructura)
 * 2. Use Cases (capa media - aplicación)
 * 3. Controllers (capa más alta - infraestructura)
 */
export interface Container {
  // ═══════════════════════════════════════════════════════════
  // REPOSITORIES (implementaciones de los puertos)
  // ═══════════════════════════════════════════════════════════
  bookRepository: BookRepository;        // InMemory o Postgres
  userRepository: UserRepository;        // InMemory o Postgres
  loanRepository: LoanRepository;        // InMemory o Postgres
  idGenerator: IdGenerator;              // Siempre UUID

  // ═══════════════════════════════════════════════════════════
  // USE CASES (orquestadores)
  // ═══════════════════════════════════════════════════════════
  registerBookUseCase: RegisterBookUseCase;
  registerUserUseCase: RegisterUserUseCase;
  loanBookUseCase: LoanBookUseCase;
  returnBookUseCase: ReturnBookUseCase;
  getAvailableBooksUseCase: GetAvailableBooksUseCase;
  getUserLoansUseCase: GetUserLoansUseCase;

  // ═══════════════════════════════════════════════════════════
  // CONTROLLERS (adaptadores de entrada HTTP)
  // ═══════════════════════════════════════════════════════════
  bookController: BookController;
  userController: UserController;
  loanController: LoanController;

  // ═══════════════════════════════════════════════════════════
  // CLEANUP (cerrar recursos)
  // ═══════════════════════════════════════════════════════════
  shutdown: () => Promise<void>;
}

/**
 * ════════════════════════════════════════════════════════════════════════
 * FUNCIÓN PRINCIPAL: createContainer
 * ════════════════════════════════════════════════════════════════════════
 *
 * AQUÍ OCURRE LA MAGIA DE LA ARQUITECTURA HEXAGONAL
 *
 * Dependiendo de config.persistence, creamos:
 * - InMemoryRepositories → para desarrollo/tests
 * - PostgresRepositories → para producción
 *
 * El RESTO del código (UseCase, Controller) NO CAMBIA.
 * Solo cambia QUÉ implementación del Repository se inyecta.
 *
 * FLUJO:
 * 1. Decidir qué implementación de Repository usar
 * 2. Crear Repositories
 * 3. Crear UseCases (inyectando Repositories)
 * 4. Crear Controllers (inyectando UseCases)
 * 5. Devolver todo en el Container
 */
export function createContainer(config: ContainerConfig): Container {
  let pool: Pool | undefined;
  let bookRepository: BookRepository;      // ← Tipo: interface
  let userRepository: UserRepository;      // ← Tipo: interface
  let loanRepository: LoanRepository;      // ← Tipo: interface

  // ═══════════════════════════════════════════════════════════════
  // PASO 1: Seleccionar implementación de Repositories
  // ═══════════════════════════════════════════════════════════════
  // ESTE if es la clave de la intercambiabilidad.
  // Cambia config.persistence y toda la app usa otra BD.
  if (config.persistence === 'postgresql') {
    console.log('Using PostgreSQL persistence');

    // Crear pool de conexiones a PostgreSQL
    pool = createPoolFromEnv();

    // Crear implementaciones PostgreSQL
    bookRepository = new PostgresBookRepository(pool);
    userRepository = new PostgresUserRepository(pool);
    loanRepository = new PostgresLoanRepository(pool);
  } else {
    console.log('Using In-Memory persistence');

    // Crear implementaciones InMemory
    bookRepository = new InMemoryBookRepository();
    userRepository = new InMemoryUserRepository();
    loanRepository = new InMemoryLoanRepository();
  }

  // ═══════════════════════════════════════════════════════════════
  // PASO 2: Crear IdGenerator
  // ═══════════════════════════════════════════════════════════════
  // Siempre usamos UUID (podrías tener otras estrategias: CUID, Snowflake...)
  const idGenerator = new UuidIdGenerator();

  // ═══════════════════════════════════════════════════════════════
  // PASO 3: Crear Use Cases (INYECTANDO Repositories)
  // ═══════════════════════════════════════════════════════════════
  // Fíjate: pasamos bookRepository (la variable, no la clase).
  // El UseCase NO SABE si es InMemory o PostgreSQL.
  // Solo sabe que es un BookRepository (interface).
  const registerBookUseCase = new RegisterBookUseCase(
    bookRepository,    // ← Inyección de dependencia
    idGenerator
  );

  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    idGenerator
  );

  const loanBookUseCase = new LoanBookUseCase(
    userRepository,
    bookRepository,
    loanRepository,
    idGenerator
  );

  const returnBookUseCase = new ReturnBookUseCase(
    userRepository,
    bookRepository,
    loanRepository
  );

  const getAvailableBooksUseCase = new GetAvailableBooksUseCase(
    bookRepository     // ← Misma instancia que en registerBookUseCase
  );

  const getUserLoansUseCase = new GetUserLoansUseCase(
    userRepository,
    loanRepository
  );

  // ═══════════════════════════════════════════════════════════════
  // PASO 4: Crear Controllers (INYECTANDO Use Cases)
  // ═══════════════════════════════════════════════════════════════
  // El Controller NO conoce los Repositories.
  // Solo conoce los Use Cases.
  const bookController = new BookController(
    registerBookUseCase,
    getAvailableBooksUseCase
  );

  const userController = new UserController(
    registerUserUseCase,
    getUserLoansUseCase
  );

  const loanController = new LoanController(
    loanBookUseCase,
    returnBookUseCase
  );

  // ═══════════════════════════════════════════════════════════════
  // PASO 5: Crear función de cleanup
  // ═══════════════════════════════════════════════════════════════
  // Si usamos PostgreSQL, tenemos que cerrar el pool al terminar.
  // Si usamos InMemory, no hay nada que cerrar.
  const shutdown = async (): Promise<void> => {
    if (pool) {
      console.log('Closing PostgreSQL connection pool...');
      await pool.end();
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // PASO 6: Devolver todo en el Container
  // ═══════════════════════════════════════════════════════════════
  // Ahora cualquier parte de la app puede acceder a:
  // - container.bookController.router (para Express)
  // - container.registerBookUseCase (para tests)
  // - container.bookRepository (para debugging)
  return {
    // Repositories
    bookRepository,
    userRepository,
    loanRepository,
    idGenerator,

    // Use Cases
    registerBookUseCase,
    registerUserUseCase,
    loanBookUseCase,
    returnBookUseCase,
    getAvailableBooksUseCase,
    getUserLoansUseCase,

    // Controllers
    bookController,
    userController,
    loanController,

    // Cleanup
    shutdown,
  };
}

/**
 * ════════════════════════════════════════════════════════════════════════
 * HELPER: createContainerFromEnv
 * ════════════════════════════════════════════════════════════════════════
 *
 * Crea el container leyendo la config desde variables de entorno.
 *
 * USO:
 *   # Desarrollo (InMemory)
 *   PERSISTENCE_TYPE=memory npm start
 *
 *   # Producción (PostgreSQL)
 *   PERSISTENCE_TYPE=postgresql npm start
 *
 * Si no se especifica PERSISTENCE_TYPE, usa 'memory' por defecto.
 */
export function createContainerFromEnv(): Container {
  const persistenceType = (process.env.PERSISTENCE_TYPE ?? 'memory') as PersistenceType;

  console.log(`Creating container with persistence: ${persistenceType}`);

  return createContainer({
    persistence: persistenceType,
  });
}
