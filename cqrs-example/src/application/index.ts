/**
 * CQRS EXAMPLE - Application Layer
 *
 * The application layer in CQRS is organized by:
 * - Commands: Write operations that change state
 * - Queries: Read operations that return data
 *
 * Each has its own handlers that implement the business flow.
 */

export * from './commands';
export * from './commands/handlers';
export * from './queries';
export * from './queries/handlers';
