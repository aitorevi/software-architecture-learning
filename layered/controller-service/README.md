# Controller-Service Pattern Example

> **A step-by-step tutorial by Profe Millo**

A practical example showing the **Controller** and **Service** layers in action. This project bridges the gap between the simple Repository Pattern and full Hexagonal Architecture.

## What You'll Learn

- What a **Controller** is and what it does
- What a **Service** (Application Service) is and what it does
- How HTTP requests flow through the layers
- How to separate concerns: HTTP handling vs. business orchestration

## Quick Start

```bash
npm install
npm run dev     # Start server on http://localhost:3000
npm test        # Run tests
```

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get up and running in 5 minutes
- **[README_ES.md](README_ES.md)** - Full tutorial in Spanish (comprehensive)

## Learning Path

```
Repository Pattern (Basic)      ← You should know this
        ↓
Controller-Service (Basic)      ← YOU ARE HERE
        ↓
Hexagonal Architecture (Intermediate)
        ↓
Vertical Slicing / Event-Driven (Advanced)
```

## Project Structure

```
src/
├── domain/                     # Business rules
│   ├── Task.ts                # Task entity
│   └── TaskRepository.ts      # Repository interface (port)
│
├── application/
│   └── TaskService.ts         # SERVICE - Orchestrates use cases
│
└── infrastructure/
    ├── persistence/
    │   └── InMemoryTaskRepository.ts  # Output adapter
    │
    ├── http/
    │   ├── TaskController.ts   # CONTROLLER - HTTP adapter
    │   └── server.ts           # Express setup
    │
    └── index.ts                # Composition root
```

## Core Concepts

### What is a Controller?

The **Controller** is an **input adapter** that translates HTTP requests into calls to the Service layer:

```typescript
// Controller knows about HTTP
class TaskController {
  async createTask(req: Request, res: Response) {
    const { title } = req.body;
    const task = await this.service.createTask(title);
    res.status(201).json(task);
  }
}
```

### What is a Service?

The **Service** is an **orchestrator** that coordinates domain operations:

```typescript
// Service knows NOTHING about HTTP
class TaskService {
  async createTask(title: string): Promise<Task> {
    const task = new Task(this.generateId(), title);
    await this.repository.save(task);
    return task;
  }
}
```

### The Request Flow

```
HTTP Request → Controller → Service → Repository → Database
     ↑                                                  ↓
HTTP Response ← Controller ← Service ← Repository ← Database
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks` | Create a task |
| GET | `/tasks` | List all tasks |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks/:id/complete` | Mark as completed |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/health` | Health check |

## Example Requests

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Learn architecture"}'

# List tasks
curl http://localhost:3000/tasks

# Complete a task
curl -X POST http://localhost:3000/tasks/{id}/complete
```

## Key Takeaways

1. **Controller** = HTTP adapter (knows Request/Response)
2. **Service** = Orchestrator (knows nothing about HTTP)
3. **Repository** = Data access abstraction
4. **Separation of concerns** = Each layer has one job

## Next Steps

After mastering this example:

1. Check out **[hexagonal/library-system](../../hexagonal/library-system)** for full Hexagonal Architecture
2. See **[slicing/vertical-slicing-tasks](../../slicing/vertical-slicing-tasks)** for feature-based organization
3. Explore **[ddd/event-driven-orders](../../ddd/event-driven-orders)** for Event-Driven Architecture

## About

Created by **Profe Millo** - a software architect turned educator who believes in learning through simple, real code.

**Philosophy:** _"If you understand HTTP → Controller → Service → Repository, you understand 80% of how modern web apps work."_

## License

MIT
