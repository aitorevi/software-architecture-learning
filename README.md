# Software Architecture Learning

A collection of projects demonstrating different **software architecture patterns**, from basic layered architecture to advanced DDD patterns.

## Structure

```
software-architecture-learning/
├── layered/                          # Layered Architecture
│   ├── repository-pattern/           # Basic repository pattern
│   └── controller-service/           # Controller-Service-Repository
├── hexagonal/                        # Hexagonal Architecture
│   └── library-system/               # Library management system
├── slicing/                          # Code Organization Patterns
│   ├── vertical-slicing-tasks/       # Feature-based organization
│   └── cqrs-inventory/               # Command Query Responsibility Segregation
└── ddd/                              # Domain-Driven Design
    ├── event-driven-orders/          # Event-driven architecture
    └── bounded-contexts-ecommerce/   # Bounded contexts with integration events
```

## Projects

| Level | Project | Pattern | Description |
|-------|---------|---------|-------------|
| Beginner | [repository-pattern](./layered/repository-pattern) | Layered | Basic repository pattern introduction |
| Beginner | [controller-service](./layered/controller-service) | Layered | Controller-Service-Repository structure |
| Intermediate | [library-system](./hexagonal/library-system) | Hexagonal | Full hexagonal architecture with ports & adapters |
| Intermediate | [vertical-slicing-tasks](./slicing/vertical-slicing-tasks) | Vertical Slicing | Feature-based code organization |
| Advanced | [cqrs-inventory](./slicing/cqrs-inventory) | CQRS | Separate read and write models |
| Advanced | [event-driven-orders](./ddd/event-driven-orders) | Event-Driven | Domain events and event handlers |
| Advanced | [bounded-contexts-ecommerce](./ddd/bounded-contexts-ecommerce) | DDD | Multiple bounded contexts with integration events |

## Clone a Specific Project (Sparse Checkout)

If you only want to clone a specific example:

```bash
# Clone the repository with sparse checkout
git clone --filter=blob:none --sparse https://github.com/aitorevi/software-architecture-learning.git
cd software-architecture-learning

# Choose the project you want
git sparse-checkout set slicing/cqrs-inventory
# Or: git sparse-checkout set hexagonal/library-system
# Or: git sparse-checkout set ddd/event-driven-orders
```

## Getting Started

Each project follows the same pattern:

```bash
cd <project-folder>
npm install
npm run dev    # Start development server
npm test       # Run tests
```

## Tech Stack

All projects use:
- **TypeScript** - Type safety
- **Express** - Web framework
- **Vitest** - Testing
- **In-Memory Repositories** - No database required for learning

## Learning Path

1. **Layered** - Start with `repository-pattern` to understand basic separation
2. **Hexagonal** - Move to `library-system` for ports & adapters
3. **Vertical Slicing** - Learn feature-based organization with `vertical-slicing-tasks`
4. **CQRS** - Understand read/write separation with `cqrs-inventory`
5. **Event-Driven** - Learn domain events with `event-driven-orders`
6. **Bounded Contexts** - Master DDD with `bounded-contexts-ecommerce`

## License

MIT
