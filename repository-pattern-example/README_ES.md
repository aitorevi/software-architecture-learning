# 📚 Patrón Repository - Ejemplo Básico

> **Un tutorial paso a paso by el Profe Millo**
> _"Aprender arquitectura no tiene por qué ser un lío, mi niño/a"_

---

## 🎯 ¿Qué aprenderás aquí?

Este proyecto enseña **SOLO** el patrón Repository de forma clara y simple. Nada de eventos, DTOs, CQRS ni otros patrones complejos. Solo lo esencial para que entiendas:

1. Qué es un **Repository** y para qué sirve
2. Qué es la **Inversión de Dependencias**
3. Por qué separar **Dominio**, **Aplicación** e **Infraestructura**
4. Cómo hacer tu código **testeable** y **mantenible**

---

## 🏗️ Estructura del Proyecto

```
repository-pattern-example/
│
├── src/
│   ├── domain/                    <- El CORAZÓN (reglas de negocio)
│   │   ├── Task.ts               <- Entidad (qué ES una tarea)
│   │   └── TaskRepository.ts     <- PUERTO (qué necesitamos hacer con tareas)
│   │
│   ├── application/               <- Los CASOS DE USO (qué hacemos)
│   │   └── TaskService.ts        <- Orquesta el dominio para hacer cosas útiles
│   │
│   └── infrastructure/            <- Los DETALLES (cómo se hace)
│       ├── InMemoryTaskRepository.ts  <- ADAPTADOR (implementación concreta)
│       └── index.ts              <- Punto de entrada (demo)
│
├── tests/
│   └── task.test.ts              <- Tests que demuestran la testabilidad
│
├── package.json
├── tsconfig.json
└── README_ES.md                   <- Estás aquí
```

---

## 📖 Los Tres Conceptos Clave

### 1. El DOMINIO (Domain)

**¿Qué es?** El conocimiento del negocio. Las reglas que existen independientemente de la tecnología.

**En este proyecto:**
- `Task.ts` - Define qué ES una tarea y qué PUEDE HACER
- `TaskRepository.ts` - Define qué NECESITAMOS para guardar/recuperar tareas

**Regla de oro:** El dominio NO puede depender de nada externo (ni BD, ni frameworks, ni APIs).

```typescript
// Ejemplo de regla de negocio en el dominio
class Task {
  complete(): void {
    if (this.completed) {
      throw new Error('Ya está completada');
    }
    this.completed = true;
  }
}
```

### 2. La APLICACIÓN (Application)

**¿Qué es?** Los casos de uso. Las cosas que los usuarios quieren hacer.

**En este proyecto:**
- `TaskService.ts` - Casos de uso como "crear tarea", "completar tarea", etc.

**Clave:** La aplicación ORQUESTA el dominio. No contiene lógica de negocio compleja, solo coordina.

```typescript
// La aplicación orquesta el dominio
async completeTask(id: string): Promise<void> {
  const task = await this.repository.findById(id);
  task.complete(); // Usa el método del dominio
  await this.repository.save(task);
}
```

### 3. La INFRAESTRUCTURA (Infrastructure)

**¿Qué es?** Los detalles técnicos. Cómo se implementan las cosas.

**En este proyecto:**
- `InMemoryTaskRepository.ts` - Implementa el repositorio guardando en memoria
- `index.ts` - Crea las instancias concretas y las conecta

**Clave:** La infraestructura IMPLEMENTA las interfaces definidas por el dominio.

```typescript
// La infraestructura implementa el puerto del dominio
class InMemoryTaskRepository implements TaskRepository {
  private tasks = new Map<string, Task>();

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }
}
```

---

## 🔌 El Patrón Repository Explicado

### ¿Qué problema resuelve?

Imagina que tu código accede directamente a la base de datos:

```typescript
// ❌ MAL - Acoplamiento directo a la BD
class TaskService {
  async createTask(title: string) {
    const id = generateId();
    await db.query('INSERT INTO tasks VALUES (?, ?)', [id, title]);
    return { id, title };
  }
}
```

**Problemas:**
- Si cambias de BD (MySQL → PostgreSQL → MongoDB), tienes que cambiar TODO el código
- No puedes testear sin una BD real (tests lentos y frágiles)
- La lógica de negocio se mezcla con detalles técnicos

### La solución: Repository Pattern

```typescript
// ✅ BIEN - Usando el patrón Repository
class TaskService {
  constructor(private repository: TaskRepository) {} // Interface, no clase concreta

  async createTask(title: string) {
    const task = new Task(generateId(), title);
    await this.repository.save(task); // No sabemos CÓMO se guarda
    return task;
  }
}
```

**Ventajas:**
- Cambiar de BD es cambiar QUÉ implementación inyectas (una línea)
- Puedes testear con un repositorio en memoria (tests rápidos)
- La lógica de negocio está aislada de detalles técnicos

---

## 🎓 Inversión de Dependencias (DIP)

Este es el principio clave que hace funcionar todo:

### Antes (dependencia normal):

```
TaskService → InMemoryTaskRepository
```

El servicio depende de una clase concreta. Si cambias la implementación, rompes el servicio.

### Después (inversión de dependencias):

```
TaskService → TaskRepository ← InMemoryTaskRepository
   (usa)      (interface)         (implementa)
```

El servicio depende de una **abstracción** (interface), no de una implementación.
La implementación concreta también depende de la abstracción (la implementa).

**Por eso se llama "inversión":** Invertimos la dirección de la dependencia.

---

## 🗂️ Archivo por Archivo

### `src/domain/Task.ts`

**Qué hace:** Define la entidad Task con sus propiedades y comportamientos.

**Por qué está aquí:** Es conocimiento del negocio puro.

**Conceptos clave:**
- Validaciones en el constructor (el dominio se protege)
- Métodos que expresan acciones de negocio (`complete()`, no solo `completed = true`)
- Inmutabilidad donde tiene sentido (`readonly id`)

### `src/domain/TaskRepository.ts`

**Qué hace:** Define la interface (contrato) para guardar/recuperar tareas.

**Por qué está aquí:** El DOMINIO define qué necesita, no la infraestructura.

**Conceptos clave:**
- Es una **interface**, no una clase
- Métodos devuelven `Promise` aunque la implementación sea síncrona (preparado para BD reales)
- Solo operaciones que el dominio necesita

### `src/application/TaskService.ts`

**Qué hace:** Implementa los casos de uso de la aplicación.

**Por qué está aquí:** Orquestar el dominio no es ni dominio ni infraestructura.

**Conceptos clave:**
- Recibe el repositorio por **inyección de dependencias**
- NO contiene lógica de negocio compleja (eso va en el dominio)
- Coordina llamadas al repositorio y al dominio

### `src/infrastructure/InMemoryTaskRepository.ts`

**Qué hace:** Implementa TaskRepository guardando datos en memoria (Map).

**Por qué está aquí:** Es un detalle de implementación técnico.

**Conceptos clave:**
- **Implementa** la interface del dominio
- Usa un `Map` para rapidez (O(1) en búsquedas)
- Podría reemplazarse por `MongoTaskRepository` sin cambiar nada más

### `src/infrastructure/index.ts`

**Qué hace:** Punto de entrada. Crea las instancias y las conecta.

**Por qué está aquí:** Alguien tiene que decidir qué implementación usar.

**Conceptos clave:**
- Única parte que conoce las clases concretas
- Hace la **composición** (cablea las dependencias)
- Demuestra cómo funciona todo junto

### `tests/task.test.ts`

**Qué hace:** Tests unitarios de todas las capas.

**Por qué es importante:** Demuestra la **testabilidad** del patrón.

**Conceptos clave:**
- Tests rápidos (todo en memoria)
- Aislados (cada test tiene su repositorio)
- No necesitan BD real ni Docker

---

## 🚀 Cómo Ejecutarlo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar la demo

```bash
npm run dev
```

Verás una demostración completa de todas las operaciones:
- Crear tareas
- Completar tareas
- Listar por estado
- Buscar por ID
- Eliminar tareas
- Manejo de errores

### 3. Ejecutar los tests

```bash
npm test
```

Verás todos los tests pasando en milisegundos. ¡Eso es testabilidad!

---

## 💡 Ejercicios Propuestos

Para consolidar lo aprendido, intenta estos ejercicios:

### Nivel 1: Básico

1. **Añade un nuevo campo a Task:**
   - Añade `description: string` (opcional)
   - Actualiza el constructor
   - Añade un método `updateDescription(newDesc: string)`

2. **Añade un nuevo método al repositorio:**
   - `findByTitle(title: string): Promise<Task[]>`
   - Implementa en `InMemoryTaskRepository`
   - Úsalo desde `TaskService`
   - Añade tests

### Nivel 2: Intermedio

3. **Crea una nueva implementación del repositorio:**
   - `FileTaskRepository` que guarde en un archivo JSON
   - Debe implementar la misma interface `TaskRepository`
   - Cambia `index.ts` para usar esta implementación
   - Verifica que TODO sigue funcionando sin cambios en dominio/aplicación

4. **Añade paginación:**
   - Modifica `findAll()` para recibir `page` y `pageSize`
   - Implementa la paginación en el repositorio
   - Actualiza `TaskService` para usar paginación

### Nivel 3: Avanzado

5. **Implementa un patrón Observer simple:**
   - Cuando se complete una tarea, notifica a un listener
   - Mantenlo simple (sin eventos de dominio complejos)

6. **Añade una segunda entidad:**
   - Crea `Project` con su propio repositorio
   - Relaciona `Task` con `Project`
   - Mantén la separación de capas

---

## ❓ Preguntas Frecuentes

### ¿Por qué la interface está en domain/ y no en infrastructure/?

Porque el **dominio** define qué necesita, no la infraestructura.
Esto es **Inversión de Dependencias**: la infraestructura depende del dominio, no al revés.

### ¿Por qué usar Promise si todo es síncrono?

Para mantener el **contrato** compatible con implementaciones reales (BD, APIs).
Mañana cambias a MongoDB y no tienes que cambiar la interface.

### ¿Debo hacer un repositorio por entidad?

Generalmente **sí**. `TaskRepository` para `Task`, `UserRepository` para `User`, etc.
Pero no es una regla estricta. Usa el sentido común.

### ¿Qué pasa si necesito una consulta compleja que junta varias entidades?

Tienes varias opciones:
1. Método específico en el repositorio (`findTasksWithProjectAndUser()`)
2. Repositorio especializado para esa consulta
3. Un servicio de aplicación que coordine varios repositorios

No hay una única respuesta correcta. Depende del contexto.

### ¿Esto es lo mismo que DAO (Data Access Object)?

Casi. Son muy parecidos:
- **DAO**: Patrón más antiguo, centrado en persistencia
- **Repository**: Patrón DDD, centrado en colecciones de entidades

En la práctica, para empezar, puedes considerarlos equivalentes.

---

## 🎯 Qué NO Encontrarás Aquí (a propósito)

Este proyecto es **intencionadamente simple**. No incluye:

- ❌ **Eventos de dominio** - Para mantenerlo simple
- ❌ **DTOs** - Devolvemos entidades directamente
- ❌ **Commands/Queries** - Solo métodos simples
- ❌ **Value Objects** - Solo primitivos y la entidad
- ❌ **Agregados** - Una sola entidad
- ❌ **Specification Pattern** - Filtros simples directamente

**¿Por qué?** Porque primero debes entender el Repository. Los demás patrones vienen después.

---

## 📚 Siguiente Paso

Una vez que domines este proyecto, estás listo para:

1. **Ver el proyecto `hexagonal/`** - Arquitectura hexagonal completa
2. **Ver el proyecto `vertical-slicing-example/`** - Organización por features
3. **Leer sobre DDD** - Domain-Driven Design (Evans, Vaughn Vernon)
4. **Aprender CQRS** - Separación de lectura y escritura

---

## 🏆 Resumen de lo Aprendido

Si has llegado hasta aquí y ejecutado el código, ahora entiendes:

1. El **patrón Repository** separa la lógica de negocio de la persistencia
2. La **Inversión de Dependencias** hace que el dominio defina contratos que la infraestructura implementa
3. Separar en **capas** (Domain, Application, Infrastructure) hace el código mantenible
4. El código **testeable** no necesita BD ni Docker
5. Cambiar implementaciones es cambiar **qué inyectas**, no el código que las usa

**El Profe Millo dice:**
_"Si solo te llevas UNA cosa de este proyecto, que sea esto: el dominio NO debe depender de detalles técnicos. Todo lo demás son consecuencias de este principio. Eso está fetén, mi niño/a."_

---

## 📝 Licencia

MIT - Úsalo, cámbialo, apréndelo.

---

## 👨‍🏫 Sobre el Profe Millo

Un arquitecto de software reconvertido en docente que cree que la mejor forma de aprender es con código real, explicaciones claras y sin complicaciones innecesarias.

**Filosofía:** _"La arquitectura no es para presumir, es para resolver problemas. Si no lo entiendes, no lo uses. Primero lo simple, luego lo complejo."_

---

¿Dudas? ¿Sugerencias? Abre un issue o hablamos. ¡Venga, a darle caña! 🚀
