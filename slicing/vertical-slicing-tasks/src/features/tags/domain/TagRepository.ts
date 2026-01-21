import { Tag } from './Tag';
import { TagId } from './TagId';

/**
 * TAG FEATURE - Repository Interface (Port)
 */
export interface TagRepository {
  save(tag: Tag): Promise<void>;
  findById(id: TagId): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  findByIds(ids: TagId[]): Promise<Tag[]>;
  existsByName(name: string): Promise<boolean>;
  delete(id: TagId): Promise<void>;
}
