# Strategy Pattern - Algoritmos Intercambiables 🎯

Bienvenido, mi niño. Este proyecto te va a enseñar el **Strategy Pattern**, uno de los patrones de diseño más potentes y elegantes que existen. Te permite encapsular algoritmos relacionados en objetos separados y cambiar entre ellos en tiempo de ejecución.

## ¿Qué vas a aprender?

Imagínate que tienes un e-commerce que acepta múltiples métodos de pago:
- Tarjeta de crédito (rápida, comisión moderada)
- PayPal (rápida, comisión alta)
- Criptomonedas (lenta, comisión baja)
- Transferencia bancaria (muy lenta, comisión fija)

Cada método tiene su propia lógica, sus propias comisiones, sus propias validaciones. Sin el Strategy Pattern, acabas con un método lleno de if/else que es un infierno de mantener.

### Conceptos clave que dominarás

1. **Strategy (Estrategia)** - Un algoritmo encapsulado en un objeto
2. **Context (Contexto)** - El objeto que usa las estrategias
3. **Runtime Switching** - Cambiar de algoritmo dinámicamente
4. **Open/Closed Principle** - Extender sin modificar
5. **Polimorfismo** - Diferentes implementaciones, misma interfaz

## El Problema

### Sin Strategy Pattern ❌

Mira tú, esto es lo que NO queremos:

```typescript
class PaymentService {
  processPayment(method: string, amount: number): PaymentResult {
    if (method === 'creditcard') {
      // Validar tarjeta
      if (!this.isValidCard()) return fail();

      // Calcular comisión 2.9% + 0.30
      const fee = amount * 0.029 + 0.30;

      // Llamar API de Stripe
      const result = await stripe.charge(amount + fee);

      // Generar ID de transacción
      return { transactionId: `CC-${Date.now()}`, ... };

    } else if (method === 'paypal') {
      // Validar cuenta PayPal
      if (!this.isValidPayPal()) return fail();

      // Calcular comisión 3.4% + 0.35
      const fee = amount * 0.034 + 0.35;

      // OAuth con PayPal
      const token = await paypal.auth();

      // Procesar pago
      const result = await paypal.charge(token, amount + fee);

      return { transactionId: `PP-${Date.now()}`, ... };

    } else if (method === 'crypto') {
      // Validar wallet
      if (!this.isValidWallet()) return fail();

      // Calcular comisión 1%
      const fee = amount * 0.01;

      // Enviar a blockchain
      const txHash = await blockchain.sendTransaction(amount + fee);

      // Esperar confirmaciones
      await this.waitForConfirmations(txHash, 3);

      return { transactionId: txHash, ... };

    } else if (method === 'banktransfer') {
      // ... más código ...
    }
    // Y esto sigue creciendo con cada nuevo método...
  }
}
```

**Problemas:**
- Viola **Open/Closed Principle**: Para añadir un método, modificas esta clase
- Viola **Single Responsibility**: Esta clase conoce TODOS los métodos de pago
- **Difícil de testear**: No puedes testear cada método aisladamente
- **Duplicación de código**: Validaciones y lógica repetidas
- **Difícil de leer**: Un método gigante con lógica mezclada
- **Acoplamiento**: Cambiar un método puede romper otros

### Con Strategy Pattern ✅

Ahora mira esto, mi niño:

```typescript
// 1. INTERFACE - Define el contrato
interface PaymentStrategy {
  name: string;
  processPayment(details: PaymentDetails): Promise<PaymentResult>;
  validatePaymentDetails(details: PaymentDetails): boolean;
  calculateFee(amount: Money): Money;
}

// 2. ESTRATEGIAS CONCRETAS - Cada una con su algoritmo
class CreditCardStrategy implements PaymentStrategy {
  name = 'CreditCard';

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    // Solo lógica de tarjeta
    const fee = this.calculateFee(details.amount);
    // ...
  }

  calculateFee(amount: Money): Money {
    return amount.multiply(0.029).add(Money.create(0.30));
  }
}

class PayPalStrategy implements PaymentStrategy {
  name = 'PayPal';

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    // Solo lógica de PayPal
    // ...
  }

  calculateFee(amount: Money): Money {
    return amount.multiply(0.034).add(Money.create(0.35));
  }
}

// 3. CONTEXTO - Usa las estrategias
class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  // Cambiar estrategia en runtime
  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  // Delegar a la estrategia actual
  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    return this.strategy.processPayment(details);
  }
}

// 4. USO - Limpio y expresivo
const processor = new PaymentProcessor(new CreditCardStrategy());
const result = await processor.processPayment(details);

// Cambiar de algoritmo dinámicamente
processor.setStrategy(new PayPalStrategy());
const result2 = await processor.processPayment(details);
```

**Ventajas:**
- ✅ Cada estrategia es una clase pequeña y enfocada
- ✅ Añadir un método nuevo no toca código existente
- ✅ Cada estrategia se testea aisladamente
- ✅ El código del cliente es limpio y expresivo
- ✅ Fácil comparar algoritmos
- ✅ Cambiar de algoritmo en runtime

## Arquitectura - El Patrón en Detalle

```
┌─────────────────────────────────────────────────────────────┐
│                    STRATEGY PATTERN                         │
└─────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────┐
         │   <<interface>>                  │
         │   PaymentStrategy                │
         ├──────────────────────────────────┤
         │ + processPayment()               │
         │ + validatePaymentDetails()       │
         │ + calculateFee()                 │
         └──────────────────────────────────┘
                       △
                       │ implements
          ┌────────────┼────────────┬────────────┐
          │            │            │            │
┌─────────┴─────┐  ┌──┴───────┐  ┌─┴──────────┐ ┌┴──────────────┐
│ CreditCard    │  │ PayPal   │  │ Crypto     │ │ BankTransfer  │
│ Strategy      │  │ Strategy │  │ Strategy   │ │ Strategy      │
├───────────────┤  ├──────────┤  ├────────────┤ ├───────────────┤
│ 2.9% + 0.30€  │  │ 3.4% +   │  │ 1%         │ │ 1€ fijo       │
│ Instant       │  │ 0.35€    │  │ Slow       │ │ 1-3 días      │
│ High success  │  │ Instant  │  │ Min 10€    │ │ Min 50€       │
└───────────────┘  └──────────┘  └────────────┘ └───────────────┘
                              △
                              │ uses
                   ┌──────────┴──────────┐
                   │  PaymentProcessor   │
                   │    (CONTEXT)        │
                   ├─────────────────────┤
                   │ - strategy          │
                   ├─────────────────────┤
                   │ + setStrategy()     │
                   │ + processPayment()  │
                   └─────────────────────┘
```

### Componentes del Patrón

#### 1. Strategy Interface

Define el contrato que todas las estrategias deben cumplir:

```typescript
export interface PaymentStrategy {
  readonly name: string;
  processPayment(details: PaymentDetails): Promise<PaymentResult>;
  validatePaymentDetails(details: PaymentDetails): boolean;
  calculateFee(amount: Money): Money;
}
```

**La clave:** Todas las estrategias implementan esta interfaz, garantizando intercambiabilidad.

#### 2. Concrete Strategies

Cada estrategia implementa su propio algoritmo:

```typescript
export class CreditCardStrategy implements PaymentStrategy {
  readonly name = 'CreditCard';
  private readonly PERCENTAGE_FEE = 0.029;
  private readonly FIXED_FEE = 0.30;

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    // 1. Validar
    if (!this.validatePaymentDetails(details)) {
      return { success: false, ... };
    }

    // 2. Simular llamada a pasarela (Stripe, etc.)
    await this.simulateExternalCall();

    // 3. Calcular comisión
    const fee = this.calculateFee(details.amount);

    // 4. Procesar
    const transactionId = this.generateTransactionId();

    return {
      success: true,
      transactionId,
      fee,
      ...
    };
  }

  calculateFee(amount: Money): Money {
    const percentageFee = amount.amount * this.PERCENTAGE_FEE;
    return Money.create(percentageFee + this.FIXED_FEE);
  }
}
```

#### 3. Context

El objeto que usa las estrategias:

```typescript
export class PaymentProcessor {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    // Delegar a la estrategia actual
    return this.strategy.processPayment(details);
  }

  calculateFee(amount: Money): Money {
    return this.strategy.calculateFee(amount);
  }
}
```

**Lo importante:** El contexto NO conoce qué estrategia específica está usando, solo que cumple el contrato.

## Estructura de Carpetas

```
src/
├── domain/                                 # 🎯 EL NÚCLEO
│   ├── entities/
│   │   └── Order.ts                        # Entidad Order
│   │
│   ├── value-objects/
│   │   ├── Money.ts                        # Value Object Money
│   │   └── OrderId.ts                      # Value Object OrderId
│   │
│   ├── strategies/                         # ⭐ ESTRATEGIAS
│   │   ├── PaymentStrategy.ts              # Interface base
│   │   ├── CreditCardStrategy.ts           # Estrategia tarjeta
│   │   ├── PayPalStrategy.ts               # Estrategia PayPal
│   │   ├── CryptoStrategy.ts               # Estrategia Crypto
│   │   └── BankTransferStrategy.ts         # Estrategia transferencia
│   │
│   └── services/
│       └── PaymentProcessor.ts             # ⭐ CONTEXTO
│
├── application/                            # Casos de Uso
│   ├── use-cases/
│   │   ├── CreateOrderUseCase.ts           # Crear orden
│   │   └── PayOrderUseCase.ts              # Pagar orden (usa Strategy)
│   │
│   └── dtos/
│       ├── CreateOrderDTO.ts
│       └── PaymentDTO.ts
│
└── infrastructure/                         # Adaptadores
    └── http/
        ├── PaymentController.ts            # REST controller
        ├── routes.ts
        └── index.ts                        # Express app
```

## Las 4 Estrategias Implementadas

### 1. CreditCardStrategy - Tarjeta de Crédito

```typescript
- Comisión: 2.9% + 0.30 EUR
- Velocidad: Instantánea (100-300ms)
- Tasa de éxito: 90%
- Ideal para: Compras pequeñas y medianas
- Validación: Email básico
```

**Caso de uso:** E-commerce estándar, pagos rápidos.

### 2. PayPalStrategy - PayPal

```typescript
- Comisión: 3.4% + 0.35 EUR (más cara)
- Velocidad: Moderada (200-500ms, incluye OAuth)
- Tasa de éxito: 85%
- Ideal para: Usuarios que prefieren PayPal
- Validación: Email estricto (formato completo)
```

**Caso de uso:** Usuarios sin tarjeta, pagos internacionales.

### 3. CryptoStrategy - Criptomonedas

```typescript
- Comisión: 1% (la más barata porcentual)
- Velocidad: Lenta (requiere 3 confirmaciones blockchain)
- Tasa de éxito: 95%
- Mínimo: 10 EUR
- Ideal para: Montos medianos-grandes, usuarios crypto
```

**Caso de uso:** Pagos de alto valor, usuarios tech-savvy.

### 4. BankTransferStrategy - Transferencia Bancaria

```typescript
- Comisión: 1 EUR fijo (la mejor para montos grandes)
- Velocidad: Muy lenta (1-3 días hábiles)
- Tasa de éxito: 95%
- Mínimo: 50 EUR
- Ideal para: Montos muy grandes (>5000 EUR)
```

**Caso de uso:** Pagos B2B, compras de alto valor.

## Comparación de Comisiones

Para un pago de **100 EUR**:

| Estrategia    | Comisión | % del total |
|---------------|----------|-------------|
| BankTransfer  | 1.00 €   | 1.00%       |
| Crypto        | 1.00 €   | 1.00%       |
| CreditCard    | 3.20 €   | 3.20%       |
| PayPal        | 3.75 €   | 3.75%       |

Para un pago de **10,000 EUR**:

| Estrategia    | Comisión  | % del total |
|---------------|-----------|-------------|
| BankTransfer  | 1.00 €    | 0.01%       |
| Crypto        | 100.00 €  | 1.00%       |
| CreditCard    | 290.30 €  | 2.90%       |
| PayPal        | 340.35 €  | 3.40%       |

**Conclusión:** La estrategia óptima depende del contexto (monto, urgencia, preferencias).

## Uso en Casos de Uso Reales

### Ejemplo 1: Selección Manual de Estrategia

```typescript
export class PayOrderUseCase {
  private strategies: Map<string, PaymentStrategy>;

  constructor() {
    // Registrar estrategias disponibles
    this.strategies = new Map([
      ['creditcard', new CreditCardStrategy()],
      ['paypal', new PayPalStrategy()],
      ['crypto', new CryptoStrategy()],
      ['banktransfer', new BankTransferStrategy()]
    ]);
  }

  async execute(dto: ProcessPaymentDTO): Promise<PaymentResponseDTO> {
    // 1. Obtener orden
    const order = await this.getOrder(dto.orderId);

    // 2. Seleccionar estrategia basada en input del usuario
    const strategy = this.strategies.get(dto.paymentMethod);
    if (!strategy) {
      throw new Error('Payment method not supported');
    }

    // 3. Crear procesador con la estrategia
    const processor = new PaymentProcessor(strategy);

    // 4. Procesar pago
    const result = await processor.processPayment({
      orderId: dto.orderId,
      amount: order.calculateTotal(),
      customerEmail: dto.customerEmail
    });

    // 5. Actualizar orden
    if (result.success) {
      order.markAsPaid(strategy.name);
    }

    return result;
  }
}
```

### Ejemplo 2: Selección Automática de Estrategia

```typescript
class SmartPaymentSelector {
  selectOptimalStrategy(amount: Money, urgency: 'low' | 'medium' | 'high'): PaymentStrategy {
    // Urgencia alta: tarjeta (rápida aunque cara)
    if (urgency === 'high') {
      return new CreditCardStrategy();
    }

    // Montos grandes + baja urgencia: transferencia (barata)
    if (amount.amount > 5000 && urgency === 'low') {
      return new BankTransferStrategy();
    }

    // Montos medianos + baja urgencia: crypto (barata)
    if (amount.amount >= 10 && urgency === 'low') {
      return new CryptoStrategy();
    }

    // Por defecto: tarjeta
    return new CreditCardStrategy();
  }
}
```

### Ejemplo 3: Fallback entre Estrategias

```typescript
class PaymentWithFallback {
  private strategies: PaymentStrategy[] = [
    new CreditCardStrategy(),
    new PayPalStrategy(),
    new CreditCardStrategy() // Reintentar
  ];

  async processWithFallback(details: PaymentDetails): Promise<PaymentResult> {
    let lastError: Error | null = null;

    for (const strategy of this.strategies) {
      try {
        const processor = new PaymentProcessor(strategy);
        const result = await processor.processPayment(details);

        if (result.success) {
          console.log(`Payment successful with ${strategy.name}`);
          return result;
        }

        console.log(`Payment failed with ${strategy.name}, trying next...`);
      } catch (error) {
        lastError = error as Error;
        console.error(`Error with ${strategy.name}:`, error);
      }
    }

    throw new Error(`All payment methods failed. Last error: ${lastError?.message}`);
  }
}
```

## Ventajas y Desventajas

### ✅ Ventajas

1. **Open/Closed Principle**
   - Añadir nuevas estrategias no modifica código existente
   - Solo creas una nueva clase que implementa la interfaz

2. **Single Responsibility**
   - Cada estrategia tiene una sola razón para cambiar
   - El contexto no conoce detalles de implementación

3. **Testeable**
   - Cada estrategia se testea aisladamente
   - Fácil hacer mocks de estrategias en tests

4. **Expresivo**
   - El código se lee como lenguaje de negocio
   - `processor.setStrategy(new PayPalStrategy())` es auto-explicativo

5. **Composición sobre Herencia**
   - Las estrategias se componen, no se heredan
   - Más flexible que jerarquías de clases

6. **Runtime Switching**
   - Cambiar de algoritmo en tiempo de ejecución
   - Útil para A/B testing, feature flags, etc.

### ⚠️ Desventajas

1. **Más clases**
   - Cada estrategia es una clase
   - Puede parecer excesivo para casos simples

2. **El cliente debe conocer las estrategias**
   - El código que usa el patrón debe saber qué estrategias existen
   - Puede mitigarse con un Factory o Registry

3. **Overhead**
   - Para 2-3 casos simples, un if/else puede ser suficiente
   - El patrón brilla con 4+ algoritmos o complejidad alta

4. **Comunicación entre Contexto y Estrategia**
   - Deben compartir datos a través de la interfaz
   - A veces requiere pasar muchos parámetros

## ¿Cuándo Usar el Strategy Pattern?

### ✅ Úsalo cuando:

- Tienes **múltiples algoritmos** para la misma tarea (4+)
- Los algoritmos son **complejos** y merecen su propia clase
- Necesitas **cambiar de algoritmo** en runtime
- Quieres **comparar** algoritmos fácilmente
- El código tiene **if/else o switch** que crece constantemente
- Quieres **testear algoritmos** aisladamente

### ❌ No lo uses cuando:

- Solo tienes **2-3 casos simples** que caben en un if/else
- Los algoritmos son **triviales** (1-2 líneas)
- Nunca cambias de algoritmo
- El equipo no está familiarizado con el patrón

## Comparación con Otros Patrones

### vs State Pattern

```typescript
// STRATEGY: Elige entre algoritmos
const processor = new PaymentProcessor(new CreditCardStrategy());
processor.processPayment(details);

// STATE: El objeto cambia su comportamiento según su estado interno
const order = new Order();
order.submit(); // Estado: Submitted
order.pay();    // Estado: Paid (comportamiento cambia automáticamente)
```

**Diferencia clave:**
- **Strategy:** El cliente elige la estrategia explícitamente
- **State:** El objeto cambia de estado (y comportamiento) automáticamente

### vs Command Pattern

```typescript
// STRATEGY: Encapsula algoritmos
const strategy = new CreditCardStrategy();
strategy.processPayment(details);

// COMMAND: Encapsula peticiones/acciones
const command = new ProcessPaymentCommand(orderId, amount);
commandBus.execute(command);
```

**Diferencia clave:**
- **Strategy:** Enfocado en algoritmos intercambiables
- **Command:** Enfocado en acciones/peticiones encapsuladas

### vs Simple Polymorphism

```typescript
// STRATEGY PATTERN: Contexto + Estrategias intercambiables
const processor = new PaymentProcessor(new PayPalStrategy());
processor.setStrategy(new CryptoStrategy()); // Cambio dinámico

// POLIMORFISMO SIMPLE: Solo interfaces
const strategy: PaymentStrategy = new PayPalStrategy();
strategy.processPayment(details);
```

**Diferencia clave:**
- **Strategy:** Incluye el contexto que gestiona estrategias
- **Polimorfismo:** Solo usar interfaces/clases polimórficas

## Testing de Estrategias

Una de las grandes ventajas es lo fácil que es testear:

```typescript
describe('CreditCardStrategy', () => {
  const strategy = new CreditCardStrategy();

  it('should calculate fee correctly', () => {
    const amount = Money.create(100);
    const fee = strategy.calculateFee(amount);

    expect(fee.amount).toBeCloseTo(3.20, 2); // 2.9% + 0.30
  });

  it('should validate payment details', () => {
    const validDetails = {
      orderId: 'ORD-001',
      amount: Money.create(50),
      customerEmail: 'test@example.com'
    };

    expect(strategy.validatePaymentDetails(validDetails)).toBe(true);
  });

  it('should reject negative amounts', () => {
    const invalidDetails = {
      orderId: 'ORD-001',
      amount: Money.create(-10),
      customerEmail: 'test@example.com'
    };

    expect(strategy.validatePaymentDetails(invalidDetails)).toBe(false);
  });
});

describe('PaymentProcessor', () => {
  it('should switch strategies dynamically', () => {
    const processor = new PaymentProcessor(new CreditCardStrategy());

    expect(processor.getCurrentStrategyName()).toBe('CreditCard');

    processor.setStrategy(new PayPalStrategy());

    expect(processor.getCurrentStrategyName()).toBe('PayPal');
  });
});
```

## API REST - Probando el Patrón

### 1. Crear Orden

```bash
POST /api/orders
Content-Type: application/json

{
  "customerId": "customer-123",
  "items": [
    {
      "productId": "prod-1",
      "productName": "Laptop",
      "quantity": 1,
      "unitPrice": 999.99
    }
  ]
}
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "id": "ORD-1234567890-abc",
    "customerId": "customer-123",
    "total": 999.99,
    "currency": "EUR",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 2. Pagar con Tarjeta

```bash
POST /api/payments
Content-Type: application/json

{
  "orderId": "ORD-1234567890-abc",
  "paymentMethod": "creditcard",
  "customerEmail": "customer@example.com"
}
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "success": true,
    "transactionId": "CC-1234567890-ABCDEF",
    "message": "Payment processed successfully via CreditCard",
    "processedAt": "2024-01-15T10:01:00.000Z",
    "fee": {
      "amount": 29.30,
      "currency": "EUR"
    },
    "orderId": "ORD-1234567890-abc",
    "paymentMethod": "CreditCard"
  }
}
```

### 3. Comparar Comisiones

```bash
GET /api/payments/compare-fees?amount=100
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "amount": 100,
    "currency": "EUR",
    "fees": [
      { "method": "banktransfer", "fee": 1.00, "percentage": "1.00%" },
      { "method": "crypto", "fee": 1.00, "percentage": "1.00%" },
      { "method": "creditcard", "fee": 3.20, "percentage": "3.20%" },
      { "method": "paypal", "fee": 3.75, "percentage": "3.75%" }
    ]
  }
}
```

## Ejercicios Prácticos

### Ejercicio 1: Nueva Estrategia

Implementa `ApplePayStrategy`:
- Comisión: 1.5% + 0.20 EUR
- Validación: requiere Apple device token
- Transacción instantánea

### Ejercicio 2: Estrategia con Descuento

Crea `LoyaltyCardStrategy`:
- Sin comisión para clientes premium
- Comisión normal para otros
- Validar tarjeta de fidelidad

### Ejercicio 3: Smart Selector

Implementa un selector automático:
- Urgencia alta → CreditCard
- Monto > 5000 → BankTransfer
- Usuario crypto → CryptoStrategy
- Por defecto → más barata

### Ejercicio 4: Composite Strategy

Combina estrategias:
- Intenta Crypto primero (más barata)
- Si falla, fallback a CreditCard
- Registra todos los intentos

## Preguntas Frecuentes

### ¿Cuándo usar Strategy vs Simple if/else?

**Usa if/else si:**
- 2-3 casos simples
- Lógica de 1-2 líneas por caso
- No cambia frecuentemente

**Usa Strategy si:**
- 4+ algoritmos complejos
- Cada algoritmo tiene múltiples pasos
- Añades algoritmos frecuentemente
- Necesitas testear aisladamente

### ¿Cómo evito que el cliente conozca todas las estrategias?

Usa un **Factory** o **Registry**:

```typescript
class PaymentStrategyFactory {
  private strategies = new Map<string, PaymentStrategy>();

  register(name: string, strategy: PaymentStrategy): void {
    this.strategies.set(name, strategy);
  }

  create(name: string): PaymentStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) throw new Error(`Unknown strategy: ${name}`);
    return strategy;
  }
}
```

### ¿Puedo combinar Strategy con otros patrones?

Sí, absolutamente:

- **Strategy + Factory:** Factory crea las estrategias
- **Strategy + Dependency Injection:** Inyectar estrategias desde configuración
- **Strategy + Decorator:** Decorar estrategias con logging, retry, etc.
- **Strategy + Template Method:** Estrategias que comparten pasos comunes

### ¿Strategy vs Function Parameters?

En lenguajes con first-class functions (JS/TS), podrías pasar funciones:

```typescript
// Con funciones
function processPayment(
  amount: number,
  processor: (amount: number) => PaymentResult
): PaymentResult {
  return processor(amount);
}

// Con Strategy Pattern
const processor = new PaymentProcessor(new CreditCardStrategy());
processor.processPayment(details);
```

**Strategy Pattern gana cuando:**
- Los algoritmos tienen estado
- Necesitas métodos adicionales (validate, calculateFee, etc.)
- Quieres encapsular múltiples métodos relacionados
- Necesitas polimorfismo robusto

## Recursos Adicionales

- **Libro**: "Design Patterns" - Gang of Four (Capítulo Strategy)
- **Libro**: "Head First Design Patterns" (Capítulo 1 - ¡Empieza con Strategy!)
- **Artículo**: "Strategy Pattern" - Refactoring Guru

## Conclusión

El Strategy Pattern es como tener un equipo de especialistas, mi niño. Cada estrategia es un experto en su algoritmo. El contexto (PaymentProcessor) no necesita saber CÓMO funciona cada uno, solo que todos cumplen el contrato.

Este patrón es la base de código extensible y mantenible. En vez de un método gigante lleno de if/else que crece sin control, tienes clases pequeñas, enfocadas y testeables.

La próxima vez que veas un switch/case que maneja diferentes algoritmos, pregúntate: ¿No sería esto más limpio con Strategy Pattern?

**La regla de oro:** Si tienes múltiples formas de hacer lo mismo, encapsúlalas en estrategias.

¡Venga, a darle caña con las estrategias!

---

**Profe Millo**
_"Los buenos arquitectos no escriben if/else gigantes, escriben estrategias intercambiables"_
