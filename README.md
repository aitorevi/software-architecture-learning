# Ejemplos de Arquitectura Hexagonal

Colección de proyectos que demuestran patrones de **Arquitectura Hexagonal** (Puertos y Adaptadores) con diferentes casos de uso y tecnologías.

## ¿Qué es la Arquitectura Hexagonal?

La Arquitectura Hexagonal, propuesta por Alistair Cockburn, aísla la lógica de negocio de las preocupaciones externas (bases de datos, APIs, interfaces de usuario) mediante **puertos** (interfaces) y **adaptadores** (implementaciones).

```
┌─────────────────────────────────────────────────────────┐
│                      Adaptadores                        │
│  ┌─────────────┐                    ┌─────────────┐    │
│  │ Controllers │                    │ Repositorios│    │
│  │   (REST)    │                    │   (BD/API)  │    │
│  └──────┬──────┘                    └──────┬──────┘    │
│         │                                  │           │
│         ▼                                  ▼           │
│  ┌─────────────┐                    ┌─────────────┐    │
│  │   Puertos   │                    │   Puertos   │    │
│  │ (Primarios) │                    │(Secundarios)│    │
│  └──────┬──────┘                    └──────┬──────┘    │
│         │      ┌─────────────────┐         │           │
│         └─────►│     Dominio     │◄────────┘           │
│                │  (Casos de Uso  │                     │
│                │   y Entidades)  │                     │
│                └─────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## Beneficios Clave

- **Testeabilidad**: La lógica de dominio se puede probar de forma aislada con fakes/mocks
- **Flexibilidad**: Fácil cambiar implementaciones (ej. cambiar base de datos)
- **Mantenibilidad**: Límites claros entre capas
- **Independencia**: Las reglas de negocio no dependen de frameworks

## Proyectos

| Proyecto | Descripción | Stack |
|----------|-------------|-------|
| [library-system](./library-system) | Sistema de gestión de biblioteca con préstamos, usuarios y libros | TypeScript, Express, PostgreSQL |

## Estructura

Cada proyecto sigue esta estructura:

```
proyecto/
├── src/
│   ├── domain/           # Lógica de negocio (entidades, value objects, servicios)
│   ├── application/      # Casos de uso y DTOs
│   └── infrastructure/   # Adaptadores (controllers, repositorios, servicios externos)
└── tests/
    └── unit/             # Tests unitarios con fakes
```

## Cómo Empezar

Navega a cualquier carpeta de proyecto y sigue su README para instrucciones específicas.

## Licencia

MIT
