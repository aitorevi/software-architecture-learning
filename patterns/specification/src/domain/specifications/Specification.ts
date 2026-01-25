/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 1 DE 6: SPECIFICATION PATTERN - LA BASE
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Buenas, mi niño! Este es el CORAZÓN del Specification Pattern.
 *
 * 🎯 QUÉ ES UNA SPECIFICATION:
 *
 * Una especificación es simplemente una REGLA DE NEGOCIO encapsulada en un objeto
 * que puede responder a una pregunta con boolean: ¿Este objeto cumple la regla?
 *
 * Ejemplo mental:
 *   Regla: "El producto debe estar en stock"
 *   Pregunta: ¿Este producto cumple la regla?
 *   Respuesta: true o false
 *
 * 💡 LA MAGIA - COMPOSICIÓN:
 *
 * Las especificaciones se pueden COMBINAR usando operadores lógicos:
 *   - AND: Ambas reglas deben cumplirse
 *   - OR:  Al menos una regla debe cumplirse
 *   - NOT: La regla NO debe cumplirse
 *
 * Ejemplo de composición:
 *   const affordable = new PriceLessThan(100);
 *   const inStock = new InStock();
 *   const affordableAndInStock = affordable.and(inStock);
 *
 * 🔗 RELACIÓN CON EL README:
 *
 * Esto implementa lo explicado en README_ES.md líneas 194-217
 * "La Interface Base: Specification<T>"
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de entender esta interface, ve a:
 *   → ProductSpecs.ts (ver especificaciones CONCRETAS en acción)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface Specification<T> {
  /**
   * 🎯 EL MÉTODO MÁS IMPORTANTE
   *
   * ¿Este objeto candidato cumple con mi regla de negocio?
   *
   * @param candidate - El objeto a evaluar
   * @returns true si cumple la especificación, false si no
   *
   * Ejemplo:
   *   const inStock = new InStockSpecification();
   *   inStock.isSatisfiedBy(product) // true si product.stock > 0
   */
  isSatisfiedBy(candidate: T): boolean;

  /**
   * 🔗 COMBINAR CON AND (lógica &&)
   *
   * Crea una nueva especificación que solo se cumple si AMBAS se cumplen.
   *
   * @param other - La otra especificación
   * @returns Una nueva especificación compuesta
   *
   * Ejemplo:
   *   const cheap = new PriceLessThan(100);
   *   const electronics = new Category('electronics');
   *   const cheapElectronics = cheap.and(electronics);
   *   // Solo productos que son baratos Y electrónicos
   */
  and(other: Specification<T>): Specification<T>;

  /**
   * 🔗 COMBINAR CON OR (lógica ||)
   *
   * Crea una nueva especificación que se cumple si AL MENOS UNA se cumple.
   *
   * @param other - La otra especificación
   * @returns Una nueva especificación compuesta
   *
   * Ejemplo:
   *   const electronics = new Category('electronics');
   *   const furniture = new Category('furniture');
   *   const electronicsOrFurniture = electronics.or(furniture);
   *   // Productos que son electrónicos O muebles
   */
  or(other: Specification<T>): Specification<T>;

  /**
   * 🔄 NEGAR CON NOT (lógica !)
   *
   * Crea una nueva especificación que es la negación de esta.
   *
   * @returns Una nueva especificación negada
   *
   * Ejemplo:
   *   const inStock = new InStock();
   *   const outOfStock = inStock.not();
   *   // Productos que NO están en stock
   */
  not(): Specification<T>;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   🧱 CLASE BASE ABSTRACTA: CompositeSpecification
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🎯 PROPÓSITO:
 *
 * Esta clase base implementa los métodos de COMPOSICIÓN (and, or, not)
 * para que las especificaciones concretas solo se preocupen de su lógica.
 *
 * 💡 PRINCIPIO DRY (Don't Repeat Yourself):
 *
 * Sin esta clase, CADA especificación concreta tendría que implementar
 * and(), or(), not(). Eso sería repetir el mismo código 10 veces.
 *
 * Con esta clase base: implementamos una vez, heredamos siempre.
 *
 * 🏗️ ESTRUCTURA:
 *
 * ┌─────────────────────────────────────┐
 * │  CompositeSpecification (abstracta) │
 * │  - isSatisfiedBy() → abstracto      │
 * │  - and() → implementado             │
 * │  - or() → implementado              │
 * │  - not() → implementado             │
 * └─────────────────────────────────────┘
 *            ↑
 *            │ extiende
 *            │
 * ┌─────────────────────────┐
 * │ InStockSpecification    │
 * │ - solo implementa       │
 * │   isSatisfiedBy()       │
 * │ - hereda and/or/not     │
 * └─────────────────────────┘
 *
 * 🔗 RELACIÓN CON EL README:
 *
 * Esto implementa README_ES.md líneas 219-240
 * "Clase Base Abstracta: CompositeSpecification"
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
export abstract class CompositeSpecification<T> implements Specification<T> {
  /**
   * 🎯 MÉTODO ABSTRACTO
   *
   * Cada especificación concreta DEBE implementar su propia lógica de negocio.
   * Aquí es donde pones la regla específica.
   *
   * Ejemplo en InStockSpecification:
   *   isSatisfiedBy(product: Product): boolean {
   *     return product.stock > 0;
   *   }
   */
  abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * ✅ YA IMPLEMENTADO - No tienes que hacerlo en cada especificación
   *
   * Crea un AndSpecification que combina esta spec con otra.
   */
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  /**
   * ✅ YA IMPLEMENTADO
   *
   * Crea un OrSpecification que combina esta spec con otra.
   */
  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  /**
   * ✅ YA IMPLEMENTADO
   *
   * Crea un NotSpecification que niega esta spec.
   */
  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   🔗 ESPECIFICACIONES COMPUESTAS - El Patrón Composite en Acción
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Estas tres clases implementan el COMPOSITE PATTERN.
 * Permiten combinar especificaciones simples en especificaciones complejas.
 *
 * 💡 CONCEPTO CLAVE - RECURSIVIDAD:
 *
 * Estas clases reciben Specification<T> y devuelven Specification<T>.
 * Esto permite anidar combinaciones infinitamente:
 *
 *   const complex = spec1.and(spec2).or(spec3).and(spec4.not());
 *
 * 🎯 EJEMPLO MENTAL:
 *
 *   Filtro simple: "precio < 100"
 *   Filtro simple: "en stock"
 *   Filtro compuesto: "precio < 100 AND en stock"
 *
 * 🔗 RELACIÓN CON EL README:
 *
 * Esto implementa README_ES.md líneas 242-287
 * "Especificaciones Compuestas (Composite Pattern)"
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * 🔗 AndSpecification - Combinar con AND (&&)
 *
 * AMBAS especificaciones deben cumplirse para que el candidato sea válido.
 *
 * 📊 Tabla de verdad:
 *   left | right | resultado
 *   -----|-------|----------
 *   true | true  | true ✅
 *   true | false | false ❌
 *   false| true  | false ❌
 *   false| false | false ❌
 *
 * 💡 EJEMPLO DE USO:
 *
 *   const cheap = new PriceLessThan(100);
 *   const inStock = new InStock();
 *   const affordableInStock = cheap.and(inStock);
 *
 *   // Solo productos que son baratos Y tienen stock
 */
class AndSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    // Evalúa ambas especificaciones
    return this.left.isSatisfiedBy(candidate)
        && this.right.isSatisfiedBy(candidate);
  }
}

/**
 * 🔗 OrSpecification - Combinar con OR (||)
 *
 * AL MENOS UNA especificación debe cumplirse para que el candidato sea válido.
 *
 * 📊 Tabla de verdad:
 *   left | right | resultado
 *   -----|-------|----------
 *   true | true  | true ✅
 *   true | false | true ✅
 *   false| true  | true ✅
 *   false| false | false ❌
 *
 * 💡 EJEMPLO DE USO:
 *
 *   const electronics = new Category('electronics');
 *   const furniture = new Category('furniture');
 *   const electronicsOrFurniture = electronics.or(furniture);
 *
 *   // Productos que son electrónicos O muebles
 */
class OrSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    // Evalúa ambas, con que una sea true, el resultado es true
    return this.left.isSatisfiedBy(candidate)
        || this.right.isSatisfiedBy(candidate);
  }
}

/**
 * 🔄 NotSpecification - Negar con NOT (!)
 *
 * La especificación debe NO cumplirse para que el candidato sea válido.
 *
 * 📊 Tabla de verdad:
 *   spec  | resultado
 *   ------|----------
 *   true  | false ❌
 *   false | true ✅
 *
 * 💡 EJEMPLO DE USO:
 *
 *   const cheap = new PriceLessThan(100);
 *   const expensive = cheap.not();
 *
 *   // Productos que NO son baratos (precio >= 100)
 *
 * 🎯 CASO DE USO REAL:
 *
 *   const premium = new PriceLessThan(1000).not();
 *   // Productos premium (precio >= 1000)
 */
class NotSpecification<T> extends CompositeSpecification<T> {
  constructor(private readonly spec: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    // Niega el resultado de la especificación interna
    return !this.spec.isSatisfiedBy(candidate);
  }
}
