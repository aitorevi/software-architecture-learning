# 🎯 TDD Kata - Red Green Refactor

> **Un tutorial paso a paso by el Profe Millo**
> _"El mejor código no es el más listo, es el que tiene los mejores tests, mi niño/a"_

---

## 🎯 ¿Qué aprenderás aquí?

Este proyecto te enseña **Test-Driven Development (TDD)** desde cero con katas progresivas. Aprenderás:

1. El ciclo **Red-Green-Refactor** (la esencia del TDD)
2. **Test-first thinking** (cómo pensar en tests antes que código)
3. Patrón **AAA** (Arrange-Act-Assert)
4. **Naming conventions** para tests claros
5. La disciplina de dar **baby steps** (pasos pequeños)

---

## 🏗️ Estructura del Proyecto

```
tdd-kata/
│
├── src/
│   ├── kata-1-fizzbuzz/           <- Kata 1: El clásico (fácil)
│   │   └── fizzbuzz.ts
│   │
│   ├── kata-2-string-calculator/  <- Kata 2: Más complejo
│   │   └── string-calculator.ts
│   │
│   └── kata-3-shopping-cart/      <- Kata 3: Mundo real
│       ├── ShoppingCart.ts
│       └── Product.ts
│
├── tests/
│   ├── fizzbuzz.test.ts           <- Tests del Kata 1
│   ├── string-calculator.test.ts  <- Tests del Kata 2
│   └── shopping-cart.test.ts      <- Tests del Kata 3
│
├── package.json
├── tsconfig.json
└── README_ES.md                    <- Estás aquí
```

---

## 📖 ¿Qué es TDD?

### La definición seria

**Test-Driven Development (TDD)** es una metodología de desarrollo donde escribes **primero los tests** y **luego el código** que los hace pasar.

### La definición del Profe Millo

Mira tú, TDD es como construir una casa con las Palmas al fondo:

- **Sin TDD:** Construyes la casa, esperas que no se caiga, rezas un poco.
- **Con TDD:** Pones sensores en cada pared ANTES de construir. Si algo va mal, lo sabes al instante.

El test es tu **red de seguridad**. Es tu **GPS**. Es tu **certificado de calidad**.

---

## 🔄 El Ciclo Red-Green-Refactor

El corazón del TDD es este ciclo de 3 pasos:

```
┌─────────────────────────────────────────────────────────────┐
│                    EL CICLO TDD                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ❌ RED (Rojo)                                           │
│     ├─ Escribe un test que FALLA                            │
│     ├─ El test debe fallar por la razón correcta           │
│     └─ Asegúrate de que falla (¡ejecútalo!)                │
│                                                             │
│          ↓                                                  │
│                                                             │
│  2. ✅ GREEN (Verde)                                        │
│     ├─ Escribe el código MÁS SIMPLE que haga pasar el test │
│     ├─ No importa si el código es feo o duplicado          │
│     └─ Solo hazlo pasar. Ya refactorizarás después.        │
│                                                             │
│          ↓                                                  │
│                                                             │
│  3. ♻️ REFACTOR (Refactorizar)                             │
│     ├─ Mejora el código (elimina duplicación, clarifica)   │
│     ├─ Los tests deben seguir pasando (verdes)             │
│     └─ Si rompes algo, los tests te avisan                 │
│                                                             │
│          ↓                                                  │
│                                                             │
│  Repite con el siguiente test                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Regla de oro

**NUNCA** escribas código de producción sin un test que falle primero.

Si escribes código sin test, estás volando sin red. Y créeme, mi niño/a, te vas a caer.

---

## 🎨 El Patrón AAA (Arrange-Act-Assert)

Cada test sigue esta estructura:

```typescript
test('debería hacer algo específico', () => {
  // 1. ARRANGE (Preparar)
  // Configura el escenario: crea objetos, inicializa variables
  const calculator = new Calculator();

  // 2. ACT (Actuar)
  // Ejecuta la acción que quieres testear
  const result = calculator.add(2, 3);

  // 3. ASSERT (Afirmar)
  // Verifica que el resultado es el esperado
  assert.strictEqual(result, 5);
});
```

**¿Por qué AAA?**

- **Claridad:** Cualquiera entiende qué hace el test
- **Mantenibilidad:** Es fácil modificar tests
- **Debugging:** Si falla, sabes dónde buscar

---

## 📝 Guía para Nombrar Tests

### La regla de oro

> **Un buen nombre de test es una afirmación clara en lenguaje de negocio sobre el comportamiento del sistema.**

El nombre debe describir la **regla de negocio**, no los datos concretos del test.

---

### ❌ Lo que NO hacer

**No incluyas datos concretos ni constantes numéricas:**

```typescript
// ❌ MAL - Contiene datos específicos, no la regla
test('returns 4 when the input is 2', () => { /* ... */ });
test('empty string', () => { /* ... */ });
test('returns null', () => { /* ... */ });
test('throws exception if empty', () => { /* ... */ });

// ❌ MAL - No se entiende qué prueba
test('test1', () => { /* ... */ });
test('fizzbuzz', () => { /* ... */ });
test('it works', () => { /* ... */ });
```

**¿Por qué está mal?**
- `'returns 4 when input is 2'` → Describe el ejemplo, no la regla
- `'empty string'` → No es una afirmación, es solo un caso
- `'returns null'` → ¿Cuándo? ¿Por qué? No dice nada útil

---

### ✅ Lo que SÍ hacer

**Usa verbos en tercera persona que describan el comportamiento:**

```typescript
// ✅ BIEN - Afirmaciones claras sobre comportamiento
test('removes duplicated items from the list', () => { /* ... */ });
test('counts characters in the document', () => { /* ... */ });
test('registers a failure in the communication', () => { /* ... */ });
test('calculates the net pay', () => { /* ... */ });
test('finds patients by surname', () => { /* ... */ });
test('is case insensitive', () => { /* ... */ });
test('requires at least one number', () => { /* ... */ });

// ✅ BIEN - Ejemplos de FizzBuzz
test('displays Fizz when number is multiple of three', () => { /* ... */ });
test('displays Buzz when number is multiple of five', () => { /* ... */ });
test('displays FizzBuzz when number is multiple of both', () => { /* ... */ });
```

**¿Por qué está bien?**
- Se lee como documentación
- Describe el **qué**, no el **cómo**
- Cualquiera entiende la regla sin ver el código

---

### 📐 Estructura del Test: AAA (Arrange-Act-Assert)

Cada test tiene 3 partes claramente diferenciadas:

```typescript
test('calculates total with discount applied', () => {
  // 1. ARRANGE (Given) - Preparar el contexto
  const cart = new ShoppingCart();
  const product = new Product('Laptop', 1000);
  const discount = new Discount(10); // 10%

  // 2. ACT (When) - Ejecutar la acción
  cart.addProduct(product);
  cart.applyDiscount(discount);
  const total = cart.getTotal();

  // 3. ASSERT (Then) - Verificar el resultado
  assert.strictEqual(total, 900);
});
```

| Fase | También conocida como | Qué hace |
|------|----------------------|----------|
| **Arrange** | Given | Prepara el escenario: crea objetos, inicializa datos |
| **Act** | When | Ejecuta la acción que quieres testear |
| **Assert** | Then | Verifica que el resultado es el esperado |

---

### 🎯 Un test, un motivo de fallo

> **El test debe fallar por un solo motivo.**

Es mejor tener algún test redundante para ganar en seguridad y feedback, pero cada test debe ser **muy certero** con lo que quiere probar.

```typescript
// ❌ MAL - Prueba demasiadas cosas
test('shopping cart operations', () => {
  const cart = new ShoppingCart();
  cart.addProduct(product);
  assert.strictEqual(cart.itemCount, 1);      // ¿Falla por esto?
  assert.strictEqual(cart.total, 100);        // ¿O por esto?
  assert.strictEqual(cart.isEmpty(), false);  // ¿O por esto?
});

// ✅ BIEN - Cada test tiene una responsabilidad
test('increments item count when adding product', () => {
  const cart = new ShoppingCart();
  cart.addProduct(product);
  assert.strictEqual(cart.itemCount, 1);
});

test('updates total when adding product', () => {
  const cart = new ShoppingCart();
  cart.addProduct(product);
  assert.strictEqual(cart.total, 100);
});
```

---

### 📦 Datos del test: solo lo relevante

A la hora de escribir un test, los datos son cruciales:

| Tipo de dato | Qué hacer |
|--------------|-----------|
| **Relevantes** | Mostrarlos claramente, son los que diferencian este test del resto |
| **Irrelevantes** | Ocultarlos (usar valores por defecto, builders, factories) |

```typescript
// ❌ MAL - Demasiados datos irrelevantes
test('applies senior discount', () => {
  const customer = new Customer(
    'Juan',           // ¿Importa el nombre? No
    'García',         // ¿Importa el apellido? No
    'juan@email.com', // ¿Importa el email? No
    '123456789',      // ¿Importa el teléfono? No
    65                // ¡Esto SÍ importa! Es senior
  );
  const discount = calculateDiscount(customer);
  assert.strictEqual(discount, 15);
});

// ✅ BIEN - Solo datos relevantes visibles
test('applies senior discount', () => {
  const seniorCustomer = createCustomer({ age: 65 });
  const discount = calculateDiscount(seniorCustomer);
  assert.strictEqual(discount, 15);
});
```

**El Profe Millo dice:** _"Si tienes que leer 10 líneas de setup para entender qué prueba el test, algo está mal. Los datos importantes deben saltar a la vista."_

---

## 🎓 Las 3 Katas Explicadas

### Kata 1: FizzBuzz (15 min)

**Objetivo:** Aprender el ciclo básico Red-Green-Refactor

**El problema:**
Escribe una función que devuelva:
- "Fizz" si el número es divisible por 3
- "Buzz" si es divisible por 5
- "FizzBuzz" si es divisible por 3 y 5
- El número como string en cualquier otro caso

**Conceptos que practicarás:**
- Baby steps (empezar con el caso más simple)
- Test-first thinking
- Refactorización con confianza

**Archivo:** `src/kata-1-fizzbuzz/fizzbuzz.ts`
**Tests:** `tests/fizzbuzz.test.ts`

---

### Kata 2: String Calculator (25 min)

**Objetivo:** Trabajar con múltiples requisitos y manejo de errores

**El problema:**
Crea una calculadora que sume números en un string:
- `add("")` → 0
- `add("1")` → 1
- `add("1,2")` → 3
- `add("1\n2,3")` → 6 (soporta múltiples delimitadores)
- `add("1,-2")` → lanza error (no permite negativos)

**Conceptos que practicarás:**
- Requisitos incrementales
- Manejo de errores con TDD
- Refactorización continua
- Tests que documentan casos edge

**Archivo:** `src/kata-2-string-calculator/string-calculator.ts`
**Tests:** `tests/string-calculator.test.ts`

---

### Kata 3: Shopping Cart (45 min)

**Objetivo:** TDD en un escenario de mundo real con múltiples entidades

**El problema:**
Implementa un carrito de compras con:
- Añadir/eliminar productos
- Calcular total
- Aplicar descuentos
- Validar stock

**Conceptos que practicarás:**
- TDD con múltiples clases
- Validaciones de negocio
- Tests de integración entre clases
- Diseño emergente (el diseño surge de los tests)

**Archivos:**
- `src/kata-3-shopping-cart/ShoppingCart.ts`
- `src/kata-3-shopping-cart/Product.ts`

**Tests:** `tests/shopping-cart.test.ts`

---

## 🚀 Cómo Ejecutarlo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar todos los tests

```bash
npm test
```

### 3. Ejecutar tests en modo watch (RECOMENDADO para TDD)

```bash
npm run test:watch
```

Con `test:watch`, los tests se ejecutan automáticamente cada vez que guardas un archivo. ¡Así se hace TDD de verdad!

### 4. Ejecutar una kata específica

```bash
# Solo FizzBuzz
npm test -- fizzbuzz

# Solo String Calculator
npm test -- string-calculator

# Solo Shopping Cart
npm test -- shopping-cart
```

---

## 💡 Ejercicios Propuestos

### Nivel 1: Practicando FizzBuzz

1. **Borra el código de `fizzbuzz.ts` y reimpleméntalo:**
   - Sigue los tests uno por uno
   - No escribas código que los tests no pidan
   - Siente el ciclo Red-Green-Refactor

2. **Añade una nueva regla:**
   - "Jazz" si el número es divisible por 7
   - "FizzJazz" si es divisible por 3 y 7
   - Etc.
   - **IMPORTANTE:** Primero escribe el test que falla

---

### Nivel 2: Expandiendo String Calculator

3. **Añade soporte para delimitadores personalizados:**
   - `add("//;\n1;2")` → 3 (usa `;` como delimitador)
   - Primero el test, luego el código

4. **Ignora números mayores que 1000:**
   - `add("2,1001")` → 2
   - `add("1000,1001,2")` → 1002

---

### Nivel 3: Mejorando Shopping Cart

5. **Añade descuentos por cantidad:**
   - 10% si compras 5 o más del mismo producto
   - Los tests deben guiar el diseño

6. **Implementa un sistema de cupones:**
   - Cupón de porcentaje ("SAVE20" → 20% descuento)
   - Cupón de cantidad fija ("SAVE10EUR" → 10€ descuento)
   - No puede haber descuento negativo

---

## ❓ Preguntas Frecuentes

### ¿Por qué escribir el test primero y no después?

**Respuesta corta:** Porque si escribes el test después, estás sesgado por tu implementación.

**Respuesta larga:**
Cuando escribes el test primero:
- Piensas en la **interfaz pública** (cómo se usa) antes que en la implementación
- Escribes código **testeable** por diseño (no tienes que forzarlo después)
- El test es **honesto** (no está hecho para que pase)
- Evitas código innecesario (solo escribes lo que los tests piden)

### ¿No es más lento hacer TDD?

**Al principio:** Sí, es más lento. Como aprender a conducir.

**Después de practicar:** No. Escribes menos bugs, menos código innecesario, y refactorizas con confianza.

**A largo plazo:** Es MUCHO más rápido. No pierdes horas buscando bugs. Los tests te dicen exactamente qué se rompió.

### ¿Debo hacer TDD siempre?

El Profe Millo dice: "No seas dogmático, mi niño/a."

**Haz TDD cuando:**
- Estás escribiendo lógica de negocio compleja
- Quieres diseño limpio
- Vas a mantener el código a largo plazo
- Estás aprendiendo un lenguaje/framework nuevo

**No hagas TDD cuando:**
- Estás haciendo un prototipo de una sola vez
- Estás experimentando con una API nueva (spike)
- El código es trivial (getters/setters)

### ¿Qué hago si no sé cómo empezar el primer test?

**Principio:** Empieza con el caso MÁS SIMPLE posible.

Ejemplo para String Calculator:
- ❌ NO empieces con: `add("1,2,3\n4,5")` → 15
- ✅ SÍ empieza con: `add("")` → 0

Una vez pase el más simple, añade complejidad gradualmente.

### ¿Cuántos tests necesito?

**Regla práctica:** Suficientes para:
1. Cubrir el caso happy path (el flujo normal)
2. Cubrir casos edge (vacío, null, límites)
3. Cubrir errores esperados
4. Darte confianza para refactorizar

No persigas cobertura del 100%. Persigue **tests útiles** que realmente validen comportamiento.

---

## 🎯 Errores Comunes en TDD

### Error 1: Escribir mucho código de golpe

```typescript
// ❌ MAL - Escribiste toda la función sin tests que lo guíen
function fizzbuzz(n: number): string {
  if (n % 15 === 0) return 'FizzBuzz';
  if (n % 3 === 0) return 'Fizz';
  if (n % 5 === 0) return 'Buzz';
  return String(n);
}
```

**Solución:** Baby steps. Un test → mínimo código → siguiente test.

---

### Error 2: Tests que prueban implementación, no comportamiento

```typescript
// ❌ MAL - Prueba detalles internos
test('should call calculateSubtotal internally', () => {
  const cart = new ShoppingCart();
  const spy = jest.spyOn(cart, 'calculateSubtotal');
  cart.getTotal();
  expect(spy).toHaveBeenCalled();
});
```

**Solución:** Testea **QUÉ** hace, no **CÓMO** lo hace.

---

### Error 3: No ejecutar los tests cuando fallan

Debes VER el test fallar antes de escribir el código.

**¿Por qué?** Para asegurarte de que el test realmente prueba algo.

---

### Error 4: Tests con múltiples asserts no relacionados

```typescript
// ❌ MAL - El test prueba demasiadas cosas
test('shopping cart', () => {
  const cart = new ShoppingCart();
  cart.addProduct(product);
  assert.strictEqual(cart.itemCount, 1);
  assert.strictEqual(cart.total, 10);
  assert.strictEqual(cart.isEmpty(), false);
  assert.strictEqual(cart.products[0].name, 'Product');
});
```

**Solución:** Un test, una responsabilidad.

---

## 🏆 Resumen de lo Aprendido

Si has completado las 3 katas, ahora entiendes:

1. **El ciclo TDD:** Red → Green → Refactor es un ritmo, no una fórmula
2. **Test-first thinking:** Pensar en el test primero cambia cómo diseñas
3. **Baby steps:** Los pasos pequeños son más seguros y rápidos
4. **AAA pattern:** Tests claros y mantenibles
5. **Naming:** Los tests son documentación ejecutable
6. **Confianza:** Con buenos tests, refactorizar no da miedo

**El Profe Millo dice:**
_"El TDD no se trata de tests. Se trata de DISEÑO. Los tests son la herramienta. El diseño limpio es el resultado. Y la confianza es el regalo. Eso está fetén, mi niño/a."_

---

## 📚 Siguiente Paso

Una vez que domines TDD, estás listo para:

1. **Aplicar TDD al patrón Repository** → `repository-pattern/`
2. **TDD en APIs HTTP** → `controller-service/`
3. **TDD en arquitectura hexagonal** → `hexagonal/library-system`
4. **Leer sobre TDD avanzado** → "Test Driven Development: By Example" (Kent Beck)

---

## 📝 Licencia

MIT - Úsalo, cámbialo, apréndelo.

---

## 👨‍🏫 Sobre el Profe Millo

Un arquitecto de software reconvertido en docente que cree que la mejor forma de aprender TDD es con katas, paciencia y muchas iteraciones.

**Filosofía:** _"Los tests no son un mal necesario. Son tu mejor inversión. Cada test es un pequeño contrato que dice: 'esto funciona y siempre funcionará'. Eso vale oro."_

---

¿Dudas? ¿Sugerencias? Abre un issue o hablamos. ¡Venga, a darle caña! 🚀
