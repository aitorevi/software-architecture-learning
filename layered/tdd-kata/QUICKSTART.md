# Quickstart - TDD Kata

## 1. Instalar y ejecutar

```bash
cd tdd-kata
npm install
npm test
```

Deberías ver todos los tests pasando (verdes).

## 2. Modo watch (recomendado)

```bash
npm run test:watch
```

Esto ejecuta los tests automáticamente cada vez que guardas un archivo. ¡Es la forma correcta de hacer TDD!

## 3. Tu primera kata: FizzBuzz

Abre estos dos archivos lado a lado:

- `src/kata-1-fizzbuzz/fizzbuzz.ts` (el código)
- `tests/fizzbuzz.test.ts` (los tests)

Lee los comentarios. Verás el ciclo completo:

1. **RED** - Un test que falla
2. **GREEN** - Código mínimo para que pase
3. **REFACTOR** - Mejoras manteniendo tests verdes

## 4. Experimenta

**Ejercicio rápido:** Borra el código de `fizzbuzz.ts` y reimpleméntalo siguiendo los tests.

Pasos:
1. Lee el primer test
2. Escribe el código MÁS SIMPLE que lo haga pasar
3. Ve al siguiente test
4. Repite

No te adelantes. No escribas código que los tests no pidan todavía.

## 5. Continúa con las otras katas

Una vez domines FizzBuzz (15 min):

- **Kata 2:** String Calculator (25 min)
- **Kata 3:** Shopping Cart (45 min)

## 6. Para aprender más

Lee el **README_ES.md** completo para entender:
- Por qué TDD
- El mindset de test-first
- Patrones de naming
- Errores comunes

¡A darle chicha!
