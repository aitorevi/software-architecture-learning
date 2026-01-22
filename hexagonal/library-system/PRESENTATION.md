# 🎓 Presentación: Arquitectura Hexagonal

> **Una guía para presentar este proyecto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar Arquitectura Hexagonal (Puertos y Adaptadores) con un ejemplo completo: Value Objects, DTOs, Inversión de Dependencias.

### Duración Recomendada
- **Express (45 min)**: Conceptos + demo
- **Estándar (1.5 horas)**: Conceptos + código + ejercicios
- **Completo (3 horas)**: Workshop con implementación

### Prerrequisitos
- Patrón Repository
- Controller-Service

---

## 🎤 Estructura Sugerida

### 1. Introducción (10 min)

**Pregunta inicial:** "¿Cómo organizan el código de sus aplicaciones?"

**El problema típico:**
```
src/
├── models/         ← ¿Lógica de negocio aquí?
├── controllers/    ← ¿O aquí?
├── services/       ← ¿O aquí?
└── utils/          ← "Código que no sé dónde poner"
```

**La solución hexagonal:**
```
src/
├── domain/         ← Lógica de negocio PURA
├── application/    ← Casos de uso (orquestación)
└── infrastructure/ ← Detalles técnicos (HTTP, BD)
```

### 2. El Hexágono (15 min)

**Dibujar:**

```
                    ┌───────────────────┐
                    │   HTTP / REST     │
                    │   (Adaptador)     │
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │          APLICACIÓN           │
              │         (Casos de Uso)        │
              └───────────────┬───────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        │              D O M I N I O                │
        │                                           │
        │  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
        │  │Entities │  │  Value  │  │ Puertos │   │
        │  │         │  │ Objects │  │(interfaces)│ │
        │  └─────────┘  └─────────┘  └─────────┘   │
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │         INFRAESTRUCTURA       │
              │          (Adaptadores)        │
              └───────────────┬───────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   PostgreSQL      │
                    │   (Adaptador)     │
                    └───────────────────┘
```

**Conceptos clave:**
1. **Dominio**: El corazón. NO depende de nada.
2. **Puertos**: Interfaces que el dominio DEFINE.
3. **Adaptadores**: Implementaciones de los puertos.
4. **Inversión**: Las dependencias apuntan HACIA el dominio.

### 3. Value Objects (10 min)

**Mostrar código:**

```typescript
// ❌ Sin Value Object
function createBook(isbn: string) {
  // ¿ISBN válido? ¿Formato correcto?
  // Validación repetida en todas partes
}

// ✅ Con Value Object
function createBook(isbn: ISBN) {
  // ISBN ya está validado
  // Imposible crear ISBN inválido
}

// El Value Object se encarga
class ISBN {
  private constructor(private value: string) {}

  static create(value: string): ISBN {
    if (!this.isValid(value)) {
      throw new InvalidISBNError(value);
    }
    return new ISBN(value);
  }
}
```

### 4. Demo en Vivo (20 min)

**Paso 1: Ejecutar**
```bash
npm run dev
```

**Paso 2: Registrar un libro**
```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0-13-468599-1",
    "title": "Clean Architecture",
    "author": "Robert C. Martin"
  }'
```

**Paso 3: Mostrar código**

1. **BookRepository (Puerto)** - "El dominio DEFINE qué necesita"
2. **InMemoryBookRepository (Adaptador)** - "La infra IMPLEMENTA cómo"
3. **ISBN (Value Object)** - "Validación encapsulada"
4. **RegisterBookUseCase** - "Orquestación sin detalles técnicos"

**Paso 4: Tests**
```bash
npm test
```

### 5. Ejercicio (15 min)

**Ejercicio:**
"Creen un Value Object `Author` que valide:
- Mínimo 2 caracteres
- Máximo 100 caracteres
- Sin números"

---

## 💡 Puntos Clave

### El Dominio es el Rey
- NO importa nada de infraestructura
- Define sus propios tipos (Value Objects)
- Define sus necesidades (Puertos/Interfaces)

### Puertos y Adaptadores
- **Puerto**: Interface en el dominio
- **Adaptador**: Implementación en infraestructura
- Puedes tener múltiples adaptadores para un puerto

### Inversión de Dependencias
```
SIN inversión:    Dominio → Infraestructura  (malo)
CON inversión:    Dominio ← Infraestructura  (bueno)
```

### DTOs vs Entidades
- **Entidad**: Tiene identidad, lógica, Value Objects
- **DTO**: Datos planos para transferir entre capas

---

## ❓ Preguntas Frecuentes

### "¿Es esto overkill para proyectos pequeños?"
Depende. Si el proyecto va a crecer y mantenerse, vale la pena. Si es un script de una vez, no.

### "¿Cuándo uso Value Object vs tipo primitivo?"
Si el dato tiene reglas de validación o comportamiento, Value Object. Si es solo un string sin reglas, primitivo.

### "¿Puedo tener lógica en los DTOs?"
No. Los DTOs son objetos tontos. Solo datos, sin comportamiento.

### "¿Qué diferencia hay con Clean Architecture?"
Son muy similares. Hexagonal enfatiza "puertos y adaptadores". Clean Architecture tiene más capas definidas. En la práctica, son intercambiables.

---

## 📋 Checklist

Antes:
- [ ] Proyecto ejecutándose
- [ ] Tests pasando
- [ ] Ejemplos curl preparados

Durante:
- [ ] Explicar el hexágono
- [ ] Mostrar Value Objects
- [ ] Demo en vivo
- [ ] Mostrar inversión de dependencias
- [ ] Ejercicio práctico

---

## 🏆 Mensaje Final

"La arquitectura hexagonal no es sobre hexágonos. Es sobre una idea simple:

**El dominio no debe depender de nada externo.**

Todo lo demás (HTTP, bases de datos, frameworks) son detalles que se adaptan al dominio, no al revés.

Si se llevan solo una cosa: las dependencias siempre apuntan hacia adentro, hacia el dominio."

---

**Profe Millo**
_"El dominio es el corazón. Todo lo demás son detalles."_
