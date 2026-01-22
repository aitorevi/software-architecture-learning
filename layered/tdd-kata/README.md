# 🎯 TDD Kata - Red Green Refactor

> **A step-by-step tutorial by El Profe Millo**
> _"The best code isn't the cleverest, it's the one with the best tests"_

---

## 🎯 What You'll Learn

This project teaches **Test-Driven Development (TDD)** from scratch using progressive katas. You'll learn:

1. The **Red-Green-Refactor** cycle (the essence of TDD)
2. **Test-first thinking** (thinking in tests before code)
3. The **AAA pattern** (Arrange-Act-Assert)
4. **Test naming conventions** for clear tests
5. The discipline of taking **baby steps**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode (RECOMMENDED for TDD)
npm run test:watch

# Run specific kata tests
npm run test:fizzbuzz
npm run test:string-calculator
npm run test:shopping-cart
```

---

## 📚 The 3 Katas

### Kata 1: FizzBuzz (15 min) - Easy
**Learn:** The basic Red-Green-Refactor cycle

Write a function that returns:
- "Fizz" if the number is divisible by 3
- "Buzz" if divisible by 5
- "FizzBuzz" if divisible by both 3 and 5
- The number as a string otherwise

📁 `src/kata-1-fizzbuzz/` | 🧪 `tests/fizzbuzz.test.ts`

---

### Kata 2: String Calculator (25 min) - Intermediate
**Learn:** Incremental requirements and error handling

Create a calculator that sums numbers in a string:
- `add("")` → 0
- `add("1")` → 1
- `add("1,2")` → 3
- `add("1\n2,3")` → 6
- `add("1,-2")` → Error (negatives not allowed)

📁 `src/kata-2-string-calculator/` | 🧪 `tests/string-calculator.test.ts`

---

### Kata 3: Shopping Cart (45 min) - Advanced
**Learn:** TDD with multiple classes in a real-world scenario

Implement a shopping cart with:
- Add/remove products
- Calculate total
- Apply discounts
- Validate business rules

📁 `src/kata-3-shopping-cart/` | 🧪 `tests/shopping-cart.test.ts`

---

## 🔄 The Red-Green-Refactor Cycle

```
1. ❌ RED - Write a failing test
   ↓
2. ✅ GREEN - Write minimal code to make it pass
   ↓
3. ♻️ REFACTOR - Improve code while keeping tests green
   ↓
Repeat with next test
```

**Golden Rule:** NEVER write production code without a failing test first.

---

## 📖 Documentation

- **Quick Start (5 min):** [QUICKSTART.md](./QUICKSTART.md)
- **Full Tutorial (45 min):** [README_ES.md](./README_ES.md) (Spanish)
- **Presentation Guide:** [PRESENTATION.md](./PRESENTATION.md)

---

## 💡 Key Concepts

### The AAA Pattern

Every test follows this structure:

```typescript
test('should do something specific', () => {
  // ARRANGE: Set up the scenario
  const calculator = new Calculator();

  // ACT: Execute the action
  const result = calculator.add(2, 3);

  // ASSERT: Verify the result
  assert.strictEqual(result, 5);
});
```

### Test Naming

Good tests read like documentation:

```typescript
// ✅ GOOD - Reads like a specification
test('should return Fizz when number is divisible by 3', () => {
  // ...
});

// ❌ BAD - Unclear what it tests
test('test1', () => { /* ... */ });
```

---

## 🎓 Learning Path

```
TDD Kata           ← YOU ARE HERE
     ↓
Repository Pattern (TDD + architecture)
     ↓
Controller-Service (TDD + HTTP APIs)
     ↓
Library System (TDD + hexagonal architecture)
```

---

## 📝 License

MIT - Use it, change it, learn from it.

---

## 👨‍🏫 About El Profe Millo

A software architect turned educator who believes the best way to learn TDD is through katas, patience, and many iterations.

**Philosophy:** _"Tests aren't a necessary evil. They're your best investment. Each test is a small contract that says: 'this works and will always work'. That's worth gold."_

---

For the complete Spanish tutorial, see [README_ES.md](./README_ES.md)

¡Venga, a darle caña! 🚀
