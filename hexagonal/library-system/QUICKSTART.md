# Quickstart - Library System (Hexagonal Architecture)

## 1. Instalar y ejecutar

```bash
cd hexagonal/library-system
npm install
npm run dev
```

Deberías ver:

```
Server running on http://localhost:3000

Available endpoints:
  POST   /books           → Register a book
  GET    /books/available → List available books
  POST   /users           → Register a user
  POST   /loans           → Create a loan
  POST   /loans/:id/return → Return a book
  GET    /users/:id/loans → Get user loans
```

## 2. Probar la API

Abre otra terminal y ejecuta:

```bash
# Registrar un libro
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0-13-468599-1",
    "title": "Clean Architecture",
    "author": "Robert C. Martin"
  }'

# Registrar un usuario
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }'

# Prestar un libro (usa los IDs que obtuviste)
curl -X POST http://localhost:3000/loans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "bookId": "BOOK_ID"
  }'

# Devolver el libro
curl -X POST http://localhost:3000/loans/LOAN_ID/return
```

## 3. Ejecutar tests

```bash
# Todos los tests
npm test

# En modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

## 4. Leer el código

Sigue este orden para entender la arquitectura:

### Dominio (el corazón)
1. `src/domain/entities/book.ts` - Aggregate Root Book
2. `src/domain/value-objects/isbn.ts` - Value Object ISBN
3. `src/domain/repositories/book.repository.ts` - Puerto (interface)

### Aplicación (casos de uso)
4. `src/application/use-cases/register-book.use-case.ts` - Caso de uso
5. `src/application/dtos/book.dto.ts` - DTOs

### Infraestructura (adaptadores)
6. `src/infrastructure/persistence/in-memory/in-memory-book.repository.ts` - Adaptador de salida
7. `src/infrastructure/controllers/rest/book.controller.ts` - Adaptador de entrada
8. `src/infrastructure/bootstrap/container.ts` - Composición

## 5. Conceptos clave a observar

### Value Objects
```typescript
// El ISBN valida automáticamente su formato
const isbn = ISBN.create("978-0-13-468599-1");
// Si es inválido, lanza error
```

### Aggregate Roots
```typescript
// El libro protege sus invariantes
book.markAsBorrowed();  // Valida que esté disponible
```

### Inversión de Dependencias
```typescript
// El caso de uso usa la interface (puerto)
constructor(private bookRepo: BookRepository) {}
// NO la implementación concreta
```

## 6. Experimentar

Ideas para practicar:

1. **Añadir un endpoint nuevo:** `GET /books/:id` para obtener un libro por ID
2. **Crear un Value Object:** `Author` con validación de nombre
3. **Añadir una regla de negocio:** Libros de más de 500 páginas solo se prestan por 14 días
4. **Crear un nuevo adaptador:** `MongoBookRepository` que implemente la misma interface

## 7. Siguiente paso

Una vez domines este proyecto:

→ **[Vertical Slicing](../../slicing/vertical-slicing-tasks)** - Organización por features

¡A darle caña!
