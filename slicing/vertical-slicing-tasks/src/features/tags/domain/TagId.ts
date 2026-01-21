import { SimpleId } from '@shared/kernel';

/**
 * TAG FEATURE - TagId Value Object
 *
 * Feature-specific ID for tags.
 */
export class TagId extends SimpleId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): TagId {
    return new TagId(value);
  }
}
