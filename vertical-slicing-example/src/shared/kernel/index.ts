/**
 * SHARED KERNEL - Public API
 *
 * This index exports everything that features can depend on.
 * Keep this minimal! Each export here is a dependency that
 * couples features together.
 *
 * Rule of thumb: If something is only used by one feature,
 * it should NOT be in the shared kernel.
 */

export { Entity, DomainEvent } from './Entity';
export { ValueObject, SimpleId } from './ValueObject';
export { IdGenerator } from './IdGenerator';
