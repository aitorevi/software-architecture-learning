import { TagRepository, TagId } from '../domain';
import { TagResponse, toTagResponse } from './CreateTagUseCase';

export class ListTagsUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(): Promise<TagResponse[]> {
    const tags = await this.tagRepository.findAll();
    return tags.map(toTagResponse);
  }

  async byIds(tagIds: string[]): Promise<TagResponse[]> {
    const ids = tagIds.map((id) => TagId.create(id));
    const tags = await this.tagRepository.findByIds(ids);
    return tags.map(toTagResponse);
  }
}
