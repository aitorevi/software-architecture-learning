# Estructura del Proyecto

## Árbol de Archivos

```
domain-vs-application-services/
│
├── 📖 DOCUMENTACIÓN
│   ├── WELCOME.txt                    ← Empezar aquí (1 min)
│   ├── QUICKSTART.md                  ← Inicio rápido (5 min)
│   ├── README_ES.md                   ← Tutorial completo (45 min)
│   ├── README.md                      ← English version
│   ├── PRESENTATION.md                ← Guía para presentar
│   ├── DIAGRAM.md                     ← Diagramas visuales
│   ├── SUMMARY.md                     ← Resumen ejecutivo
│   └── PROJECT_STRUCTURE.md           ← Este archivo
│
├── 💻 CÓDIGO FUENTE
│   ├── src/
│   │   ├── before/                    ← ❌ ANTES: El problema
│   │   │   └── TransferMoneyUseCase.ts    (todo mezclado)
│   │   │
│   │   ├── domain/                    ← ✅ DOMINIO (lógica pura)
│   │   │   ├── entities/
│   │   │   │   └── Account.ts             Entidad cuenta
│   │   │   ├── value-objects/
│   │   │   │   └── Money.ts               Value Object dinero
│   │   │   ├── services/
│   │   │   │   └── MoneyTransferService.ts  🎯 DOMAIN SERVICE
│   │   │   └── repositories/
│   │   │       └── AccountRepository.ts     Puerto (interface)
│   │   │
│   │   ├── application/               ← ✅ APLICACIÓN (orquestación)
│   │   │   ├── use-cases/
│   │   │   │   └── TransferMoneyUseCase.ts  🎯 APPLICATION SERVICE
│   │   │   └── dtos/
│   │   │       └── TransferMoneyDTO.ts      DTOs
│   │   │
│   │   └── infrastructure/            ← Adaptadores
│   │       ├── persistence/
│   │       │   └── InMemoryAccountRepository.ts
│   │       ├── http/
│   │       │   ├── TransferController.ts
│   │       │   └── AccountController.ts
│   │       └── index.ts               Punto de entrada
│   │
│   └── tests/
│       ├── domain/                    ← Tests SIN mocks
│       │   ├── MoneyTransferService.test.ts
│       │   ├── Account.test.ts
│       │   └── Money.test.ts
│       └── application/               ← Tests CON mocks
│           └── TransferMoneyUseCase.test.ts
│
├── 🔧 CONFIGURACIÓN
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── .gitignore
│
└── 🎬 SCRIPTS
    └── examples.sh                    Demo con ejemplos
```

## Orden de Lectura Recomendado

### 1. Para Entender Rápido (15 min)

```
1. WELCOME.txt           (1 min)  ← Empezar aquí
2. QUICKSTART.md         (5 min)  ← La idea central
3. SUMMARY.md            (5 min)  ← Resumen ejecutivo
4. npm test              (4 min)  ← Ver tests pasando
```

### 2. Para Aprender a Fondo (1 hora)

```
1. WELCOME.txt
2. README_ES.md                    ← Tutorial completo
3. src/before/TransferMoneyUseCase.ts   ← El problema
4. src/domain/services/MoneyTransferService.ts  ← Domain Service
5. src/application/use-cases/TransferMoneyUseCase.ts  ← Application Service
6. tests/domain/MoneyTransferService.test.ts  ← Tests sin mocks
7. tests/application/TransferMoneyUseCase.test.ts  ← Tests con mocks
8. npm run dev + ./examples.sh     ← Demo en vivo
```

### 3. Para Presentar a Otros (2 horas)

```
1. Leer PRESENTATION.md            ← Guía completa
2. Preparar ejemplos en vivo
3. Ejecutar tests en vivo
4. Mostrar diagramas (DIAGRAM.md)
```

## Archivos Clave

### 🎯 Los Dos Servicios (El Corazón del Proyecto)

| Archivo | Tipo | Descripción | Testing |
|---------|------|-------------|---------|
| `src/domain/services/MoneyTransferService.ts` | Domain Service | Lógica de negocio pura | Sin mocks |
| `src/application/use-cases/TransferMoneyUseCase.ts` | Application Service | Orquestación con I/O | Con mocks |

### 📚 Documentación por Audiencia

| Archivo | Audiencia | Tiempo | Contenido |
|---------|-----------|--------|-----------|
| `WELCOME.txt` | Todos | 1 min | Bienvenida y navegación |
| `QUICKSTART.md` | Desarrolladores con prisa | 5 min | TL;DR y ejemplos |
| `SUMMARY.md` | Managers / Revisión rápida | 5 min | Resumen ejecutivo |
| `README_ES.md` | Desarrolladores aprendiendo | 45 min | Tutorial completo |
| `PRESENTATION.md` | Instructores / Presentadores | 2 horas | Guía de presentación |
| `DIAGRAM.md` | Visual learners | 15 min | Diagramas y flujos |

### 🧪 Tests que Demuestran el Concepto

| Test | Demuestra | Clave |
|------|-----------|-------|
| `tests/domain/MoneyTransferService.test.ts` | Testing sin mocks | Lógica pura testeable |
| `tests/application/TransferMoneyUseCase.test.ts` | Testing con mocks | Orquestación testeable |

## Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar TODOS los tests
npm test

# Ejecutar solo tests de Domain Service (sin mocks)
npm test MoneyTransferService

# Ejecutar solo tests de Application Service (con mocks)
npm test TransferMoneyUseCase

# Build del proyecto
npm run build

# Arrancar servidor de desarrollo
npm run dev

# Ejecutar ejemplos de uso
./examples.sh
```

## Conceptos Demostrados

### Domain Service (`MoneyTransferService`)

```typescript
✅ Lógica de negocio pura
✅ Sin I/O
✅ Sin dependencias de infraestructura
✅ Testeable sin mocks
✅ Reutilizable en múltiples contextos
```

### Application Service (`TransferMoneyUseCase`)

```typescript
✅ Orquestación de operaciones
✅ Coordinación de I/O (repos, eventos, APIs)
✅ Conversión DTOs ↔ Dominio
✅ Manejo de transacciones
✅ Testeable con mocks
```

## Patrones Aplicados

- ✅ **Hexagonal Architecture** - Puertos y adaptadores
- ✅ **Dependency Inversion** - El dominio define las interfaces
- ✅ **Single Responsibility** - Cada servicio tiene una responsabilidad
- ✅ **Domain-Driven Design** - Entidades, Value Objects, Services
- ✅ **Repository Pattern** - Abstracción de persistencia
- ✅ **DTO Pattern** - Conversión entre capas
- ✅ **Use Case Pattern** - Casos de uso explícitos

## Stack Tecnológico

- **TypeScript** - Lenguaje
- **Vitest** - Testing (con soporte para mocks)
- **Express** - HTTP Server
- **Node.js** - Runtime

## Métricas del Proyecto

```
Archivos de código:      11
Tests:                   4 suites, 26 tests
Cobertura conceptual:    Domain Service, Application Service
Líneas de código:        ~800 (sin comentarios)
Líneas de docs:          ~1500
Tiempo de tests:         <20ms (muy rápido)
```

## Próximos Pasos Sugeridos

Después de dominar este proyecto, continúa con:

1. **Vertical Slicing** - Organización por features
2. **CQRS** - Separar comandos de queries
3. **Event Sourcing** - Arquitectura basada en eventos
4. **Aggregate Pattern** - Agregados complejos en DDD

---

**La estructura está diseñada para el aprendizaje progresivo.**

Cada archivo tiene su propósito:
- Documentación gradual (1 min → 45 min)
- Código ANTES/DESPUÉS para comparar
- Tests que demuestran la diferencia

¡Empieza por WELCOME.txt y sigue el orden recomendado!

-- El Profe Millo
