import { Router, Request, Response } from 'express';
import {
  CreateProjectUseCase,
  GetProjectUseCase,
  ListProjectsUseCase,
  UpdateProjectUseCase,
  DeleteProjectUseCase,
} from '../application';
import { ProjectValidationError, ProjectNotFoundError } from '../domain';

/**
 * PROJECT FEATURE - REST Controller (Primary Adapter)
 *
 * VERTICAL SLICING KEY CONCEPT:
 * The controller lives within the feature folder, not in a global
 * /infrastructure/controllers folder.
 *
 * This makes the feature completely self-contained:
 * - Domain (entities, value objects, repository interface)
 * - Application (use cases)
 * - Infrastructure (repository implementation, controller)
 *
 * When you need to understand or modify the Projects feature,
 * everything is in one place!
 */
export class ProjectController {
  public readonly router: Router;

  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/', this.createProject.bind(this));
    this.router.get('/', this.listProjects.bind(this));
    this.router.get('/:id', this.getProject.bind(this));
    this.router.put('/:id', this.updateProject.bind(this));
    this.router.delete('/:id', this.deleteProject.bind(this));
  }

  private async createProject(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createProjectUseCase.execute({
        name: req.body.name,
        description: req.body.description,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getProject(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getProjectUseCase.execute({
        projectId: req.params.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async listProjects(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listProjectsUseCase.execute();
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.updateProjectUseCase.execute({
        projectId: req.params.id,
        name: req.body.name,
        description: req.body.description,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteProjectUseCase.execute({
        projectId: req.params.id,
      });
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof ProjectValidationError) {
      res.status(400).json({ success: false, error: error.message });
    } else if (error instanceof ProjectNotFoundError) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
