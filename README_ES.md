# Arquitectura de Software - Colección Pedagógica

Bienvenido a esta colección de proyectos para aprender **patrones de arquitectura de software**. Desde arquitectura por capas básica hasta patrones avanzados de DDD, todo con ejemplos reales y explicaciones claras.

## Estructura del Repositorio

```
software-architecture-learning/
├── layered/                          # Arquitectura por Capas
│   ├── repository-pattern/           # Patrón repositorio básico
│   └── controller-service/           # Controller-Service-Repository
├── hexagonal/                        # Arquitectura Hexagonal
│   └── library-system/               # Sistema de biblioteca
├── slicing/                          # Patrones de Organización
│   ├── vertical-slicing-tasks/       # Organización por features
│   └── cqrs-inventory/               # CQRS (Command Query Responsibility Segregation)
└── ddd/                              # Domain-Driven Design
    ├── event-driven-orders/          # Arquitectura dirigida por eventos
    └── bounded-contexts-ecommerce/   # Bounded Contexts con eventos de integración
```

## Los Proyectos

| Nivel | Proyecto | Patrón | Descripción |
|-------|----------|--------|-------------|
| Principiante | [repository-pattern](./layered/repository-pattern) | Capas | Introducción al patrón repositorio |
| Principiante | [controller-service](./layered/controller-service) | Capas | Estructura Controller-Service-Repository |
| Intermedio | [library-system](./hexagonal/library-system) | Hexagonal | Arquitectura hexagonal completa con puertos y adaptadores |
| Intermedio | [vertical-slicing-tasks](./slicing/vertical-slicing-tasks) | Vertical Slicing | Organización del código por features |
| Avanzado | [cqrs-inventory](./slicing/cqrs-inventory) | CQRS | Separar modelos de lectura y escritura |
| Avanzado | [event-driven-orders](./ddd/event-driven-orders) | Event-Driven | Eventos de dominio y event handlers |
| Avanzado | [bounded-contexts-ecommerce](./ddd/bounded-contexts-ecommerce) | DDD | Múltiples bounded contexts con eventos de integración |

## Clonar un Proyecto Específico (Sparse Checkout)

Si solo quieres clonar un ejemplo específico:

```bash
# Clonar el repositorio con sparse checkout
git clone --filter=blob:none --sparse https://github.com/aitorevi/software-architecture-learning.git
cd software-architecture-learning

# Elegir el proyecto que quieres
git sparse-checkout set slicing/cqrs-inventory
# O: git sparse-checkout set hexagonal/library-system
# O: git sparse-checkout set ddd/event-driven-orders
```

## Ruta de Aprendizaje Recomendada

### Nivel 1: Fundamentos (Semana 1-2)

1. **Empieza con repository-pattern** (`layered/repository-pattern`)
   - Entiende la separación básica de capas
   - Aprende qué es un repositorio

2. **Continúa con controller-service** (`layered/controller-service`)
   - Añade la capa de servicio
   - Entiende la responsabilidad de cada capa

3. **Avanza a library-system** (`hexagonal/library-system`)
   - Puertos y adaptadores
   - Dominio independiente de infraestructura
   - Value Objects y Aggregate Roots

### Nivel 2: Organización (Semana 3)

4. **Aprende Vertical Slicing** (`slicing/vertical-slicing-tasks`)
   - Organización por features vs capas técnicas
   - Alta cohesión, bajo acoplamiento
   - Comunicación entre features

### Nivel 3: Patrones Avanzados (Semana 4-5)

5. **Domina CQRS** (`slicing/cqrs-inventory`)
   - Separar comandos de queries
   - Write Model vs Read Model
   - Repositorios separados

6. **Aprende Event-Driven** (`ddd/event-driven-orders`)
   - Domain Events
   - Event Bus y Event Handlers
   - Desacoplamiento mediante eventos

### Nivel 4: DDD (Semana 6+)

7. **Bounded Contexts** (`ddd/bounded-contexts-ecommerce`)
   - Múltiples contextos delimitados
   - Lenguaje ubicuo por contexto
   - Integration Events
   - Anti-Corruption Layer

## Instalación y Ejecución

Todos los proyectos siguen el mismo patrón:

```bash
# 1. Entrar al proyecto
cd layered/repository-pattern  # o cualquier otro

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm run dev

# 4. Ejecutar tests
npm test

# 5. Compilar y ejecutar
npm run build
npm start
```

## Stack Tecnológico

Todos los proyectos usan:

- **TypeScript** - Tipado fuerte
- **Express** - Framework web simple
- **Vitest** - Testing rápido
- **InMemory Repositories** - Sin necesidad de base de datos

## Recursos de Cada Proyecto

Cada proyecto incluye:

- README con guía paso a paso
- Código comentado explicando el "por qué"
- Tests unitarios como ejemplos
- Guías pedagógicas (en proyectos avanzados)

## Preguntas Frecuentes

### ¿En qué orden debo estudiar?

Sigue el orden de la tabla: de arriba a abajo, de principiante a avanzado.

### ¿Puedo usar esto en producción?

Los ejemplos son pedagógicos. Para producción necesitarías validación robusta, manejo de errores completo, base de datos real, autenticación, etc. Pero la **arquitectura** sí es válida.

### ¿Puedo mezclar estos patrones?

Sí, los proyectos avanzados lo hacen:
- Event-Driven usa Hexagonal
- Bounded Contexts usa Event-Driven
- CQRS se puede combinar con Event-Driven

## Licencia

MIT
