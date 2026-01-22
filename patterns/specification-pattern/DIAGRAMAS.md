# Diagramas del Specification Pattern

Este documento contiene diagramas visuales para entender mejor el patrón.

## 1. Jerarquía de Clases

```
┌──────────────────────────────────┐
│   Specification<T>               │
│   (Interface)                    │
│                                  │
│   + isSatisfiedBy(T): boolean    │
│   + and(Spec<T>): Spec<T>        │
│   + or(Spec<T>): Spec<T>         │
│   + not(): Spec<T>               │
└──────────────────────────────────┘
           △
           │ implementa
           │
┌──────────┴───────────────────────┐
│   CompositeSpecification<T>      │
│   (Abstract Class)               │
│                                  │
│   + and(other): Spec<T> { ... }  │  ← Ya implementados
│   + or(other): Spec<T> { ... }   │
│   + not(): Spec<T> { ... }       │
│                                  │
│   # isSatisfiedBy(T): boolean    │  ← Abstracto
└──────────────────────────────────┘
           △
           │ extienden
           │
     ┌─────┴─────┬─────────────┬──────────────┬──────────────┐
     │           │             │              │              │
┌────▼─────┐ ┌──▼──────┐ ┌───▼──────┐ ┌─────▼──────┐ ┌────▼─────┐
│InStock   │ │PriceLess│ │Category  │ │NameContains│ │HasTag    │
│Spec      │ │ThanSpec │ │Spec      │ │Spec        │ │Spec      │
└──────────┘ └─────────┘ └──────────┘ └────────────┘ └──────────┘

     Especificaciones Concretas (cada una encapsula UNA regla)
```

## 2. Composición (AND, OR, NOT)

```
Composición AND:
════════════════

┌─────────────┐         ┌─────────────┐
│   SpecA     │         │   SpecB     │
│             │         │             │
│ isSatisfied │         │ isSatisfied │
│    By()     │         │    By()     │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │                       │
       └──────┬─────┬──────────┘
              │     │
              ▼     ▼
       ┌─────────────────┐
       │AndSpecification │
       │                 │
       │ left && right   │
       └─────────────────┘


Composición OR:
═══════════════

┌─────────────┐         ┌─────────────┐
│   SpecA     │         │   SpecB     │
│             │         │             │
│ isSatisfied │         │ isSatisfied │
│    By()     │         │    By()     │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │                       │
       └──────┬─────┬──────────┘
              │     │
              ▼     ▼
       ┌─────────────────┐
       │ OrSpecification │
       │                 │
       │ left || right   │
       └─────────────────┘


Negación NOT:
═════════════

       ┌─────────────┐
       │   SpecA     │
       │             │
       │ isSatisfied │
       │    By()     │
       └──────┬──────┘
              │
              ▼
       ┌─────────────────┐
       │NotSpecification │
       │                 │
       │   !spec         │
       └─────────────────┘
```

## 3. Flujo de Uso en un Caso de Uso

```
┌──────────────────────────────────────────────────────────────┐
│                  SearchProductsUseCase                       │
│                                                              │
│  1. Recibe SearchCriteria                                   │
│     ┌──────────────────────────┐                            │
│     │ { category: 'electronics'│                            │
│     │   maxPrice: 1000         │                            │
│     │   inStock: true }        │                            │
│     └──────────────────────────┘                            │
│                                                              │
│  2. Construye Especificación Compuesta                      │
│     ┌────────────────────────────────────────────┐          │
│     │ CategorySpec('electronics')                │          │
│     │   .and(PriceLessThanSpec(1000))            │          │
│     │   .and(InStockSpec())                      │          │
│     └────────────────────────────────────────────┘          │
│                                                              │
│  3. Llama al Repositorio                                    │
│     repository.findAll(spec)                                │
│                    │                                         │
└────────────────────┼─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│              InMemoryProductRepository                       │
│                                                              │
│  4. Aplica la Especificación a cada producto                │
│                                                              │
│  products.filter(product =>                                 │
│    spec.isSatisfiedBy(product)                              │
│  )                                                           │
│                                                              │
│  Para cada producto:                                        │
│    ┌──────────────────────────────┐                         │
│    │ spec.isSatisfiedBy(product)  │                         │
│    └───────────┬──────────────────┘                         │
│                │                                             │
│                ▼                                             │
│    ¿Cumple CategorySpec? → ✓                                │
│    ¿Cumple PriceLessThan? → ✓                               │
│    ¿Cumple InStockSpec?   → ✓                               │
│                                                              │
│    Resultado: true → incluir en resultados                  │
│                                                              │
│  5. Devuelve productos filtrados                            │
│     [product1, product2, ...]                               │
└──────────────────────────────────────────────────────────────┘
```

## 4. Composición Compleja Ejemplo

```
Búsqueda: "Electrónicos O Muebles" Y "Precio < 500" Y "En Stock"

                    ┌─────────────────┐
                    │  AndSpec (root) │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐      ┌───────────────────┐
    │    AndSpec        │      │    InStockSpec    │
    └─────────┬─────────┘      └───────────────────┘
              │
        ┌─────┼─────┐
        │           │
        ▼           ▼
┌─────────────┐  ┌──────────────────┐
│  OrSpec     │  │PriceLessThanSpec │
└──────┬──────┘  │   (500)          │
       │         └──────────────────┘
   ┌───┼────┐
   │        │
   ▼        ▼
┌──────┐ ┌──────┐
│Cat   │ │Cat   │
│Elec  │ │Furn  │
└──────┘ └──────┘

Código equivalente:
═══════════════════

const spec = new CategorySpec('electronics')
  .or(new CategorySpec('furniture'))
  .and(new PriceLessThanSpec(500))
  .and(new InStockSpec());
```

## 5. Flujo de Evaluación (isSatisfiedBy)

```
Ejemplo: spec.isSatisfiedBy(product)

Donde spec = InStock.and(PriceLessThan(100))
Y product = { price: 50, stock: 10 }

┌──────────────────────────────────────────┐
│   AndSpecification                       │
│   isSatisfiedBy(product)                 │
└───────────────┬──────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌───────────────┐  ┌─────────────────────┐
│ InStockSpec   │  │ PriceLessThanSpec   │
│ isSatisfied   │  │ isSatisfied         │
│   By()        │  │   By()              │
└───────┬───────┘  └──────────┬──────────┘
        │                     │
        ▼                     ▼
   product.stock > 0    product.price < 100
        ✓                     ✓
       10 > 0               50 < 100
     = true               = true
        │                     │
        └──────┬──────────────┘
               │
               ▼
          true && true
               │
               ▼
            = true  ← El producto cumple la especificación
```

## 6. Antes vs Después del Patrón

### ❌ ANTES (Sin Specification Pattern)

```
┌────────────────────────────────────────────────────────┐
│           ProductRepository                            │
│                                                        │
│  findByCategory(cat)                                   │
│  findByCategoryAndPrice(cat, price)                    │
│  findByCategoryAndPriceAndStock(cat, price, stock)     │
│  findByPriceRange(min, max)                            │
│  findByCategoryOrTag(cat, tag)                         │
│  ... (explosión de métodos)                            │
│                                                        │
│  // Cada combinación = método nuevo                    │
│  // Lógica repetida en cada método                     │
│  // Imposible testear cada filtro aislado              │
└────────────────────────────────────────────────────────┘
```

### ✅ DESPUÉS (Con Specification Pattern)

```
┌────────────────────────────────────────────────────────┐
│           ProductRepository                            │
│                                                        │
│  findAll(spec?: Specification<Product>)                │
│                                                        │
│  // Un solo método                                     │
│  // Infinitas combinaciones posibles                   │
│  // Cada filtro testeable por separado                 │
└────────────────────────────────────────────────────────┘

        +

┌────────────────────────────────────────────────────────┐
│         Especificaciones (Dominio)                     │
│                                                        │
│  • InStockSpec                                         │
│  • PriceLessThanSpec                                   │
│  • CategorySpec                                        │
│  • NameContainsSpec                                    │
│  • HasTagSpec                                          │
│  ...                                                   │
│                                                        │
│  // Pequeñas, componibles, reutilizables               │
└────────────────────────────────────────────────────────┘
```

## 7. Testeo de Especificaciones

```
Test Unitario (Aislado):
═══════════════════════

┌──────────────────────────────────────┐
│  Test: InStockSpecification          │
│                                      │
│  const product = { stock: 10 }       │
│  const spec = new InStockSpec()      │
│                                      │
│  expect(spec.isSatisfiedBy(product)) │
│    .toBe(true)                       │
│                                      │
│  ✓ Sin dependencias                  │
│  ✓ Rápido                            │
│  ✓ Enfocado en UNA regla             │
└──────────────────────────────────────┘


Test de Composición:
═══════════════════

┌──────────────────────────────────────┐
│  Test: AND Composition                │
│                                      │
│  const product = {                   │
│    category: 'electronics',          │
│    price: 50,                        │
│    stock: 10                         │
│  }                                   │
│                                      │
│  const spec = new CategorySpec(...)  │
│    .and(new PriceLessThan(...))      │
│    .and(new InStockSpec())           │
│                                      │
│  expect(spec.isSatisfiedBy(product)) │
│    .toBe(true)                       │
│                                      │
│  ✓ Testea la composición             │
│  ✓ Verifica lógica AND/OR/NOT        │
└──────────────────────────────────────┘
```

## 8. Flujo Completo End-to-End

```
┌──────────────┐
│    Cliente   │
│   (Usuario)  │
└──────┬───────┘
       │
       │ GET /products/search?category=electronics&inStock=true
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│              ProductController                           │
│                                                          │
│  1. Parsea query params → SearchCriteria                 │
│     { category: 'electronics', inStock: true }           │
│                                                          │
│  2. Llama al caso de uso                                 │
│     searchUseCase.execute(criteria)                      │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│           SearchProductsUseCase                          │
│                                                          │
│  3. Construye especificación                             │
│     let spec = null                                      │
│     if (criteria.category)                               │
│       spec = new CategorySpec(criteria.category)         │
│     if (criteria.inStock)                                │
│       spec = spec.and(new InStockSpec())                 │
│                                                          │
│  4. Consulta repositorio                                 │
│     repository.findAll(spec)                             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│         InMemoryProductRepository                        │
│                                                          │
│  5. Filtra productos                                     │
│     products.filter(p => spec.isSatisfiedBy(p))          │
│                                                          │
│  6. Devuelve resultados                                  │
│     [product1, product2, ...]                            │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│           SearchProductsUseCase                          │
│                                                          │
│  7. Convierte a DTOs                                     │
│     products.map(ProductDTO.fromDomain)                  │
│                                                          │
│  8. Devuelve DTOs                                        │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              ProductController                           │
│                                                          │
│  9. Devuelve respuesta HTTP                              │
│     res.json({ products })                               │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │    Cliente   │
                  │   (Usuario)  │
                  └──────────────┘
```

---

**Profe Millo**
_"Los diagramas valen más que mil palabras, mi niño. Pero el código vale más que mil diagramas."_
