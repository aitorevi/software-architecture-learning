# Specification Pattern - Smart Filtering 🎯

> **A hands-on example of the Specification Pattern in TypeScript**
>
> By El Profe Millo

---

## Quick Start

```bash
# Install dependencies
npm install

# Run the server
npm run dev

# Run tests
npm test
```

Server will be available at http://localhost:3000

## What is the Specification Pattern?

The Specification Pattern is a design pattern that encapsulates business rules into reusable, composable objects. Instead of writing complex filtering logic with nested ifs, you create small specification objects that can be combined using AND, OR, and NOT operations.

### Before (❌ Without Pattern)

```typescript
function findProducts(category?, maxPrice?, inStock?) {
  return products.filter(p => {
    if (category && p.category !== category) return false;
    if (maxPrice && p.price > maxPrice) return false;
    if (inStock && p.stock === 0) return false;
    return true;
  });
}
```

### After (✅ With Pattern)

```typescript
const spec = new CategorySpec('electronics')
  .and(new PriceLessThanSpec(1000))
  .and(new InStockSpec());

const products = await repository.findAll(spec);
```

## API Examples

```bash
# Create a product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","price":1199,"category":"electronics","stock":50,"tags":["apple"]}'

# Search with specifications
curl "http://localhost:3000/products/search?category=electronics&maxPrice=1000&inStock=true"
```

## Documentation

- 📚 **[README_ES.md](./README_ES.md)** - Complete tutorial in Spanish (45 min)
- ⚡ **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- 🎤 **[PRESENTATION.md](./PRESENTATION.md)** - Guide for presenting to others
- 📊 **[DIAGRAMAS.md](./DIAGRAMAS.md)** - Visual diagrams
- ✅ **[PROYECTO_COMPLETADO.md](./PROYECTO_COMPLETADO.md)** - Project completion checklist

## Project Structure

```
src/
├── domain/                      # Business Rules
│   ├── entities/                # Product entity
│   ├── specifications/          # Specifications (the core!)
│   └── repositories/            # Repository port
├── application/                 # Use Cases
│   ├── use-cases/               # Search & Create
│   └── dtos/                    # Data Transfer Objects
└── infrastructure/              # Adapters
    ├── persistence/             # In-memory repository
    └── http/                    # REST API

tests/
├── domain/                      # Specification tests
└── application/                 # Use case tests
```

## Key Concepts

1. **Specification** - Encapsulates a business rule
2. **Composite** - Combine specs with AND, OR, NOT
3. **Query Object** - SearchCriteria DTO
4. **Repository Pattern** - Abstract persistence
5. **Reusability** - Same spec in memory, DB, validation

## Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

All specifications are unit tested in isolation, demonstrating one of the pattern's main advantages.

## Technologies

- TypeScript
- Express
- Vitest
- In-Memory Repository (no database needed)

## When to Use This Pattern

✅ **Use it when:**
- Complex filtering logic that repeats across the codebase
- Need to combine filters dynamically
- Want to test business rules in isolation
- Same logic used in multiple contexts (memory, DB, validation)

❌ **Don't use it when:**
- Only 2-3 simple filters
- Logic is trivial and won't change
- Critical performance (need hand-optimized SQL)

## Learn More

This is a pedagogical project. For a complete explanation in Spanish, see [README_ES.md](./README_ES.md).

---

**License:** MIT

**Author:** El Profe Millo

_"A well-crafted specification is worth a thousand nested ifs"_
