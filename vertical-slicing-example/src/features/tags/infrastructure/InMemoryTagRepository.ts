import { Tag, TagId, TagRepository, TagProps, Color } from '../domain';

/**
 * TAG FEATURE - In-Memory Repository Implementation
 */
export class InMemoryTagRepository implements TagRepository {
  private tags: Map<string, TagProps> = new Map();

  async save(tag: Tag): Promise<void> {
    this.tags.set(tag.id.value, {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt,
    });
  }

  async findById(id: TagId): Promise<Tag | null> {
    const data = this.tags.get(id.value);
    if (!data) {
      return null;
    }
    return Tag.reconstitute(data);
  }

  async findAll(): Promise<Tag[]> {
    return Array.from(this.tags.values()).map((data) => Tag.reconstitute(data));
  }

  async findByIds(ids: TagId[]): Promise<Tag[]> {
    const idValues = new Set(ids.map((id) => id.value));
    return Array.from(this.tags.values())
      .filter((data) => idValues.has(data.id.value))
      .map((data) => Tag.reconstitute(data));
  }

  async existsByName(name: string): Promise<boolean> {
    const normalizedName = name.toLowerCase().trim();
    for (const data of this.tags.values()) {
      if (data.name.toLowerCase() === normalizedName) {
        return true;
      }
    }
    return false;
  }

  async delete(id: TagId): Promise<void> {
    this.tags.delete(id.value);
  }

  // === Test Helpers ===

  clear(): void {
    this.tags.clear();
  }

  count(): number {
    return this.tags.size;
  }
}
