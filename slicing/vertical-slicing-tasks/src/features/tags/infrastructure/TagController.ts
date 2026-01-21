import { Router, Request, Response } from 'express';
import {
  CreateTagUseCase,
  GetTagUseCase,
  ListTagsUseCase,
  UpdateTagUseCase,
  DeleteTagUseCase,
} from '../application';
import {
  TagValidationError,
  TagNotFoundError,
  ColorValidationError,
} from '../domain';

/**
 * TAG FEATURE - REST Controller
 */
export class TagController {
  public readonly router: Router;

  constructor(
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly getTagUseCase: GetTagUseCase,
    private readonly listTagsUseCase: ListTagsUseCase,
    private readonly updateTagUseCase: UpdateTagUseCase,
    private readonly deleteTagUseCase: DeleteTagUseCase
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/', this.createTag.bind(this));
    this.router.get('/', this.listTags.bind(this));
    this.router.get('/:id', this.getTag.bind(this));
    this.router.put('/:id', this.updateTag.bind(this));
    this.router.delete('/:id', this.deleteTag.bind(this));
  }

  private async createTag(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createTagUseCase.execute({
        name: req.body.name,
        color: req.body.color,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getTag(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getTagUseCase.execute({
        tagId: req.params.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async listTags(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listTagsUseCase.execute();
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async updateTag(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.updateTagUseCase.execute({
        tagId: req.params.id,
        name: req.body.name,
        color: req.body.color,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async deleteTag(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteTagUseCase.execute({
        tagId: req.params.id,
      });
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (
      error instanceof TagValidationError ||
      error instanceof ColorValidationError
    ) {
      res.status(400).json({ success: false, error: error.message });
    } else if (error instanceof TagNotFoundError) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
