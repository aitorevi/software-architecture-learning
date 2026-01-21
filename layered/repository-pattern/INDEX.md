# 📑 Índice Completo del Proyecto

> **Guía de navegación para el proyecto Repository Pattern Example**

---

## 🚀 Empezar Aquí

Si es tu primera vez, empieza por estos archivos EN ESTE ORDEN:

1. **[QUICKSTART.md](QUICKSTART.md)** (5 min) - Para empezar rápido
2. **[README_ES.md](README_ES.md)** (30 min) - Tutorial completo en español
3. **[DIAGRAMA.md](DIAGRAMA.md)** (15 min) - Diagramas visuales

Luego ve al código:

4. **[src/domain/Task.ts](src/domain/Task.ts)** - La entidad
5. **[src/domain/TaskRepository.ts](src/domain/TaskRepository.ts)** - La interface
6. **[src/infrastructure/InMemoryTaskRepository.ts](src/infrastructure/InMemoryTaskRepository.ts)** - La implementación
7. **[src/application/TaskService.ts](src/application/TaskService.ts)** - Los casos de uso
8. **[src/infrastructure/index.ts](src/infrastructure/index.ts)** - La demo

---

## 📚 Documentación

### Para Aprender

| Archivo | Qué es | Tiempo | Para quién |
|---------|--------|--------|------------|
| [README.md](README.md) | Introducción (inglés) | 5 min | Overview rápido |
| [README_ES.md](README_ES.md) | Tutorial completo | 30 min | Aprender a fondo |
| [QUICKSTART.md](QUICKSTART.md) | Empezar en 5 min | 5 min | Impacientes |
| [DIAGRAMA.md](DIAGRAMA.md) | Diagramas visuales | 15 min | Visuales |

### Para Presentar

| Archivo | Qué es | Para quién |
|---------|--------|------------|
| [PRESENTATION.md](PRESENTATION.md) | Guía de presentación | Instructores/Tech Leads |
| [METRICS.md](METRICS.md) | Métricas del proyecto | Managers/Curiosos |
| [COMMANDS.md](COMMANDS.md) | Comandos útiles | Desarrolladores |

### Configuración

| Archivo | Qué es |
|---------|--------|
| [package.json](package.json) | Dependencias y scripts |
| [tsconfig.json](tsconfig.json) | Configuración TypeScript |
| [.gitignore](.gitignore) | Archivos ignorados por Git |
| [.vscode/settings.json](.vscode/settings.json) | Configuración VS Code |

---

## 💻 Código Fuente

### Dominio (Domain)

El corazón del negocio. NO depende de nada externo.

| Archivo | Qué hace | Líneas* |
|---------|----------|---------|
| [src/domain/Task.ts](src/domain/Task.ts) | Define la entidad Task | 33 |
| [src/domain/TaskRepository.ts](src/domain/TaskRepository.ts) | Define la interface del repositorio (PUERTO) | 8 |

**Total Dominio: 41 líneas**

### Aplicación (Application)

Los casos de uso. Orquesta el dominio.

| Archivo | Qué hace | Líneas* |
|---------|----------|---------|
| [src/application/TaskService.ts](src/application/TaskService.ts) | Implementa casos de uso (crear, completar, listar...) | 43 |

**Total Aplicación: 43 líneas**

### Infraestructura (Infrastructure)

Detalles técnicos. Implementa las interfaces del dominio.

| Archivo | Qué hace | Líneas* |
|---------|----------|---------|
| [src/infrastructure/InMemoryTaskRepository.ts](src/infrastructure/InMemoryTaskRepository.ts) | Implementa TaskRepository en memoria (ADAPTADOR) | 31 |
| [src/infrastructure/index.ts](src/infrastructure/index.ts) | Punto de entrada y demo | 83 |

**Total Infraestructura: 114 líneas**

### Tests

| Archivo | Qué testea | Líneas* | Tests |
|---------|------------|---------|-------|
| [tests/task.test.ts](tests/task.test.ts) | Dominio + Repo + Servicio | 155 | 19 |

**Total Tests: 155 líneas, 19 tests**

_*Líneas sin comentarios ni espacios en blanco_

---

## 🎯 Por Objetivo

### Quiero Aprender el Patrón Repository

1. Lee [QUICKSTART.md](QUICKSTART.md)
2. Lee [README_ES.md](README_ES.md) sección "El Patrón Repository Explicado"
3. Ve [DIAGRAMA.md](DIAGRAMA.md) sección "Inversión de Dependencias"
4. Lee el código: TaskRepository.ts → InMemoryTaskRepository.ts

### Quiero Ver Inversión de Dependencias en Acción

1. Lee [DIAGRAMA.md](DIAGRAMA.md) sección "Inversión de Dependencias"
2. Lee [TaskService.ts](src/application/TaskService.ts) - fíjate en el constructor
3. Lee [index.ts](src/infrastructure/index.ts) - donde se inyecta la dependencia

### Quiero Entender la Separación en Capas

1. Lee [README_ES.md](README_ES.md) sección "Los Tres Conceptos Clave"
2. Ve [DIAGRAMA.md](DIAGRAMA.md) sección "Arquitectura de 3 Capas"
3. Explora la estructura de carpetas src/

### Quiero Ver Tests Testeables

1. Lee [tests/task.test.ts](tests/task.test.ts)
2. Ejecuta `npm test`
3. Lee [README_ES.md](README_ES.md) sección sobre testabilidad

### Quiero Presentar Esto a Mi Equipo

1. Lee [PRESENTATION.md](PRESENTATION.md) completo
2. Ejecuta la demo: `npm run dev`
3. Prepara los ejercicios sugeridos

---

## 🔧 Por Tarea

### Ejecutar el Proyecto

```bash
npm install
npm run dev
```

Ver: [COMMANDS.md](COMMANDS.md) sección "Comandos Principales"

### Ejecutar Tests

```bash
npm test
```

Ver: [COMMANDS.md](COMMANDS.md) sección "Tests"

### Hacer Ejercicios

Ver: [README_ES.md](README_ES.md) sección "Ejercicios Propuestos"

### Añadir una Nueva Feature

1. Añade método a la interface: [TaskRepository.ts](src/domain/TaskRepository.ts)
2. Implementa en: [InMemoryTaskRepository.ts](src/infrastructure/InMemoryTaskRepository.ts)
3. Úsalo desde: [TaskService.ts](src/application/TaskService.ts)
4. Testea en: [task.test.ts](tests/task.test.ts)

---

## 📊 Métricas Rápidas

- **Archivos de código**: 5 archivos TypeScript
- **Líneas de código**: 353 (sin comentarios)
- **Líneas totales**: 941 (con comentarios pedagógicos)
- **Tests**: 19 (todos pasando en <300ms)
- **Dependencias**: 0 producción, 3 desarrollo
- **Tiempo de aprendizaje**: 30-60 minutos

Ver detalles: [METRICS.md](METRICS.md)

---

## 🎓 Por Nivel de Experiencia

### Principiante (Primera vez con arquitectura)

1. [QUICKSTART.md](QUICKSTART.md) - Contexto rápido
2. [README_ES.md](README_ES.md) - Leer completo
3. [DIAGRAMA.md](DIAGRAMA.md) - Ver diagramas
4. Ejecutar `npm run dev` y ver qué pasa
5. Leer el código en orden (Task → Repository → InMemory → Service)
6. Hacer Ejercicio 1 (findByTitle)

### Intermedio (Ya conozco arquitectura)

1. [QUICKSTART.md](QUICKSTART.md) - Para contexto
2. Leer el código directamente
3. Ejecutar tests: `npm test`
4. Ver [DIAGRAMA.md](DIAGRAMA.md) para confirmar entendimiento
5. Hacer Ejercicio 2 (FileTaskRepository)

### Avanzado (Quiero comparar enfoques)

1. Leer código directamente
2. Ver [METRICS.md](METRICS.md) para análisis
3. Comparar con otros proyectos (hexagonal/, vertical-slicing/)
4. Hacer Ejercicio 3 (paginación)
5. Leer [PRESENTATION.md](PRESENTATION.md) para enseñar a otros

---

## 🗺️ Mapa Mental del Proyecto

```
Repository Pattern Example
│
├── 📖 Documentación
│   ├── README.md (inglés, overview)
│   ├── README_ES.md (español, completo)
│   ├── QUICKSTART.md (5 minutos)
│   ├── DIAGRAMA.md (visual)
│   ├── PRESENTATION.md (presentar)
│   ├── METRICS.md (métricas)
│   └── COMMANDS.md (comandos)
│
├── 💻 Código
│   ├── Domain (41 líneas)
│   │   ├── Task.ts (entidad)
│   │   └── TaskRepository.ts (interface/puerto)
│   │
│   ├── Application (43 líneas)
│   │   └── TaskService.ts (casos de uso)
│   │
│   └── Infrastructure (114 líneas)
│       ├── InMemoryTaskRepository.ts (adaptador)
│       └── index.ts (demo)
│
└── 🧪 Tests
    └── task.test.ts (19 tests)
```

---

## 🏆 Objetivos de Aprendizaje

Al terminar este proyecto, deberías poder:

- [ ] Explicar qué es el patrón Repository
- [ ] Entender la Inversión de Dependencias
- [ ] Separar código en Domain/Application/Infrastructure
- [ ] Escribir tests sin necesidad de BD real
- [ ] Implementar una nueva feature siguiendo el patrón
- [ ] Cambiar de implementación (ej: InMemory → File) fácilmente

---

## 🎯 Siguiente Paso

Una vez domines este proyecto:

1. Ver [hexagonal/](../hexagonal/) - Arquitectura hexagonal completa
2. Ver [vertical-slicing-example/](../vertical-slicing-example/) - Organización por features
3. Ver [cqrs-example/](../cqrs-example/) - Separación lectura/escritura

---

## 💡 Consejo del Profe Millo

_"No intentes aprender todo de golpe. Empieza por QUICKSTART, luego README_ES, luego el código. Paso a paso, mi niño/a. La arquitectura se entiende haciendo, no solo leyendo."_

---

## 📝 Notas

- Todos los archivos .md tienen comentarios pedagógicos
- El código tiene comentarios del Profe Millo explicando el POR QUÉ
- Los tests son documentación ejecutable
- Si algo no está claro, lee README_ES.md sección FAQs

---

**Última actualización**: 2026-01-18

Creado con ❤️ por el Profe Millo para que aprendas arquitectura sin complicaciones.
