# Sistema de Biblioteca

Sistema de gestión de biblioteca que demuestra **Arquitectura Hexagonal** en TypeScript.

## Funcionalidades

- Registro y gestión de libros (validación de ISBN)
- Registro de usuarios con validación de email
- Préstamos de libros con reglas de negocio:
  - Máximo 3 préstamos activos por usuario
  - Usuarios con penalizaciones no pueden pedir prestado
  - Cálculo automático de penalizaciones por devoluciones tardías

## Arquitectura

```
src/
├── domain/                    # Lógica de negocio central
│   ├── entities/              # Aggregate roots (Book, User, Loan, Penalty)
│   ├── value-objects/         # Valores inmutables (BookId, ISBN, Email, Money)
│   ├── repositories/          # Interfaces de puertos
│   ├── services/              # Servicios de dominio (LoanValidator, PenaltyCalculator)
│   ├── events/                # Eventos de dominio
│   └── exceptions/            # Errores específicos del dominio
│
├── application/               # Casos de uso
│   ├── use-cases/             # Servicios de aplicación
│   │   ├── register-book.use-case.ts
│   │   ├── register-user.use-case.ts
│   │   ├── loan-book.use-case.ts
│   │   ├── return-book.use-case.ts
│   │   ├── get-available-books.use-case.ts
│   │   └── get-user-loans.use-case.ts
│   └── dtos/                  # Objetos de transferencia de datos
│
└── infrastructure/            # Adaptadores
    ├── controllers/rest/      # Controladores HTTP (adaptadores primarios)
    ├── persistence/
    │   ├── in-memory/         # Repositorios en memoria para testing
    │   └── postgresql/        # Repositorios PostgreSQL
    └── bootstrap/             # Contenedor DI y configuración del servidor
```

## Modelo de Dominio

```
┌─────────────┐        ┌─────────────┐
│    User     │        │    Book     │
├─────────────┤        ├─────────────┤
│ id: UserId  │        │ id: BookId  │
│ name        │        │ isbn: ISBN  │
│ email: Email│        │ title       │
│ maxLoans: 3 │        │ author      │
└──────┬──────┘        │ status      │
       │               └──────┬──────┘
       │    ┌─────────────┐   │
       └───►│    Loan     │◄──┘
            ├─────────────┤
            │ id: LoanId  │
            │ userId      │
            │ bookId      │
            │ loanDate    │
            │ dueDate     │
            │ returnDate? │
            └─────────────┘
```

## Instalación

```bash
npm install
```

## Uso

### Desarrollo

```bash
npm run dev
```

### Compilar

```bash
npm run build
npm start
```

### Tests

```bash
# Ejecutar tests
npm test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

## Endpoints de la API

### Libros

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/books` | Registrar un nuevo libro |
| GET | `/books/available` | Listar libros disponibles |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/users` | Registrar un nuevo usuario |

### Préstamos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/loans` | Crear un préstamo |
| POST | `/loans/:id/return` | Devolver un libro |
| GET | `/users/:userId/loans` | Obtener préstamos de un usuario |

## Ejemplos de Peticiones

### Registrar un Libro

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0-13-468599-1",
    "title": "Clean Architecture",
    "author": "Robert C. Martin"
  }'
```

### Registrar un Usuario

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }'
```

### Prestar un Libro

```bash
curl -X POST http://localhost:3000/loans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<user-id>",
    "bookId": "<book-id>"
  }'
```

## Patrones Clave

### Value Objects
Objetos inmutables definidos por sus atributos, no por identidad:
- `ISBN`: Valida formato y dígito de control
- `Email`: Valida formato de email
- `Money`: Maneja moneda y cantidad

### Aggregate Roots
Entidades que aseguran límites de consistencia:
- `Book`: Gestiona estado de disponibilidad
- `User`: Aplica límites de préstamos
- `Loan`: Maneja ciclo de vida del préstamo

### Eventos de Dominio
Capturan ocurrencias significativas del negocio:
- `BookRegisteredEvent`
- `BookLoanedEvent`
- `BookReturnedEvent`
- `PenaltyAppliedEvent`

### Patrón Repository
Puertos (interfaces) en dominio, adaptadores en infraestructura:
- `BookRepository` (puerto) → `InMemoryBookRepository`, `PgBookRepository` (adaptadores)

## Licencia

MIT
