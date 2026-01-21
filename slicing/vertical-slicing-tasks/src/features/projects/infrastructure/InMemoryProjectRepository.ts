import {
  Project,
  ProjectId,
  ProjectRepository,
  ProjectProps,
} from '../domain';

/**
 * PROJECT FEATURE - In-Memory Repository (Adapter)
 *
 * VERTICAL SLICING KEY CONCEPT:
 * Each feature has its own repository implementation.
 * This adapter lives within the feature folder, making the
 * feature completely self-contained.
 *
 * In horizontal layering, all repositories would be in
 * /infrastructure/persistence/. In vertical slicing, each
 * feature owns its infrastructure.
 *
 * Benefits:
 * - Easy to see how a feature persists its data
 * - Can swap implementations per feature (one could use PostgreSQL,
 *   another could use MongoDB)
 * - Testing is easier - just use the in-memory version
 */
export class InMemoryProjectRepository implements ProjectRepository {
  private projects: Map<string, ProjectProps> = new Map();

  async save(project: Project): Promise<void> {
    // Store a plain object representation for "persistence"
    this.projects.set(project.id.value, {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const data = this.projects.get(id.value);
    if (!data) {
      return null;
    }
    return Project.reconstitute(data);
  }

  async findAll(): Promise<Project[]> {
    return Array.from(this.projects.values()).map((data) =>
      Project.reconstitute(data)
    );
  }

  async existsByName(name: string): Promise<boolean> {
    const normalizedName = name.toLowerCase().trim();
    for (const data of this.projects.values()) {
      if (data.name.toLowerCase() === normalizedName) {
        return true;
      }
    }
    return false;
  }

  async delete(id: ProjectId): Promise<void> {
    this.projects.delete(id.value);
  }

  // === Test Helpers ===

  /**
   * Clears all data - useful for test setup/teardown
   */
  clear(): void {
    this.projects.clear();
  }

  /**
   * Returns the count of stored projects
   */
  count(): number {
    return this.projects.size;
  }
}
