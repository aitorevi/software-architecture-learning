# Arquitectura de Software - Colección Pedagógica

Bienvenido a esta colección de proyectos para aprender **patrones de arquitectura de software**. Desde arquitectura por capas básica hasta patrones avanzados de DDD, todo con ejemplos reales y explicaciones claras.

## Estructura del Repositorio

```
software-architecture-learning/
├── layered/                          # Arquitectura por Capas
│   ├── tdd-kata/                     # TDD con 3 katas (FizzBuzz, String Calculator, Shopping Cart)
│   ├── repository-pattern/           # Patrón repositorio básico
│   └── controller-service/           # Controller-Service-Repository
├── patterns/                         # Patrones Fundamentales
│   ├── singleton/                    # Singleton Pattern (Lazy, Eager, Thread-Safe)
│   ├── strategy/                     # Strategy Pattern (múltiples algoritmos intercambiables)
│   ├── factory-method/               # Factory Method Pattern (creación de objetos)
│   ├── error-handling/               # Error Handling con Result/Either Pattern
│   └── specification-pattern/        # Specification Pattern para filtrado inteligente
├── hexagonal/                        # Arquitectura Hexagonal
│   ├── library-system/               # Sistema de biblioteca
│   └── domain-vs-application-services/ # Domain Services vs Application Services
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
| Principiante | [tdd-kata](./layered/tdd-kata) | TDD | Aprende TDD con 3 katas progresivas (FizzBuzz, String Calculator, Shopping Cart) |
| Principiante | [repository-pattern](./layered/repository-pattern) | Capas | Introducción al patrón repositorio |
| Principiante | [controller-service](./layered/controller-service) | Capas | Estructura Controller-Service-Repository |
| Principiante | [singleton](./patterns/singleton) | Singleton | Una única instancia global (Logger, DatabaseConnection, Config) |
| Intermedio | [strategy](./patterns/strategy) | Strategy | Algoritmos intercambiables (estrategias de pago) |
| Intermedio | [factory-method](./patterns/factory-method) | Factory Method | Creación de objetos mediante factories (exportadores de documentos) |
| Intermedio | [error-handling](./patterns/error-handling) | Result/Either | Manejo de errores funcional con el patrón Result |
| Intermedio | [specification-pattern](patterns/specification) | Specification | Encapsular reglas de negocio de filtrado en objetos componibles |
| Intermedio | [library-system](./hexagonal/library-system) | Hexagonal | Arquitectura hexagonal completa con puertos y adaptadores |
| Intermedio | [domain-vs-application-services](./hexagonal/domain-vs-application-services) | Services | Domain Services (lógica pura) vs Application Services (orquestación) |
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

### Nivel 0: Test-Driven Development (Antes de empezar)

0. **Aprende TDD primero** (`layered/tdd-kata`)
   - El ciclo Red-Green-Refactor
   - Test-first thinking
   - 3 katas: FizzBuzz → String Calculator → Shopping Cart
   - Patrón AAA y naming conventions

### Nivel 1: Fundamentos (Semana 1-2)

1. **Empieza con repository-pattern** (`layered/repository-pattern`)
   - Entiende la separación básica de capas
   - Aprende qué es un repositorio

2. **Continúa con controller-service** (`layered/controller-service`)
   - Añade la capa de servicio
   - Entiende la responsabilidad de cada capa

3. **Aprende error handling robusto** (`patterns/error-handling`)
   - Patrón Result/Either
   - Errores como valores (no excepciones)
   - Validación en boundaries con Fail Fast
   - Traducir errores de dominio a HTTP status codes

4. **Domina filtrado inteligente** (`patterns/specification-pattern`)
   - Specification Pattern
   - Encapsular reglas de negocio reutilizables
   - Composición con AND, OR, NOT
   - Filtrado en memoria vs base de datos

5. **Avanza a library-system** (`hexagonal/library-system`)
   - Puertos y adaptadores
   - Dominio independiente de infraestructura
   - Value Objects y Aggregate Roots

### Nivel 2: Organización (Semana 3)

6. **Aprende Vertical Slicing** (`slicing/vertical-slicing-tasks`)
   - Organización por features vs capas técnicas
   - Alta cohesión, bajo acoplamiento
   - Comunicación entre features

### Nivel 3: Patrones Avanzados (Semana 4-5)

7. **Domina CQRS** (`slicing/cqrs-inventory`)
   - Separar comandos de queries
   - Write Model vs Read Model
   - Repositorios separados

8. **Aprende Event-Driven** (`ddd/event-driven-orders`)
   - Domain Events
   - Event Bus y Event Handlers
   - Desacoplamiento mediante eventos

### Nivel 4: DDD (Semana 6+)

9. **Bounded Contexts** (`ddd/bounded-contexts-ecommerce`)
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

- README_ES.md con tutorial completo y guía pedagógica integrada
- QUICKSTART.md para empezar en 5 minutos
- WELCOME.txt con bienvenida e instrucciones rápidas
- PRESENTATION.md para presentar a otros desarrolladores
- Código comentado explicando el "por qué"
- Tests unitarios como ejemplos

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
