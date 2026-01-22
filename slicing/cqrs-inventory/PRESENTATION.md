# 🎓 Presentación: CQRS

> **Una guía para presentar este proyecto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar CQRS (Command Query Responsibility Segregation): separar modelos de lectura y escritura.

### Duración Recomendada
- **Express (45 min)**: Conceptos + demo
- **Estándar (1.5 horas)**: Conceptos + código + discusión
- **Completo (3 horas)**: Workshop implementando CQRS

### Prerrequisitos
- Arquitectura Hexagonal
- Event-Driven Architecture

---

## 🎤 Estructura Sugerida

### 1. Introducción (10 min)

**Pregunta inicial:** "¿Usan las mismas entidades para leer y escribir?"

**El problema:**
```typescript
// Entidad rica para escritura
class Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: Money;
  stock: number;
  category: Category;
  supplier: Supplier;
  reviews: Review[];
  // ... 20+ propiedades

  updateStock(delta: number) { /* validación compleja */ }
}

// Para mostrar una lista... ¿cargo TODO esto?
async function listProducts() {
  const products = await repo.findAll();
  // Cargo reviews, supplier, category...
  // ¡Solo quería nombre y precio!
}
```

### 2. Concepto CQRS (15 min)

**Dibujar:**

```
                    ┌───────────┐
                    │    API    │
                    └─────┬─────┘
                          │
           ┌──────────────┴──────────────┐
           │                             │
           ▼                             ▼
    ┌─────────────┐               ┌─────────────┐
    │  COMANDOS   │               │  QUERIES    │
    │ (Escritura) │               │  (Lectura)  │
    └──────┬──────┘               └──────┬──────┘
           │                             │
           ▼                             ▼
    ┌─────────────┐               ┌─────────────┐
    │Write Model  │               │ Read Model  │
    │(Entidades)  │               │   (DTOs)    │
    └──────┬──────┘               └──────┬──────┘
           │                             │
           │      ┌───────────┐          │
           └─────▶│  Eventos  │─────────▶│
                  └───────────┘
           │                             │
           ▼                             ▼
    ┌─────────────┐               ┌─────────────┐
    │Write Store  │               │ Read Store  │
    │(Normalizado)│               │(Optimizado) │
    └─────────────┘               └─────────────┘
```

**Conceptos:**
1. **Command**: Intención de cambiar el sistema
2. **Query**: Solicitud de información
3. **Write Model**: Rico en lógica, validaciones
4. **Read Model**: Optimizado para queries, desnormalizado

### 3. Cuándo Usar CQRS (10 min)

**✅ USA CQRS cuando:**
- Lecturas muy diferentes a escrituras
- Necesitas escalar por separado
- Queries complejas (reportes, dashboards)
- Alto volumen de lecturas vs escrituras

**❌ NO uses CQRS cuando:**
- CRUD simple
- Lecturas y escrituras similares
- Equipo pequeño sin experiencia
- No tienes problemas de rendimiento

### 4. Demo en Vivo (20 min)

**Mostrar estructura:**
```
src/
├── write/           ← Modelo de escritura
│   ├── commands/
│   ├── domain/
│   └── handlers/
│
└── read/            ← Modelo de lectura
    ├── queries/
    ├── projections/
    └── handlers/
```

**Demo de comando:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku": "LAPTOP-001", "name": "Laptop", "price": 999}'
```

**Demo de query:**
```bash
curl http://localhost:3000/api/products/low-stock
```

"El comando va al write model. La query va al read model."

### 5. Sincronización (10 min)

**¿Cómo se sincronizan los modelos?**

```
Write Model                     Read Model
    │                               ▲
    │ ProductCreatedEvent           │
    └──────────────────────────────▶│
                                    │
    │ StockUpdatedEvent             │
    └──────────────────────────────▶│
```

"El write model emite eventos. Proyecciones actualizan el read model."

**Eventual Consistency:**
- Read model puede estar "atrasado" por milisegundos
- Para la mayoría de casos, aceptable
- Si necesitas consistencia fuerte, CQRS quizás no es la respuesta

---

## 💡 Puntos Clave

### Separación de Responsabilidades
- Write: validar, aplicar reglas de negocio
- Read: optimizar queries, denormalizar

### Escalabilidad Independiente
- Muchas más lecturas que escrituras → escala reads
- Escrituras críticas → optimiza writes

### Complejidad Añadida
- Dos modelos que mantener
- Sincronización
- Eventual consistency
- Solo vale la pena si resuelve un problema real

---

## ❓ Preguntas Frecuentes

### "¿Necesito dos bases de datos?"
No necesariamente. Puedes tener dos modelos en la misma BD. Dos BDs es una optimización posterior.

### "¿Qué pasa si el read model está desactualizado?"
Es "eventual consistency". Para la mayoría de UIs, milisegundos de retraso son aceptables. Si no es aceptable, CQRS quizás no es la solución.

### "¿Es esto Event Sourcing?"
No. CQRS = separar read/write. Event Sourcing = estado desde eventos. Frecuentemente se combinan, pero son independientes.

### "¿Cuánta complejidad añade?"
Significativa. Dos modelos, sincronización, testing más complejo. Solo úsalo si el beneficio supera el costo.

---

## 📋 Checklist

Antes:
- [ ] Proyecto ejecutándose
- [ ] Entender la diferencia write/read

Durante:
- [ ] Mostrar problema (modelo único)
- [ ] Explicar separación
- [ ] Demo comandos y queries
- [ ] Discutir cuándo usar/no usar

---

## 🏆 Mensaje Final

"CQRS no es una bala de plata. Es una herramienta para problemas específicos.

Si tus lecturas y escrituras son muy diferentes, CQRS puede simplificar.
Si son similares, CQRS solo añade complejidad.

La pregunta no es '¿debería usar CQRS?' sino '¿tengo un problema que CQRS resuelve?'

Si la respuesta es no, un modelo único está bien. No uses CQRS porque está de moda."

---

**Profe Millo**
_"No añadas complejidad sin resolver un problema real"_
