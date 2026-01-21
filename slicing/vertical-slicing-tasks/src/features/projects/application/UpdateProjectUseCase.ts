import {
  Project,
  ProjectId,
  ProjectRepository,
  ProjectNotFoundError,
  ProjectValidationError,
} from '../domain';
import { ProjectResponse } from './CreateProjectUseCase';

/**
 * PROJECT FEATURE - Update Project Use Case
 *
 * Updates an existing project's name and/or description.
 * Partial updates are supported - only provided fields are updated.
 */

export interface UpdateProjectCommand {
  projectId: string;
  name?: string;
  description?: string;
}

export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(command: UpdateProjectCommand): Promise<ProjectResponse> {
    const projectId = ProjectId.create(command.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundError(command.projectId);
    }

    // Check for duplicate name if name is being changed
    if (command.name && command.name !== project.name) {
      const nameExists = await this.projectRepository.existsByName(command.name);
      if (nameExists) {
        throw new ProjectValidationError(
          `A project with name "${command.name}" already exists`
        );
      }
    }

    // Update the project (domain entity validates and applies changes)
    project.update({
      name: command.name,
      description: command.description,
    });

    // Persist changes
    await this.projectRepository.save(project);

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
