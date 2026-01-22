# Proyecto Error Handling - Completado

## Resumen

Proyecto pedagógico completo de **Error Handling & Validation Strategy** implementado con el patrón **Result/Either**.

### Estadísticas

- **104 tests** pasando (100% de cobertura)
- **13 archivos de código** fuente
- **5 archivos de tests** (3 unitarios + 2 integration)
- **4 archivos de documentación** pedagógica
- **TypeScript** con tipado estricto
- **Arquitectura Hexagonal** (puertos y adaptadores)

## Estructura del Proyecto

```
patterns/error-handling/
├── src/
│   ├── domain/
│   │   ├── Result.ts                    # ⭐ Patrón Result/Either
│   │   ├── User.ts                      # Aggregate Root
│   │   ├── UserId.ts                    # Value Object
│   │   ├── UserRepository.ts            # Puerto (interface)
│   │   ├── value-objects/
│   │   │   ├── Email.ts                 # ⭐ Validación con Result
│   │   │   └── Password.ts              # ⭐ Validación compleja
│   │   └── errors/
│   │       └── DomainError.ts           # Jerarquía de errores
│   ├── application/
│   │   └── RegisterUserUseCase.ts       # ⭐ Result en acción
│   └── infrastructure/
│       ├── persistence/
│       │   └── InMemoryUserRepository.ts
│       └── http/
│           ├── UserController.ts        # ⭐ Result → HTTP
│           ├── server.ts
│           └── index.ts
├── tests/
│   ├── unit/
│   │   ├── Result.test.ts               # 25 tests
│   │   ├── Email.test.ts                # 21 tests
│   │   ├── Password.test.ts             # 21 tests
│   │   └── RegisterUserUseCase.test.ts  # 18 tests
│   └── integration/
│       └── api.test.ts                  # 19 tests
├── WELCOME.txt                          # ⭐ Bienvenida
├── QUICKSTART.md                        # ⭐ 5 minutos
├── README_ES.md                         # ⭐ Tutorial completo (45 min)
├── PRESENTATION.md                      # ⭐ Para presentaciones
└── package.json
```

## Conceptos Implementados

### 1. Patrón Result/Either

```typescript
class Result<T, E = Error> {
  static ok<T>(value: T): Result<T, never>;
  static fail<E>(error: E): Result<never, E>;

  isOk(): boolean;
  isError(): boolean;
  map<U>(fn: (value: T) => U): Result<U, E>;
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
}
```

**Beneficios:**
- Errores como **valores** (no excepciones)
- **Tipado** explícito de errores
- **Composable** (Railway Oriented Programming)
- **Testeable** sin try/catch

### 2. Errores de Dominio vs Infraestructura

```typescript
// DOMINIO (esperado) → Result.fail()
- ValidationError          → 400 Bad Request
- UserAlreadyExistsError   → 409 Conflict
- TermsNotAcceptedError    → 403 Forbidden

// INFRAESTRUCTURA (inesperado) → throw
- DatabaseError            → 500 Internal Server Error
- NetworkError             → 500 Internal Server Error
```

### 3. Fail Fast - Validación en Boundaries

```typescript
// ✅ Value Object con constructor privado
class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Result<Email, ValidationError> {
    // Validación AQUÍ - en el boundary
    if (!value.includes('@')) {
      return Result.fail(new ValidationError('Email debe contener @'));
    }
    return Result.ok(new Email(value));
  }
}

// Garantía: Si tienes un Email, es válido. Siempre.
```

### 4. Railway Oriented Programming

```typescript
async function registerUser(data: UserData): Promise<Result<User, DomainError>> {
  // Si CUALQUIER paso falla → Result.fail() y se detiene

  const emailResult = Email.create(data.email);
  if (emailResult.isError()) {
    return Result.fail(emailResult.error); // 🚂 Descarrilamiento
  }

  const passwordResult = Password.create(data.password);
  if (passwordResult.isError()) {
    return Result.fail(passwordResult.error); // 🚂 Descarrilamiento
  }

  // Todos los pasos pasaron ✅
  const user = new User(emailResult.value, passwordResult.value);
  return Result.ok(user);
}
```

### 5. Traducción Result → HTTP

```typescript
class UserController {
  async register(req: Request, res: Response): Promise<void> {
    const result = await useCase.execute(req.body);

    if (result.isError()) {
      const statusCode = this.errorToStatusCode(result.error);
      return res.status(statusCode).json({
        error: result.error.name,
        message: result.error.message
      });
    }

    return res.status(201).json(result.value.toDTO());
  }

  private errorToStatusCode(error: DomainError): number {
    if (error instanceof ValidationError) return 400;
    if (error instanceof UserAlreadyExistsError) return 409;
    if (error instanceof TermsNotAcceptedError) return 403;
    return 400;
  }
}
```

## Tests Implementados

### Unit Tests (85 tests)

1. **Result.test.ts** (25 tests)
   - Creación de Result.ok() y Result.fail()
   - Verificadores isOk() e isError()
   - Transformaciones map() y flatMap()
   - Utilidades getOrElse() y match()

2. **Email.test.ts** (21 tests)
   - Validaciones de formato
   - Casos de error (vacío, sin @, sin dominio, etc.)
   - Casos de éxito
   - Normalización (minúsculas, trim)

3. **Password.test.ts** (21 tests)
   - Validación de longitud
   - Validación de complejidad (mayúsculas, minúsculas, números, especiales)
   - Método matches()
   - Método getStrength()

4. **RegisterUserUseCase.test.ts** (18 tests)
   - Caso de éxito
   - Validación de email
   - Validación de password
   - Validación de términos
   - Usuario duplicado
   - Fail Fast

### Integration Tests (19 tests)

5. **api.test.ts** (19 tests)
   - POST /users exitoso (201)
   - Validación de email (400)
   - Validación de password (400)
   - Términos no aceptados (403)
   - Usuario duplicado (409)
   - Mapeo de errores a status codes
   - Estructura de respuestas

## Documentación Pedagógica

### WELCOME.txt
Bienvenida con estilo canario, explicación rápida y guía de navegación.

### QUICKSTART.md (5 min)
- Concepto en 1 minuto
- Comparación antes/después
- Ejemplo con curl
- Archivos clave

### README_ES.md (45 min)
- Tutorial completo paso a paso
- Explicación detallada de cada concepto
- Ejemplos de uso
- Flujo completo visualizado
- Comparaciones antes/después

### PRESENTATION.md
- Guía para instructores
- Estructura sugerida de presentación
- Preguntas frecuentes
- Checklist de presentación
- Mensaje final

## Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev              # Servidor en localhost:3000

# Tests
npm test                 # Ejecutar todos los tests
npm run test:watch       # Modo watch

# Producción
npm run build            # Compilar TypeScript
npm start                # Ejecutar compilado
```

## Endpoints

### POST /users
Registra un nuevo usuario.

**Request:**
```json
{
  "email": "millo@laspalmas.com",
  "password": "SuperSecret123!",
  "acceptedTerms": true
}
```

**Response 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "millo@laspalmas.com",
  "createdAt": "2026-01-22T10:30:00Z",
  "hasAcceptedTerms": true,
  "acceptedTermsAt": "2026-01-22T10:30:00Z"
}
```

**Response 400 (ValidationError):**
```json
{
  "error": "ValidationError",
  "message": "email: debe contener @",
  "details": {
    "field": "email",
    "reason": "debe contener @"
  }
}
```

**Response 409 (UserAlreadyExistsError):**
```json
{
  "error": "UserAlreadyExistsError",
  "message": "Ya existe un usuario con el email millo@laspalmas.com",
  "details": {
    "email": "millo@laspalmas.com"
  }
}
```

### GET /health
Health check.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T10:30:00Z"
}
```

## Valor Pedagógico

Este proyecto enseña:

1. **Errores como Valores** - No como excepciones
2. **Tipado de Errores** - El compilador te ayuda
3. **Fail Fast** - Validar en boundaries
4. **Railway Programming** - Composición de Results
5. **Separación de Responsabilidades** - Dominio vs Infraestructura
6. **Arquitectura Hexagonal** - Puertos y adaptadores
7. **Testing Exhaustivo** - Casos de error como diseño

## Lo Que Hace Especial a Este Proyecto

### 1. Comentarios Pedagógicos Exhaustivos
Cada archivo tiene comentarios explicando:
- Qué es cada concepto
- Por qué se hace así
- Cuándo usar cada patrón
- Comparaciones antes/después

### 2. Estilo "El Profe Millo"
Documentación con personalidad canaria:
- "Mira tú"
- "Eso está fetén"
- "Tranqui papas"
- "Venga, a darle caña"

### 3. Navegación Clara
Cada archivo indica:
- De dónde vienes
- Qué vas a aprender
- Hacia dónde vas después

### 4. Tests Como Especificación
Los tests documentan todos los casos:
- Happy path
- Casos de error
- Edge cases
- Integración E2E

### 5. Progresión Pedagógica
Orden de lectura claro:
1. Result.ts - El patrón base
2. DomainError.ts - Jerarquía de errores
3. Email.ts - Validación simple
4. Password.ts - Validación compleja
5. User.ts - Aggregate Root
6. RegisterUserUseCase.ts - Composición
7. UserController.ts - HTTP

## Próximos Pasos Sugeridos

Después de dominar este proyecto:

1. **Library System** - Result + Hexagonal completo
2. **Unit of Work** - Transaccionalidad con Result
3. **Specification Pattern** - Queries composables con Result

## Referencias

- **Railway Oriented Programming** - Scott Wlaschin
- **Functional Error Handling** - Domain Modeling Made Functional
- **Rust Result Type** - Inspiración del lenguaje Rust

---

**Proyecto completado:** 2026-01-22
**Tests:** 104/104 pasando ✅
**Build:** OK ✅
**Documentación:** Completa ✅

**El Profe Millo dice:**
> "Este proyecto cambiará tu forma de pensar sobre los errores.
> Los errores de negocio no son excepciones, son parte del flujo.
> Eso está fetén. Eso es arquitectura limpia. ¡Venga!"
