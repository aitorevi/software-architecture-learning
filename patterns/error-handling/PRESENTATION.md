# 🎓 Presentación: Error Handling & Validation Strategy

> **Una guía para presentar este proyecto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar el patrón Result/Either para manejar errores de forma funcional, sin excepciones para casos de negocio.

### Duración Recomendada
- **Express (20 min)**: Problema + Result básico + demo
- **Estándar (45 min)**: Conceptos + código + práctica
- **Completo (1.5 horas)**: Todo + ejercicios + discusión profunda

### Prerrequisito
Los asistentes deberían conocer Controller-Service y tener experiencia con try/catch.

---

## 🎤 Estructura Sugerida

### 1. Introducción - El Problema (10 min)

**Pregunta inicial:** "¿Cómo manejan los errores de validación en sus APIs?"

Respuestas típicas:
- Lanzo excepciones (común pero problemático)
- Retorno null (ambiguo)
- Códigos de error (old school)

**Plantear el problema:**

```typescript
// ❌ Código típico con excepciones
async function registerUser(data: any) {
  try {
    // ¿Email válido?
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Email inválido');
    }

    // ¿Password seguro?
    if (data.password.length < 8) {
      throw new Error('Password muy corto');
    }

    // ¿Usuario ya existe?
    const existing = await repo.findByEmail(data.email);
    if (existing) {
      throw new Error('Usuario ya existe');
    }

    return await repo.save(new User(data));

  } catch (error) {
    // 😱 ¿Qué tipo de error es? ¿De validación? ¿De BD? ¿De red?
    // ¿Qué status code devuelvo? ¿400? ¿409? ¿500?
    throw error; // Y lo tiro hacia arriba...
  }
}
```

**¿Problemas?**
1. **No sabes qué tipo de error es** sin leer el mensaje
2. **Mezclas errores de negocio** (email inválido) con errores técnicos (BD caída)
3. **Pierdes el tipo** - todo es `Error`
4. **El flujo se rompe** con throw (no es composable)
5. **Tests difíciles** - tienes que usar try/catch en los tests

### 2. La Solución - Patrón Result (15 min)

**Dibujar en pizarra:**

```
┌─────────────────────────────────────────────────────┐
│  Result<T, E>                                       │
│                                                     │
│  • Es un contenedor de ÉXITO o ERROR                │
│  • El error es un VALOR, no una excepción           │
│  • Es composable (map, flatMap, etc.)               │
│  • Tipado - el compilador te ayuda                  │
└─────────────────────────────────────────────────────┘

         ┌─────────┐
         │ Result  │
         └────┬────┘
              │
       ┌──────┴──────┐
       │             │
   ┌───▼───┐   ┌────▼────┐
   │  OK   │   │  ERROR  │
   │       │   │         │
   │ value │   │  error  │
   └───────┘   └─────────┘
```

**Código simple:**

```typescript
// ✅ Con Result - el error es un VALOR
function createEmail(value: string): Result<Email, ValidationError> {
  if (!value.includes('@')) {
    return Result.fail(
      new ValidationError('Email debe contener @')
    );
  }

  return Result.ok(new Email(value));
}

// Uso
const emailResult = createEmail('millo@laspalmas.com');

if (emailResult.isOk()) {
  console.log('Email:', emailResult.value); // ✅ Tipado
} else {
  console.log('Error:', emailResult.error.message); // ✅ Tipado
}
```

**Ventajas:**
- El tipo dice "esto puede fallar" → `Result<T, E>`
- No rompes el flujo con throw
- El compilador te obliga a manejar el error
- Composable con `map`, `flatMap`, etc.

### 3. Demo en Vivo (15 min)

**Paso 1: Ejecutar tests**
```bash
npm test
```

"Mira tú, todos los tests pasan. Fíjate que estamos testeando ERRORES como parte del flujo normal."

**Paso 2: Mostrar código en orden**

1. **Result.ts** - "Esta es la clase base"
   - `Result.ok()` para éxito
   - `Result.fail()` para error
   - `isOk()` e `isError()` para verificar
   - `map()` para transformar valores

2. **Email.ts** - "Value Object con validación"
   - Retorna `Result<Email, ValidationError>`
   - Si falla validación → `Result.fail()`
   - Si pasa → `Result.ok()`

3. **RegisterUserUseCase.ts** - "Composición de Results"
   ```typescript
   const emailResult = Email.create(data.email);
   if (emailResult.isError()) {
     return Result.fail(emailResult.error);
   }

   const passwordResult = Password.create(data.password);
   if (passwordResult.isError()) {
     return Result.fail(passwordResult.error);
   }
   ```

4. **UserController.ts** - "Traducir Result → HTTP"
   ```typescript
   const result = await registerUserUseCase.execute(req.body);

   if (result.isError()) {
     const statusCode = this.errorToStatusCode(result.error);
     return res.status(statusCode).json({
       error: result.error.name,
       message: result.error.message
     });
   }

   return res.status(201).json(result.value);
   ```

**Paso 3: Probar con curl**

```bash
# Email inválido
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"no-valido","password":"Abc123!","acceptedTerms":true}'

# Ver respuesta: 400 con error estructurado

# Email válido
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"millo@laspalmas.com","password":"SuperSecret123!","acceptedTerms":true}'

# Ver respuesta: 201 con usuario creado
```

### 4. Ejercicio Práctico (15 min)

**Ejercicio:** "Añade validación para que el email no sea de dominios temporales"

```typescript
// En Email.ts
private static readonly FORBIDDEN_DOMAINS = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com'
];

static create(value: string): Result<Email, ValidationError> {
  // ... validaciones existentes ...

  const domain = value.split('@')[1];
  if (this.FORBIDDEN_DOMAINS.includes(domain)) {
    return Result.fail(
      new ValidationError('Email temporal no permitido')
    );
  }

  return Result.ok(new Email(value));
}
```

**Discutir:** ¿Dónde va esta validación? ¿En el VO? ¿En el UseCase? ¿Por qué?

---

## 💡 Puntos Clave a Transmitir

### 1. Errores de Negocio vs Errores Técnicos

```typescript
// ERRORES DE NEGOCIO (esperados, parte del flujo)
// → Retornar Result.fail()
- Email inválido
- Password muy corto
- Usuario ya existe
- Términos no aceptados

// ERRORES TÉCNICOS (inesperados, excepcionales)
// → Lanzar exception
- BD caída
- Red desconectada
- Disco lleno
- OutOfMemory
```

### 2. Fail Fast

"Valida en los boundaries (Value Objects), no en el centro (Entities)."

```typescript
// ✅ BIEN: Validar en la creación del VO
const emailResult = Email.create(rawEmail);
if (emailResult.isError()) {
  return Result.fail(emailResult.error);
}

// Aquí email es VÁLIDO garantizado
const user = new User(emailResult.value);

// ❌ MAL: Validar después de crear el objeto
const email = new Email(rawEmail); // Puede estar roto
if (!email.isValid()) { // Ya es tarde
  // ...
}
```

### 3. Railway Oriented Programming

"Los Results se encadenan como vagones de tren. Si uno descarrila (error), todo el tren para."

```typescript
Result.ok(rawData)
  .map(data => Email.create(data.email))
  .flatMap(email => Password.create(data.password))
  .flatMap(password => User.create(email, password))
  .flatMap(user => repo.save(user));

// Si CUALQUIER paso falla → Result.fail()
// Si TODOS pasan → Result.ok()
```

---

## ❓ Preguntas Frecuentes

### "¿No es más complicado que try/catch?"

Al principio sí, pero:
1. El compilador te ayuda (no olvidas manejar errores)
2. El código es más explícito (sabes qué puede fallar)
3. Los tests son más simples (no necesitas try/catch)
4. Es composable (railway programming)

### "¿Siempre debo usar Result?"

No. Usa Result para:
- Errores de negocio esperados
- Validaciones
- Operaciones que pueden fallar por razones válidas

Usa exceptions para:
- Errores técnicos inesperados
- Bugs (null pointer, etc.)
- Condiciones que nunca deberían pasar

### "¿Result es lo mismo que Either?"

Casi. Either es más genérico:
- `Either<Left, Right>` (convención: Left = error, Right = éxito)
- `Result<Value, Error>` es un Either con nombres claros

### "¿Qué pasa con async/await?"

Funciona perfecto:

```typescript
async function registerUser(data: UserData): Promise<Result<User, DomainError>> {
  const emailResult = Email.create(data.email);
  if (emailResult.isError()) {
    return Result.fail(emailResult.error);
  }

  // await funciona normal
  const existing = await repo.findByEmail(emailResult.value);
  if (existing) {
    return Result.fail(new UserAlreadyExistsError());
  }

  return Result.ok(user);
}
```

---

## 📋 Checklist de Presentación

Antes:
- [ ] `npm install` ejecutado
- [ ] `npm test` pasa
- [ ] `npm run dev` funciona
- [ ] Curl commands preparados

Durante:
- [ ] Empezar con el problema (try/catch hell)
- [ ] Mostrar Result como solución
- [ ] Demo con tests
- [ ] Demo con API
- [ ] Ejercicio práctico
- [ ] Discusión de casos de uso

Después:
- [ ] Compartir repo
- [ ] Recomendar lectura: "Railway Oriented Programming"
- [ ] Siguiente proyecto: library-system (Result + Hexagonal)

---

## 🏆 Mensaje Final

"El manejo de errores es lo que separa el código amateur del profesional.

No se trata de evitar errores (eso es imposible).
Se trata de ESPERARLOS, MODELARLOS y MANEJARLOS como parte del diseño.

Result hace que los errores sean VISIBLES en el tipo.
Si una función retorna `Result<User, ValidationError>`,
ya sabes que puede fallar y POR QUÉ.

Eso es arquitectura limpia."

---

## 📚 Referencias

- **Railway Oriented Programming** - Scott Wlaschin
- **Functional Error Handling** - Functional Programming in TypeScript
- **Result Pattern** - Rust language (donde Result es un ciudadano de primera)

---

**Profe Millo**
_"Un error bien tipado es mejor que una excepción sorpresa en producción"_
