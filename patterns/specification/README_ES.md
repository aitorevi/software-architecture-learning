# Specification Pattern - Filtrado Inteligente 🎯

Bienvenido, mi niño. Este proyecto te va a enseñar el **Specification Pattern**, un patrón de diseño que te permite encapsular lógica de negocio de filtrado y selección en objetos reutilizables. Es como tener piezas de LEGO que puedes combinar para crear filtros complejos sin repetir código.

## ¿Qué vas a aprender?

Imagínate que tienes un catálogo de productos en tu e-commerce. Los usuarios quieren filtrar por:
- Precio menor a X
- Categoría específica
- Productos en stock
- Con ciertos tags
- Combinaciones: "electrónicos baratos en stock" o "muebles premium sin stock"

Sin el Specification Pattern, acabas con un método de filtrado lleno de ifs anidados que es un infierno de mantener. Con este patrón, cada regla es un objeto pequeño y reutilizable.

### Conceptos clave que dominarás

1. **Specification (Especificación)** - Una regla de negocio encapsulada
2. **Composite Pattern** - Combinar especificaciones con AND, OR, NOT
3. **Query Object Pattern** - Separar criterios de búsqueda de la ejecución
4. **In-Memory vs Database** - Especificaciones que funcionan en ambos
5. **Inversión de Dependencias** - El dominio define las reglas, no la infra

## El Problema

### Sin Specification Pattern ❌

Mira tú, esto es lo que NO queremos:

```typescript
class ProductRepository {
  findProducts(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    inStock?: boolean,
    tags?: string[]
  ): Product[] {
    return this.products.filter(product => {
      // Un infierno de ifs anidados
      if (category && product.category !== category) return false;
      if (minPrice && product.price < minPrice) return false;
      if (maxPrice && product.price > maxPrice) return false;
      if (inStock !== undefined && product.stock === 0) return false;
      if (tags && !tags.some(tag => product.tags.includes(tag))) return false;
      return true;
    });
  }
}

// Y si quieres añadir un filtro nuevo, tocas el repo
// Y si quieres combinar filtros de forma dinámica, buena suerte
```

**Problemas:**
- Lógica de negocio en el repositorio (capa de infraestructura)
- Difícil de testear cada filtro por separado
- Imposible reutilizar filtros en otros contextos
- El método crece sin parar con cada nuevo filtro
- No puedes componer filtros dinámicamente

### Con Specification Pattern ✅

Ahora mira esto, mi niño:

```typescript
// Cada regla es un objeto reutilizable
const inStock = new InStockSpecification();
const cheap = new PriceLessThanSpecification(100);
const electronics = new CategorySpecification('electronics');

// Se combinan fácilmente
const affordableElectronics = inStock
  .and(cheap)
  .and(electronics);

// Uso simple
const products = await repository.findAll(affordableElectronics);

// Testeable aisladamente
expect(inStock.isSatisfiedBy(product)).toBe(true);
```

**Ventajas:**
- Cada especificación es pequeña, simple y testeable
- Reutilizables en cualquier parte del código
- Composición dinámica: creas filtros complejos fácilmente
- La lógica de negocio está en el dominio, no en la infra
- Principio Open/Closed: añades filtros sin tocar código existente

## Arquitectura - El Patrón en Acción

```
┌─────────────────────────────────────────────────────┐
│         DOMINIO (Reglas de Negocio)                 │
│  ┌───────────────────────────────────────────────┐  │
│  │   Specification<Product>                      │  │
│  │   ├── isSatisfiedBy(product): boolean         │  │
│  │   ├── and(other): Specification               │  │
│  │   ├── or(other): Specification                │  │
│  │   └── not(): Specification                    │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  Especificaciones Concretas:                        │
│  ┌─────────────────────────────────────┐            │
│  │ InStockSpecification                │            │
│  │ PriceLessThanSpecification          │            │
│  │ CategorySpecification               │            │
│  │ NameContainsSpecification           │            │
│  │ HasTagSpecification                 │            │
│  └─────────────────────────────────────┘            │
│                                                      │
│  Especificaciones Compuestas:                       │
│  ┌─────────────────────────────────────┐            │
│  │ AndSpecification                    │            │
│  │ OrSpecification                     │            │
│  │ NotSpecification                    │            │
│  └─────────────────────────────────────┘            │
└──────────────────────────────────────────────────────┘
                        ↑
                        │ usa
                        │
┌──────────────────────────────────────────────────────┐
│         APLICACIÓN (Casos de Uso)                    │
│  ┌───────────────────────────────────────────────┐  │
│  │   SearchProductsUseCase                       │  │
│  │   - Recibe criterios                          │  │
│  │   - Construye especificaciones                │  │
│  │   - Consulta repositorio                      │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                        ↑
                        │ usa
                        │
┌──────────────────────────────────────────────────────┐
│         INFRAESTRUCTURA (Adaptadores)                │
│  ┌───────────────────────────────────────────────┐  │
│  │   InMemoryProductRepository                   │  │
│  │   - Filtra en memoria con spec.isSatisfiedBy  │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │   SqlProductRepository (opcional)             │  │
│  │   - Traduce spec a SQL WHERE                  │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### ¿Por qué esta estructura, Profe?

Buena pregunta, mi niño. Mira tú:

1. **Dominio limpio** - Las reglas de negocio (especificaciones) están en el dominio
2. **Reutilización** - Misma especificación funciona en memoria, en BD, en validación
3. **Testeable** - Cada especificación se testea aislada
4. **Composición** - Combinas piezas pequeñas para crear filtros complejos
5. **Extensible** - Añades nuevas especificaciones sin tocar las existentes

## Estructura de Carpetas

```
src/
├── domain/                              # 🎯 EL NÚCLEO
│   ├── entities/
│   │   └── Product.ts                   # La entidad Producto
│   │
│   ├── specifications/
│   │   ├── Specification.ts             # Interface base
│   │   ├── CompositeSpecs.ts            # AND, OR, NOT
│   │   └── ProductSpecs.ts              # Especificaciones concretas
│   │
│   └── repositories/
│       └── ProductRepository.ts         # Puerto (interface)
│
├── application/                         # Casos de Uso
│   ├── use-cases/
│   │   ├── SearchProductsUseCase.ts     # Buscar con specs
│   │   └── CreateProductUseCase.ts      # Crear producto
│   │
│   └── dtos/
│       ├── SearchCriteria.ts            # Criterios de búsqueda
│       └── ProductDTO.ts                # DTO de producto
│
└── infrastructure/                      # Adaptadores
    ├── persistence/
    │   └── InMemoryProductRepository.ts # Repo en memoria
    │
    └── http/
        ├── ProductController.ts         # REST controller
        └── index.ts                     # Express app
```

## El Patrón en Detalle

### 1. La Interface Base: Specification<T>

Todo empieza aquí, mi niño:

```typescript
// src/domain/specifications/Specification.ts

export interface Specification<T> {
  // ¿Este objeto cumple la especificación?
  isSatisfiedBy(candidate: T): boolean;

  // Combinar con AND lógico
  and(other: Specification<T>): Specification<T>;

  // Combinar con OR lógico
  or(other: Specification<T>): Specification<T>;

  // Negar la especificación (NOT)
  not(): Specification<T>;
}
```

**La clave:** Todos los métodos devuelven `Specification<T>`, permitiendo composición fluida.

### 2. Clase Base Abstracta: CompositeSpecification

Para no repetir código en cada especificación concreta:

```typescript
export abstract class CompositeSpecification<T> implements Specification<T> {
  // Cada subclase implementa su propia lógica
  abstract isSatisfiedBy(candidate: T): boolean;

  // Estos métodos ya están implementados
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}
```

### 3. Especificaciones Compuestas (Composite Pattern)

Aquí está la magia de la composición:

```typescript
// AND: Ambas especificaciones deben cumplirse
class AndSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate)
        && this.right.isSatisfiedBy(candidate);
  }
}

// OR: Al menos una debe cumplirse
class OrSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate)
        || this.right.isSatisfiedBy(candidate);
  }
}

// NOT: La especificación NO debe cumplirse
class NotSpecification<T> extends CompositeSpecification<T> {
  constructor(private spec: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}
```

### 4. Especificaciones Concretas

Cada una encapsula UNA regla de negocio:

```typescript
// Productos en stock
export class InStockSpecification extends CompositeSpecification<Product> {
  isSatisfiedBy(product: Product): boolean {
    return product.stock > 0;
  }
}

// Precio menor que...
export class PriceLessThanSpecification extends CompositeSpecification<Product> {
  constructor(private maxPrice: number) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.price < this.maxPrice;
  }
}

// Categoría específica
export class CategorySpecification extends CompositeSpecification<Product> {
  constructor(private category: string) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.category.toLowerCase() === this.category.toLowerCase();
  }
}

// Nombre contiene...
export class NameContainsSpecification extends CompositeSpecification<Product> {
  constructor(private searchTerm: string) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
  }
}

// Tiene un tag específico
export class HasTagSpecification extends CompositeSpecification<Product> {
  constructor(private tag: string) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.tags.some(t => t.toLowerCase() === this.tag.toLowerCase());
  }
}
```

### 5. Uso en Casos de Uso

Aquí ves cómo se usan dinámicamente:

```typescript
export class SearchProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(criteria: SearchCriteria): Promise<ProductDTO[]> {
    // Construir especificación compuesta dinámicamente
    let spec: Specification<Product> | null = null;

    if (criteria.category) {
      const categorySpec = new CategorySpecification(criteria.category);
      spec = spec ? spec.and(categorySpec) : categorySpec;
    }

    if (criteria.maxPrice) {
      const priceSpec = new PriceLessThanSpecification(criteria.maxPrice);
      spec = spec ? spec.and(priceSpec) : priceSpec;
    }

    if (criteria.inStock) {
      const stockSpec = new InStockSpecification();
      spec = spec ? spec.and(stockSpec) : stockSpec;
    }

    if (criteria.name) {
      const nameSpec = new NameContainsSpecification(criteria.name);
      spec = spec ? spec.and(nameSpec) : nameSpec;
    }

    if (criteria.tag) {
      const tagSpec = new HasTagSpecification(criteria.tag);
      spec = spec ? spec.and(tagSpec) : tagSpec;
    }

    // Consultar con la especificación compuesta
    const products = spec
      ? await this.productRepository.findAll(spec)
      : await this.productRepository.findAll();

    return products.map(ProductDTO.fromDomain);
  }
}
```

### 6. Implementación en el Repositorio

#### In-Memory (simple)

```typescript
export class InMemoryProductRepository implements ProductRepository {
  private products: Product[] = [];

  async findAll(spec?: Specification<Product>): Promise<Product[]> {
    if (!spec) {
      return [...this.products];
    }

    // Filtrar usando isSatisfiedBy
    return this.products.filter(product => spec.isSatisfiedBy(product));
  }
}
```

#### SQL (avanzado - no implementado en el ejemplo)

Para usar especificaciones con SQL, necesitarías un "visitor" que traduzca a SQL:

```typescript
// Ejemplo conceptual (no implementado)
export class SqlProductRepository implements ProductRepository {
  async findAll(spec?: Specification<Product>): Promise<Product[]> {
    if (!spec) {
      return this.db.query('SELECT * FROM products');
    }

    // Traducir especificación a SQL WHERE clause
    const visitor = new SqlSpecificationVisitor();
    const whereClause = spec.accept(visitor);

    return this.db.query(`SELECT * FROM products WHERE ${whereClause}`);
  }
}

// Cada especificación sabe cómo traducirse a SQL
class CategorySpecification {
  accept(visitor: SqlSpecificationVisitor): string {
    return visitor.visitCategory(this.category);
  }
}
```

## Casos de Uso Reales

### Búsquedas Complejas

```typescript
// "Electrónicos baratos en stock"
const affordableElectronics = new CategorySpecification('electronics')
  .and(new PriceLessThanSpecification(500))
  .and(new InStockSpecification());

const products = await repository.findAll(affordableElectronics);
```

### Validación de Reglas de Negocio

```typescript
// "Productos premium requieren stock mínimo de 10"
const premiumProductSpec = new PriceLessThanSpecification(1000)
  .not()  // Precio >= 1000
  .and(new MinStockSpecification(10));

if (!premiumProductSpec.isSatisfiedBy(product)) {
  throw new InvalidProductError("Premium products need min 10 stock");
}
```

### Filtros Dinámicos de Usuario

```typescript
// El usuario construye su búsqueda dinámicamente
function buildUserSearch(filters: UserFilters): Specification<Product> {
  let spec: Specification<Product> | null = null;

  filters.categories.forEach(cat => {
    const catSpec = new CategorySpecification(cat);
    spec = spec ? spec.or(catSpec) : catSpec;
  });

  if (filters.priceRange) {
    const priceSpec = new PriceInRangeSpecification(
      filters.priceRange.min,
      filters.priceRange.max
    );
    spec = spec ? spec.and(priceSpec) : priceSpec;
  }

  return spec || new AllProductsSpecification();
}
```

## Ventajas y Desventajas

### ✅ Ventajas

1. **Single Responsibility**: Cada especificación tiene una razón para cambiar
2. **Open/Closed**: Añades especificaciones sin tocar código existente
3. **Reutilización**: Misma lógica en memoria, BD, validación, etc.
4. **Testeable**: Cada especificación se testea aislada
5. **Expresivo**: El código se lee como reglas de negocio
6. **Composición**: Filtros complejos con sintaxis fluida

### ⚠️ Desventajas

1. **Overhead**: Para filtros simples puede ser excesivo
2. **Curva de aprendizaje**: Más abstracto que un simple if
3. **Performance**: En BD puede ser menos eficiente que SQL directo
4. **Complejidad**: Más clases y archivos que mantener

## ¿Cuándo Usar el Specification Pattern?

### ✅ Úsalo cuando:

- Tienes **lógica de filtrado compleja** que se repite en varios lugares
- Necesitas **combinar filtros dinámicamente** según el usuario
- Quieres **testear reglas de negocio** aisladamente
- La misma lógica se usa en **múltiples contextos** (memoria, BD, validación)
- Tienes **muchos filtros opcionales** combinables
- Necesitas **validar objetos** contra reglas complejas

### ❌ No lo uses cuando:

- Solo tienes **2-3 filtros simples** que no se combinan
- La lógica de filtrado es **trivial** y no cambia
- El **performance es crítico** y necesitas SQL optimizado a mano
- El equipo no está familiarizado y no hay tiempo de aprendizaje

## Comparación con Alternativas

### vs Query Builder (tipo Prisma/TypeORM)

```typescript
// Query Builder
const products = await db.products
  .where('category', 'electronics')
  .where('price', '<', 500)
  .where('stock', '>', 0)
  .execute();

// Specification
const spec = new CategorySpecification('electronics')
  .and(new PriceLessThanSpecification(500))
  .and(new InStockSpecification());
const products = await repo.findAll(spec);
```

**Specification gana:** Cuando la lógica se reutiliza y testea. Encapsulación de negocio.
**Query Builder gana:** Cuando solo necesitas ejecutar la query sin reutilizar.

### vs Métodos de Filtrado en el Repositorio

```typescript
// Métodos específicos
findByCategory(category: string)
findByCategoryAndPrice(category: string, maxPrice: number)
findByCategoryAndPriceAndStock(category: string, maxPrice: number, inStock: boolean)
// ... explosión combinatoria

// Specification
findAll(spec: Specification<Product>)
// Un método, infinitas combinaciones
```

**Specification gana:** Siempre. Evita explosión de métodos.

## Testing de Especificaciones

Una de las grandes ventajas es lo fácil que es testear:

```typescript
describe('InStockSpecification', () => {
  it('should be satisfied by products with stock', () => {
    const product = new Product({
      id: '1',
      name: 'Test',
      price: 100,
      category: 'test',
      stock: 10,
      tags: []
    });

    const spec = new InStockSpecification();

    expect(spec.isSatisfiedBy(product)).toBe(true);
  });

  it('should not be satisfied by products without stock', () => {
    const product = new Product({
      id: '1',
      name: 'Test',
      price: 100,
      category: 'test',
      stock: 0,
      tags: []
    });

    const spec = new InStockSpecification();

    expect(spec.isSatisfiedBy(product)).toBe(false);
  });
});

describe('AndSpecification', () => {
  it('should combine two specifications with AND logic', () => {
    const product = new Product({
      id: '1',
      name: 'Cheap Electronics',
      price: 50,
      category: 'electronics',
      stock: 10,
      tags: []
    });

    const spec = new CategorySpecification('electronics')
      .and(new PriceLessThanSpecification(100));

    expect(spec.isSatisfiedBy(product)).toBe(true);
  });
});
```

## Ejercicios Prácticos

### Ejercicio 1: Nueva Especificación
Crea una especificación `PriceInRangeSpecification` que acepte min y max.

### Ejercicio 2: Especificación de Descuento
Crea `OnSaleSpecification` que verifique si un producto tiene descuento (nuevo campo).

### Ejercicio 3: Combinar Lógica Compleja
Crea una búsqueda para: "(electrónicos O muebles) Y (precio < 500) Y en stock"

### Ejercicio 4: Visitor para SQL
Implementa un `SqlSpecificationVisitor` que traduzca especificaciones a SQL WHERE.

### Ejercicio 5: Especificaciones de Validación
Usa especificaciones para validar que un producto cumple reglas antes de guardarlo.

## Preguntas Frecuentes

### ¿Es lo mismo que el patrón Strategy?

No. Strategy encapsula **algoritmos intercambiables**. Specification encapsula **reglas de negocio combinables**. Specification es más específico.

### ¿Puedo usar esto con MongoDB?

Sí. En lugar de traducir a SQL, traduces a queries de Mongo. Mismo concepto.

### ¿Qué pasa con la performance en BD grandes?

Para optimizar, implementa un visitor que traduzca especificaciones a queries nativas de tu BD. Así aprovechas índices y el optimizer.

### ¿Puedo usar especificaciones para validación?

Absolutamente. Es uno de los usos más potentes:

```typescript
class ProductValidator {
  private rules: Specification<Product>[] = [
    new NameNotEmptySpecification(),
    new PricePositiveSpecification(),
    new ValidCategorySpecification()
  ];

  validate(product: Product): ValidationResult {
    const failures = this.rules
      .filter(rule => !rule.isSatisfiedBy(product))
      .map(rule => rule.getErrorMessage());

    return { isValid: failures.length === 0, failures };
  }
}
```

## Recursos Adicionales

- **Libro**: "Domain-Driven Design" - Eric Evans (Capítulo sobre Specifications)
- **Artículo**: "Specifications" - Martin Fowler
- **Video**: Recomiendo buscar "Specification Pattern explained" en YouTube

## Conclusión

El Specification Pattern es como tener bloques de LEGO para tus reglas de negocio, mi niño. Cada especificación es una pieza pequeña, simple y testeable. Las combinas para crear filtros tan complejos como necesites.

No es para todos los casos. Si solo tienes un par de filtros simples, es overkill. Pero si tu dominio tiene lógica compleja de filtrado y validación que se reutiliza en varios lugares, este patrón te va a salvar la vida.

La clave está en la **composición**: pequeñas piezas que se combinan para crear comportamientos complejos. Eso es diseño orientado a objetos del bueno.

¡Venga, a darle caña con las especificaciones!

---

**Profe Millo**
_"Una especificación bien hecha vale más que mil ifs anidados"_
