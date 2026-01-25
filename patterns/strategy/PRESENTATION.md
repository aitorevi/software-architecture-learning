# 🎓 Presentación: Strategy Pattern

> **Una guía para presentar este patrón a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar el Strategy Pattern: cómo encapsular algoritmos relacionados en objetos separados e intercambiables, eliminando condicionales complejos y mejorando la extensibilidad.

### Duración Recomendada
- **Express (30 min)**: Problema + Solución + Demo
- **Estándar (1 hora)**: Conceptos + Código + Ejercicios
- **Completo (2 horas)**: Workshop con implementación

### Prerrequisitos
- OOP básico (interfaces, polimorfismo)
- SOLID principles (deseable)

---

## 🎤 Estructura Sugerida

### 1. Introducción - El Problema (10 min)

**Pregunta inicial:** "¿Cómo manejan múltiples formas de hacer la misma cosa en sus aplicaciones?"

**Mostrar código problemático:**
```typescript
// ❌ El infierno de los if/else
class PaymentService {
  processPayment(method: string, amount: number): PaymentResult {
    if (method === 'creditcard') {
      // 30 líneas de lógica de tarjeta...
      const fee = amount * 0.029 + 0.30;
      // validar tarjeta...
      // llamar a Stripe...
      // generar ID de transacción...

    } else if (method === 'paypal') {
      // 25 líneas de lógica de PayPal...
      const fee = amount * 0.034 + 0.35;
      // OAuth con PayPal...
      // procesar pago...

    } else if (method === 'crypto') {
      // 35 líneas de lógica crypto...
      const fee = amount * 0.01;
      // enviar a blockchain...
      // esperar confirmaciones...

    } else if (method === 'banktransfer') {
      // 20 líneas más...
    }

    // Este método tiene 150+ líneas y crece con cada nuevo método de pago
  }
}
```

**Los problemas:**
1. **Viola Open/Closed**: Para añadir un método, modificas esta clase
2. **Viola Single Responsibility**: Esta clase conoce TODOS los métodos
3. **Imposible testear**: No puedes testear cada método aisladamente
4. **Duplicación**: Validaciones y lógica repetidas
5. **Ilegible**: Un método gigante con lógica mezclada
6. **Acoplamiento**: Cambiar un método puede romper otros

**Hacer la pregunta:** "¿Qué pasa cuando quieren añadir Apple Pay? ¿Google Pay? ¿Bitcoin? ¿Monero?"

### 2. La Solución - Strategy Pattern (15 min)

**Mostrar la transformación:**

```typescript
// ✅ Con Strategy Pattern

// 1. INTERFACE - El contrato
interface PaymentStrategy {
  name: string;
  processPayment(details: PaymentDetails): Promise<PaymentResult>;
  calculateFee(amount: Money): Money;
  validatePaymentDetails(details: PaymentDetails): boolean;
}

// 2. ESTRATEGIAS CONCRETAS - Cada una con su algoritmo
class CreditCardStrategy implements PaymentStrategy {
  name = 'CreditCard';

  calculateFee(amount: Money): Money {
    return amount.multiply(0.029).add(Money.create(0.30));
  }

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    // Solo lógica de tarjeta aquí
  }
}

class PayPalStrategy implements PaymentStrategy {
  name = 'PayPal';

  calculateFee(amount: Money): Money {
    return amount.multiply(0.034).add(Money.create(0.35));
  }

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    // Solo lógica de PayPal aquí
  }
}

// 3. CONTEXTO - Usa las estrategias
class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  processPayment(details: PaymentDetails): Promise<PaymentResult> {
    return this.strategy.processPayment(details);
  }
}

// 4. USO - Limpio y expresivo
const processor = new PaymentProcessor(new CreditCardStrategy());
await processor.processPayment(details);

// Cambiar algoritmo dinámicamente
processor.setStrategy(new PayPalStrategy());
await processor.processPayment(details);
```

**Ventajas inmediatas:**
- ✅ Cada estrategia: 1 clase pequeña, 1 responsabilidad
- ✅ Añadir método nuevo: crear nueva clase, no tocar código existente
- ✅ Testing: cada estrategia se testea aislada
- ✅ Legibilidad: el código se auto-documenta
- ✅ Reutilización: misma estrategia en múltiples contextos

### 3. La Anatomía del Patrón (15 min)

**Dibujar en la pizarra:**

```
┌──────────────────────────────────────────────────────┐
│                STRATEGY PATTERN                      │
└──────────────────────────────────────────────────────┘

         ┌──────────────────────────────────┐
         │   <<interface>>                  │
         │   PaymentStrategy                │
         ├──────────────────────────────────┤
         │ + processPayment()               │
         │ + calculateFee()                 │
         │ + validatePaymentDetails()       │
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

**Componentes clave:**

1. **Strategy Interface**: Define el contrato que todas las estrategias cumplen
2. **Concrete Strategies**: Cada estrategia implementa su propio algoritmo
3. **Context**: El objeto que usa las estrategias y las puede cambiar dinámicamente

**Hacer énfasis:** El contexto NO sabe qué estrategia específica está usando, solo que cumple el contrato.

### 4. Demo en Vivo (20 min)

**Paso 1: Ejecutar el proyecto**
```bash
npm run dev
```

**Paso 2: Crear una orden**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "items": [{
      "productId": "laptop-001",
      "productName": "MacBook Pro",
      "quantity": 1,
      "unitPrice": 2499.99
    }]
  }'
```

**Paso 3: Pagar con diferentes estrategias**
```bash
# Tarjeta (cara pero rápida)
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-...",
    "paymentMethod": "creditcard",
    "customerEmail": "test@example.com"
  }'

# Crypto (barata pero lenta)
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-...",
    "paymentMethod": "crypto",
    "customerEmail": "test@example.com"
  }'
```

**Paso 4: Comparar estrategias**
```bash
curl "http://localhost:3000/api/payments/compare-fees?amount=1000"
```

**Mostrar resultado:**
```json
{
  "amount": 1000,
  "fees": [
    { "method": "banktransfer", "fee": 1.00, "percentage": "0.10%" },
    { "method": "crypto", "fee": 10.00, "percentage": "1.00%" },
    { "method": "creditcard", "fee": 29.30, "percentage": "2.93%" },
    { "method": "paypal", "fee": 34.35, "percentage": "3.44%" }
  ]
}
```

**Punto clave:** "Miren cómo cada estrategia tiene su propia lógica de comisiones. Sin modificar el código cliente."

**Paso 5: Mostrar el código**

Navegar por el código en este orden:
1. `PaymentStrategy.ts` - La interface base
2. `CreditCardStrategy.ts` - Una estrategia concreta
3. `PayPalStrategy.ts` - Otra estrategia (misma interfaz, algoritmo diferente)
4. `PaymentProcessor.ts` - El contexto
5. `PayOrderUseCase.ts` - Cómo se selecciona la estrategia

**Hacer pausa:** "¿Qué pasaría si queremos añadir Apple Pay?"

**Respuesta:** "Solo crear `ApplePayStrategy.ts`. Sin tocar código existente."

### 5. Casos de Uso Reales (15 min)

**Ejemplo 1: Selección Manual**

```typescript
// El usuario elige explícitamente
const strategy = strategies.get(dto.paymentMethod);
const processor = new PaymentProcessor(strategy);
const result = await processor.processPayment(details);
```

**Ejemplo 2: Selección Automática**

```typescript
// Smart selector basado en contexto
class SmartPaymentSelector {
  selectOptimal(amount: Money, urgency: 'low' | 'high'): PaymentStrategy {
    // Urgencia alta: tarjeta (rápida aunque cara)
    if (urgency === 'high') {
      return new CreditCardStrategy();
    }

    // Montos grandes + baja urgencia: transferencia (barata)
    if (amount.amount > 5000) {
      return new BankTransferStrategy();
    }

    // Montos medianos: crypto (barata y moderada)
    if (amount.amount >= 10) {
      return new CryptoStrategy();
    }

    return new CreditCardStrategy();
  }
}
```

**Ejemplo 3: Fallback Strategy**

```typescript
// Intentar con varias estrategias hasta que una funcione
class PaymentWithFallback {
  private strategies = [
    new CreditCardStrategy(),
    new PayPalStrategy(),
    new CryptoStrategy()
  ];

  async processWithFallback(details: PaymentDetails): Promise<PaymentResult> {
    for (const strategy of this.strategies) {
      try {
        const processor = new PaymentProcessor(strategy);
        const result = await processor.processPayment(details);

        if (result.success) {
          console.log(`Success with ${strategy.name}`);
          return result;
        }
      } catch (error) {
        console.log(`Failed with ${strategy.name}, trying next...`);
      }
    }

    throw new Error('All payment methods failed');
  }
}
```

**Ejemplo 4: A/B Testing**

```typescript
// Cambiar estrategia según feature flag
const strategy = featureFlags.useNewPaymentGateway
  ? new NewPaymentStrategy()
  : new LegacyPaymentStrategy();

const processor = new PaymentProcessor(strategy);
```

### 6. Ventajas vs Desventajas (5 min)

**Ventajas ✅**

| Ventaja | Descripción | Ejemplo |
|---------|-------------|---------|
| **Open/Closed** | Añadir algoritmos sin modificar código | Nueva estrategia = nueva clase |
| **Single Responsibility** | Cada estrategia hace UNA cosa | CreditCardStrategy solo sabe de tarjetas |
| **Testeable** | Cada estrategia se testea aislada | `expect(strategy.calculateFee(100)).toBe(3.20)` |
| **Runtime Switching** | Cambiar algoritmo dinámicamente | `processor.setStrategy(new PayPal())` |
| **Expresivo** | El código se auto-documenta | `new CreditCardStrategy()` es claro |

**Desventajas ⚠️**

| Desventaja | Descripción | Mitigación |
|------------|-------------|------------|
| **Más clases** | Una clase por estrategia | Aceptable si cada una es compleja |
| **El cliente conoce estrategias** | Debe saber cuáles existen | Usar Factory o Registry |
| **Overhead para casos simples** | Si solo hay 2-3 casos triviales | Usar if/else simple |
| **Comunicación** | Pasar datos entre contexto y estrategia | Diseñar bien la interfaz |

### 7. Ejercicio Práctico (15 min)

**Ejercicio:**
"Implementen `ApplePayStrategy` con las siguientes características:
- Comisión: 1.5% + 0.20 EUR
- Requiere validación de Apple device token
- Procesamiento instantáneo"

**Solución:**
```typescript
export class ApplePayStrategy implements PaymentStrategy {
  readonly name = 'ApplePay';
  private readonly PERCENTAGE_FEE = 0.015;
  private readonly FIXED_FEE = 0.20;

  calculateFee(amount: Money): Money {
    const percentageFee = amount.amount * this.PERCENTAGE_FEE;
    return Money.create(percentageFee + this.FIXED_FEE);
  }

  validatePaymentDetails(details: PaymentDetails): boolean {
    return details.amount.amount > 0
        && details.customerEmail.length > 0
        && details.appleDeviceToken?.length > 0;  // Nuevo campo
  }

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    if (!this.validatePaymentDetails(details)) {
      return {
        success: false,
        message: 'Invalid payment details or missing device token'
      };
    }

    await this.simulateApplePayCall();

    return {
      success: true,
      transactionId: `AP-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      message: 'Payment processed successfully via Apple Pay',
      processedAt: new Date(),
      fee: this.calculateFee(details.amount),
      paymentMethod: this.name
    };
  }

  private async simulateApplePayCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150));
  }
}
```

**Ejercicio extra (si hay tiempo):**
"Implementen un smart selector que elija automáticamente la estrategia más barata para un monto dado."

```typescript
class CheapestPaymentSelector {
  private strategies: PaymentStrategy[] = [
    new CreditCardStrategy(),
    new PayPalStrategy(),
    new CryptoStrategy(),
    new BankTransferStrategy()
  ];

  selectCheapest(amount: Money): PaymentStrategy {
    let cheapest = this.strategies[0];
    let lowestFee = cheapest.calculateFee(amount);

    for (const strategy of this.strategies) {
      const fee = strategy.calculateFee(amount);
      if (fee.amount < lowestFee.amount) {
        cheapest = strategy;
        lowestFee = fee;
      }
    }

    return cheapest;
  }
}
```

---

## 💡 Puntos Clave

### Las Tres Ideas Centrales

1. **Encapsulación de Algoritmos**: Cada estrategia es un objeto con su propio algoritmo
2. **Intercambiabilidad**: Todas cumplen el mismo contrato, son intercambiables
3. **Composición sobre Herencia**: Las estrategias se componen, no se heredan

### ¿Cuándo Usarlo?

✅ **SÍ** cuando:
- Múltiples algoritmos para la misma tarea (4+)
- Los algoritmos son complejos (no 1-2 líneas)
- Necesitas cambiar de algoritmo en runtime
- Quieres comparar algoritmos
- Código lleno de if/else o switch que crece
- Quieres testear algoritmos aisladamente

❌ **NO** cuando:
- Solo 2-3 casos simples que caben en un if/else
- Los algoritmos son triviales (1-2 líneas)
- Nunca cambias de algoritmo
- El equipo no conoce el patrón y no hay tiempo

### Comparación Rápida

| Sin Strategy | Con Strategy |
|--------------|--------------|
| if/else gigante | Clases pequeñas |
| Difícil testear | Fácil testear |
| Viola Open/Closed | Cumple Open/Closed |
| No reutilizable | Altamente reutilizable |
| Lógica mezclada | Lógica encapsulada |
| Acoplamiento alto | Bajo acoplamiento |

---

## ❓ Preguntas Frecuentes

### "¿No es demasiado código para un simple if/else?"

Para UN caso, sí. Pero cuando tienes 5+ algoritmos complejos que crecen constantemente, Strategy Pattern reduce drásticamente la complejidad total y mejora la mantenibilidad.

### "¿Cómo evito que el cliente conozca todas las estrategias?"

Usa un **Factory** o **Registry**:

```typescript
class PaymentStrategyFactory {
  private strategies = new Map<string, PaymentStrategy>([
    ['creditcard', new CreditCardStrategy()],
    ['paypal', new PayPalStrategy()],
    ['crypto', new CryptoStrategy()]
  ]);

  create(name: string): PaymentStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) throw new Error(`Unknown strategy: ${name}`);
    return strategy;
  }
}
```

### "¿Es lo mismo que el patrón State?"

No:
- **Strategy**: El cliente elige explícitamente qué algoritmo usar
- **State**: El objeto cambia de comportamiento automáticamente según su estado interno

### "¿Puedo combinar estrategias?"

Sí, con **Decorator Pattern**:

```typescript
class LoggingPaymentStrategy implements PaymentStrategy {
  constructor(private wrapped: PaymentStrategy) {}

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    console.log(`Processing with ${this.wrapped.name}...`);
    const result = await this.wrapped.processPayment(details);
    console.log(`Result: ${result.success}`);
    return result;
  }
}

// Uso
const strategy = new LoggingPaymentStrategy(new CreditCardStrategy());
```

### "¿Strategy vs simplemente pasar funciones?"

En lenguajes con first-class functions podrías pasar funciones, pero Strategy Pattern gana cuando:
- Los algoritmos tienen estado
- Necesitas múltiples métodos relacionados
- Quieres encapsular comportamiento complejo
- Necesitas polimorfismo robusto

---

## 📋 Checklist de Presentación

**Antes:**
- [ ] Proyecto ejecutándose
- [ ] Tests pasando
- [ ] Ejemplos curl preparados
- [ ] Diagramas listos

**Durante:**
- [ ] Mostrar el problema (if/else gigante)
- [ ] Explicar la solución (estrategias)
- [ ] Demo en vivo (cambiar estrategias)
- [ ] Comparar estrategias
- [ ] Ejercicio práctico
- [ ] Casos de uso reales

**Después:**
- [ ] Compartir recursos adicionales
- [ ] Responder dudas
- [ ] Sugerir ejercicios para practicar

---

## 🏆 Mensaje Final

"El Strategy Pattern trata sobre una idea fundamental:

**Define una familia de algoritmos, encapsula cada uno en un objeto, y hazlos intercambiables.**

No es para todo. Pero cuando tu aplicación necesita múltiples formas de hacer la misma cosa, este patrón te va a cambiar la vida.

En vez de un método gigante lleno de ifs que viola todos los principios SOLID, tienes clases pequeñas, enfocadas, testeables y extensibles.

Recuerden: la próxima vez que escriban un switch/case que maneja diferentes algoritmos, pregúntense: ¿No sería esto más limpio con Strategy Pattern?

**La regla de oro:** Múltiples formas de hacer lo mismo = múltiples estrategias."

---

**Profe Millo**
_"Los buenos arquitectos no escriben if/else gigantes, escriben estrategias intercambiables"_
