# Ejemplo de Bounded Contexts - E-Commerce

Sistema de comercio electrónico que demuestra **múltiples Bounded Contexts** comunicándose mediante eventos de integración.

## ¿Qué son los Bounded Contexts?

Los Bounded Contexts son límites explícitos dentro de un dominio donde se aplica un modelo de dominio particular. Cada contexto tiene su propio lenguaje ubicuo y modelo de dominio.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Bounded Contexts                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│   │    CATÁLOGO     │    │     VENTAS      │    │    ENVÍOS     │  │
│   │                 │    │                 │    │               │  │
│   │  Producto:      │    │  Pedido:        │    │  Envío:       │  │
│   │  - nombre       │    │  - items        │    │  - items      │  │
│   │  - descripción  │    │  - total        │    │  - dirección  │  │
│   │  - precio       │    │  - estado       │    │  - tracking   │  │
│   │  - categoría    │    │                 │    │               │  │
│   │                 │    │  ItemPedido:    │    │  (¡Sin        │  │
│   │  (¡Sin          │    │  - productId    │    │   precios!)   │  │
│   │   inventario!)  │    │  - precio(copia)│    │               │  │
│   └────────┬────────┘    └────────┬────────┘    └───────┬───────┘  │
│            │                      │                      │          │
│            ▼                      ▼                      ▼          │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │              Bus de Eventos de Integración                  │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   ¡Mismo concepto "Producto", diferentes significados!              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Conceptos Clave

### 1. Cada Contexto Tiene Su Propio Modelo

**Producto del Catálogo:**
```typescript
// Enfoque: Visualización y búsqueda
interface Product {
  name: string;
  description: string;
  price: Money;
  category: string;
}
```

**ItemPedido de Ventas:**
```typescript
// Enfoque: Transacción comercial
interface OrderItem {
  productId: string;  // ¡Solo una referencia!
  productName: string; // Cacheado al crear pedido
  unitPrice: Money;    // Capturado al crear pedido
}
```

**ItemEnvío de Envíos:**
```typescript
// Enfoque: Logística
interface ShipmentItem {
  productId: string;
  quantity: number;
  // ¡Sin precio! Envíos no le importa el dinero
}
```

### 2. Eventos de Integración para Comunicación

Los contextos se comunican mediante eventos, no llamadas directas.

### 3. Anti-Corruption Layer (ACL)

Cuando Ventas necesita información de productos, no importa el dominio de Catálogo directamente.

### 4. Shared Kernel Mínimo

Solo tipos verdaderamente universales se comparten (como Money).

## Estructura del Proyecto

```
bounded-contexts-example/
├── src/
│   ├── catalog-context/        # Catálogo de productos
│   ├── sales-context/          # Gestión de pedidos
│   ├── shipping-context/       # Gestión de envíos
│   └── shared/
│       ├── events/             # Eventos de integración
│       └── kernel/             # Tipos compartidos mínimos
```

## Mapa de Contextos

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  CATÁLOGO   │         │   VENTAS    │         │   ENVÍOS    │
│  (Upstream) │◀───ACL──│  (Core)     │───Evento─▶│(Downstream)│
└─────────────┘         └─────────────┘         └─────────────┘
```

## Endpoints de la API

```bash
# Catálogo: Crear producto
POST /api/catalog/products

# Catálogo: Listar productos
GET /api/catalog/products

# Ventas: Crear pedido
POST /api/sales/orders
```

## Comenzar

```bash
npm install
npm run dev
npm test
```

## Proyectos Relacionados

- **library-system**: Arquitectura hexagonal básica
- **vertical-slicing-example**: Organización por funcionalidades
- **cqrs-example**: Patrón CQRS
- **event-driven-example**: Arquitectura dirigida por eventos
