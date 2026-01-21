# Vertical Slicing - Deep Dive

## The Problem with Horizontal Layering

In traditional horizontal layering, we organize code by technical concern:

```
src/
├── controllers/     ← All HTTP handlers
├── services/        ← All business logic
├── repositories/    ← All data access
└── models/          ← All data structures
```

This seems logical at first, but creates problems as the codebase grows:

### 1. Feature Fragmentation
To understand the "User Registration" feature, you need to open:
- `controllers/UserController.ts`
- `services/UserService.ts`
- `repositories/UserRepository.ts`
- `models/User.ts`
- `validators/UserValidator.ts`
- `dtos/CreateUserDto.ts`

The feature is scattered across 6+ files in different folders!

### 2. Merge Conflicts
When two developers work on different features, they often touch the same files:
- Both add routes to `routes/index.ts`
- Both add services to `services/index.ts`
- Constant merge conflicts slow everyone down

### 3. Implicit Coupling
When all repositories are in one folder, it's easy to accidentally import one repository into an unrelated service. The code structure doesn't communicate boundaries.

### 4. Scaling Difficulties
If you want to extract "Payments" into a microservice, you need to:
- Find all payment-related code across all folders
- Untangle dependencies
- Hope you didn't miss anything

## The Vertical Slicing Solution

Vertical slicing organizes by feature:

```
src/
├── features/
│   ├── user-registration/    ← Everything for this feature
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── payments/             ← Everything for this feature
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── notifications/        ← Everything for this feature
│       ├── domain/
│       ├── application/
│       └── infrastructure/
└── shared/                   ← Only truly shared code
    └── kernel/
```

### Benefits

**1. Feature Cohesion**
All code for a feature lives together. One folder = one feature.

**2. Team Autonomy**
Team A owns `/payments`, Team B owns `/notifications`. No conflicts.

**3. Explicit Boundaries**
Features can only depend on each other through well-defined APIs.

**4. Easy Extraction**
Want to make "Payments" a microservice? Cut the folder and go.

## Cross-Feature Communication

Features should be loosely coupled. Here's how:

### Reference by ID, Not Entity

```typescript
// ❌ BAD - Tasks feature imports Project entity
import { Project } from '../projects/domain/Project';

interface Task {
  project: Project;  // Direct dependency!
}

// ✅ GOOD - Tasks feature only knows the ID
interface Task {
  projectId: string;  // Just the reference
}
```

### Events for Async Communication

```typescript
// When a project is deleted, tasks need to know
// But projects shouldn't call tasks directly

// projects/domain/Project.ts
class Project {
  delete() {
    this.addDomainEvent(new ProjectDeletedEvent(this.id));
  }
}

// tasks/application/ProjectDeletedHandler.ts
class ProjectDeletedHandler {
  handle(event: ProjectDeletedEvent) {
    await this.taskRepository.deleteByProjectId(event.projectId);
  }
}
```

### Shared Kernel for True Commonalities

Only put code in shared kernel if:
1. Multiple features truly need it
2. It changes rarely
3. It's truly universal (not business-logic specific)

Good candidates:
- `Entity` base class
- `ValueObject` base class
- `IdGenerator` interface

Bad candidates:
- Business rules
- Feature-specific DTOs
- Domain events (should be owned by the emitting feature)

## When NOT to Use Vertical Slicing

Vertical slicing isn't always the answer:

### Small Projects
If your entire app fits in 10-15 files, horizontal layering is simpler.

### Highly Interconnected Domains
If every feature needs to know about every other feature, you'll end up with either:
- Circular dependencies between features
- Everything in the shared kernel

In these cases, horizontal layering might be cleaner.

### Early Stage Exploration
When you don't know your domain boundaries yet, it's easier to reorganize horizontal layers than to merge/split vertical slices.

## Gradual Migration

You can migrate from horizontal to vertical gradually:

1. **Start with new features** - Create them as vertical slices
2. **Extract stable features** - Move well-understood features into slices
3. **Keep shared unstable code** - Don't force unstable code into slices
4. **Shrink the shared layer** - Over time, the horizontal part shrinks

## Architecture Decision Record

**Decision**: Use vertical slicing for feature organization

**Context**:
- Multiple teams will work on the codebase
- Features are relatively independent
- We anticipate extracting some features to services

**Consequences**:
- ✅ Clear feature ownership
- ✅ Reduced merge conflicts
- ✅ Easier microservice extraction
- ⚠️ Some code duplication between features
- ⚠️ Requires discipline to keep features truly independent
- ⚠️ More complex initial setup

## Further Reading

- [Vertical Slice Architecture](https://jimmybogard.com/vertical-slice-architecture/) - Jimmy Bogard
- [Feature Folders](https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/areas) - Microsoft
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html) - Robert C. Martin
