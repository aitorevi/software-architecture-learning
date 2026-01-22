# 🎓 Presentación: Event-Driven Architecture

> **Una guía para presentar este proyecto a otros desarrolladores**
> By El Profe Millo

---

## 🎯 Para el Instructor

### Objetivo de la Sesión
Enseñar Event-Driven Architecture: eventos de dominio, event bus, handlers desacoplados.

### Duración Recomendada
- **Express (45 min)**: Conceptos + demo
- **Estándar (1.5 horas)**: Conceptos + código + ejercicios
- **Completo (3 horas)**: Workshop implementando eventos

### Prerrequisitos
- Arquitectura Hexagonal
- Aggregates (conceptualmente)

---

## 🎤 Estructura Sugerida

### 1. Introducción (10 min)

**Pregunta inicial:** "¿Qué pasa después de crear un pedido?"

Respuestas típicas:
- Enviar email de confirmación
- Actualizar inventario
- Notificar al almacén
- Registrar en analytics

**El problema acoplado:**
```typescript
async createOrder() {
  const order = Order.create({...});
  await orderRepo.save(order);

  // ¿Y ahora? Todo aquí:
  await emailService.sendConfirmation(order);
  await inventoryService.decreaseStock(order);
  await analyticsService.track(order);
  // ¿Añadir push notifications? Modificar este código.
}
```

**La solución event-driven:**
```typescript
async createOrder() {
  const order = Order.create({...});  // Emite OrderCreatedEvent
  await orderRepo.save(order);
  await eventBus.publish(order.pullEvents());
  // Los handlers reaccionan independientemente
}
```

### 2. Conceptos Clave (15 min)

**Dibujar:**

```
┌─────────────────┐
│ CreateOrderUseCase │
└────────┬────────┘
         │
         │ order.create()
         ▼
┌─────────────────┐
│     Order       │ ──emite──▶ OrderCreatedEvent
│   (Aggregate)   │
└────────┬────────┘
         │
         │ eventBus.publish()
         ▼
┌─────────────────┐
│    EVENT BUS    │
└────────┬────────┘
         │
    ┌────┴────┬─────────────┐
    ▼         ▼             ▼
┌───────┐ ┌───────┐   ┌───────────┐
│ Email │ │Inventory│   │ [Nuevo]   │
│Handler│ │ Handler │   │  Handler  │
└───────┘ └───────┘   └───────────┘

Añadir nuevo handler = 0 cambios en código existente
```

**Conceptos:**
1. **Evento**: Hecho que ocurrió (pasado). Inmutable.
2. **Event Bus**: Distribuye eventos a handlers.
3. **Handler**: Reacciona a un evento específico.
4. **Desacoplamiento**: Publicador no conoce suscriptores.

### 3. Anatomía de un Evento (10 min)

```typescript
class OrderCreatedEvent {
  readonly eventName = 'order.created';  // Identificador
  readonly eventId: string;               // Único
  readonly occurredOn: Date;              // Cuándo

  constructor(
    public readonly orderId: string,
    public readonly customerEmail: string,
    public readonly items: OrderItem[]
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
```

**Reglas de eventos:**
- Nombre en **pasado**: `OrderCreated`, no `CreateOrder`
- **Inmutables**: representan algo que YA pasó
- Contienen **toda la info necesaria** para reaccionar
- **ID único** y **timestamp**

### 4. Demo en Vivo (20 min)

**Paso 1: Ejecutar**
```bash
npm run dev
```

**Paso 2: Crear un pedido (observar logs)**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@example.com",
    "items": [{"productId": "1", "productName": "Laptop", "quantity": 1, "unitPriceInCents": 99900}],
    "shippingAddress": {"street": "Calle 1", "city": "Madrid", "postalCode": "28001", "country": "ES"}
  }'
```

**Mostrar en los logs:**
```
→ OrderCreatedEvent emitido
→ SendEmailHandler: Enviando email a test@example.com
→ InventoryHandler: Actualizando stock
```

**Paso 3: Mostrar código**
1. `Order.ts` - Aggregate que emite eventos
2. `OrderEvents.ts` - Definición de eventos
3. `InMemoryEventBus.ts` - Implementación del bus
4. `SendOrderConfirmationHandler.ts` - Un handler

### 5. Ejercicio (15 min)

**Ejercicio:**
"Creen un `SendSMSHandler` que 'envíe' SMS cuando se crea un pedido"

Pasos:
1. Crear `SendSMSHandler.ts`
2. Implementar `handle(event)`
3. Registrar en el bootstrap
4. Probar

"¿Cuántos archivos existentes modificaron? Solo el bootstrap."

---

## 💡 Puntos Clave

### Eventos son Hechos
- Pasado: `OrderCreated`, no `CreateOrder`
- Inmutables: no se modifican después de crearse
- Completos: tienen toda la info necesaria

### Desacoplamiento Total
- Publicador no conoce suscriptores
- Handlers no se conocen entre sí
- Añadir handler = 0 cambios en código existente

### Cuándo Usar
✅ Múltiples reacciones a una acción
✅ Componentes que no deben conocerse
✅ Auditoría y logging
✅ Microservicios

❌ Flujos simples y directos
❌ Cuando necesitas respuesta inmediata
❌ Proyectos pequeños sin múltiples reacciones

---

## ❓ Preguntas Frecuentes

### "¿Qué pasa si un handler falla?"
Depende del diseño:
- Continuar con otros handlers (este proyecto)
- Retry automático
- Dead letter queue
- Compensación

### "¿Los handlers son síncronos o asíncronos?"
En este ejemplo son síncronos (para simplicidad). En producción, típicamente asíncronos con colas.

### "¿Es esto Event Sourcing?"
No. Event-Driven = comunicación vía eventos. Event Sourcing = estado reconstruido desde eventos. Relacionados pero diferentes.

### "¿Cómo debuggeo esto?"
- Logs en cada handler
- Correlación IDs en eventos
- Tracing distribuido en producción

---

## 📋 Checklist

Antes:
- [ ] Proyecto ejecutándose
- [ ] Terminal visible para ver logs

Durante:
- [ ] Mostrar problema acoplado
- [ ] Explicar eventos y handlers
- [ ] Demo en vivo (ver logs)
- [ ] Mostrar cómo añadir handler
- [ ] Ejercicio práctico

---

## 🏆 Mensaje Final

"Event-Driven no es magia. Es una idea simple:

Cuando algo importante pasa, publícalo.
Quien esté interesado, que escuche.

El resultado: componentes que no se conocen entre sí, pero colaboran.
Extensibilidad sin modificar código existente.
Sistemas que pueden crecer sin volverse un enredo.

Usa eventos cuando tengas múltiples reacciones a una acción.
No los uses solo porque están de moda."

---

**Profe Millo**
_"Usa eventos para desacoplar, no para complicar"_
