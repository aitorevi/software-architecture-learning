# 🎓 Presentación: Bounded Contexts

> **Una guía para presentar este proyecto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar Bounded Contexts de DDD: fronteras conceptuales, lenguaje ubicuo, comunicación entre contextos.

### Duración Recomendada
- **Express (45 min)**: Conceptos + demo
- **Estándar (1.5 horas)**: Conceptos + código + discusión
- **Completo (3 horas)**: Workshop identificando contextos

### Prerrequisitos
- Arquitectura Hexagonal
- Event-Driven Architecture

---

## 🎤 Estructura Sugerida

### 1. Introducción (10 min)

**Pregunta inicial:** "¿Qué significa 'Producto' en su sistema?"

Respuestas típicas:
- "Tiene nombre, precio, stock..."
- "Depende... para el catálogo es una cosa, para envíos otra"

**El problema del modelo único:**
```typescript
// Un modelo gigante para todo
class Product {
  // Para catálogo
  name: string;
  description: string;
  images: Image[];

  // Para ventas
  price: Money;
  stock: number;
  discount: Discount;

  // Para envíos
  weight: Weight;
  dimensions: Dimensions;
  fragile: boolean;

  // ... 50 propiedades más
}
```

### 2. Concepto de Bounded Context (15 min)

**Dibujar:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     E-COMMERCE SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │    CATÁLOGO     │  │     VENTAS      │  │     ENVÍOS      │ │
│  │                 │  │                 │  │                 │ │
│  │  Product:       │  │  Product:       │  │  Product:       │ │
│  │  - nombre       │  │  - precio       │  │  - peso         │ │
│  │  - descripción  │  │  - stock        │  │  - dimensiones  │ │
│  │  - imágenes     │  │  - descuento    │  │  - frágil       │ │
│  │                 │  │                 │  │                 │ │
│  │  "Product" =    │  │  "Product" =    │  │  "Product" =    │ │
│  │  Info para      │  │  Info para      │  │  Info para      │ │
│  │  mostrar        │  │  vender         │  │  enviar         │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │          │
│           └────────────────────┼────────────────────┘          │
│                                ▼                               │
│           ┌────────────────────────────────────────┐           │
│           │     Integration Events Bus             │           │
│           └────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

**Conceptos:**
1. **Bounded Context**: Frontera donde un modelo tiene significado específico
2. **Lenguaje Ubicuo**: Cada contexto tiene su propio vocabulario
3. **Integration Events**: Comunicación explícita entre contextos

### 3. Lenguaje Ubicuo (10 min)

```
En CATÁLOGO:
- "Publicar producto" = hacerlo visible
- "Producto destacado" = en la homepage

En VENTAS:
- "Publicar producto" = ¿qué significa?
- "Producto destacado" = ¿qué significa?

En ENVÍOS:
- "Producto" = algo que tiene peso y dimensiones
- No le importa el nombre ni el precio
```

"Las mismas palabras, diferentes significados. Cada contexto tiene su diccionario."

### 4. Demo en Vivo (20 min)

**Mostrar estructura:**
```
src/
├── catalog-context/
│   └── domain/Product.ts    # name, description, images
│
├── sales-context/
│   └── domain/Product.ts    # price, stock, discount
│
└── shipping-context/
    └── domain/Product.ts    # weight, dimensions
```

**Demo de comunicación:**
```bash
# Crear producto en catálogo
curl -X POST http://localhost:3000/catalog/products

# Evento: ProductPublishedEvent
# Sales escucha y crea su versión
# Shipping escucha y crea su versión
```

"El catálogo publica. Ventas y Envíos escuchan y crean su propio modelo."

### 5. Context Mapping (10 min)

**Relaciones entre contextos:**

- **Conformist**: Un contexto se adapta al otro
- **Anti-Corruption Layer**: Traduce entre modelos
- **Shared Kernel**: Código compartido (con cuidado)
- **Open Host Service**: API pública para otros contextos

---

## 💡 Puntos Clave

### Cada Contexto es Autónomo
- Su propio modelo
- Su propio lenguaje
- Su propia base de datos (idealmente)

### Comunicación Explícita
- Integration Events
- APIs entre contextos
- NO compartir entidades directamente

### Identifica Contextos por Lenguaje
- Cuando la misma palabra significa cosas diferentes → contextos diferentes
- Cuando equipos diferentes usan vocabularios diferentes → contextos diferentes

---

## ❓ Preguntas Frecuentes

### "¿Cómo sé dónde poner las fronteras?"
Escucha el lenguaje. Cuando expertos de negocio usan las mismas palabras con significados diferentes, hay una frontera.

### "¿Hay duplicación de código?"
Sí, y está bien. Cada contexto tiene su Product. Prefiero duplicación a acoplamiento. Los modelos evolucionan independientemente.

### "¿Cómo mantengo consistencia?"
Eventual consistency vía eventos. Para operaciones críticas, sagas o procesos de compensación.

### "¿Es esto microservicios?"
No necesariamente. Puedes tener bounded contexts en un monolito. Microservicios es una decisión de deployment, no de diseño de dominio.

---

## 📋 Checklist

Antes:
- [ ] Proyecto ejecutándose
- [ ] Entender los tres contextos

Durante:
- [ ] Mostrar problema (modelo único)
- [ ] Explicar bounded contexts
- [ ] Mostrar diferentes modelos de Product
- [ ] Demo de comunicación vía eventos
- [ ] Discutir cómo identificar contextos

---

## 🏆 Mensaje Final

"Bounded Contexts no son sobre código. Son sobre ENTENDER el negocio.

Cada parte del negocio tiene su propia visión del mundo.
Forzar una visión única crea un modelo gigante que nadie entiende.

La pregunta correcta no es '¿cómo modelo Product?' sino '¿qué significa Product para cada parte del negocio?'

Respeta las fronteras. Acepta que la misma palabra puede significar cosas diferentes. Diseña en base al lenguaje del negocio, no a tu intuición técnica."

---

**Profe Millo**
_"Escucha el lenguaje del negocio. Las fronteras están ahí."_
