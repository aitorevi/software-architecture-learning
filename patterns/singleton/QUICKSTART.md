# Quickstart - Singleton Pattern

## 1. Instalar y ejecutar

```bash
cd patterns/singleton
npm install
npm run dev
```

Deberías ver:

```
Server running on http://localhost:3000

Available endpoints:
  POST   /logs                → Create a log
  GET    /logs                → Get all logs
  POST   /database/connect    → Connect to database
  GET    /config              → Get configuration
  GET    /demo/singleton-proof → Prove it's a singleton
```

## 2. Probar el patrón

### Demostrar que es Singleton

```bash
curl http://localhost:3000/demo/singleton-proof
```

Respuesta:
```json
{
  "areSameInstance": true,
  "message": "✅ Logger is a proper singleton (same instance)",
  "logCount": 1
}
```

### Usar el Logger

```bash
# Crear algunos logs
curl -X POST http://localhost:3000/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "INFO",
    "message": "Usuario inició sesión",
    "metadata": { "userId": "123", "ip": "192.168.1.1" }
  }'

curl -X POST http://localhost:3000/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "ERROR",
    "message": "Fallo en la conexión",
    "metadata": { "error": "ETIMEDOUT" }
  }'

# Ver todos los logs (de la única instancia)
curl http://localhost:3000/logs
```

### Conectar a la Base de Datos

```bash
curl -X POST http://localhost:3000/database/connect \
  -H "Content-Type: application/json" \
  -d '{
    "host": "localhost",
    "port": 5432,
    "database": "myapp",
    "username": "postgres",
    "password": "secret"
  }'

# Ver estado de conexión
curl http://localhost:3000/database/status
```

### Obtener Configuración

```bash
# Configuración completa
curl http://localhost:3000/config

# Verificar una feature específica
curl http://localhost:3000/config/feature/authentication
```

## 3. Ejecutar tests

```bash
# Todos los tests
npm test

# En modo watch
npm run test:watch
```

Los tests demuestran:
- ✅ Siempre es la misma instancia
- ✅ El estado se comparte entre referencias
- ✅ Lazy vs Eager initialization
- ✅ Thread-safety en código asíncrono
- ❌ El problema SIN Singleton

## 4. Leer el código

Sigue este orden para entender el patrón:

### El Problema (sin Singleton)
1. `src/infrastructure/singleton/Logger.before.ts` - Múltiples instancias
2. `tests/Logger.before.test.ts` - Tests que muestran el problema

### La Solución (con Singleton)

**Variante 1: Lazy Initialization**
3. `src/infrastructure/singleton/Logger.ts` - Singleton lazy
4. `tests/Logger.test.ts` - Tests del patrón

**Variante 2: Eager Initialization**
5. `src/infrastructure/singleton/DatabaseConnection.ts` - Singleton eager
6. `tests/DatabaseConnection.test.ts` - Tests

**Variante 3: Thread-Safe Async**
7. `src/infrastructure/singleton/ConfigManager.ts` - Singleton thread-safe
8. `tests/ConfigManager.test.ts` - Tests

## 5. Conceptos clave

### Constructor Privado
```typescript
class Logger {
  // ❌ No se puede hacer: new Logger()
  private constructor() {
    // Solo se puede llamar desde dentro de la clase
  }
}
```

### Lazy vs Eager

**Lazy (se crea cuando se pide):**
```typescript
private static instance: Logger | null = null;
// Se crea en getInstance()
```

**Eager (se crea al cargar la clase):**
```typescript
private static instance = new DatabaseConnection();
// Ya está creada
```

## 6. Siguiente paso

→ **[README_ES.md](./README_ES.md)** - Tutorial completo del patrón

¡Venga, a darle caña!
