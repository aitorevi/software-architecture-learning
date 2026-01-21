import { TagId, TagRepository, TagNotFoundError } from '../domain';

export interface DeleteTagCommand {
  tagId: string;
}

export class DeleteTagUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(command: DeleteTagCommand): Promise<void> {
    const tag = await this.tagRepository.findById(TagId.create(command.tagId));

    if (!tag) {
      throw new TagNotFoundError(command.tagId);
    }

    await this.tagRepository.delete(TagId.create(command.tagId));
  }
}
