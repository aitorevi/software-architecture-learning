# Arquitectura Hexagonal - Colección Pedagógica 🎓

Buenas, mi niño. Bienvenido a esta colección de proyectos para aprender **Arquitectura Hexagonal** y patrones avanzados de arquitectura de software. Esto está to' pensado para que aprendas de verdad, paso a paso, con ejemplos reales y explicaciones que se entienden.

## ¿Qué vas a aprender?

Esta colección cubre desde lo más básico hasta lo más avanzado:

1. **Arquitectura Hexagonal básica** - Los fundamentos
2. **Vertical Slicing** - Organización por features
3. **CQRS** - Separar escrituras de lecturas
4. **Event-Driven** - Arquitectura dirigida por eventos
5. **Bounded Contexts** - Múltiples contextos delimitados (DDD)

## Los Proyectos 📚

### 1. Library System - Hexagonal Básica

**Nivel**: Principiante
**Tiempo**: 2-3 horas

Un sistema de biblioteca para aprender los fundamentos de la arquitectura hexagonal: puertos, adaptadores, dominio, aplicación e infraestructura.

```
hexagonal/
├── domain/           # El corazón - Entidades, VOs, reglas de negocio
├── application/      # Casos de uso - Orquestación
└── infrastructure/   # Adaptadores - REST, BD, servicios externos
```

**Aprenderás**:
- Qué es un puerto y un adaptador
- Cómo separar el dominio de la infraestructura
- Aggregate Roots y Value Objects
- Repositorios como puertos
- Testing del dominio sin dependencias externas

**Documentación**:
- [README Principal](./hexagonal/README_ES.md) - Guía completa del proyecto
- [Guía del Dominio](./hexagonal/src/domain/README.md) - Entidades, VOs y servicios
- [Guía de Aplicación](./hexagonal/src/application/README.md) - Casos de uso
- [Guía de Infraestructura](./hexagonal/src/infrastructure/README.md) - Adaptadores

### 2. Task Manager - Vertical Slicing

**Nivel**: Intermedio
**Tiempo**: 3-4 horas

Un gestor de tareas que muestra cómo organizar el código por **features** en lugar de por capas técnicas.

```
features/
├── tasks/       # Feature completa: domain + application + infrastructure
├── projects/    # Feature completa: domain + application + infrastructure
└── tags/        # Feature completa: domain + application + infrastructure
```

**Aprenderás**:
- Organización por capacidad de negocio vs capas técnicas
- Alta cohesión dentro de features
- Bajo acoplamiento entre features
- Comunicación entre features por IDs
- Cuándo usar vertical slicing

**Documentación**:
- [README Principal](./vertical-slicing-example/README_ES.md) - Guía completa
- [Guía de Features](./vertical-slicing-example/src/features/README.md) - Cómo organizar features

### 3. Inventory System - CQRS

**Nivel**: Intermedio-Avanzado
**Tiempo**: 4-5 horas

Un sistema de inventario que separa el **modelo de escritura** del **modelo de lectura** para optimizar cada uno.

```
application/
├── commands/     # Modifican estado (write model)
│   ├── AddProductCommand
│   └── UpdateStockCommand
└── queries/      # Solo consultan (read model)
    ├── ListProductsQuery
    └── GetLowStockQuery
```

**Aprenderás**:
- Separar comandos de queries
- Write Model vs Read Model
- Write Repository vs Read Repository
- DTOs optimizados para lectura
- Cuándo CQRS aporta valor

**Documentación**:
- [Guía Pedagógica CQRS](./cqrs-example/GUIA_PEDAGOGICA.md) - Explicación completa del patrón

### 4. Order System - Event-Driven

**Nivel**: Avanzado
**Tiempo**: 5-6 horas

Un sistema de pedidos donde los componentes se **comunican mediante eventos** en lugar de llamadas directas.

```
application/
├── use-cases/         # Crean pedidos, procesan pagos
│   └── CreateOrderUseCase → emite OrderPlacedEvent
└── event-handlers/    # Reaccionan a eventos
    ├── SendEmailHandler
    ├── UpdateInventoryHandler
    └── CreateShipmentHandler
```

**Aprenderás**:
- Domain Events
- Event Bus
- Event Handlers
- Desacoplamiento mediante eventos
- Eventual consistency
- Cuándo usar arquitectura event-driven

**Documentación**:
- [Guía Pedagógica Event-Driven](./event-driven-example/GUIA_PEDAGOGICA.md) - Todo sobre eventos

### 5. E-Commerce - Bounded Contexts

**Nivel**: Avanzado
**Tiempo**: 6-8 horas

Un e-commerce con múltiples **contextos delimitados** que se comunican entre sí pero mantienen modelos independientes.

```
src/
├── catalog-context/    # Modelo de Product para marketing
├── sales-context/      # Modelo de Product para ventas
├── shipping-context/   # No tiene Product, solo ShipmentItem
└── shared/             # Solo lo verdaderamente compartido
```

**Aprenderás**:
- Bounded Contexts (DDD)
- Lenguaje ubicuo por contexto
- Integration Events entre contextos
- Anti-Corruption Layer
- Shared Kernel mínimo
- Preparar para microservicios

**Documentación**:
- [Guía Pedagógica Bounded Contexts](./bounded-contexts-example/GUIA_PEDAGOGICA.md) - DDD en acción

## Ruta de Aprendizaje Recomendada 🗺️

### Nivel 1: Fundamentos (Semana 1-2)

1. **Empieza con Library System** (hexagonal)
   - Lee el [README_ES.md](./hexagonal/README_ES.md) completo
   - Explora el código de dominio
   - Revisa los casos de uso
   - Mira los adaptadores
   - Ejecuta los tests

2. **Conceptos clave a dominar**:
   - Puertos y adaptadores
   - Separación de capas
   - Inversión de dependencias
   - Testing del dominio

### Nivel 2: Organización (Semana 3)

3. **Continúa con Vertical Slicing** (task manager)
   - Lee el [README_ES.md](./vertical-slicing-example/README_ES.md)
   - Compara con la organización por capas
   - Entiende las features
   - Ve cómo se comunican

4. **Conceptos clave a dominar**:
   - Feature slicing vs layer slicing
   - Referencias por ID entre features
   - Shared kernel mínimo

### Nivel 3: Patrones Avanzados (Semana 4-5)

5. **Aprende CQRS** (inventory system)
   - Lee la [Guía Pedagógica CQRS](./cqrs-example/GUIA_PEDAGOGICA.md)
   - Entiende la separación read/write
   - Mira los diferentes repositorios
   - Compara comandos vs queries

6. **Aprende Event-Driven** (order system)
   - Lee la [Guía Pedagógica Event-Driven](./event-driven-example/GUIA_PEDAGOGICA.md)
   - Entiende los domain events
   - Ve cómo se desacoplan componentes
   - Mira los event handlers

7. **Conceptos clave a dominar**:
   - Comandos vs Queries
   - Write Model vs Read Model
   - Domain Events
   - Event Bus
   - Event Handlers

### Nivel 4: Arquitectura Empresarial (Semana 6+)

8. **Domina Bounded Contexts** (e-commerce)
   - Lee la [Guía Pedagógica Bounded Contexts](./bounded-contexts-example/GUIA_PEDAGOGICA.md)
   - Entiende por qué múltiples modelos del mismo concepto
   - Ve cómo se comunican los contextos
   - Estudia el Anti-Corruption Layer

9. **Conceptos clave a dominar**:
   - Bounded Contexts
   - Lenguaje ubicuo
   - Integration Events
   - Anti-Corruption Layer
   - Shared Kernel

## Recursos de Cada Proyecto

Cada proyecto incluye:

- ✅ **README completo en español** con guía paso a paso
- ✅ **Código comentado pedagógicamente** explicando el "por qué"
- ✅ **Tests unitarios** como ejemplos de cómo testear
- ✅ **Ejemplos de peticiones HTTP** con curl
- ✅ **Diagramas ASCII** para visualizar la arquitectura
- ✅ **Analogías y ejemplos** para conceptos complejos
- ✅ **Errores comunes** y cómo evitarlos
- ✅ **Ejercicios propuestos** para practicar

## Instalación y Ejecución

Todos los proyectos siguen el mismo patrón:

```bash
# 1. Entrar al proyecto
cd nombre-del-proyecto

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm run dev

# 4. Ejecutar tests
npm test

# 5. Compilar
npm run build
npm start
```

## Stack Tecnológico

Todos los proyectos usan:

- **TypeScript** - Tipado fuerte para mejor DX
- **Express** - Framework web simple
- **Vitest** - Testing rápido y moderno
- **InMemory Repositories** - Para desarrollo y testing (sin BD real)

**¿Por qué InMemory?**

Para aprender arquitectura, no necesitas BD real. Los repositorios en memoria:
- Son más rápidos de ejecutar
- No requieren configuración
- Se pueden cambiar fácilmente por PostgreSQL, MongoDB, etc.
- Demuestran que el dominio NO depende de la BD

## Preguntas Frecuentes

### ¿En qué orden debo estudiar los proyectos?

Sigue el orden recomendado arriba: Library System → Vertical Slicing → CQRS → Event-Driven → Bounded Contexts.

Cada proyecto se construye sobre conceptos del anterior.

### ¿Puedo usar esto en producción?

Los ejemplos son pedagógicos, no production-ready. Para producción necesitarías:
- Validación más robusta
- Manejo de errores completo
- Logging y observabilidad
- Base de datos real
- Autenticación y autorización
- Rate limiting
- etc.

Pero la **arquitectura** sí es válida para producción.

### ¿Necesito saber DDD?

No para los primeros proyectos. DDD es importante para Bounded Contexts, pero los conceptos básicos (entidades, value objects, agregados) se explican en Library System.

### ¿Qué pasa si me atasco?

Cada proyecto tiene documentación extensa. Si algo no queda claro:
1. Lee los comentarios en el código
2. Revisa la guía pedagógica del proyecto
3. Mira los tests para ver ejemplos de uso
4. Busca en el README las analogías y explicaciones

### ¿Puedo mezclar estos patrones?

Sí, de hecho los proyectos avanzados lo hacen:
- Event-Driven usa Hexagonal
- Bounded Contexts usa Event-Driven
- CQRS se puede combinar con Event-Driven
- Vertical Slicing se puede combinar con CQRS

No son mutuamente excluyentes.

## Contribuir

Si encuentras errores o quieres mejorar las explicaciones:
1. Abre un issue describiendo el problema
2. O mejor, envía un PR con la mejora

## Filosofía Pedagógica

Estos proyectos están diseñados con una filosofía clara:

1. **Aprender haciendo** - No solo teoría, código real
2. **Explicar el "por qué"** - No solo el "qué" o el "cómo"
3. **Iterativo** - De simple a complejo gradualmente
4. **Analogías** - Conceptos complejos con ejemplos cotidianos
5. **Errores comunes** - Aprender de los errores típicos
6. **Testing** - Demostrar cómo testear cada patrón

## Sobre "El Profe Millo"

El estilo de estos materiales es coloquial, canario, cercano. La idea es que aprendas de verdad, no que memorices conceptos sin entenderlos.

Si algo no te queda claro, es culpa mía, no tuya. Estos materiales están vivos y se mejoran con feedback.

## Próximos Pasos

Una vez domines estos proyectos, puedes explorar:

1. **Event Sourcing** - Guardar eventos en lugar de estado
2. **Saga Pattern** - Transacciones distribuidas
3. **API Gateway** - Punto de entrada único
4. **Service Mesh** - Comunicación entre microservicios
5. **Observability** - Logs, métricas, trazas

Pero eso es tema para otra colección.

## Licencia

MIT - Usa, aprende, enseña, mejora.

---

Recuerda, mi niño: **la arquitectura perfecta no existe. Solo la arquitectura adecuada para tu problema**.

Empieza simple (hexagonal básica) y añade complejidad solo cuando la necesites.

¿Te quedó clarito o le damos otra vuelta? 🚀
