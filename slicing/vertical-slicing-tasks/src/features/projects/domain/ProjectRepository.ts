import { Project } from './Project';
import { ProjectId } from './ProjectId';

/**
 * PROJECT FEATURE - Repository Interface (Port)
 *
 * VERTICAL SLICING KEY CONCEPT:
 * Each feature defines its OWN repository interface.
 * This interface lives in the feature's domain folder, not in a
 * shared /domain/repositories folder.
 *
 * Why feature-specific repositories?
 * 1. Each feature knows exactly what persistence operations it needs
 * 2. Features can have different query requirements
 * 3. No "god repository" with methods for all features
 * 4. Easier to understand a feature's data access patterns
 *
 * This is a "driven port" (secondary port) - the domain defines
 * what it needs, and infrastructure provides the implementation.
 */
export interface ProjectRepository {
  /**
   * Persists a project (create or update).
   * The repository decides whether to INSERT or UPDATE based on existence.
   */
  save(project: Project): Promise<void>;

  /**
   * Finds a project by its unique identifier.
   * Returns null if not found (caller decides how to handle).
   */
  findById(id: ProjectId): Promise<Project | null>;

  /**
   * Returns all projects.
   * In a real app, this would support pagination.
   */
  findAll(): Promise<Project[]>;

  /**
   * Checks if a project with the given name already exists.
   * Useful for enforcing unique names within the system.
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Removes a project from persistence.
   */
  delete(id: ProjectId): Promise<void>;
}
