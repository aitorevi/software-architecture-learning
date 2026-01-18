# Diagramas del Patrón Repository

Diagramas Mermaid que ilustran el flujo completo y la inversión de dependencias en el patrón Repository.

---

## 1. Flujo Completo de una Petición

Este diagrama muestra el recorrido completo de una petición HTTP desde que llega hasta que se persiste en la base de datos.

```mermaid
flowchart TB
    subgraph EXT["🌐 EXTERIOR"]
        HTTP["HTTP Request<br/>POST /api/books"]
    end

    subgraph INFRA_IN["📥 INFRASTRUCTURE - Entrada"]
        CTRL["BookController<br/>Adaptador Primario"]
    end

    subgraph APP["🎯 APPLICATION"]
        DTO_IN["RegisterBookCommand<br/>DTO entrada"]
        UC["RegisterBookUseCase<br/>Caso de Uso"]
        DTO_OUT["BookResponse<br/>DTO salida"]
    end

    subgraph DOMAIN["💎 DOMAIN - El Corazón"]
        ENTITY["Book<br/>Entidad"]
        VO["ISBN, BookId<br/>Value Objects"]
        PORT["BookRepository<br/>INTERFACE - Puerto"]
    end

    subgraph INFRA_OUT["📤 INFRASTRUCTURE - Salida"]
        REPO_MEM["InMemoryBookRepository"]
        REPO_PG["PgBookRepository"]
        DB_MEM[("Memoria")]
        DB_PG[("PostgreSQL")]
    end

    HTTP -->|JSON| CTRL
    CTRL -->|crea| DTO_IN
    DTO_IN --> UC
    UC -->|crea| VO
    UC -->|crea| ENTITY
    UC -->|usa| PORT
    UC -->|retorna| DTO_OUT
    DTO_OUT --> CTRL
    CTRL -->|HTTP 201| HTTP

    PORT -.->|implements| REPO_MEM
    PORT -.->|implements| REPO_PG
    REPO_MEM --> DB_MEM
    REPO_PG --> DB_PG
```

### Explicación del Flujo

1. **Cliente** envía HTTP Request con JSON
2. **Controller** (Infrastructure) recibe y crea el Command (DTO)
3. **UseCase** (Application) orquesta la lógica:
   - Crea Value Objects (ISBN, BookId)
   - Crea la Entidad Book
   - Usa el Puerto (Interface) para persistir
4. **Repository Interface** (Domain) define el contrato
5. **Implementación** (Infrastructure) ejecuta la persistencia real
6. La respuesta vuelve por el mismo camino

---

## 2. Inversión de Dependencias

Este diagrama muestra cómo las dependencias apuntan HACIA el dominio (inversión).

```mermaid
flowchart BT
    subgraph INFRA["🔧 INFRASTRUCTURE"]
        CTRL["BookController"]
        REPO_MEM["InMemoryBookRepository"]
        REPO_PG["PgBookRepository"]
    end

    subgraph APP["🎯 APPLICATION"]
        UC["RegisterBookUseCase"]
    end

    subgraph DOMAIN["💎 DOMAIN"]
        PORT["BookRepository<br/>Interface"]
        ENTITY["Book"]
    end

    CTRL -->|depende de| UC
    UC -->|depende de| PORT
    UC -->|depende de| ENTITY
    REPO_MEM -->|implements| PORT
    REPO_PG -->|implements| PORT
```

### La Clave de la Inversión

**Sin inversión (mal):**
```
Application ──depende de──▶ Infrastructure (PostgreSQL)
```

**Con inversión (bien):**
```
Application ──depende de──▶ Domain (Interface)
                                  ▲
                                  │ implements
                            Infrastructure
```

**Observa:**
- Las flechas van de abajo hacia arriba (hacia el dominio)
- `InMemoryBookRepository` y `PgBookRepository` **implementan** la interface
- `RegisterBookUseCase` **solo conoce** la interface, no las implementaciones
- El dominio **no depende de nadie**

---

## 3. Diagrama de Secuencia

Este diagrama muestra la secuencia temporal de una petición para registrar un libro.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP
    participant Ctrl as Controller
    participant UC as UseCase
    participant Repo as BookRepository
    participant Impl as Implementación
    participant DB as Storage

    Client->>Ctrl: POST /api/books
    Ctrl->>UC: execute(Command)
    UC->>UC: Crear Value Objects
    UC->>UC: Crear Entidad Book
    UC->>Repo: save(book)
    Repo->>Impl: save(book)
    Impl->>DB: INSERT/Map.set
    DB-->>Impl: OK
    Impl-->>Repo: void
    Repo-->>UC: void
    UC-->>Ctrl: BookResponse
    Ctrl-->>Client: HTTP 201
```

### Pasos Detallados

| Paso | Componente | Acción |
|------|------------|--------|
| 1 | Cliente | Envía POST con JSON `{isbn, title, author}` |
| 2 | Controller | Crea `RegisterBookCommand` y llama al UseCase |
| 3 | UseCase | Crea `ISBN` y `BookId` (Value Objects) |
| 4 | UseCase | Crea entidad `Book` con validaciones |
| 5 | UseCase | Llama a `bookRepository.save(book)` |
| 6 | Interface | Delega a la implementación inyectada |
| 7 | Implementación | Persiste en memoria o PostgreSQL |
| 8 | Respuesta | Vuelve por el mismo camino |

---

## 4. Capas y Responsabilidades

```mermaid
flowchart LR
    subgraph CAPAS["Arquitectura Hexagonal"]
        direction TB

        subgraph I1["Infrastructure<br/>Adaptadores Entrada"]
            C1["Controllers"]
            C2["CLI"]
            C3["GraphQL"]
        end

        subgraph A["Application<br/>Casos de Uso"]
            U1["RegisterBook"]
            U2["LoanBook"]
            U3["ReturnBook"]
        end

        subgraph D["Domain<br/>El Corazón"]
            E["Entities"]
            V["Value Objects"]
            P["Ports/Interfaces"]
            S["Domain Services"]
        end

        subgraph I2["Infrastructure<br/>Adaptadores Salida"]
            R1["InMemoryRepo"]
            R2["PostgresRepo"]
            R3["MongoRepo"]
        end
    end

    I1 --> A
    A --> D
    I2 -.->|implements| D
```

---

## Archivos Relacionados

| Diagrama | Archivos del Proyecto |
|----------|----------------------|
| Controller | `src/infrastructure/controllers/rest/book.controller.ts` |
| DTO/Command | `src/application/dtos/book.dto.ts` |
| UseCase | `src/application/use-cases/register-book.use-case.ts` |
| Interface (Puerto) | `src/domain/repositories/book.repository.ts` |
| Entidad | `src/domain/entities/book.ts` |
| Impl. InMemory | `src/infrastructure/persistence/in-memory/in-memory-book.repository.ts` |
| Impl. PostgreSQL | `src/infrastructure/persistence/postgresql/pg-book.repository.ts` |

---

## Ver También

- [GUIA_REPOSITORY_PATTERN.md](./GUIA_REPOSITORY_PATTERN.md) - Guía completa del patrón
- [README.md](./README.md) - Índice de documentación
