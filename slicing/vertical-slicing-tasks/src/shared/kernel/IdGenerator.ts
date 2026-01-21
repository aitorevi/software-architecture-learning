/**
 * SHARED KERNEL - ID Generator
 *
 * ID generation is a cross-cutting infrastructure concern that all features need.
 * By defining the interface in the shared kernel, we ensure:
 *
 * 1. Consistent ID format across the entire system
 * 2. Each feature can depend on this interface without coupling to UUID library
 * 3. Easy to swap implementation (UUID, ULID, sequence, etc.)
 * 4. Testable - we can inject a predictable ID generator in tests
 */

/**
 * IdGenerator - Port for generating unique identifiers
 *
 * This is a "driven port" (secondary port) - the application
 * needs IDs but doesn't care how they're generated.
 */
export interface IdGenerator {
  generate(): string;
}
