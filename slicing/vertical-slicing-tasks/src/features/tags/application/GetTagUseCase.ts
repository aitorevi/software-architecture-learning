import { TagId, TagRepository, TagNotFoundError } from '../domain';
import { TagResponse, toTagResponse } from './CreateTagUseCase';

export interface GetTagQuery {
  tagId: string;
}

export class GetTagUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(query: GetTagQuery): Promise<TagResponse> {
    const tag = await this.tagRepository.findById(TagId.create(query.tagId));

    if (!tag) {
      throw new TagNotFoundError(query.tagId);
    }

    return toTagResponse(tag);
  }
}
