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
 * Dependency Container
 *
 * El Composition Root donde se ensamblan todas las piezas.
 *
 * ¿Por qué un contenedor manual?
 * - Transparente: ves exactamente qué se inyecta
 * - Sin magia: no hay decoradores ni reflexión
 * - Tipado: TypeScript detecta errores de dependencias
 *
 * Para proyectos más grandes podrías usar:
 * - InversifyJS
 * - tsyringe
 * - awilix
 */

export type PersistenceType = 'memory' | 'postgresql';

export interface ContainerConfig {
  persistence: PersistenceType;
}

export interface Container {
  // Repositories
  bookRepository: BookRepository;
  userRepository: UserRepository;
  loanRepository: LoanRepository;
  idGenerator: IdGenerator;

  // Use Cases
  registerBookUseCase: RegisterBookUseCase;
  registerUserUseCase: RegisterUserUseCase;
  loanBookUseCase: LoanBookUseCase;
  returnBookUseCase: ReturnBookUseCase;
  getAvailableBooksUseCase: GetAvailableBooksUseCase;
  getUserLoansUseCase: GetUserLoansUseCase;

  // Controllers
  bookController: BookController;
  userController: UserController;
  loanController: LoanController;

  // Cleanup
  shutdown: () => Promise<void>;
}

/**
 * Crea el contenedor de dependencias
 *
 * ESTO ES LO MÁGICO DE LA ARQUITECTURA HEXAGONAL:
 * - Cambias de InMemory a PostgreSQL cambiando UNA variable
 * - El dominio y casos de uso no se enteran
 * - Los tests pueden usar InMemory, producción PostgreSQL
 */
export function createContainer(config: ContainerConfig): Container {
  let pool: Pool | undefined;
  let bookRepository: BookRepository;
  let userRepository: UserRepository;
  let loanRepository: LoanRepository;

  // Seleccionar implementación de repositorios según config
  if (config.persistence === 'postgresql') {
    console.log('Using PostgreSQL persistence');
    pool = createPoolFromEnv();
    bookRepository = new PostgresBookRepository(pool);
    userRepository = new PostgresUserRepository(pool);
    loanRepository = new PostgresLoanRepository(pool);
  } else {
    console.log('Using In-Memory persistence');
    bookRepository = new InMemoryBookRepository();
    userRepository = new InMemoryUserRepository();
    loanRepository = new InMemoryLoanRepository();
  }

  // IdGenerator siempre usa UUID
  const idGenerator = new UuidIdGenerator();

  // Crear casos de uso
  const registerBookUseCase = new RegisterBookUseCase(bookRepository, idGenerator);
  const registerUserUseCase = new RegisterUserUseCase(userRepository, idGenerator);
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
  const getAvailableBooksUseCase = new GetAvailableBooksUseCase(bookRepository);
  const getUserLoansUseCase = new GetUserLoansUseCase(userRepository, loanRepository);

  // Crear controladores
  const bookController = new BookController(
    registerBookUseCase,
    getAvailableBooksUseCase
  );
  const userController = new UserController(
    registerUserUseCase,
    getUserLoansUseCase
  );
  const loanController = new LoanController(loanBookUseCase, returnBookUseCase);

  // Función de cleanup
  const shutdown = async (): Promise<void> => {
    if (pool) {
      await pool.end();
    }
  };

  return {
    bookRepository,
    userRepository,
    loanRepository,
    idGenerator,
    registerBookUseCase,
    registerUserUseCase,
    loanBookUseCase,
    returnBookUseCase,
    getAvailableBooksUseCase,
    getUserLoansUseCase,
    bookController,
    userController,
    loanController,
    shutdown,
  };
}

/**
 * Crea el contenedor desde variables de entorno
 */
export function createContainerFromEnv(): Container {
  const persistenceType = (process.env.PERSISTENCE_TYPE ?? 'memory') as PersistenceType;

  return createContainer({
    persistence: persistenceType,
  });
}
