# Ejemplo CQRS - Sistema de Inventario

Sistema de gestión de inventario que demuestra el patrón **CQRS (Command Query Responsibility Segregation)**.

## ¿Qué es CQRS?

CQRS separa las operaciones de lectura y escritura en modelos diferentes:

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Arquitectura CQRS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         ┌───────────┐                               │
│                         │    API    │                               │
│                         └─────┬─────┘                               │
│                               │                                     │
│              ┌────────────────┴────────────────┐                    │
│              │                                 │                    │
│              ▼                                 ▼                    │
│      ┌───────────────┐                ┌───────────────┐            │
│      │   Comandos    │                │   Consultas   │            │
│      │ (POST/PUT/DEL)│                │     (GET)     │            │
│      └───────┬───────┘                └───────┬───────┘            │
│              │                                 │                    │
│              ▼                                 ▼                    │
│      ┌───────────────┐                ┌───────────────┐            │
│      │   Entidades   │                │ Modelo Lectura│            │
│      │   de Dominio  │                │    (DTOs)     │            │
│      └───────┬───────┘                └───────┬───────┘            │
│              │                                 │                    │
│              ▼                                 ▼                    │
│      ┌───────────────┐                ┌───────────────┐            │
│      │  Repositorio  │  ──Eventos──▶  │  Repositorio  │            │
│      │  de Escritura │                │  de Lectura   │            │
│      └───────────────┘                └───────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Conceptos Clave

### Comandos (Lado de Escritura)

Los comandos representan **intenciones de cambiar** el sistema:

```typescript
// Los comandos se nombran en imperativo
interface AddProductCommand {
  type: 'AddProduct';
  sku: string;
  name: string;
  initialQuantity: number;
  priceInCents: number;
}

// Los handlers procesan comandos a través de entidades de dominio
class AddProductHandler {
  async handle(command: AddProductCommand) {
    const product = Product.create({...});  // Lógica de dominio
    await this.writeRepository.save(product);  // Persistir
    return { productId: product.id };  // Respuesta mínima
  }
}
```

### Consultas (Lado de Lectura)

Las consultas representan **solicitudes de datos**:

```typescript
// Las consultas se nombran descriptivamente
interface GetProductQuery {
  type: 'GetProduct';
  productId: string;
}

// Los handlers leen directamente del almacenamiento optimizado
class GetProductHandler {
  async handle(query: GetProductQuery) {
    // ¡Sin entidades de dominio! DTO directo del almacenamiento de lectura
    return this.readRepository.findById(query.productId);
  }
}
```

### Modelos de Datos Separados

| Aspecto | Modelo de Escritura | Modelo de Lectura |
|---------|---------------------|-------------------|
| **Propósito** | Lógica de negocio e invariantes | Consultas rápidas y visualización |
| **Estructura** | Entidades ricas con comportamiento | DTOs planos |
| **Optimización** | Consistencia y validación | Rendimiento de consultas |
| **Almacenamiento** | Normalizado (generalmente relacional) | Desnormalizado (puede ser NoSQL) |

## Estructura del Proyecto

```
cqrs-example/
├── src/
│   ├── domain/
│   │   ├── entities/           # Modelo de escritura (Product)
│   │   ├── value-objects/      # ProductId, Quantity, Money, Sku
│   │   ├── events/             # Eventos de dominio
│   │   └── repositories/
│   │       ├── ProductWriteRepository.ts  # Puerto lado escritura
│   │       └── ProductReadRepository.ts   # Puerto lado lectura
│   │
│   ├── application/
│   │   ├── commands/           # Definiciones de comandos
│   │   │   ├── AddProductCommand.ts
│   │   │   ├── UpdateStockCommand.ts
│   │   │   └── handlers/       # Manejadores de comandos
│   │   │
│   │   └── queries/            # Definiciones de consultas
│   │       ├── GetProductQuery.ts
│   │       ├── ListProductsQuery.ts
│   │       └── handlers/       # Manejadores de consultas
│   │
│   └── infrastructure/
│       ├── persistence/
│       │   ├── write/          # Implementación repositorio escritura
│       │   └── read/           # Implementación repositorio lectura
│       └── api/
│           └── InventoryController.ts
```

## Beneficios de CQRS

### 1. **Rendimiento de Lectura Optimizado**
Los modelos de lectura pueden estar desnormalizados, pre-computados e indexados específicamente para consultas.

### 2. **Escalabilidad**
Los lados de lectura y escritura pueden escalar independientemente.

### 3. **Modelos más Simples**
Cada lado se enfoca en una preocupación:
- Escritura: Reglas de negocio y consistencia
- Lectura: Flexibilidad de consultas y velocidad

### 4. **Tecnologías Diferentes**
Puedes usar la mejor herramienta para cada trabajo:
- Escritura: PostgreSQL con consistencia fuerte
- Lectura: Elasticsearch para búsqueda de texto completo

## Cuándo Usar CQRS

### Buenos candidatos:
- Sistemas con patrones de lectura/escritura muy diferentes
- Alta proporción de lecturas vs escrituras
- Consultas complejas costosas en datos normalizados
- Necesidad de múltiples proyecciones de lectura

### Evitar cuando:
- Operaciones CRUD simples
- Los patrones de lectura y escritura son similares
- Pequeña escala sin preocupaciones de rendimiento

## Endpoints de la API

### Comandos (Operaciones de Escritura)

```bash
# Añadir un nuevo producto
POST /api/inventory/products
{
  "sku": "ABC-12345",
  "name": "Widget",
  "initialQuantity": 100,
  "priceInCents": 1999
}

# Aumentar stock
POST /api/inventory/products/:id/increase-stock
{ "quantity": 50, "reason": "Envío recibido" }

# Disminuir stock
POST /api/inventory/products/:id/decrease-stock
{ "quantity": 10, "reason": "Vendido" }
```

### Consultas (Operaciones de Lectura)

```bash
# Listar productos con filtros
GET /api/inventory/products?search=widget&lowStockOnly=true

# Obtener estadísticas del inventario
GET /api/inventory/statistics
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
- **event-driven-example**: Arquitectura dirigida por eventos
- **bounded-contexts-example**: Múltiples bounded contexts
