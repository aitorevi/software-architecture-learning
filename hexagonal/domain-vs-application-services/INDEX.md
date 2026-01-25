# Índice de Navegación - Domain vs Application Services

> Guía rápida para encontrar lo que necesitas

## 🎯 Empiezo por Aquí

```
1. WELCOME.txt     ← Lee esto primero (1 min)
2. QUICKSTART.md   ← La idea central (5 min)
3. npm test        ← Ver tests pasando (4 min)
```

## 📚 Documentación por Nivel

### Nivel 1: Resumen Rápido (10 min total)

| Archivo | Descripción | Tiempo |
|---------|-------------|--------|
| [WELCOME.txt](./WELCOME.txt) | Bienvenida y navegación | 1 min |
| [QUICKSTART.md](./QUICKSTART.md) | TL;DR y ejemplos | 5 min |
| [SUMMARY.md](./SUMMARY.md) | Resumen ejecutivo | 5 min |

### Nivel 2: Tutorial Completo (1 hora)

| Archivo | Descripción | Tiempo |
|---------|-------------|--------|
| [README_ES.md](./README_ES.md) | Tutorial completo en español | 45 min |
| [DIAGRAM.md](./DIAGRAM.md) | Diagramas visuales y flujos | 15 min |

### Nivel 3: Presentación y Enseñanza (2+ horas)

| Archivo | Descripción | Audiencia |
|---------|-------------|-----------|
| [PRESENTATION.md](./PRESENTATION.md) | Guía completa para presentar | Instructores |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Estructura del proyecto | Todos |

## 💻 Código por Concepto

### El Problema (ANTES)

```
src/before/TransferMoneyUseCase.ts
```

Todo mezclado: lógica de negocio + I/O en un solo lugar.

### La Solución (DESPUÉS)

#### Domain Service (Lógica Pura)

```
src/domain/services/MoneyTransferService.ts
```

- Lógica de negocio pura
- Sin I/O
- Testeable sin mocks

#### Application Service (Orquestación)

```
src/application/use-cases/TransferMoneyUseCase.ts
```

- Orquestación con I/O
- Coordina repositorios, eventos, notificaciones
- Testeable con mocks

## 🧪 Tests que Demuestran la Diferencia

### Sin Mocks (Domain Service)

```
tests/domain/MoneyTransferService.test.ts
tests/domain/Account.test.ts
tests/domain/Money.test.ts
```

Lógica pura, sin dependencias externas.

### Con Mocks (Application Service)

```
tests/application/TransferMoneyUseCase.test.ts
```

Orquestación de I/O, necesita mocks para repos y eventos.

## 🎬 Ejecutar el Proyecto

```bash
# 1. Instalar
npm install

# 2. Ejecutar tests
npm test

# 3. Ejecutar solo Domain Service tests (sin mocks)
npm test MoneyTransferService

# 4. Ejecutar solo Application Service tests (con mocks)
npm test TransferMoneyUseCase

# 5. Arrancar servidor
npm run dev

# 6. Probar ejemplos
./examples.sh
```

## 📖 Rutas de Aprendizaje

### Ruta Express (15 min)

```
WELCOME.txt → QUICKSTART.md → npm test
```

### Ruta Estándar (1 hora)

```
WELCOME.txt
    ↓
README_ES.md (tutorial completo)
    ↓
Código: src/before/ → src/domain/services/ → src/application/use-cases/
    ↓
Tests: tests/domain/ → tests/application/
    ↓
npm run dev + ./examples.sh
```

### Ruta Instructor (2+ horas)

```
Todos los archivos de documentación
    ↓
PRESENTATION.md (guía de presentación)
    ↓
Preparar demo en vivo
    ↓
Practicar con ejemplos
```

## 🎯 Por Objetivo

### Quiero entender el concepto

1. [QUICKSTART.md](./QUICKSTART.md)
2. [README_ES.md](./README_ES.md) - Sección "El Problema"
3. `src/before/TransferMoneyUseCase.ts`
4. `src/domain/services/MoneyTransferService.ts`

### Quiero ver código funcionando

1. `npm install`
2. `npm test`
3. `npm run dev`
4. `./examples.sh`

### Quiero ver la diferencia en testing

1. `tests/domain/MoneyTransferService.test.ts` ← Sin mocks
2. `tests/application/TransferMoneyUseCase.test.ts` ← Con mocks
3. `npm test`

### Quiero presentar esto a mi equipo

1. [PRESENTATION.md](./PRESENTATION.md) ← Empieza aquí
2. Preparar el proyecto: `npm install` + `npm run dev`
3. Practicar con [DIAGRAM.md](./DIAGRAM.md)
4. Revisar ejemplos en `./examples.sh`

## 🔑 Conceptos Clave por Archivo

| Concepto | Archivo | Línea Clave |
|----------|---------|-------------|
| Domain Service | `src/domain/services/MoneyTransferService.ts` | `transfer(from, to, amount)` sin I/O |
| Application Service | `src/application/use-cases/TransferMoneyUseCase.ts` | `async execute()` con I/O |
| Testing sin mocks | `tests/domain/MoneyTransferService.test.ts` | Crear entidades en memoria |
| Testing con mocks | `tests/application/TransferMoneyUseCase.test.ts` | `mock<AccountRepository>()` |
| El problema | `src/before/TransferMoneyUseCase.ts` | Todo mezclado |

## ❓ Preguntas Frecuentes → Respuestas

| Pregunta | Respuesta en |
|----------|--------------|
| ¿Qué es un Domain Service? | [README_ES.md](./README_ES.md) - Sección "Domain Service" |
| ¿Qué es un Application Service? | [README_ES.md](./README_ES.md) - Sección "Application Service" |
| ¿Cuándo usar cada uno? | [README_ES.md](./README_ES.md) - Sección "Casos de Uso" |
| ¿Cómo testear cada uno? | [README_ES.md](./README_ES.md) - Sección "Testing" |
| ¿Cuál es la diferencia? | [QUICKSTART.md](./QUICKSTART.md) + [SUMMARY.md](./SUMMARY.md) |
| ¿Cómo presentar esto? | [PRESENTATION.md](./PRESENTATION.md) |

## 📊 Comparación Visual

Para diagramas y visualizaciones: [DIAGRAM.md](./DIAGRAM.md)

- Arquitectura general
- Flujo de transferencia
- ANTES vs DESPUÉS
- Testing sin mocks vs con mocks

## 🚀 Siguientes Pasos

Después de dominar este proyecto:

1. **Vertical Slicing** - `../slicing/vertical-slicing-tasks/`
2. **CQRS** - `../slicing/cqrs-inventory/`
3. **Event-Driven** - `../ddd/event-driven-orders/`

---

**¿Perdido? Empieza por WELCOME.txt**

-- El Profe Millo
