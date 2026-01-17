import {
  ProjectId,
  ProjectRepository,
  ProjectNotFoundError,
} from '../domain';

/**
 * PROJECT FEATURE - Delete Project Use Case
 *
 * Removes a project from the system.
 *
 * IMPORTANT: In a real system, you'd need to handle:
 * - What happens to tasks belonging to this project?
 * - Soft delete vs hard delete?
 * - Cascading deletes or preventing delete if has tasks?
 *
 * For this teaching example, we do a simple delete.
 * The bounded-contexts-example project will show how to handle
 * cross-feature concerns like this properly.
 */

export interface DeleteProjectCommand {
  projectId: string;
}

export class DeleteProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(command: DeleteProjectCommand): Promise<void> {
    const projectId = ProjectId.create(command.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundError(command.projectId);
    }

    await this.projectRepository.delete(projectId);
  }
}
