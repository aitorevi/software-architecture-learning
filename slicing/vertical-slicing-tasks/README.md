# Vertical Slicing Example - Task Manager

A task management system demonstrating **Vertical Slicing** architecture as an alternative to traditional horizontal layering.

## What is Vertical Slicing?

Vertical Slicing organizes code by **features** instead of **technical layers**. Each feature contains its complete implementation stack: domain, application, and infrastructure.

### Comparison

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HORIZONTAL LAYERING                              │
│                    (library-system style)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   src/                                                              │
│   ├── domain/                    ← All entities together            │
│   │   ├── entities/                                                 │
│   │   │   ├── Book.ts                                               │
│   │   │   ├── User.ts                                               │
│   │   │   └── Loan.ts                                               │
│   │   └── repositories/                                             │
│   │       ├── BookRepository.ts                                     │
│   │       └── UserRepository.ts                                     │
│   ├── application/               ← All use cases together           │
│   │   └── use-cases/                                                │
│   │       ├── RegisterBook.ts                                       │
│   │       ├── LoanBook.ts                                           │
│   │       └── RegisterUser.ts                                       │
│   └── infrastructure/            ← All adapters together            │
│       ├── persistence/                                              │
│       └── controllers/                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    VERTICAL SLICING                                 │
│                    (this project)                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   src/                                                              │
│   ├── features/                                                     │
│   │   ├── projects/              ← Complete Projects feature        │
│   │   │   ├── domain/                                               │
│   │   │   ├── application/                                          │
│   │   │   └── infrastructure/                                       │
│   │   ├── tasks/                 ← Complete Tasks feature           │
│   │   │   ├── domain/                                               │
│   │   │   ├── application/                                          │
│   │   │   └── infrastructure/                                       │
│   │   └── tags/                  ← Complete Tags feature            │
│   │       ├── domain/                                               │
│   │       ├── application/                                          │
│   │       └── infrastructure/                                       │
│   └── shared/                    ← Minimal shared code              │
│       └── kernel/                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Benefits of Vertical Slicing

| Aspect | Horizontal Layering | Vertical Slicing |
|--------|---------------------|------------------|
| **Understanding a feature** | Navigate multiple folders | Everything in one folder |
| **Adding a feature** | Touch multiple layers | Create one folder |
| **Deleting a feature** | Hunt through entire codebase | Delete one folder |
| **Team ownership** | Shared code, coordination needed | Teams own complete features |
| **Coupling** | Layers depend on each other | Features are independent |
| **Scaling codebase** | Folders grow linearly | Features can become microservices |

## When to Use Each Approach

### Use Horizontal Layering when:
- Small to medium codebase
- Features share significant domain logic
- Single team working on the project
- Stable domain that doesn't change much

### Use Vertical Slicing when:
- Large codebase with many features
- Features are relatively independent
- Multiple teams need clear ownership
- Features might become separate services
- Domain evolves rapidly

## Project Structure

```
vertical-slicing-example/
├── src/
│   ├── features/
│   │   ├── projects/           # Project management feature
│   │   │   ├── domain/
│   │   │   │   ├── Project.ts
│   │   │   │   ├── ProjectId.ts
│   │   │   │   └── ProjectRepository.ts
│   │   │   ├── application/
│   │   │   │   ├── CreateProjectUseCase.ts
│   │   │   │   ├── GetProjectUseCase.ts
│   │   │   │   └── ...
│   │   │   └── infrastructure/
│   │   │       ├── InMemoryProjectRepository.ts
│   │   │       └── ProjectController.ts
│   │   │
│   │   ├── tasks/              # Task management feature
│   │   │   ├── domain/
│   │   │   │   ├── Task.ts
│   │   │   │   ├── TaskStatus.ts
│   │   │   │   └── Priority.ts
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   │
│   │   └── tags/               # Tag management feature
│   │       ├── domain/
│   │       ├── application/
│   │       └── infrastructure/
│   │
│   └── shared/
│       └── kernel/             # Truly shared code (minimal!)
│           ├── Entity.ts
│           ├── ValueObject.ts
│           └── IdGenerator.ts
│
└── tests/
    └── unit/
        ├── projects/
        ├── tasks/
        └── tags/
```

## Key Patterns Demonstrated

### 1. Feature Modules
Each feature exposes a public API through its index file:

```typescript
// features/projects/index.ts
export { ProjectId } from './domain';
export { CreateProjectUseCase, ProjectResponse } from './application';
export { InMemoryProjectRepository, ProjectController } from './infrastructure';
```

### 2. Cross-Feature References by ID
Features reference each other by ID, not by entity:

```typescript
// Task stores projectId as string, not Project entity
interface TaskProps {
  projectId: string;  // Reference by ID
  tagIds: string[];   // References by ID
}
```

### 3. Minimal Shared Kernel
Only truly universal code goes in shared kernel:

```typescript
// shared/kernel/Entity.ts - Base class for all entities
// shared/kernel/ValueObject.ts - Base class for value objects
// shared/kernel/IdGenerator.ts - Interface for ID generation
```

### 4. Feature Independence
Each feature can:
- Use different repository implementations
- Have feature-specific DTOs
- Define its own exceptions
- Be extracted to a microservice

## API Endpoints

### Projects
```
POST   /api/projects          Create a project
GET    /api/projects          List all projects
GET    /api/projects/:id      Get a project
PUT    /api/projects/:id      Update a project
DELETE /api/projects/:id      Delete a project
```

### Tasks
```
POST   /api/tasks                    Create a task
GET    /api/tasks/:id                Get a task
PUT    /api/tasks/:id                Update a task
DELETE /api/tasks/:id                Delete a task
GET    /api/tasks/project/:projectId List tasks by project
GET    /api/tasks/status/:status     List tasks by status
GET    /api/tasks/filter/overdue     List overdue tasks
POST   /api/tasks/:id/start          Start a task
POST   /api/tasks/:id/complete       Complete a task
POST   /api/tasks/:id/reopen         Reopen a task
POST   /api/tasks/:id/tags/:tagId    Add tag to task
DELETE /api/tasks/:id/tags/:tagId    Remove tag from task
```

### Tags
```
POST   /api/tags          Create a tag
GET    /api/tags          List all tags
GET    /api/tags/:id      Get a tag
PUT    /api/tags/:id      Update a tag
DELETE /api/tags/:id      Delete a tag
```

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Example Usage

```bash
# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project", "description": "A great project"}'

# Create a tag
curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "Urgent", "color": "#FF0000"}'

# Create a task in the project
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"projectId": "PROJECT_ID", "title": "First Task", "priority": "HIGH"}'

# Add tag to task
curl -X POST http://localhost:3000/api/tasks/TASK_ID/tags/TAG_ID

# Complete the task
curl -X POST http://localhost:3000/api/tasks/TASK_ID/start
curl -X POST http://localhost:3000/api/tasks/TASK_ID/complete
```

## Related Projects

- **library-system**: Horizontal layering approach
- **cqrs-example**: CQRS pattern
- **event-driven-example**: Event-driven architecture
- **bounded-contexts-example**: Multiple bounded contexts
