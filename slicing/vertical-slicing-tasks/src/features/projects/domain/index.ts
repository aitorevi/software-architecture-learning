/**
 * PROJECT FEATURE - Domain Layer Exports
 *
 * This index defines the public API of the Projects feature's domain.
 * Other layers (application, infrastructure) import from here.
 */

export { ProjectId } from './ProjectId';
export {
  Project,
  ProjectProps,
  ProjectCreatedEvent,
  ProjectUpdatedEvent,
  ProjectValidationError,
  ProjectNotFoundError,
} from './Project';
export { ProjectRepository } from './ProjectRepository';
