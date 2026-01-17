/**
 * SHARED KERNEL - Value Object Base
 *
 * Value Objects are compared by their values, not identity.
 * They are immutable - once created, they cannot change.
 *
 * This base class provides:
 * - Equality comparison by value
 * - Immutability through TypeScript readonly modifiers
 *
 * Each feature creates its own specific value objects that extend
 * this base class or implement similar patterns.
 */

/**
 * ValueObject - Abstract base for all value objects
 *
 * @template T - The shape of the value object's properties
 *
 * Examples of value objects:
 * - ProjectId, TaskId, TagId (identity wrappers)
 * - Priority (Low, Medium, High)
 * - Status (Todo, InProgress, Done)
 * - Color (hex code for tags)
 */
export abstract class ValueObject<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * Compares two value objects by their properties.
   * Two value objects with the same properties are considered equal.
   */
  equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (other.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}


/**
 * SimpleId - A simple string-based ID value object
 *
 * Many entities need ID wrappers for type safety.
 * Instead of using raw strings, we wrap them:
 *
 *   function findTask(id: string) { }      // Any string works - dangerous!
 *   function findTask(id: TaskId) { }       // Only TaskId works - safe!
 *
 * Each feature creates its own ID type (ProjectId, TaskId, TagId)
 * to prevent accidentally mixing IDs from different features.
 */
export abstract class SimpleId extends ValueObject<{ value: string }> {
  protected constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('ID cannot be empty');
    }
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
