/**
 * PROJECT FEATURE - Public API
 *
 * VERTICAL SLICING KEY CONCEPT:
 * This index file defines what other features can access.
 * Only export what other features need - keep internals private.
 *
 * Other features should:
 * - Use ProjectId to reference projects
 * - Subscribe to ProjectCreatedEvent/ProjectUpdatedEvent if needed
 *
 * Other features should NOT:
 * - Access Project entity directly (encapsulation)
 * - Call repository methods directly (use cases only)
 */

// Domain exports (for other features to reference)
export { ProjectId } from './domain';
export { ProjectCreatedEvent, ProjectUpdatedEvent } from './domain';

// Application exports (use cases and DTOs)
export {
  CreateProjectUseCase,
  CreateProjectCommand,
  ProjectResponse,
  GetProjectUseCase,
  GetProjectQuery,
  ListProjectsUseCase,
  UpdateProjectUseCase,
  UpdateProjectCommand,
  DeleteProjectUseCase,
  DeleteProjectCommand,
} from './application';

// Infrastructure exports (for wiring in main app)
export { InMemoryProjectRepository, ProjectController } from './infrastructure';

// Re-export repository interface for dependency injection
export { ProjectRepository } from './domain';
