# Quickstart - Strategy Pattern

## 1. Instalar y ejecutar

```bash
cd patterns/strategy
npm install
npm run dev
```

Deberías ver:

```
Server running on http://localhost:3000

Available endpoints:
  POST   /api/orders           → Create an order
  POST   /api/payments         → Process payment with chosen strategy
  GET    /api/payments/compare-fees?amount=100  → Compare all strategies
```

## 2. Probar la API

Abre otra terminal y ejecuta:

```bash
# 1. Crear una orden
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

# Copiar el orderId de la respuesta (ORD-...)

# 2. Pagar con Tarjeta de Crédito (2.9% + 0.30 EUR)
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1737823866729-b1234",
    "paymentMethod": "creditcard",
    "customerEmail": "customer@example.com"
  }'

# 3. Crear otra orden
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-456",
    "items": [{
      "productId": "mouse-001",
      "productName": "Magic Mouse",
      "quantity": 2,
      "unitPrice": 79.99
    }]
  }'

# 4. Pagar con PayPal (3.4% + 0.35 EUR)
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-...",
    "paymentMethod": "paypal",
    "customerEmail": "customer@example.com"
  }'

# 5. Pagar con Crypto (1% - mínimo 10 EUR)
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-...",
    "paymentMethod": "crypto",
    "customerEmail": "customer@example.com"
  }'

# 6. Comparar comisiones para un monto específico
curl "http://localhost:3000/api/payments/compare-fees?amount=1000"
```

## 3. Ejecutar tests

```bash
# Todos los tests
npm test

# En modo watch
npm run test:watch

# Con coverage
npm run test:coverage
```

## 4. Leer el código

Sigue este orden para entender el patrón:

### Dominio (las estrategias)
1. `src/domain/strategies/PaymentStrategy.ts` - Interface base
2. `src/domain/strategies/CreditCardStrategy.ts` - Estrategia concreta (tarjeta)
3. `src/domain/strategies/PayPalStrategy.ts` - Estrategia concreta (PayPal)
4. `src/domain/strategies/CryptoStrategy.ts` - Estrategia concreta (crypto)
5. `src/domain/strategies/BankTransferStrategy.ts` - Estrategia concreta (transferencia)
6. `src/domain/services/PaymentProcessor.ts` - El CONTEXTO que usa las estrategias

### Aplicación (casos de uso)
7. `src/application/use-cases/PayOrderUseCase.ts` - Caso de uso que selecciona la estrategia
8. `src/application/dtos/PaymentDTO.ts` - DTOs

### Infraestructura
9. `src/infrastructure/http/PaymentController.ts` - REST controller
10. `src/infrastructure/http/routes.ts` - Rutas

## 5. Conceptos clave a observar

### Strategy Interface
```typescript
// Todas las estrategias implementan este contrato
interface PaymentStrategy {
  readonly name: string;
  processPayment(details: PaymentDetails): Promise<PaymentResult>;
  validatePaymentDetails(details: PaymentDetails): boolean;
  calculateFee(amount: Money): Money;
}
```

### Estrategias Concretas
```typescript
// Cada estrategia encapsula SU algoritmo
class CreditCardStrategy implements PaymentStrategy {
  name = 'CreditCard';

  calculateFee(amount: Money): Money {
    return amount.multiply(0.029).add(Money.create(0.30));
  }

  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    // Lógica específica de tarjeta...
  }
}

class PayPalStrategy implements PaymentStrategy {
  name = 'PayPal';

  calculateFee(amount: Money): Money {
    return amount.multiply(0.034).add(Money.create(0.35));
  }

  // Lógica diferente pero misma interfaz
}
```

### Contexto (PaymentProcessor)
```typescript
// El objeto que usa las estrategias
class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  // Cambiar estrategia dinámicamente
  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  // Delegar a la estrategia actual
  processPayment(details: PaymentDetails): Promise<PaymentResult> {
    return this.strategy.processPayment(details);
  }
}
```

### Uso en Casos de Uso
```typescript
// Seleccionar estrategia basada en input del usuario
const strategy = this.strategies.get(dto.paymentMethod);
const processor = new PaymentProcessor(strategy);
const result = await processor.processPayment(details);
```

## 6. Comparación de Estrategias

Para un pago de **100 EUR**:

| Estrategia    | Comisión | % del total | Velocidad |
|---------------|----------|-------------|-----------|
| BankTransfer  | 1.00 €   | 1.00%       | 1-3 días  |
| Crypto        | 1.00 €   | 1.00%       | 5-10 min  |
| CreditCard    | 3.20 €   | 3.20%       | Instant   |
| PayPal        | 3.75 €   | 3.75%       | Instant   |

Para un pago de **10,000 EUR**:

| Estrategia    | Comisión  | % del total | Velocidad |
|---------------|-----------|-------------|-----------|
| BankTransfer  | 1.00 €    | 0.01%       | 1-3 días  |
| Crypto        | 100.00 €  | 1.00%       | 5-10 min  |
| CreditCard    | 290.30 €  | 2.90%       | Instant   |
| PayPal        | 340.35 €  | 3.40%       | Instant   |

**Observación:** La estrategia óptima depende del contexto (monto, urgencia, preferencias).

## 7. Experimentar

Ideas para practicar:

1. **Añadir nueva estrategia:** `ApplePayStrategy` con comisión 1.5% + 0.20 EUR
2. **Smart Selector:** Crear una función que seleccione automáticamente la estrategia más barata según el monto
3. **Fallback Strategy:** Intentar con una estrategia, si falla usar otra
4. **Logging Decorator:** Añadir logs a cualquier estrategia sin modificarla

## 8. Testing

Observa cómo cada estrategia se testea aisladamente:

```typescript
describe('CreditCardStrategy', () => {
  it('should calculate fee correctly', () => {
    const strategy = new CreditCardStrategy();
    const fee = strategy.calculateFee(Money.create(100));
    expect(fee.amount).toBeCloseTo(3.20, 2);
  });
});
```

Esto es imposible con un if/else gigante.

## 9. Siguiente paso

Una vez domines este patrón:

→ **[Library System](../../hexagonal/library-system)** - Arquitectura Hexagonal completa

¡A darle caña!
