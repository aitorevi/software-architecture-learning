# Quickstart - Specification Pattern

## 1. Instalar y ejecutar

```bash
cd patterns/specification-pattern
npm install
npm run dev
```

Deberías ver:

```
Server running on http://localhost:3000

Available endpoints:
  POST   /products           → Create a product
  GET    /products/search    → Search products with specifications
  GET    /products           → Get all products
```

## 2. Probar la API

Abre otra terminal y ejecuta:

```bash
# Crear algunos productos
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "price": 1199,
    "category": "electronics",
    "stock": 50,
    "tags": ["apple", "smartphone", "5G"]
  }'

curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Galaxy S24",
    "price": 899,
    "category": "electronics",
    "stock": 30,
    "tags": ["samsung", "smartphone", "android"]
  }'

curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mesa de oficina",
    "price": 250,
    "category": "furniture",
    "stock": 0,
    "tags": ["office", "wood"]
  }'

# Buscar productos con especificaciones
# Productos electrónicos en stock con precio menor a 1000
curl "http://localhost:3000/products/search?category=electronics&inStock=true&maxPrice=1000"

# Productos que contengan "Samsung" en el nombre
curl "http://localhost:3000/products/search?name=Samsung"

# Productos con tag específico
curl "http://localhost:3000/products/search?tag=smartphone"
```

## 3. Ejecutar tests

```bash
# Todos los tests
npm test

# En modo watch
npm run test:watch
```

## 4. Leer el código

Sigue este orden para entender el patrón:

### Dominio (las especificaciones)
1. `src/domain/specifications/Specification.ts` - Interface base
2. `src/domain/specifications/ProductSpecs.ts` - Especificaciones concretas
3. `src/domain/specifications/CompositeSpecs.ts` - Composición (AND, OR, NOT)
4. `src/domain/entities/Product.ts` - La entidad

### Aplicación (casos de uso)
5. `src/application/SearchProductsUseCase.ts` - Usar las especificaciones
6. `src/application/dtos/SearchCriteria.ts` - DTOs

### Infraestructura
7. `src/infrastructure/persistence/InMemoryProductRepository.ts` - Repo en memoria
8. `src/infrastructure/http/ProductController.ts` - REST controller

## 5. Conceptos clave a observar

### Specification Base
```typescript
// La interface madre de todas las especificaciones
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}
```

### Especificaciones Concretas
```typescript
// Cada especificación es una regla de negocio reutilizable
const inStockSpec = new InStockSpecification();
const cheapSpec = new PriceLessThanSpecification(100);

// Se combinan fácilmente
const affordableAndAvailable = inStockSpec.and(cheapSpec);
```

### Uso en Casos de Uso
```typescript
// El caso de uso combina especificaciones dinámicamente
const spec = buildSpecification(criteria);
const products = await repository.findAll(spec);
```

## 6. Experimentar

Ideas para practicar:

1. **Añadir nueva especificación:** `ProductOnSaleSpecification` para productos con descuento
2. **Combinar más especificaciones:** Buscar productos premium (precio > 500) y en stock
3. **Crear un repo SQL:** Implementar `SqlProductRepository` que traduzca specs a SQL WHERE
4. **Añadir validación:** Especificaciones para validar productos antes de guardarlos

## 7. Siguiente paso

Una vez domines este patrón:

→ **[Library System](../../hexagonal/library-system)** - Arquitectura Hexagonal completa

¡A darle caña!
