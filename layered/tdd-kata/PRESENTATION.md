# 🎓 Presentación: TDD Kata - Red Green Refactor

> **Una guía para presentar este proyecto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar TDD (Test-Driven Development) de forma práctica usando katas progresivas.

### Duración Recomendada
- **Express (30 min)**: Conceptos clave + demo de FizzBuzz
- **Estándar (90 min)**: Conceptos + 2 katas completas + práctica
- **Completo (3 horas)**: Todo + las 3 katas + ejercicios + discusión

### Prerrequisito
Los asistentes deberían saber TypeScript/JavaScript básico y haber escrito algún test (aunque sea manual).

---

## 🎤 Estructura Sugerida

### 1. Introducción (10 min)

**Pregunta inicial:** "¿Cuándo escriben los tests en sus proyectos?"

Respuestas típicas:
- "Al final, cuando tengo tiempo" (problema común)
- "No escribo tests" (oportunidad de enseñar)
- "Primero el código, luego los tests" (casi bien, pero...)

**Problema a plantear:**

```typescript
// Código escrito sin tests
function calculateDiscount(price: number, percentage: number): number {
  return price - (price * percentage / 100);
}

// Preguntas para la audiencia:
// ¿Qué pasa si percentage es negativo?
// ¿Y si es mayor que 100?
// ¿Y si price es 0?
// ¿Cómo sabemos que funciona correctamente?
```

**Transición:** "Con TDD, estas preguntas se responden ANTES de escribir el código."

---

### 2. Concepto: El Ciclo Red-Green-Refactor (15 min)

**Dibujar en pizarra:**

```
     ❌ RED
     Escribe un test que falle
           ↓
     ✅ GREEN
     Escribe código mínimo que lo haga pasar
           ↓
     ♻️ REFACTOR
     Mejora el código (tests siguen verdes)
           ↓
     Repite
```

**Conceptos clave:**

1. **Red (Rojo)**: El test falla porque el código no existe todavía
   - Esto es BUENO. Confirma que el test realmente prueba algo.

2. **Green (Verde)**: Escribes el código MÁS SIMPLE que haga pasar el test
   - No importa si es feo. Ya refactorizarás.

3. **Refactor**: Mejoras el código sin cambiar su comportamiento
   - Los tests son tu red de seguridad.

**Regla de oro:** NUNCA escribas código sin un test que falle primero.

---

### 3. Demo en Vivo: FizzBuzz TDD (20 min)

**Paso 0: Setup**
```bash
npm install
npm run test:watch
```

**Paso 1: El primer test (RED)**

Escribe en `tests/fizzbuzz.test.ts`:
```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { fizzbuzz } from '../src/kata-1-fizzbuzz/fizzbuzz.js';

test('displays the number itself when number is not special', () => {
  const result = fizzbuzz(1);
  assert.strictEqual(result, '1');
});
```

Ejecuta → ❌ Falla (no existe la función)

**Paso 2: Código mínimo (GREEN)**

Escribe en `src/kata-1-fizzbuzz/fizzbuzz.ts`:
```typescript
export function fizzbuzz(n: number): string {
  return '1'; // ¡Literalmente devuelve '1'!
}
```

Ejecuta → ✅ Pasa

**Pregunta a la audiencia:** "¿Esto es trampa?"
**Respuesta:** "No. Es la ESENCIA de TDD. Baby steps."

**Paso 3: Siguiente test (RED otra vez)**

```typescript
test('displays the number itself for other regular numbers', () => {
  const result = fizzbuzz(2);
  assert.strictEqual(result, '2');
});
```

Ejecuta → ❌ Falla (devuelve '1' siempre)

**Paso 4: Generalizar (GREEN)**

```typescript
export function fizzbuzz(n: number): string {
  return String(n); // Ahora sí, generalizamos
}
```

Ejecuta → ✅ Ambos tests pasan

**Continúa así hasta completar FizzBuzz.**

Muestra el ciclo completo:
- Test para "Fizz"
- Test para "Buzz"
- Test para "FizzBuzz"

**Paso 5: Refactor**

Una vez todos los tests pasan, mejora el código:
```typescript
// Antes: múltiples ifs
// Después: lógica más clara
```

Los tests siguen verdes. ¡Esa es la magia!

---

### 4. Patrón AAA (10 min)

**Explica la estructura de un test bien escrito:**

```typescript
test('calculates total correctly', () => {
  // 1. ARRANGE (Preparar)
  const cart = new ShoppingCart();
  const product = new Product('Laptop', 1000);

  // 2. ACT (Actuar)
  cart.addProduct(product);
  const total = cart.getTotal();

  // 3. ASSERT (Afirmar)
  assert.strictEqual(total, 1000);
});
```

**Por qué AAA:**
- Claridad: Cualquiera entiende qué prueba el test
- Mantenibilidad: Fácil de modificar
- Debugging: Sabes dónde buscar si falla

---

### 5. Ejercicio Práctico (30 min)

**Opción A (Guiado):** FizzBuzz
"Ahora ustedes. Borren el código de fizzbuzz.ts y reimplemnténlo siguiendo los tests."

**Opción B (Independiente):** String Calculator
"Implementen String Calculator desde cero. Los tests están comentados. Descoméntenlos uno por uno."

**Opción C (Avanzado):** Shopping Cart
"Añadan una nueva feature: descuentos por cupón. Primero el test."

**Recorre la sala ayudando.** Los errores comunes:
- Escribir mucho código de golpe (recuérdales: baby steps)
- No ejecutar el test cuando falla (deben VER el rojo)
- Código complicado en el primer intento (recuérdales: mínimo)

---

## 💡 Puntos Clave a Transmitir

### TDD es una Disciplina

No es solo "escribir tests". Es una **metodología de diseño**.

```
Tests primero → Diseño limpio
Tests después → Diseño acoplado
```

### Los Tests son Documentación

Un buen test se lee como especificación:

```typescript
test('rejects negative numbers with descriptive error', () => {
  // Este test DOCUMENTA que los negativos no están permitidos
});
```

### Baby Steps son Más Rápidos

Parece contradictorio, pero:
- Pasos pequeños → Menos bugs → Menos debugging → MÁS RÁPIDO

### Refactorizar sin Miedo

Con tests verdes, puedes cambiar TODO el código interno.
Si algo se rompe, los tests te lo dirán.

---

## ❓ Preguntas Frecuentes

### "¿No es más lento hacer TDD?"

**Respuesta:** Al principio sí, como aprender a conducir. Pero a largo plazo:
- Menos bugs en producción
- Menos tiempo buscando errores
- Refactorización rápida y segura
- Código más limpio (porque los tests te fuerzan)

### "¿Debo hacer TDD siempre?"

**Respuesta:** No seas dogmático. Haz TDD cuando:
- Lógica de negocio compleja
- Código que vas a mantener
- Aprendiendo algo nuevo

No lo hagas cuando:
- Prototipando (spike)
- Código trivial
- Experimentando con APIs

### "¿Qué pasa si no sé qué test escribir primero?"

**Respuesta:** Empieza con el caso MÁS SIMPLE. Siempre.

FizzBuzz: No empieces con 15 (FizzBuzz). Empieza con 1 (devuelve "1").

### "¿Los tests no ralentizan el desarrollo?"

**Respuesta:** Gráfica mental:

```
Sin TDD:  Rápido al inicio → Lento después (bugs, regresiones)
Con TDD:  Lento al inicio → Rápido después (confianza, refactor)
```

TDD es una inversión. Pagas por adelantado, cobras después.

---

## 📋 Checklist de Presentación

Antes:
- [ ] `npm install` ejecutado
- [ ] `npm test` funciona
- [ ] `npm run test:watch` configurado
- [ ] Código de ejemplo preparado para demo

Durante:
- [ ] Empezar con el problema (código sin tests)
- [ ] Explicar el ciclo Red-Green-Refactor
- [ ] Demo en vivo de FizzBuzz completo
- [ ] Ejercicio práctico (asistentes escriben código)
- [ ] Discusión sobre errores comunes

Después:
- [ ] Compartir repo
- [ ] Recomendar recursos (Kent Beck, "TDD by Example")
- [ ] Animar a practicar las otras katas

---

## 🎯 Ejercicios para los Asistentes

### Durante la sesión

1. **FizzBuzz desde cero** (15 min)
   - Borrar código
   - Seguir tests uno por uno
   - Sentir el ciclo Red-Green-Refactor

2. **String Calculator** (25 min)
   - Implementar requisitos incrementales
   - Practicar baby steps
   - Manejo de errores con TDD

### Para casa

3. **Shopping Cart completo** (1 hora)
   - Múltiples clases
   - Diseño emergente
   - Refactorización continua

4. **Kata personalizada** (2 horas)
   - Inventar un problema de su dominio
   - Aplicar TDD desde cero
   - Compartir con el grupo

---

## 🏆 Mensaje Final

"TDD no se trata de tests. Se trata de **diseño**.

Los tests son la herramienta.
El diseño limpio es el resultado.
La confianza es el regalo.

Cuando haces TDD de verdad, no tienes miedo de cambiar código.
No tienes miedo de refactorizar.
No tienes miedo de que se rompa algo en producción.

Porque tienes una red de seguridad.
Y esa red son tus tests.

El mejor código no es el más listo,
es el que tiene los mejores tests."

---

**Profe Millo**
_"Dale una oportunidad al TDD. Después de 2 semanas, no podrás volver a programar sin tests."_

---

## 📚 Recursos Adicionales

### Libros
- "Test Driven Development: By Example" - Kent Beck (EL libro de TDD)
- "Growing Object-Oriented Software, Guided by Tests" - Freeman/Pryce

### Katas Online
- [Kata-Log](http://kata-log.rocks/) - Colección de katas
- [Codewars](https://www.codewars.com/) - Katas interactivas

### Videos
- "TDD: The Bad Parts" - Matt Parker
- "Is TDD Dead?" - DHH, Kent Beck, Martin Fowler (debate interesante)

---

¡A practicar TDD! El único camino es hacer, hacer y hacer. 🚀
