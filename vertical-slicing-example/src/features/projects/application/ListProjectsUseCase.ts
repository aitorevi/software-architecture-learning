import { Project, ProjectRepository } from '../domain';
import { ProjectResponse } from './CreateProjectUseCase';

/**
 * PROJECT FEATURE - List Projects Use Case
 *
 * Returns all projects in the system.
 *
 * In a production system, you'd add:
 * - Pagination (limit, offset)
 * - Filtering (by name, date range)
 * - Sorting options
 *
 * For this teaching example, we keep it simple.
 */

export class ListProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(): Promise<ProjectResponse[]> {
    const projects = await this.projectRepository.findAll();
    return projects.map(this.toResponse);
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
