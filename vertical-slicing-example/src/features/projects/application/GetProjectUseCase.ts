import {
  Project,
  ProjectId,
  ProjectRepository,
  ProjectNotFoundError,
} from '../domain';
import { ProjectResponse } from './CreateProjectUseCase';

/**
 * PROJECT FEATURE - Get Project Use Case
 *
 * Simple query use case that retrieves a single project by ID.
 *
 * In CQRS, this would be a "query" that could use a read-optimized model.
 * In this vertical slicing example, we keep it simple with the same model.
 */

export interface GetProjectQuery {
  projectId: string;
}

export class GetProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(query: GetProjectQuery): Promise<ProjectResponse> {
    const projectId = ProjectId.create(query.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundError(query.projectId);
    }

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
