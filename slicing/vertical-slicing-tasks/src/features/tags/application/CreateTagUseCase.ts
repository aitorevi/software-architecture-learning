import { IdGenerator } from '@shared/kernel';
import {
  Tag,
  TagId,
  TagRepository,
  TagValidationError,
  Color,
} from '../domain';

/**
 * TAG FEATURE - Create Tag Use Case
 */

export interface CreateTagCommand {
  name: string;
  color: string; // Hex color string
}

export interface TagResponse {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export class CreateTagUseCase {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: CreateTagCommand): Promise<TagResponse> {
    // Check for duplicate name
    const nameExists = await this.tagRepository.existsByName(command.name);
    if (nameExists) {
      throw new TagValidationError(
        `A tag with name "${command.name}" already exists`
      );
    }

    const tag = Tag.create({
      id: TagId.create(this.idGenerator.generate()),
      name: command.name,
      color: Color.create(command.color),
    });

    await this.tagRepository.save(tag);

    return toTagResponse(tag);
  }
}

export function toTagResponse(tag: Tag): TagResponse {
  return {
    id: tag.id.value,
    name: tag.name,
    color: tag.color.value,
    createdAt: tag.createdAt.toISOString(),
  };
}
