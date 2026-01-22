# Error Handling & Validation Strategy

> **Tutorial completo by el Profe Millo**
> _"Los errores de negocio no son excepciones, son parte del flujo. Si entiendes esto, ya eres senior. ¡Venga, no te dejes enredar!"_

> **Nivel:** Intermedio
> **Prerrequisito:** [Controller-Service](../../layered/controller-service)
> **Siguiente paso:** [Library System (Hexagonal)](../../hexagonal/library-system)
> **Tiempo:** 45 minutos

## ¿Qué aprenderás?

Este proyecto te enseña a **manejar errores como un profesional** usando el patrón **Result/Either**.

Verás la diferencia entre:
- Errores de **dominio** (email inválido, usuario duplicado)
- Errores de **infraestructura** (BD caída, timeout de red)

Y aprenderás a:
- Modelar errores como **valores** (no excepciones)
- Usar el patrón **Result<T, E>**
- Validar en los **boundaries** (Value Objects)
- Traducir errores de dominio a **códigos HTTP**
- Testear flujos de error con TDD

```
┌─────────────────────────────────────────────────────────────────┐
│  PROGRESIÓN DE APRENDIZAJE                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Nivel 0: tdd-kata                                              │
│           (aprender a testear primero)                          │
│                        ↓                                        │
│  Nivel 1: controller-service                                    │
│           (Controller + Service, sin error handling robusto)    │
│                        ↓                                        │
│  Nivel 2: error-handling  ← ESTÁS AQUÍ                          │
│           (Result pattern, errores tipados)                     │
│                        ↓                                        │
│  Nivel 3: library-system (hexagonal)                            │
│           (Result + Hexagonal + Value Objects avanzados)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## El Problema

Mira tú, este es el código típico que ves en todos lados:

```typescript
// ❌ Código típico con excepciones por todos lados
async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, acceptedTerms } = req.body;

    // Validación mezclada con lógica
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password muy corto' });
    }

    if (!acceptedTerms) {
      return res.status(400).json({ error: 'Debes aceptar los términos' });
    }

    // ¿Usuario ya existe?
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Usuario ya existe' });
    }

    // Crear usuario
    const user = await userRepo.save({ email, password });
    return res.status(201).json(user);

  } catch (error) {
    // 😱 ¿Qué tipo de error es?
    // ¿De validación? ¿De BD? ¿De red?
    // ¿Qué status code pongo?
    return res.status(500).json({ error: 'Error inesperado' });
  }
}
```

**¿Problemas?**

1. **Validación mezclada con HTTP** - Imposible reutilizar desde CLI o tests
2. **Returns múltiples** - Difícil seguir el flujo
3. **No sabes qué tipo de error es** - Todo cae en el catch genérico
4. **Status codes manuales** - ¿400? ¿409? ¿422? ¿Quién sabe?
5. **No hay tipos** - El compilador no te ayuda

## La Solución: Patrón Result

El patrón **Result<T, E>** trata los errores como **valores**, no como excepciones.

```typescript
// ✅ Con Result - errores como valores
class Result<T, E> {
  static ok<T>(value: T): Result<T, never> {
    return new Result(value, null, true);
  }

  static fail<E>(error: E): Result<never, E> {
    return new Result(null, error, false);
  }

  isOk(): boolean { return this.success; }
  isError(): boolean { return !this.success; }
}
```

**Ventajas:**

1. **El tipo dice "esto puede fallar"** → `Result<User, ValidationError>`
2. **No rompes el flujo** - No hay throw
3. **El compilador te ayuda** - Te obliga a manejar el error
4. **Composable** - Puedes encadenar con `map`, `flatMap`
5. **Testeable** - No necesitas try/catch en tests

## Conceptos Clave

### 1. Errores de Dominio vs Infraestructura

Esto es FUNDAMENTAL, mi niño:

```typescript
// ==========================================
// ERRORES DE DOMINIO (esperados, parte del flujo)
// ==========================================
// Son casos de negocio VÁLIDOS que pueden ocurrir.
// NO son excepciones - son parte del diseño.
// Se modelan con Result.fail()

class ValidationError extends Error {
  name = 'ValidationError';
}

class UserAlreadyExistsError extends Error {
  name = 'UserAlreadyExistsError';
}

class TermsNotAcceptedError extends Error {
  name = 'TermsNotAcceptedError';
}

// ==========================================
// ERRORES DE INFRAESTRUCTURA (inesperados, excepcionales)
// ==========================================
// Son problemas técnicos que NO deberían pasar.
// SÍ se lanzan como excepciones.

class DatabaseError extends Error {
  name = 'DatabaseError';
}

class NetworkError extends Error {
  name = 'NetworkError';
}
```

**Regla de oro:**

```
Si es algo que ESPERAS que pase (email inválido)
  → Modela con Result.fail()
  → Status HTTP 4xx (error del cliente)

Si es algo que NO debería pasar (BD caída)
  → Lanza exception
  → Status HTTP 5xx (error del servidor)
```

### 2. Fail Fast - Validación en Boundaries

No te dejes enredar, mi niño. La validación va en los **Value Objects**, no en el medio.

```typescript
// ✅ BIEN: Fail Fast en el Value Object
class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Result<Email, ValidationError> {
    // Validación AQUÍ - en el boundary
    if (!value) {
      return Result.fail(
        new ValidationError('Email no puede estar vacío')
      );
    }

    if (!value.includes('@')) {
      return Result.fail(
        new ValidationError('Email debe contener @')
      );
    }

    // Si llegamos aquí, el email es VÁLIDO
    return Result.ok(new Email(value));
  }

  toString(): string {
    return this.value;
  }
}

// Uso
const emailResult = Email.create('millo@laspalmas.com');
if (emailResult.isOk()) {
  // emailResult.value es Email - GARANTIZADO válido
  const user = new User(emailResult.value);
}
```

**¿Por qué Fail Fast?**

- **Garantías** - Si tienes un `Email`, es válido. Siempre.
- **Imposible crear objetos rotos** - El constructor es privado
- **Validación centralizada** - Un solo lugar donde validar
- **Testeable** - Puedes testear Email sin crear User

### 3. Railway Oriented Programming

Mira tú, esto es bonito. Los Results se encadenan como vagones de tren:

```typescript
// Si TODOS los pasos son ok() → Result.ok()
// Si ALGUNO falla → Result.fail() y se para todo

function registerUser(data: UserData): Result<User, DomainError> {
  // Paso 1: Crear Email
  const emailResult = Email.create(data.email);
  if (emailResult.isError()) {
    return Result.fail(emailResult.error); // 🚂 Descarrilamiento
  }

  // Paso 2: Crear Password
  const passwordResult = Password.create(data.password);
  if (passwordResult.isError()) {
    return Result.fail(passwordResult.error); // 🚂 Descarrilamiento
  }

  // Paso 3: Verificar términos
  if (!data.acceptedTerms) {
    return Result.fail(new TermsNotAcceptedError()); // 🚂 Descarrilamiento
  }

  // Todos los vagones pasaron - crear usuario
  const user = new User(
    emailResult.value,
    passwordResult.value
  );

  return Result.ok(user); // ✅ Tren completo
}
```

## Estructura del Proyecto

```
error-handling/
├── src/
│   ├── domain/                              # Conocimiento del negocio
│   │   ├── Result.ts                        # ⭐ Patrón Result
│   │   ├── User.ts                          # Aggregate Root
│   │   ├── UserId.ts                        # Value Object
│   │   │
│   │   ├── value-objects/
│   │   │   ├── Email.ts                     # ⭐ Validación con Result
│   │   │   └── Password.ts                  # ⭐ Validación con Result
│   │   │
│   │   ├── errors/
│   │   │   ├── DomainError.ts               # Clase base
│   │   │   ├── ValidationError.ts           # Email inválido, etc.
│   │   │   ├── UserAlreadyExistsError.ts    # Usuario duplicado
│   │   │   └── TermsNotAcceptedError.ts     # Términos no aceptados
│   │   │
│   │   └── UserRepository.ts                # Puerto (interface)
│   │
│   ├── application/
│   │   └── RegisterUserUseCase.ts           # ⭐ Result en acción
│   │
│   └── infrastructure/
│       ├── persistence/
│       │   └── InMemoryUserRepository.ts    # Adaptador de SALIDA
│       │
│       ├── http/
│       │   ├── UserController.ts            # ⭐ Result → HTTP
│       │   └── server.ts                    # Configuración Express
│       │
│       └── index.ts                         # Composición
│
├── tests/
│   ├── unit/
│   │   ├── Result.test.ts                   # Tests del patrón
│   │   ├── Email.test.ts                    # Tests de validación
│   │   ├── Password.test.ts                 # Tests de validación
│   │   └── RegisterUserUseCase.test.ts      # Tests de casos de error
│   │
│   └── integration/
│       └── api.test.ts                      # Tests E2E
│
├── package.json
├── tsconfig.json
├── WELCOME.txt
├── QUICKSTART.md
├── PRESENTATION.md
└── README_ES.md                             # Estás aquí
```

## Orden de Lectura Recomendado

Lee los archivos en este orden para entender el flujo:

| Paso | Archivo | Qué aprenderás |
|------|---------|----------------|
| 1 | `src/domain/Result.ts` | El patrón Result (la base de todo) |
| 2 | `src/domain/errors/DomainError.ts` | Jerarquía de errores |
| 3 | `src/domain/value-objects/Email.ts` | Validación con Result |
| 4 | `src/domain/value-objects/Password.ts` | Más validación |
| 5 | `src/domain/User.ts` | Aggregate Root con VOs validados |
| 6 | `src/application/RegisterUserUseCase.ts` | Composición de Results |
| 7 | `src/infrastructure/http/UserController.ts` | Traducir Result → HTTP |
| 8 | `tests/unit/Result.test.ts` | Cómo testear Results |

## Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUJO: POST /users                                             │
│  Body: {"email":"millo@laspalmas.com","password":"Abc123!"}     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Cliente                                                        │
│     │                                                           │
│     │ POST /users                                               │
│     ▼                                                           │
│  ┌────────────────────┐                                         │
│  │  UserController    │                                         │
│  │  (HTTP Adapter)    │                                         │
│  └────────┬───────────┘                                         │
│           │ Extrae body                                         │
│           ▼                                                     │
│  ┌────────────────────┐                                         │
│  │ RegisterUserUseCase│                                         │
│  │ (Application)      │                                         │
│  └────────┬───────────┘                                         │
│           │                                                     │
│           ├─→ Email.create(data.email)                          │
│           │   Result<Email, ValidationError>                    │
│           │   ✅ ok → continuar                                  │
│           │   ❌ fail → return Result.fail(error)                │
│           │                                                     │
│           ├─→ Password.create(data.password)                    │
│           │   Result<Password, ValidationError>                 │
│           │   ✅ ok → continuar                                  │
│           │   ❌ fail → return Result.fail(error)                │
│           │                                                     │
│           ├─→ repo.findByEmail(email)                           │
│           │   ✅ null → continuar                                │
│           │   ❌ exists → return Result.fail(UserAlreadyExists)  │
│           │                                                     │
│           └─→ User.create(email, password)                      │
│               Result<User, never>                               │
│               (¡Los VOs ya están validados!)                    │
│                                                                 │
│  ┌────────────────────┐                                         │
│  │  UserController    │                                         │
│  │  (HTTP Adapter)    │                                         │
│  └────────┬───────────┘                                         │
│           │                                                     │
│           ├─→ result.isError() ?                                │
│           │   ✅ errorToStatusCode(error)                        │
│           │      ValidationError → 400                          │
│           │      UserAlreadyExists → 409                        │
│           │      TermsNotAccepted → 403                         │
│           │                                                     │
│           └─→ result.isOk() ?                                   │
│               ✅ res.status(201).json(user)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Ejemplos de Uso

### Crear Usuario Válido

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "millo@laspalmas.com",
    "password": "SuperSecret123!",
    "acceptedTerms": true
  }'
```

**Respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "millo@laspalmas.com",
  "createdAt": "2026-01-22T10:30:00Z"
}
```

### Email Inválido (400)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "no-es-email",
    "password": "SuperSecret123!",
    "acceptedTerms": true
  }'
```

**Respuesta:**
```json
{
  "error": "ValidationError",
  "message": "Email debe contener @",
  "details": {
    "field": "email",
    "value": "no-es-email"
  }
}
```

### Password Muy Corto (400)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "millo@laspalmas.com",
    "password": "123",
    "acceptedTerms": true
  }'
```

**Respuesta:**
```json
{
  "error": "ValidationError",
  "message": "Password debe tener al menos 8 caracteres",
  "details": {
    "field": "password",
    "minLength": 8
  }
}
```

### Usuario Ya Existe (409)

```bash
# Primer intento - OK
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"millo@laspalmas.com","password":"Abc123!","acceptedTerms":true}'

# Segundo intento - ERROR
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"millo@laspalmas.com","password":"Abc123!","acceptedTerms":true}'
```

**Respuesta:**
```json
{
  "error": "UserAlreadyExistsError",
  "message": "Ya existe un usuario con el email millo@laspalmas.com"
}
```

## Testing con Result

Los tests son más simples porque no necesitas try/catch:

```typescript
describe('Email', () => {
  describe('create', () => {
    it('devuelve error si el email está vacío', () => {
      const result = Email.create('');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toBe('Email no puede estar vacío');
    });

    it('devuelve error si no contiene @', () => {
      const result = Email.create('no-es-email');

      expect(result.isError()).toBe(true);
      expect(result.error.message).toBe('Email debe contener @');
    });

    it('crea email válido', () => {
      const result = Email.create('millo@laspalmas.com');

      expect(result.isOk()).toBe(true);
      expect(result.value.toString()).toBe('millo@laspalmas.com');
    });
  });
});
```

**Fíjate:**
- No hay `try/catch`
- El resultado es un **valor** que verificas con `isOk()` o `isError()`
- Los tests son **claros** y **simples**

## Resumen de Responsabilidades

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Domain** | `Result.ts` | Contenedor de éxito/error |
| **Domain** | `Email.ts` | Value Object con validación → Result |
| **Domain** | `Password.ts` | Value Object con validación → Result |
| **Domain** | `User.ts` | Aggregate Root (usa VOs ya validados) |
| **Domain** | `DomainError.ts` | Jerarquía de errores de negocio |
| **Application** | `RegisterUserUseCase.ts` | Orquesta Results, sin HTTP |
| **Infrastructure** | `UserController.ts` | Traduce Result → HTTP status codes |
| **Infrastructure** | `InMemoryUserRepository.ts` | Persistencia (puede lanzar exceptions técnicas) |

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Ejecutar tests en watch mode
npm run test:watch

# Compilar para producción
npm run build
npm start
```

## Comparación: Antes y Después

### Antes (con excepciones)

```typescript
// ❌ Confuso, mezcla HTTP con validación
async function registerUser(req: Request, res: Response) {
  try {
    if (!req.body.email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const user = await repo.save(req.body);
    return res.status(201).json(user);

  } catch (error) {
    // ¿Qué tipo de error? ¿400? ¿500?
    return res.status(500).json({ error: 'Error' });
  }
}
```

### Después (con Result)

```typescript
// ✅ Claro, separación de responsabilidades
async function registerUser(req: Request, res: Response) {
  // UseCase retorna Result
  const result = await registerUserUseCase.execute(req.body);

  // Traducir Result → HTTP
  if (result.isError()) {
    const statusCode = errorToStatusCode(result.error);
    return res.status(statusCode).json({
      error: result.error.name,
      message: result.error.message
    });
  }

  return res.status(201).json(result.value);
}
```

## Próximos Pasos

Una vez domines este proyecto, estás listo para:

→ **[Library System (Arquitectura Hexagonal)](../../hexagonal/library-system)** - Result + Hexagonal + Value Objects avanzados

## Referencias

- **Railway Oriented Programming** - Scott Wlaschin
- **Rust Result Type** - El lenguaje donde Result es parte del core
- **Functional Error Handling** - Domain Modeling Made Functional

---

## El Profe Millo dice...

> "Mira tú, el manejo de errores es lo que separa el código amateur del profesional.
>
> No se trata de evitar errores (eso es imposible, mi niño).
> Se trata de ESPERARLOS, MODELARLOS y MANEJARLOS como parte del diseño.
>
> Result hace que los errores sean VISIBLES en el tipo.
> Si una función retorna `Result<User, ValidationError>`,
> ya sabes que puede fallar y POR QUÉ.
>
> Eso está fetén. Eso es arquitectura limpia.
>
> Venga, a darle caña que este patrón te va a volar la cabeza."
