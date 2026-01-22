# 🎓 Presentación: Controller-Service

> **Una guía para presentar este proyecto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar la separación entre Controller (adaptador HTTP) y Service (orquestador de dominio) de forma práctica.

### Duración Recomendada
- **Express (20 min)**: Conceptos clave + demo
- **Estándar (45 min)**: Conceptos + código + práctica
- **Completo (1.5 horas)**: Todo + ejercicios + discusión

### Prerrequisito
Los asistentes deberían conocer el patrón Repository. Si no, empieza por `repository-pattern/`.

---

## 🎤 Estructura Sugerida

### 1. Introducción (5 min)

**Pregunta inicial:** "¿Dónde ponen la lógica de negocio en sus APIs?"

Respuestas típicas:
- En el controller (malo)
- En el modelo (confuso)
- "¿Qué es lógica de negocio?" (oportunidad de enseñar)

**Problema a plantear:**

```typescript
// ❌ Controller gordo - hace de todo
app.post('/tasks', async (req, res) => {
  // Validación HTTP
  if (!req.body.title) return res.status(400).json({ error: 'Title required' });

  // Lógica de negocio mezclada
  const task = { id: uuid(), title: req.body.title, completed: false };

  // Acceso a datos directo
  await db.query('INSERT INTO tasks VALUES (?)', [task]);

  // Respuesta HTTP
  res.status(201).json(task);
});
```

¿Problemas?
- Imposible testear sin servidor HTTP
- Lógica mezclada con manejo de HTTP
- Difícil reutilizar la lógica

### 2. Concepto (10 min)

**Dibujar en pizarra:**

```
HTTP Request
      │
      ▼
┌─────────────────┐
│   CONTROLLER    │  ← Conoce HTTP (Request/Response)
│   (Adaptador)   │     Traduce HTTP → llamada a Service
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    SERVICE      │  ← NO conoce HTTP
│  (Orquestador)  │     Coordina dominio y repositorios
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   REPOSITORY    │  ← Acceso a datos
└─────────────────┘
```

**Conceptos clave:**
1. **Controller**: Adaptador de entrada (HTTP → dominio)
2. **Service**: Orquestador (coordina sin conocer HTTP)
3. **Single Responsibility**: Cada capa hace UNA cosa

### 3. Demo en Vivo (15 min)

**Paso 1: Ejecutar**
```bash
npm run dev
```

**Paso 2: Probar endpoint**
```bash
curl -X POST http://localhost:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Aprender arquitectura"}'
```

**Paso 3: Mostrar código en orden**

1. **TaskController.ts** - "Esto es un Controller"
   - Recibe `Request`, devuelve `Response`
   - Extrae datos del body
   - Llama al Service
   - Formatea respuesta HTTP

2. **TaskService.ts** - "Esto es un Service"
   - NO tiene `Request` ni `Response`
   - Recibe datos simples (string, number)
   - Coordina entidades y repositorios
   - Retorna DTOs o entidades

**Paso 4: Tests**
```bash
npm test
```

"Los tests del Service no necesitan servidor HTTP. Eso es separación."

### 4. Ejercicio (10 min)

**Ejercicio rápido:**
"Añadan un endpoint `DELETE /tasks/:id`"

Pasos:
1. Añadir método `delete(id)` en TaskService
2. Añadir ruta DELETE en TaskController
3. Testear con curl

---

## 💡 Puntos Clave a Transmitir

### El Controller es un Adaptador
- Traduce el mundo HTTP al mundo del dominio
- Conoce `Request`, `Response`, status codes
- NO tiene lógica de negocio

### El Service es un Orquestador
- Coordina entidades, repositorios, otros servicios
- NO conoce HTTP (podría usarse desde CLI, eventos, etc.)
- Contiene la lógica de orquestación (no de negocio)

### La Lógica de Negocio va en el Dominio
- Las validaciones de negocio van en las entidades
- El Service orquesta, no decide reglas de negocio

---

## ❓ Preguntas Frecuentes

### "¿El Service puede llamar a otros Services?"
Sí, pero con cuidado. Si tienes muchos Services llamándose entre sí, quizás necesitas un UseCase explícito o eventos.

### "¿Cuál es la diferencia entre Service y UseCase?"
En proyectos simples, son lo mismo. En proyectos complejos:
- **Service**: Agrupa operaciones relacionadas (TaskService tiene CRUD)
- **UseCase**: Una operación específica (CreateTaskUseCase)

### "¿Por qué no poner todo en el Controller?"
1. No puedes testear sin HTTP
2. No puedes reutilizar desde CLI/eventos/GraphQL
3. Código más difícil de entender

### "¿Esto es overkill para un CRUD simple?"
Para scripts de una vez, sí. Para aplicaciones que van a crecer y mantenerse, vale la pena la separación desde el inicio.

---

## 📋 Checklist de Presentación

Antes:
- [ ] `npm install` ejecutado
- [ ] `npm run dev` funciona
- [ ] Tests pasando
- [ ] Curl preparado para demo

Durante:
- [ ] Empezar con el problema (controller gordo)
- [ ] Mostrar la solución (separación)
- [ ] Demo en vivo
- [ ] Mostrar tests
- [ ] Ejercicio práctico

Después:
- [ ] Compartir repo
- [ ] Recomendar siguiente proyecto (library-system)

---

## 🏆 Mensaje Final

"Si entiendes el flujo HTTP → Controller → Service → Repository, ya entiendes el 80% de cómo funcionan las aplicaciones web modernas.

El Controller traduce HTTP.
El Service orquesta.
El Repository persiste.

Cada uno hace UNA cosa bien. Eso es arquitectura limpia."

---

**Profe Millo**
_"La arquitectura no es para presumir, es para resolver problemas"_
