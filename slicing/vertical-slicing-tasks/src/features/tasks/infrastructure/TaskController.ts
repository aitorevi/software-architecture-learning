import { Router, Request, Response } from 'express';
import {
  CreateTaskUseCase,
  GetTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
  UpdateTaskStatusUseCase,
  StartTaskUseCase,
  CompleteTaskUseCase,
  ReopenTaskUseCase,
  AddTagToTaskUseCase,
  RemoveTagFromTaskUseCase,
  DeleteTaskUseCase,
} from '../application';
import { TaskValidationError, TaskNotFoundError, TaskStatus } from '../domain';

/**
 * TASK FEATURE - REST Controller
 *
 * All task-related endpoints are defined within the feature folder.
 * This makes the feature self-contained and easy to understand.
 */
export class TaskController {
  public readonly router: Router;

  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    private readonly startTaskUseCase: StartTaskUseCase,
    private readonly completeTaskUseCase: CompleteTaskUseCase,
    private readonly reopenTaskUseCase: ReopenTaskUseCase,
    private readonly addTagToTaskUseCase: AddTagToTaskUseCase,
    private readonly removeTagFromTaskUseCase: RemoveTagFromTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // CRUD operations
    this.router.post('/', this.createTask.bind(this));
    this.router.get('/:id', this.getTask.bind(this));
    this.router.put('/:id', this.updateTask.bind(this));
    this.router.delete('/:id', this.deleteTask.bind(this));

    // Listing routes
    this.router.get('/project/:projectId', this.listByProject.bind(this));
    this.router.get('/status/:status', this.listByStatus.bind(this));
    this.router.get('/filter/overdue', this.listOverdue.bind(this));

    // Status change shortcuts
    this.router.post('/:id/start', this.startTask.bind(this));
    this.router.post('/:id/complete', this.completeTask.bind(this));
    this.router.post('/:id/reopen', this.reopenTask.bind(this));
    this.router.patch('/:id/status', this.updateStatus.bind(this));

    // Tag management
    this.router.post('/:id/tags/:tagId', this.addTag.bind(this));
    this.router.delete('/:id/tags/:tagId', this.removeTag.bind(this));
  }

  private async createTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createTaskUseCase.execute({
        projectId: req.body.projectId,
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        dueDate: req.body.dueDate,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getTaskUseCase.execute({
        taskId: req.params.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async listByProject(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listTasksUseCase.byProject({
        projectId: req.params.projectId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async listByStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = req.params.status.toUpperCase() as TaskStatus;
      const result = await this.listTasksUseCase.byStatus({ status });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async listOverdue(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listTasksUseCase.overdue();
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.updateTaskUseCase.execute({
        taskId: req.params.id,
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        dueDate: req.body.dueDate,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.updateTaskStatusUseCase.execute({
        taskId: req.params.id,
        status: req.body.status,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async startTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.startTaskUseCase.execute({
        taskId: req.params.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.completeTaskUseCase.execute({
        taskId: req.params.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async reopenTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.reopenTaskUseCase.execute({
        taskId: req.params.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async addTag(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.addTagToTaskUseCase.execute({
        taskId: req.params.id,
        tagId: req.params.tagId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async removeTag(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.removeTagFromTaskUseCase.execute({
        taskId: req.params.id,
        tagId: req.params.tagId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteTaskUseCase.execute({
        taskId: req.params.id,
      });
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof TaskValidationError) {
      res.status(400).json({ success: false, error: error.message });
    } else if (error instanceof TaskNotFoundError) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
