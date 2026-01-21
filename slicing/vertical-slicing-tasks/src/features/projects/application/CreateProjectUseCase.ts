import { IdGenerator } from '@shared/kernel';
import {
  Project,
  ProjectId,
  ProjectRepository,
  ProjectValidationError,
} from '../domain';

/**
 * PROJECT FEATURE - Create Project Use Case
 *
 * VERTICAL SLICING KEY CONCEPT:
 * Use cases live within their feature folder, not in a global
 * /application/use-cases folder. This keeps the feature self-contained.
 *
 * Each feature has its own:
 * - Commands/DTOs (input)
 * - Use cases (orchestration)
 * - Responses (output)
 *
 * Benefits:
 * - Reading one folder tells you everything the feature can do
 * - Adding a new operation only touches this feature
 * - No scrolling through hundreds of use cases to find the right one
 */

// === DTOs (Commands and Responses) ===

/**
 * CreateProjectCommand - Input DTO for creating a project
 *
 * Commands are named for the action they represent.
 * They contain only the data needed to execute the action.
 */
export interface CreateProjectCommand {
  name: string;
  description?: string;
}

/**
 * ProjectResponse - Output DTO for project data
 *
 * Response DTOs shape data for the outside world.
 * They decouple the domain model from external representations.
 */
export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// === Use Case ===

/**
 * CreateProjectUseCase - Orchestrates project creation
 *
 * The use case:
 * 1. Validates business rules (unique name)
 * 2. Creates the domain entity
 * 3. Persists through repository
 * 4. Returns response DTO
 *
 * Note: Use cases don't contain business logic - that's in the domain.
 * They orchestrate the flow between infrastructure and domain.
 */
export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: CreateProjectCommand): Promise<ProjectResponse> {
    // Check for duplicate name (business rule enforcement)
    const nameExists = await this.projectRepository.existsByName(command.name);
    if (nameExists) {
      throw new ProjectValidationError(
        `A project with name "${command.name}" already exists`
      );
    }

    // Create domain entity (validation happens in factory method)
    const project = Project.create({
      id: ProjectId.create(this.idGenerator.generate()),
      name: command.name,
      description: command.description,
    });

    // Persist
    await this.projectRepository.save(project);

    // Return response DTO
    return this.toResponse(project);
  }

  private toResponse(project: Project): ProjectResponse {
    return {
      id: project.id.value,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
