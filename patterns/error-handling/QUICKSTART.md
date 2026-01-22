# Quickstart - Error Handling

> **5 minutos para entender el proyecto**
> By El Profe Millo

## Instalación

```bash
npm install
npm test        # Ver todos los tests pasar
npm run dev     # Servidor en localhost:3000
```

## El Concepto en 1 Minuto

**Problema:** ¿Cómo manejar errores de negocio sin lanzar excepciones?

**Solución:** El patrón **Result**

```typescript
// ❌ ANTES: Excepciones por todos lados
function createUser(email: string) {
  if (!isValidEmail(email)) {
    throw new Error('Email inválido'); // 😱 Exception!
  }
  return user;
}

// ✅ AHORA: Errores como valores
function createUser(email: string): Result<User, ValidationError> {
  const emailResult = Email.create(email);
  if (emailResult.isError()) {
    return Result.fail(emailResult.error); // 😊 Flujo normal
  }

  return Result.ok(user);
}
```

## Pruébalo

```bash
# Crear usuario con email válido
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"millo@laspalmas.com","password":"SuperSecret123!","acceptedTerms":true}'

# Crear usuario con email inválido (verás error estructurado)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"no-es-email","password":"123","acceptedTerms":false}'
```

## Archivos Clave

1. **`src/domain/Result.ts`** - El patrón Result (la magia)
2. **`src/domain/value-objects/Email.ts`** - Validación con Result
3. **`src/application/RegisterUserUseCase.ts`** - Result en acción
4. **`tests/unit/Result.test.ts`** - Cómo testear con Result

## Lo Que Aprenderás

- Errores como **valores** (no excepciones)
- **Result<T, E>** - El tipo que cambiará tu código
- **Fail Fast** - Validar en los boundaries
- Traducir errores a HTTP status codes

## Siguiente Paso

Lee **README_ES.md** para el tutorial completo (45 min).

---

**Profe Millo dice:** "Si solo aprendes una cosa hoy, que sea esto: los errores de negocio NO son excepciones. Son parte del flujo. Eso está fetén."
