/**
 * TAG FEATURE - Public API
 */

// Domain exports
export { TagId } from './domain';
export { Color } from './domain';
export { TagCreatedEvent } from './domain';

// Application exports
export {
  CreateTagUseCase,
  CreateTagCommand,
  TagResponse,
  GetTagUseCase,
  GetTagQuery,
  ListTagsUseCase,
  UpdateTagUseCase,
  UpdateTagCommand,
  DeleteTagUseCase,
  DeleteTagCommand,
} from './application';

// Infrastructure exports
export { InMemoryTagRepository, TagController } from './infrastructure';

// Re-export repository interface
export { TagRepository } from './domain';
