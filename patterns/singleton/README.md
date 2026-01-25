# Singleton Pattern - Learning Project

A comprehensive, pedagogical example of the Singleton Design Pattern in TypeScript, demonstrating three different implementation variants with real-world use cases.

## Quick Start

```bash
npm install
npm test          # Run all tests
npm run dev       # Start dev server on localhost:3000
```

## What You'll Learn

- ✅ **Singleton Pattern** - Guarantee a single instance
- ✅ **Lazy Initialization** - Create instance when needed
- ✅ **Eager Initialization** - Create instance on class load
- ✅ **Thread-Safe Async** - Handle concurrent initialization
- ✅ **When to use** (and when NOT to use) Singleton
- ✅ **Testing Singletons** - Handle global state in tests
- ✅ **Modern alternatives** - ES6 modules, DI

## Three Implementation Variants

### 1. Lazy Singleton (Logger)
Instance created on first use.

```typescript
const logger = Logger.getInstance();
logger.info('Hello, world!');
```

**Use when:**
- Quick initialization
- Might not be used
- You need control over when it's created

### 2. Eager Singleton (DatabaseConnection)
Instance created immediately on class load.

```typescript
const db = DatabaseConnection.getInstance();
await db.connect();
```

**Use when:**
- Always needed
- Fast initialization
- Want fail-fast behavior
- Need thread-safety by default

### 3. Thread-Safe Async (ConfigManager)
Async initialization with double-check locking.

```typescript
await ConfigManager.initializeAsync();
const config = ConfigManager.getInstance();
```

**Use when:**
- Async initialization (I/O, network)
- Expensive initialization
- Need to prevent race conditions
- Using Worker Threads

## Project Structure

```
src/
├── domain/
│   ├── entities/
│   │   └── LogEntry.ts              # Log entry entity
│   └── value-objects/
│       └── ConnectionConfig.ts      # DB config value object
│
├── application/
│   ├── use-cases/                   # Business logic
│   └── dtos/                        # Data transfer objects
│
└── infrastructure/
    ├── singleton/
    │   ├── Logger.before.ts         # ❌ Without Singleton (the problem)
    │   ├── Logger.ts                # ✅ Lazy Singleton
    │   ├── DatabaseConnection.ts    # ✅ Eager Singleton
    │   └── ConfigManager.ts         # ✅ Thread-Safe Async Singleton
    └── http/
        └── index.ts                 # Express API

tests/
├── Logger.before.test.ts            # Tests showing the problem
├── Logger.test.ts                   # Lazy Singleton tests
├── DatabaseConnection.test.ts       # Eager Singleton tests
└── ConfigManager.test.ts            # Thread-Safe tests
```

## API Endpoints

```bash
# Demonstrate it's a singleton
GET /demo/singleton-proof

# Logger
POST   /logs              # Create log
GET    /logs              # Get all logs
DELETE /logs              # Clear logs
PUT    /logs/level        # Change log level

# Database
POST   /database/connect    # Connect to database
POST   /database/disconnect # Disconnect
GET    /database/status     # Connection status

# Config
GET    /config                    # Get full config
GET    /config/feature/:name      # Check if feature is enabled
```

## When to Use Singleton

### ✅ Good Use Cases

- **Logger** - Single log file, centralized configuration
- **App Configuration** - Single source of truth
- **Database Connection Pool** - Share connections efficiently
- **Cache Manager** - Avoid duplicates in memory
- **Event Bus** - Central communication point

### ❌ Bad Use Cases (Anti-patterns)

- **Business State** - Use proper state management
- **Services** - Use Dependency Injection instead
- **Mutable Shared Data** - Use state management libraries
- **"Sharing state"** - Usually there's a better way

### Golden Rule

> "If you're unsure whether to use Singleton, you probably shouldn't.
> Only use it for truly global shared resources."

## Testing

All tests demonstrate:
- ✅ Same instance always returned
- ✅ State shared across references
- ✅ Lazy vs Eager initialization
- ✅ Thread-safety in async code
- ❌ The problem without Singleton

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
```

Test coverage includes:
- 48 tests across 4 test suites
- Unit tests for all three variants
- Edge cases and error handling
- Concurrent initialization scenarios

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[README_ES.md](./README_ES.md)** - Complete tutorial in Spanish (60 min read)
- **[PRESENTATION.md](./PRESENTATION.md)** - Guide for presenting this to others
- **[WELCOME.txt](./WELCOME.txt)** - Project overview

## Modern Alternatives

### ES6 Modules (Recommended for most cases)

```typescript
// logger.ts
export const logger = new Logger();  // Natural singleton in Node.js

// moduleA.ts
import { logger } from './logger';   // Same instance everywhere
```

### Dependency Injection

```typescript
@injectable()
class UserService {
  constructor(private logger: Logger) { }
}
```

**When to use what:**
- **Classic Singleton:** Logger, Config in small apps
- **ES6 Module:** Most cases in modern Node.js
- **DI Framework:** Large apps, teams using DI

## Key Takeaways

1. **What it is:** Guarantees a single global instance
2. **When to use:** Logger, Config, Connection Pools
3. **When NOT to use:** Business state, regular services
4. **How to test:** Reset instance between tests
5. **Alternatives:** ES6 modules, DI frameworks

## Author

**El Profe Millo** - Software Architecture Instructor

> "A well-used Singleton is elegant.
> A hundred Singletons are a global disaster."

## License

MIT
