import {
  TagId,
  TagRepository,
  TagNotFoundError,
  TagValidationError,
  Color,
} from '../domain';
import { TagResponse, toTagResponse } from './CreateTagUseCase';

export interface UpdateTagCommand {
  tagId: string;
  name?: string;
  color?: string;
}

export class UpdateTagUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(command: UpdateTagCommand): Promise<TagResponse> {
    const tag = await this.tagRepository.findById(TagId.create(command.tagId));

    if (!tag) {
      throw new TagNotFoundError(command.tagId);
    }

    if (command.name && command.name !== tag.name) {
      const nameExists = await this.tagRepository.existsByName(command.name);
      if (nameExists) {
        throw new TagValidationError(
          `A tag with name "${command.name}" already exists`
        );
      }
      tag.updateName(command.name);
    }

    if (command.color) {
      tag.updateColor(Color.create(command.color));
    }

    await this.tagRepository.save(tag);

    return toTagResponse(tag);
  }
}
