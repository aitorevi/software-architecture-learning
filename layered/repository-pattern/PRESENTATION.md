# 🎓 Presentación: Patrón Repository

> **Una guía para presentar este proyecto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar el patrón Repository y la Inversión de Dependencias de forma práctica, sin ruido de otros patrones.

### Duración Recomendada
- **Express (30 min)**: Solo los conceptos clave + demo
- **Estándar (1 hora)**: Conceptos + código + ejercicios
- **Completo (2 horas)**: Todo lo anterior + implementar variante

### Estructura Sugerida

#### 1. Introducción (10 min)

**Pregunta inicial:** "¿Cómo acceden sus aplicaciones a los datos?"

Respuestas típicas:
- SQL directo en el código
- ORM sin abstracciones
- Repositorios sin interfaces

**Problema a plantear:**
```typescript
// ❌ Código típico acoplado
async function createUser(name: string) {
  await db.query('INSERT INTO users VALUES (?)', [name]);
}
```

¿Problemas?
- Imposible testear sin BD
- Cambiar BD = reescribir todo
- Lógica de negocio mezclada con SQL

#### 2. Concepto (15 min)

**Dibujar en la pizarra (o mostrar DIAGRAMA.md):**

```
┌────────────────┐
│   Application  │
└───────┬────────┘
        │ usa
        ▼
┌────────────────┐
│   Repository   │ ← INTERFACE (abstracción)
│   (interface)  │
└───────┬────────┘
        ▲
        │ implementa
┌───────┴────────┐
│InMemoryRepo    │ ← IMPLEMENTACIÓN (detalle)
└────────────────┘
```

**Conceptos clave a explicar:**
1. **Separación de responsabilidades**: Dominio vs Infraestructura
2. **Inversión de dependencias**: Depender de abstracciones, no de implementaciones
3. **Testabilidad**: Poder testear sin BD real

#### 3. Demo en Vivo (20 min)

**Paso 1: Mostrar la estructura**
```bash
npm run dev
```

**Paso 2: Abrir archivos en este orden:**

1. **Task.ts** - "Esto es una entidad. Puro negocio."
   - Señalar validaciones
   - Señalar método `complete()` vs propiedad `completed`

2. **TaskRepository.ts** - "Esto es un PUERTO. El dominio dice QUÉ necesita."
   - Es interface, no clase
   - Está en domain/, no en infrastructure/

3. **InMemoryTaskRepository.ts** - "Esto es un ADAPTADOR. Implementa CÓMO."
   - Implementa la interface
   - Usa Map (detalle técnico)

4. **TaskService.ts** - "Esto ORQUESTA el dominio."
   - Recibe repository por inyección
   - No sabe CÓMO se guardan los datos

5. **index.ts** - "Aquí CONECTAMOS todo."
   - Único lugar que conoce implementaciones concretas

**Paso 3: Ejecutar tests**
```bash
npm test
```

Resaltar: "19 tests, <300ms, sin BD real. Eso es testabilidad."

#### 4. Ejercicio Práctico (15 min)

**Ejercicio 1 (fácil):**
"Añadan un método `findByTitle()` al repositorio"

**Ejercicio 2 (medio):**
"Creen `FileTaskRepository` que guarde en JSON"

**Ejercicio 3 (avanzado):**
"Implementen paginación en `findAll()`"

---

## 🎤 Para Presentar a un Equipo

### Elevator Pitch (30 segundos)

"Este proyecto enseña el patrón Repository de forma minimalista. En menos de 400 líneas de código real, verán cómo separar el dominio de la infraestructura, aplicar inversión de dependencias y escribir código testeable sin necesidad de bases de datos reales."

### Argumentos Clave (para managers/leads)

1. **Testabilidad**: Tests 100x más rápidos (sin BD)
2. **Mantenibilidad**: Cambiar BD = cambiar 1 línea
3. **Flexibilidad**: Múltiples implementaciones (memoria, BD, caché)
4. **Claridad**: Código más fácil de entender y razonar

### Para Developers Escépticos

**Objeción 1:** "Esto es over-engineering para un CRUD simple"

**Respuesta:** "Miren el código. Son 353 líneas. Un CRUD sin patrón puede tener 200. La diferencia es que este es testeable y mantenible. ¿Vale 150 líneas extra tener tests rápidos?"

**Objeción 2:** "Nuestro ORM ya hace esto"

**Respuesta:** "El ORM es un detalle de implementación. Si mañana cambias de ORM, ¿cuánto código rompes? Con Repository, cambias solo la implementación."

**Objeción 3:** "No tenemos tiempo para esto"

**Respuesta:** "Invertir 30 minutos ahora ahorra horas después. Los tests lentos cuestan más tiempo a largo plazo. Además, este código es más fácil de onboardear para nuevos devs."

---

## 📊 Datos para Convencer

- **Líneas de código**: 353 (sin comentarios)
- **Tests**: 19 (todos pasando)
- **Tiempo de tests**: <300ms (vs minutos con BD real)
- **Dependencias**: 0 (producción)
- **Tiempo de aprendizaje**: 30-60 min
- **ROI**: Alto (mejor testabilidad + mantenibilidad)

---

## 🎓 Conceptos Clave a Transmitir

### Orden de Importancia

1. **Inversión de Dependencias** - El más importante
   - Dependencias apuntan hacia abstracciones
   - El dominio NO depende de la infraestructura

2. **Separación de Capas** - Fundamental
   - Domain: QUÉ (reglas de negocio)
   - Application: ORQUESTACIÓN (casos de uso)
   - Infrastructure: CÓMO (detalles técnicos)

3. **Testabilidad** - Consecuencia natural
   - Si dependes de abstracciones, puedes inyectar mocks
   - Tests rápidos = mejor feedback loop

4. **Mantenibilidad** - Beneficio a largo plazo
   - Cambios localizados (cambiar BD = cambiar implementación)
   - Código más fácil de razonar

---

## 💡 Ejemplos Analogías

### Para No Técnicos

**El Enchufe:**
- Interface = formato del enchufe
- Implementación = aparato que enchufas
- Puedes cambiar de tostadora a radio sin cambiar el enchufe

**El Puerto Marítimo:**
- Puerto = interface (TaskRepository)
- Barcos = implementaciones (InMemory, Mongo, Postgres)
- El puerto define el protocolo, no importa qué barco llegue

### Para Técnicos

**Drivers de Sistema Operativo:**
- SO define interface (read, write, seek)
- Drivers implementan para cada dispositivo
- Aplicaciones usan la interface, no el driver concreto

---

## 📋 Checklist de Presentación

Antes de presentar, asegúrate de:

- [ ] Proyecto ejecutándose (`npm run dev` funciona)
- [ ] Tests pasando (`npm test` verde)
- [ ] Archivos abiertos en orden correcto
- [ ] Diagrama preparado (pizarra o DIAGRAMA.md)
- [ ] Ejercicios listos para compartir
- [ ] Tiempo medido (no pasarse)

Durante la presentación:

- [ ] Empezar con el problema (código acoplado)
- [ ] Mostrar la solución (Repository)
- [ ] Ejecutar demo funcional
- [ ] Explicar cada capa
- [ ] Correr tests
- [ ] Dejar tiempo para preguntas
- [ ] Proponer ejercicio práctico

Después:

- [ ] Compartir link al repo
- [ ] Recomendar lectura del README_ES.md
- [ ] Sugerir ejercicios para practicar
- [ ] Estar disponible para dudas

---

## ❓ Preguntas Frecuentes (Prepara Respuestas)

### 1. "¿Por qué interface en domain/ y no en infrastructure/?"

**Respuesta:** "Porque el DOMINIO define qué necesita. La infraestructura se adapta al dominio, no al revés. Eso es Inversión de Dependencias."

### 2. "¿No es esto solo un DAO con otro nombre?"

**Respuesta:** "Son muy parecidos. Repository viene de DDD y se centra en colecciones de entidades. DAO es más genérico. Para empezar, son intercambiables."

### 3. "¿Qué pasa si necesito joins complejos?"

**Respuesta:** "Tres opciones:
1. Método específico en el repositorio
2. Repositorio especializado para esa query
3. Servicio que coordine varios repositorios

No hay regla única. Pragmatismo."

### 4. "¿Debo hacer esto siempre?"

**Respuesta:** "No. Para scripts de una vez o prototipos rápidos, es overkill. Pero para aplicaciones que vivirán años, vale la pena. Piensa en el mantenimiento futuro."

### 5. "¿Qué diferencia hay con arquitectura hexagonal?"

**Respuesta:** "Repository es UN patrón. Hexagonal es una arquitectura completa que USA el patrón Repository entre otros. Este proyecto enseña Repository. El proyecto `hexagonal/` enseña la arquitectura completa."

---

## 🎬 Script de Demo (5 minutos)

```bash
# 1. Mostrar estructura
ls -R src/

# 2. Ejecutar demo
npm run dev

# [Explicar mientras corre]
# "Ven que crea tareas, las completa, las busca..."
# "Todo sin saber CÓMO se guardan"

# 3. Mostrar tests
npm test

# [Señalar tiempo]
# "271ms para 19 tests. Sin BD real. Eso es rapidez."

# 4. Abrir código
code src/domain/TaskRepository.ts

# [Señalar]
# "Esta interface está en DOMAIN. El dominio define QUÉ necesita."

code src/infrastructure/InMemoryTaskRepository.ts

# [Señalar]
# "Esta clase está en INFRASTRUCTURE. Implementa CÓMO se hace."

# 5. Cambiar implementación (en index.ts)
# [Comentar línea de InMemory, descomentar línea de Mongo simulada]
# "Esto es lo ÚNICO que cambiaría para usar Mongo. El resto del código igual."
```

---

## 🏆 Mensaje Final

**Para cerrar la presentación:**

"El patrón Repository no es magia. Es sentido común aplicado:

1. Separa QUÉ necesitas de CÓMO lo haces
2. Depende de abstracciones, no de implementaciones
3. Testea rápido, entrega confianza
4. Mantén el dominio limpio de detalles técnicos

Si se llevan solo una cosa hoy, que sea esta: **el dominio no debe depender de la infraestructura**. Todo lo demás son consecuencias de este principio.

Ahora vayan, lean el código, hagan los ejercicios. Y si tienen dudas, aquí estoy.

¡Venga, a darle caña!"

---

**Profe Millo**
_"La arquitectura no es para presumir, es para resolver problemas"_
