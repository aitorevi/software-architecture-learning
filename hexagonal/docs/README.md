# Guías Pedagógicas - Sistema de Biblioteca 📚

¡Buenas, mi niño! Aquí tienes todas las guías pedagógicas completas para aprender arquitectura hexagonal de verdad. Estas guías están escritas con el estilo del Profe Millo: claras, prácticas y con ejemplos de código reales.

## Guías Disponibles

### 🗄️ [Patrón Repository](./GUIA_REPOSITORY_PATTERN.md)

**La guía definitiva sobre el patrón Repository**. Esta guía te explica paso a paso:

- ✅ Qué es el patrón Repository y por qué existe
- ✅ La diferencia entre Puerto (interfaz) y Adaptador (implementación)
- ✅ DTOs vs Entidades de Dominio (cuándo usar cada uno)
- ✅ El flujo completo: Controller → UseCase → Repository → BD
- ✅ Mapping entre capas (HTTP JSON → DTO → Entidad → Row de BD)
- ✅ Implementaciones: InMemory, PostgreSQL y Fake para tests
- ✅ Cómo testear con repositories (unit tests, integration tests)
- ✅ Errores comunes al implementar repositories
- ✅ Preguntas frecuentes (con respuestas claras)

**Nivel**: Intermedio
**Tiempo de lectura**: 45-60 minutos
**Incluye**: Diagramas, código comentado línea por línea, ejemplos completos

---

## Guías por Venir

### 🎯 Value Objects (Próximamente)
Qué son, cuándo usarlos, cómo implementarlos con validación.

### 🏛️ Aggregate Roots (Próximamente)
Cómo proteger invariantes y mantener consistencia del dominio.

### 🎬 Use Cases y Application Layer (Próximamente)
Orquestación sin lógica de negocio, DTOs, comandos y queries.

### 🔧 Adaptadores e Infraestructura (Próximamente)
Controllers REST, manejo de errores, dependency injection.

### ⚡ Testing en Arquitectura Hexagonal (Próximamente)
La pirámide de testing, fakes vs mocks, testing de cada capa.

### 🎪 Eventos de Dominio (Próximamente)
Qué son, cuándo usarlos, cómo implementarlos sin acoplamiento.

---

## Otras Guías del Proyecto

### Guías por Capa (README en código)

Estas guías están dentro de cada carpeta del código:

- [📖 Domain README](../src/domain/README.md) - Introducción a la capa de dominio
- [🎬 Application README](../src/application/README.md) - Introducción a la capa de aplicación
- [🔧 Infrastructure README](../src/infrastructure/README.md) - Introducción a la capa de infraestructura

---

## Cómo usar estas guías

### Si eres principiante
1. Lee primero el [README principal](../README_ES.md)
2. Luego lee la [Guía del Patrón Repository](./GUIA_REPOSITORY_PATTERN.md)
3. Explora el código con los ejemplos de la guía abiertos

### Si ya conoces arquitectura hexagonal
1. Ve directamente a la [Guía del Patrón Repository](./GUIA_REPOSITORY_PATTERN.md)
2. Usa las secciones específicas (DTOs, Mapping, Testing) como referencia

### Si quieres practicar
1. Lee la guía correspondiente
2. Implementa los ejemplos por tu cuenta
3. Compara con el código del proyecto

---

## Contribuciones

Si encuentras errores, mejoras o quieres sugerir nuevas guías, abre un issue o PR.

---

¡Venga, mi niño, a aprender que esto está fetén! 🚀
