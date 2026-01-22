# 🎓 Presentación: Vertical Slicing

> **Una guía para presentar este proyecto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar la organización de código por features (vertical) vs por capas técnicas (horizontal).

### Duración Recomendada
- **Express (30 min)**: Conceptos + demo
- **Estándar (1 hora)**: Conceptos + código + discusión
- **Completo (2 horas)**: Workshop con migración de código

### Prerrequisitos
- Arquitectura Hexagonal (para entender qué hay dentro de cada feature)

---

## 🎤 Estructura Sugerida

### 1. Introducción (10 min)

**Pregunta inicial:** "¿Cuántos archivos tienen que abrir para entender una feature?"

**El problema horizontal:**
```
Para entender "User Registration" abro:
- controllers/UserController.ts
- services/UserService.ts
- repositories/UserRepository.ts
- models/User.ts
- validators/UserValidator.ts
- dtos/CreateUserDto.ts

¡6 archivos en 6 carpetas diferentes!
```

**La solución vertical:**
```
Para entender "User Registration" abro:
- features/user-registration/

Todo está ahí. Una carpeta = una feature.
```

### 2. Horizontal vs Vertical (15 min)

**Dibujar:**

```
HORIZONTAL (por capas)              VERTICAL (por features)

    Controllers                     Features
    ┌─────────────────┐            ┌─────────┬─────────┬─────────┐
    │ User  Task  Tag │            │  User   │  Task   │   Tag   │
    └────────┬────────┘            │         │         │         │
             │                     │ ctrl    │ ctrl    │ ctrl    │
    Services │                     │ svc     │ svc     │ svc     │
    ┌────────┴────────┐            │ repo    │ repo    │ repo    │
    │ User  Task  Tag │            │ model   │ model   │ model   │
    └────────┬────────┘            │         │         │         │
             │                     └─────────┴─────────┴─────────┘
    Repositories
    ┌────────┴────────┐            Cada columna es independiente
    │ User  Task  Tag │
    └─────────────────┘

    Cortes HORIZONTALES            Cortes VERTICALES
```

**El cambio de mentalidad:**
- Horizontal: "¿Dónde va este código técnicamente?"
- Vertical: "¿A qué feature pertenece este código?"

### 3. Demo en Vivo (20 min)

**Paso 1: Mostrar estructura**
```bash
ls -la src/features/
```

**Paso 2: Explorar una feature**
```bash
ls -la src/features/projects/
# domain/ application/ infrastructure/
```

"Cada feature tiene su propia arquitectura hexagonal completa."

**Paso 3: Referencias entre features**

```typescript
// tasks/domain/Task.ts
class Task {
  projectId: string;  // Solo el ID, NO import de projects/
}
```

"Las features se referencian por ID, no por entidad."

**Paso 4: Ejecutar**
```bash
npm run dev
curl http://localhost:3000/api/projects
curl http://localhost:3000/api/tasks
```

### 4. Cuándo Usar Cada Enfoque (10 min)

**Horizontal funciona cuando:**
- Proyecto pequeño (<10 archivos)
- Un solo desarrollador
- No hay planes de escalar

**Vertical funciona cuando:**
- Múltiples equipos
- Features independientes
- Planes de microservicios
- Features cambian a diferentes ritmos

### 5. Ejercicio (15 min)

**Ejercicio:**
"Creen una nueva feature `comments/` para comentarios en tareas"

Estructura:
```
features/comments/
├── domain/
│   └── Comment.ts
├── application/
│   └── AddCommentUseCase.ts
└── infrastructure/
    └── CommentController.ts
```

---

## 💡 Puntos Clave

### Cohesión > Separación Técnica
- Código que cambia junto, vive junto
- Una feature = una carpeta

### Referencias por ID
- Features no importan entidades de otras features
- Solo conocen IDs
- Comunicación vía eventos o IDs

### Preparación para Microservicios
- Cada feature puede ser un microservicio
- Extracción = cortar carpeta
- Sin dependencias cruzadas

---

## ❓ Preguntas Frecuentes

### "¿Qué pasa con código compartido?"
Va en `shared/` o `kernel/`. Pero cuidado: si mucho código es "compartido", quizás tus features no son tan independientes.

### "¿Cómo manejo relaciones entre features?"
- Por ID (Task tiene projectId, no Project)
- Por eventos (ProjectDeleted → Tasks escucha)
- Por API interna entre features

### "¿No hay duplicación de código?"
Algo de duplicación está bien. Prefiero dos features independientes con algo de duplicación que dos features acopladas "DRY".

### "¿Cuándo migro de horizontal a vertical?"
Cuando:
- Tienes equipos separados por feature
- Una feature cambia mucho más que otras
- Quieres extraer a microservicio

---

## 📋 Checklist

Antes:
- [ ] Proyecto ejecutándose
- [ ] Estructura clara para mostrar

Durante:
- [ ] Comparar horizontal vs vertical
- [ ] Mostrar estructura de una feature
- [ ] Explicar referencias por ID
- [ ] Discutir cuándo usar cada enfoque

---

## 🏆 Mensaje Final

"Vertical Slicing no es mejor que horizontal. Es diferente.

Horizontal dice: 'agrupa por tipo de código'.
Vertical dice: 'agrupa por feature de negocio'.

La pregunta correcta no es '¿cuál es mejor?' sino '¿qué necesita mi equipo?'

Si tienes múltiples equipos, features independientes, o planes de microservicios: vertical.
Si tienes un equipo pequeño y un proyecto simple: horizontal está bien.

Piensa en features, no en capas."

---

**Profe Millo**
_"El código que cambia junto, vive junto"_
