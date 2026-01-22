/**
 * Specification Pattern - Interface Base
 *
 * Este es el corazón del patrón, mi niño.
 * Cada especificación encapsula UNA regla de negocio que puede responderse con un boolean.
 *
 * La magia está en que las especificaciones se pueden COMPONER usando AND, OR, NOT.
 */

export interface Specification<T> {
  /**
   * ¿Este objeto cumple con la especificación?
   * Esta es la pregunta fundamental.
   */
  isSatisfiedBy(candidate: T): boolean;

  /**
   * Combina esta especificación con otra usando lógica AND (ambas deben cumplirse)
   */
  and(other: Specification<T>): Specification<T>;

  /**
   * Combina esta especificación con otra usando lógica OR (al menos una debe cumplirse)
   */
  or(other: Specification<T>): Specification<T>;

  /**
   * Niega esta especificación (NOT)
   */
  not(): Specification<T>;
}

/**
 * CompositeSpecification - Clase Base Abstracta
 *
 * Implementa los métodos de composición (and, or, not) para que
 * las especificaciones concretas solo tengan que implementar isSatisfiedBy.
 *
 * Esto sigue el principio DRY: no repetimos código de composición en cada especificación.
 */
export abstract class CompositeSpecification<T> implements Specification<T> {
  /**
   * Cada especificación concreta debe implementar su propia lógica
   */
  abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * Ya está implementado: crea una AndSpecification
   */
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  /**
   * Ya está implementado: crea una OrSpecification
   */
  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  /**
   * Ya está implementado: crea una NotSpecification
   */
  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

/**
 * AndSpecification - Composición con lógica AND
 *
 * Combina dos especificaciones: AMBAS deben cumplirse
 */
class AndSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate)
        && this.right.isSatisfiedBy(candidate);
  }
}

/**
 * OrSpecification - Composición con lógica OR
 *
 * Combina dos especificaciones: AL MENOS UNA debe cumplirse
 */
class OrSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate)
        || this.right.isSatisfiedBy(candidate);
  }
}

/**
 * NotSpecification - Composición con lógica NOT
 *
 * Niega una especificación: debe NO cumplirse
 */
class NotSpecification<T> extends CompositeSpecification<T> {
  constructor(private readonly spec: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}
