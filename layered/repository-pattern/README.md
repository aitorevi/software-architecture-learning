# 📚 Repository Pattern - Simple Example

> **A step-by-step tutorial by Profe Millo**

A minimal, beginner-friendly example of the Repository Pattern in TypeScript, focusing ONLY on the essential concepts without the noise of DTOs, events, CQRS, or other advanced patterns.

## 🎯 What You'll Learn

- What the Repository Pattern is and why it matters
- Dependency Inversion Principle in action
- How to separate Domain, Application, and Infrastructure
- How to write testable, maintainable code

## 🚀 Quick Start

```bash
npm install
npm run dev     # Run demo
npm test        # Run tests (19 tests, all passing)
```

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get up to speed in 5 minutes
- **[README_ES.md](README_ES.md)** - Full tutorial in Spanish (comprehensive)
- **[DIAGRAMA.md](DIAGRAMA.md)** - Visual diagrams and architecture

## 🏗️ Project Structure

```
src/
├── domain/                    # Business rules (entities, interfaces)
│   ├── Task.ts               # Task entity
│   └── TaskRepository.ts     # Repository interface (PORT)
├── application/               # Use cases
│   └── TaskService.ts        # Orchestrates domain logic
└── infrastructure/            # Technical details
    ├── InMemoryTaskRepository.ts  # Repository implementation (ADAPTER)
    └── index.ts              # Entry point & demo

tests/
└── task.test.ts              # Unit tests (domain, repo, service)
```

## 🎯 Core Concept

```typescript
// Domain defines WHAT it needs (interface)
interface TaskRepository { /* ... */ }

// Infrastructure implements HOW (concrete class)
class InMemoryTaskRepository implements TaskRepository { /* ... */ }

// Application uses the interface, not the implementation
class TaskService {
  constructor(private repo: TaskRepository) {} // Dependency Inversion!
}
```

## 💡 Why This Matters

✅ Change database by changing 1 line
✅ Test without real database (fast tests)
✅ Domain isolated from technical details
✅ Easy to maintain and extend

## 📊 Stats

- **~150 lines** of actual code (without comments)
- **19 tests** (all passing in <300ms)
- **3 layers** (Domain, Application, Infrastructure)
- **1 entity** (Task)
- **1 repository** (TaskRepository)
- **Zero dependencies** on frameworks or ORMs

## 🎓 Perfect For

- Learning Domain-Driven Design fundamentals
- Understanding Dependency Inversion
- First steps into Hexagonal Architecture
- Teaching clean architecture principles

## 📚 Next Steps

After mastering this example:

1. Check out the `hexagonal/` project for full Hexagonal Architecture
2. See `vertical-slicing-example/` for feature-based organization
3. Read about DDD, CQRS, and Event Sourcing

## 👨‍🏫 About

Created by **Profe Millo** - a software architect turned educator who believes in learning through simple, real code without unnecessary complexity.

**Philosophy:** _"Architecture isn't for showing off, it's for solving problems. If you don't understand it, don't use it. First simple, then complex."_

## 📝 License

MIT - Use it, change it, learn from it.

---

**The Golden Rule:**

> Domain defines WHAT it needs.
> Infrastructure implements HOW.
> Application orchestrates the domain.

Now go read the code! 🚀
