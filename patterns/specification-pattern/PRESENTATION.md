# 🎓 Presentación: Specification Pattern

> **Una guía para presentar este patrón a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar el Specification Pattern: cómo encapsular reglas de negocio de filtrado y selección en objetos reutilizables y componibles.

### Duración Recomendada
- **Express (30 min)**: Problema + Solución + Demo
- **Estándar (1 hora)**: Conceptos + Código + Ejercicios
- **Completo (2 horas)**: Workshop con implementación

### Prerrequisitos
- OOP básico (interfaces, herencia)
- Patrón Repository (recomendado)

---

## 🎤 Estructura Sugerida

### 1. Introducción - El Problema (10 min)

**Pregunta inicial:** "¿Cómo filtran productos en sus aplicaciones?"

**Mostrar código problemático:**
```typescript
// ❌ El infierno de los filtros
class ProductService {
  findProducts(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    inStock?: boolean,
    tags?: string[],
    name?: string
  ) {
    return this.products.filter(p => {
      if (category && p.category !== category) return false;
      if (minPrice && p.price < minPrice) return false;
      if (maxPrice && p.price > maxPrice) return false;
      if (inStock !== undefined && p.stock === 0) return false;
      if (tags && !tags.some(t => p.tags.includes(t))) return false;
      if (name && !p.name.includes(name)) return false;
      return true;
    });
  }
}
```

**Los problemas:**
1. Lógica de negocio mezclada con infraestructura
2. Imposible reutilizar filtros
3. No se pueden testear filtros aislados
4. Crece sin control con cada nuevo filtro
5. Difícil combinar filtros dinámicamente

### 2. La Solución - Specification Pattern (15 min)

**Mostrar la transformación:**

```typescript
// ✅ Con Specification Pattern

// 1. Cada filtro es un objeto
const inStock = new InStockSpecification();
const cheap = new PriceLessThanSpecification(100);
const electronics = new CategorySpecification('electronics');

// 2. Se combinan fácilmente
const affordableElectronics = inStock
  .and(cheap)
  .and(electronics);

// 3. Uso simple
const products = repository.findAll(affordableElectronics);

// 4. Testeable aisladamente
expect(inStock.isSatisfiedBy(product)).toBe(true);
```

**Conceptos clave:**
1. **Specification**: Una regla de negocio encapsulada
2. **Composite**: Combinar con AND, OR, NOT
3. **Reutilización**: Misma especificación en múltiples contextos
4. **Expresividad**: El código se lee como lenguaje natural

### 3. La Anatomía del Patrón (15 min)

**Dibujar en la pizarra:**

```
┌──────────────────────────────────┐
│   Specification<T>               │
│   ├── isSatisfiedBy(T): boolean  │ ← La pregunta clave
│   ├── and(Spec): Spec            │ ← Composición
│   ├── or(Spec): Spec             │
│   └── not(): Spec                │
└──────────────────────────────────┘
           △
           │ implementan
           │
  ┌────────┴─────────┬──────────────┐
  │                  │              │
┌─▼────────────┐  ┌─▼───────────┐  ┌─▼──────────┐
│InStockSpec   │  │PriceLessThan│  │CategorySpec│
│              │  │             │  │            │
└──────────────┘  └─────────────┘  └────────────┘

     Combinar con:

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│AndSpec       │  │OrSpec        │  │NotSpec       │
│(ambas)       │  │(al menos 1)  │  │(negar)       │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Implementación base:**

```typescript
// La interface madre
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

// Clase base para no repetir código
abstract class CompositeSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

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

### 4. Demo en Vivo (20 min)

**Paso 1: Ejecutar el proyecto**
```bash
npm run dev
```

**Paso 2: Crear productos de prueba**
```bash
# Producto 1: Electrónico caro en stock
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","price":1199,"category":"electronics","stock":50,"tags":["apple","smartphone"]}'

# Producto 2: Electrónico barato en stock
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Samsung A14","price":199,"category":"electronics","stock":30,"tags":["samsung","budget"]}'

# Producto 3: Mueble sin stock
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Mesa Ikea","price":250,"category":"furniture","stock":0,"tags":["wood"]}'
```

**Paso 3: Buscar con especificaciones**
```bash
# Electrónicos en stock con precio < 1000
curl "http://localhost:3000/products/search?category=electronics&inStock=true&maxPrice=1000"

# Solo debería devolver el Samsung A14
```

**Paso 4: Mostrar el código**

Navegar por el código en este orden:
1. `Specification.ts` - La base
2. `ProductSpecs.ts` - Especificaciones concretas
3. `CompositeSpecs.ts` - AND, OR, NOT
4. `SearchProductsUseCase.ts` - Cómo se usan
5. `InMemoryProductRepository.ts` - Aplicar especificaciones

### 5. Usos Avanzados (10 min)

**Validación de Reglas de Negocio**

```typescript
// Productos premium deben tener mínimo 10 en stock
class PremiumProductValidator {
  private spec = new PriceLessThanSpecification(1000)
    .not()  // precio >= 1000
    .and(new MinStockSpecification(10));

  validate(product: Product): void {
    if (!this.spec.isSatisfiedBy(product)) {
      throw new Error('Premium products need min 10 stock');
    }
  }
}
```

**Filtros Dinámicos**

```typescript
// Construir especificación según input del usuario
function buildSearch(filters: UserFilters): Specification<Product> {
  let spec: Specification<Product> | null = null;

  // OR entre categorías
  filters.categories.forEach(cat => {
    const catSpec = new CategorySpecification(cat);
    spec = spec ? spec.or(catSpec) : catSpec;
  });

  // AND con precio
  if (filters.maxPrice) {
    const priceSpec = new PriceLessThanSpecification(filters.maxPrice);
    spec = spec ? spec.and(priceSpec) : priceSpec;
  }

  return spec || new AllProductsSpecification();
}
```

**Traducción a SQL (conceptual)**

```typescript
// Para optimizar en BD grandes
class SqlProductRepository {
  async findAll(spec: Specification<Product>): Promise<Product[]> {
    // Visitor pattern para traducir a SQL
    const visitor = new SqlSpecificationVisitor();
    const whereClause = spec.accept(visitor);

    return this.db.query(`SELECT * FROM products WHERE ${whereClause}`);
  }
}
```

### 6. Ejercicio Práctico (15 min)

**Ejercicio:**
"Implementen una especificación `PriceInRangeSpecification` que acepte min y max precio."

**Solución:**
```typescript
export class PriceInRangeSpecification extends CompositeSpecification<Product> {
  constructor(
    private minPrice: number,
    private maxPrice: number
  ) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.price >= this.minPrice
        && product.price <= this.maxPrice;
  }
}

// Uso
const midRange = new PriceInRangeSpecification(100, 500);
const products = await repository.findAll(midRange);
```

**Ejercicio extra (si hay tiempo):**
"Combinen especificaciones para buscar: (electrónicos O muebles) Y (precio < 300) Y en stock"

```typescript
const electronicOrFurniture = new CategorySpecification('electronics')
  .or(new CategorySpecification('furniture'));

const affordableAndAvailable = electronicOrFurniture
  .and(new PriceLessThanSpecification(300))
  .and(new InStockSpecification());
```

---

## 💡 Puntos Clave

### Las Tres Ventajas Principales

1. **Encapsulación**: Cada regla es un objeto con una responsabilidad
2. **Reutilización**: Misma especificación en múltiples contextos
3. **Composición**: Combinar piezas simples para crear lógica compleja

### ¿Cuándo Usarlo?

✅ **SÍ** cuando:
- Lógica de filtrado compleja que se repite
- Necesitas combinar filtros dinámicamente
- Quieres testear reglas aisladamente
- Múltiples contextos (memoria, BD, validación)

❌ **NO** cuando:
- Solo 2-3 filtros simples
- Performance crítico (SQL manual optimizado)
- Equipo sin experiencia y sin tiempo

### Comparación Rápida

| Sin Specification | Con Specification |
|-------------------|-------------------|
| Ifs anidados | Objetos componibles |
| Difícil testear | Fácil testear |
| No reutilizable | Altamente reutilizable |
| Crece sin control | Extensible (Open/Closed) |
| Lógica dispersa | Lógica encapsulada |

---

## ❓ Preguntas Frecuentes

### "¿No es demasiado código para un simple filtro?"

Para UN filtro, sí. Pero cuando tienes 10+ filtros combinables, el Specification Pattern reduce drásticamente la complejidad total.

### "¿Cómo funciona con bases de datos?"

Dos opciones:
1. **In-Memory**: Filtras en código con `isSatisfiedBy` (simple pero menos eficiente)
2. **SQL Translation**: Usas Visitor Pattern para traducir a SQL WHERE (complejo pero eficiente)

### "¿Es lo mismo que el patrón Strategy?"

No. Strategy encapsula **algoritmos intercambiables**. Specification encapsula **reglas de negocio combinables**. Specification es más específico.

### "¿Puedo validar con esto?"

¡Absolutamente! Es uno de los mejores usos:

```typescript
const validProductRules = new NameNotEmptySpec()
  .and(new PricePositiveSpec())
  .and(new ValidCategorySpec());

if (!validProductRules.isSatisfiedBy(product)) {
  throw new InvalidProductError();
}
```

---

## 📋 Checklist de Presentación

Antes:
- [ ] Proyecto ejecutándose
- [ ] Tests pasando
- [ ] Ejemplos curl listos
- [ ] Diagramas preparados

Durante:
- [ ] Mostrar el problema (código feo con ifs)
- [ ] Explicar la solución (especificaciones)
- [ ] Demostrar composición (AND, OR, NOT)
- [ ] Demo en vivo
- [ ] Ejercicio práctico
- [ ] Casos de uso reales

Después:
- [ ] Compartir recursos adicionales
- [ ] Responder dudas
- [ ] Sugerir ejercicios para practicar

---

## 🏆 Mensaje Final

"El Specification Pattern trata sobre una idea simple pero poderosa:

**Encapsula cada regla de negocio en un objeto pequeño y testeable.**

Después combinas esos objetos como bloques de LEGO para crear filtros tan complejos como necesites.

No es la solución para todo. Pero cuando tu dominio tiene lógica compleja de filtrado y selección que se usa en múltiples lugares, este patrón te va a cambiar la vida.

Recuerden: pequeñas piezas componibles > grandes métodos con ifs anidados."

---

**Profe Millo**
_"Una especificación bien hecha vale más que mil ifs anidados"_
