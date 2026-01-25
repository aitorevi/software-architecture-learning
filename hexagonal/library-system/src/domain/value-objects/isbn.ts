/**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   📚 ARCHIVO 2 DE 7: VALUE OBJECT - ISBN
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ¡Buenas de nuevo, mi niño! Después de ver Book (Entidad), ahora vemos ISBN
 * (Value Object). Este es un concepto CLAVE de Domain-Driven Design.
 *
 * 🎯 ¿QUÉ ES UN VALUE OBJECT?
 *
 * Un Value Object es un objeto que:
 *   1. NO tiene identidad propia (no tiene ID)
 *   2. Es INMUTABLE (una vez creado, no cambia)
 *   3. Se compara por VALOR, no por referencia
 *   4. Encapsula lógica de validación
 *
 * 💡 DIFERENCIA: Value Object vs Entidad
 *
 *   Value Object (ISBN)           Entidad (Book)
 *   ───────────────────           ──────────────
 *   - Sin identidad               - Con identidad (BookId)
 *   - Inmutable                   - Mutable (cambia de estado)
 *   - Se compara por valor        - Se compara por ID
 *   - Pequeño y simple            - Más complejo
 *
 * 🎨 EJEMPLO MENTAL:
 *
 * Piensa en números: el número 5 es siempre 5.
 *   - No tiene ID (no es "el 5 número 3")
 *   - 5 === 5 (se compara por valor)
 *   - No puedes cambiar el 5 (inmutable)
 *
 * Piensa en personas: Juan Pérez es una ENTIDAD.
 *   - Tiene DNI (identidad)
 *   - Juan con 20 años === Juan con 30 años (mismo ID)
 *   - Juan cambia con el tiempo (mutable)
 *
 * 📖 ¿POR QUÉ UN VALUE OBJECT PARA ISBN?
 *
 * 1. VALIDACIÓN AUTOMÁTICA
 *    - Imposible tener un ISBN inválido en el sistema
 *    - La validación está centralizada aquí
 *
 * 2. TYPE SAFETY
 *    - ISBN vs string (el compilador te ayuda)
 *    - book.isbn = "abc123" → ERROR ❌
 *    - book.isbn = ISBN.create("978-0...") → OK ✅
 *
 * 3. LÓGICA ENCAPSULADA
 *    - Algoritmo de validación ISBN-10 e ISBN-13
 *    - Normalización (quitar guiones)
 *    - Comparación correcta
 *
 * 4. EXPRESIVIDAD
 *    - ISBN comunica intención mejor que string
 *    - Código autodocumentado
 *
 * 🔐 CARACTERÍSTICAS CLAVE:
 *
 * - Constructor PRIVADO → Solo se crea con ISBN.create()
 * - Validación en constructor → Fail Fast
 * - readonly → Inmutabilidad
 * - equals() → Comparación por valor
 *
 * 🔗 RELACIÓN CON EL README:
 *
 * Lee README_ES.md sección "Value Objects" para entender más sobre este
 * concepto fundamental de DDD.
 *
 * 📖 PRÓXIMO PASO:
 *
 * Después de entender Value Objects, ve a:
 *   → ../repositories/book.repository.ts (ver el PUERTO)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
export class ISBN {
  /**
   * 🔒 CONSTRUCTOR PRIVADO - Patrón Smart Constructor
   *
   * Al ser privado, nadie puede hacer `new ISBN("...")` directamente.
   * Esto nos da control total sobre la creación:
   *   - Validamos SIEMPRE antes de crear
   *   - Garantizamos invariantes
   *   - Fail Fast: falla rápido si el ISBN es inválido
   *
   * Para crear un ISBN, usa: ISBN.create("978-...")
   */
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * ✅ VALIDACIÓN - El Corazón del Value Object
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Esta validación se ejecuta SIEMPRE que se crea un ISBN.
   * Es imposible tener un ISBN inválido en el sistema.
   *
   * FAIL FAST: Si el ISBN es inválido, falla AHORA (en construcción)
   * no después (cuando lo uses).
   *
   * Valida dos formatos:
   *   - ISBN-10: 10 dígitos (ej: 0-306-40615-2)
   *   - ISBN-13: 13 dígitos (ej: 978-0-306-40615-7)
   */
  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('ISBN cannot be empty');
    }

    // Normalizar: quitar guiones y espacios
    const cleanIsbn = value.replace(/[-\s]/g, '');

    // Debe ser ISBN-10 O ISBN-13 válido
    if (!this.isValidIsbn10(cleanIsbn) && !this.isValidIsbn13(cleanIsbn)) {
      throw new Error(`Invalid ISBN format: ${value}`);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🔢 ALGORITMO ISBN-10 - Checksum con Módulo 11
   * ═══════════════════════════════════════════════════════════════════════
   *
   * ISBN-10 usa un algoritmo de checksum para detectar errores:
   *
   * EJEMPLO: 0-306-40615-2
   *
   * Paso 1: Multiplicar cada dígito por su posición (10, 9, 8, ..., 2)
   *   0×10 + 3×9 + 0×8 + 6×7 + 4×6 + 0×5 + 6×4 + 1×3 + 5×2 = 130
   *
   * Paso 2: Sumar el dígito de verificación (2)
   *   130 + 2 = 132
   *
   * Paso 3: Verificar que sea divisible entre 11
   *   132 % 11 = 0 ✅ VÁLIDO
   *
   * NOTA: El último dígito puede ser 'X' (representa 10)
   *
   * 💡 ¿Por qué este algoritmo? Detecta:
   *   - Errores de transcripción (1 dígito mal)
   *   - Transposiciones (dos dígitos intercambiados)
   */
  private isValidIsbn10(isbn: string): boolean {
    if (isbn.length !== 10) return false;

    let sum = 0;
    // Multiplicar cada dígito por (10 - posición)
    for (let i = 0; i < 9; i++) {
      const digit = parseInt(isbn[i], 10);
      if (isNaN(digit)) return false;
      sum += digit * (10 - i);
    }

    // El último dígito puede ser 'X' (vale 10)
    const lastChar = isbn[9].toUpperCase();
    const lastDigit = lastChar === 'X' ? 10 : parseInt(lastChar, 10);
    if (isNaN(lastDigit) && lastChar !== 'X') return false;

    sum += lastDigit;
    // Debe ser divisible entre 11
    return sum % 11 === 0;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🔢 ALGORITMO ISBN-13 - Checksum con Módulo 10
   * ═══════════════════════════════════════════════════════════════════════
   *
   * ISBN-13 usa un algoritmo más simple que ISBN-10:
   *
   * EJEMPLO: 978-0-306-40615-7
   *
   * Paso 1: Multiplicar alternativamente por 1 y 3
   *   9×1 + 7×3 + 8×1 + 0×3 + 3×1 + 0×3 + 6×1 + 4×3 + 0×1 + 6×3 + 1×1 + 5×3 = 93
   *
   * Paso 2: Sumar el dígito de verificación (7)
   *   93 + 7 = 100
   *
   * Paso 3: Verificar que sea divisible entre 10
   *   100 % 10 = 0 ✅ VÁLIDO
   *
   * 💡 ISBN-13 es compatible con EAN-13 (código de barras europeo)
   */
  private isValidIsbn13(isbn: string): boolean {
    if (isbn.length !== 13) return false;

    let sum = 0;
    for (let i = 0; i < 13; i++) {
      const digit = parseInt(isbn[i], 10);
      if (isNaN(digit)) return false;
      // Alternar: posiciones pares ×1, impares ×3
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }

    // Debe ser divisible entre 10
    return sum % 10 === 0;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🏭 FACTORY METHOD - Punto de Entrada Único
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Este es el ÚNICO lugar donde se puede crear un ISBN.
   *
   * USO:
   *   const isbn = ISBN.create("978-0-306-40615-7");
   *
   * Si el ISBN es inválido, lanza excepción AQUÍ (Fail Fast).
   * Nunca tendrás un ISBN inválido circulando por tu sistema.
   *
   * 💡 Patrón Smart Constructor:
   *   - Constructor privado (no puedes hacer new ISBN(...))
   *   - Factory method público (usas ISBN.create(...))
   *   - Control total sobre la creación
   */
  static create(value: string): ISBN {
    return new ISBN(value);
  }

  /**
   * 📖 Obtener el valor del ISBN tal como se proporcionó
   *
   * Puede incluir guiones: "978-0-306-40615-7"
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 🧹 Obtener ISBN normalizado (solo dígitos)
   *
   * Útil para comparaciones o almacenamiento en BD:
   *   "978-0-306-40615-7" → "9780306406157"
   */
  getNormalized(): string {
    return this.value.replace(/[-\s]/g, '');
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * ⚖️ IGUALDAD POR VALOR - Característica Clave de Value Objects
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Dos ISBNs son iguales si sus VALORES son iguales, no por referencia.
   *
   * EJEMPLO:
   *
   *   const isbn1 = ISBN.create("978-0-306-40615-7");
   *   const isbn2 = ISBN.create("9780306406157"); // Sin guiones
   *
   *   isbn1 === isbn2  // false (referencias diferentes) ❌
   *   isbn1.equals(isbn2)  // true (mismo valor) ✅
   *
   * Usamos getNormalized() para ignorar diferencias de formato.
   */
  equals(other: ISBN): boolean {
    return this.getNormalized() === other.getNormalized();
  }

  /**
   * 📝 Representación en string
   *
   * Útil para logging, debugging, serialización
   */
  toString(): string {
    return this.value;
  }
}
