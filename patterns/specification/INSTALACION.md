# Guía de Instalación y Verificación

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- curl (para probar la API)
- jq (opcional, para formatear JSON)

## Paso 1: Instalar Dependencias

```bash
cd patterns/specification-pattern
npm install
```

Deberías ver la instalación de:
- express (servidor web)
- typescript (compilador)
- vitest (testing)
- tsx (ejecutar TypeScript)

## Paso 2: Verificar que Compila

```bash
npm run build
```

Deberías ver:
- Carpeta `dist/` creada
- Sin errores de TypeScript

## Paso 3: Ejecutar Tests

```bash
npm test
```

Deberías ver:
```
✓ tests/domain/specifications.test.ts (XX tests)
✓ tests/application/search-products.test.ts (XX tests)

Test Files  2 passed (2)
     Tests  XX passed (XX)
```

## Paso 4: Ejecutar Servidor

```bash
npm run dev
```

Deberías ver:
```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║         🎯 SPECIFICATION PATTERN API                             ║
║                                                                  ║
║         Server running on http://localhost:3000                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Paso 5: Probar la API

En otra terminal:

```bash
# Verificar que el servidor responde
curl http://localhost:3000

# Crear un producto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 100,
    "category": "electronics",
    "stock": 10,
    "tags": ["test"]
  }'

# Buscar productos
curl "http://localhost:3000/products/search?category=electronics"
```

## Paso 6: Ejecutar Script de Ejemplos (Opcional)

Si tienes `jq` instalado:

```bash
chmod +x examples.sh
./examples.sh
```

Esto creará productos de ejemplo y ejecutará varias búsquedas.

## Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"
```bash
# En el archivo src/infrastructure/index.ts cambia:
const PORT = process.env.PORT || 3001;
```

### Tests fallan
```bash
# Asegúrate de que no hay errores de TypeScript
npm run build

# Ejecuta los tests en modo verbose
npm test -- --reporter=verbose
```

## Verificación Completa

Lista de comprobación:

- [ ] ✅ `npm install` - Sin errores
- [ ] ✅ `npm run build` - Compila correctamente
- [ ] ✅ `npm test` - Todos los tests pasan
- [ ] ✅ `npm run dev` - Servidor arranca
- [ ] ✅ `curl localhost:3000` - Responde OK
- [ ] ✅ Crear producto vía API - Funciona
- [ ] ✅ Buscar productos - Devuelve resultados

Si todas las casillas están marcadas, ¡el proyecto está listo! 🚀

## Siguientes Pasos

1. Lee el [README_ES.md](./README_ES.md) para entender el patrón
2. Revisa el código en el orden sugerido en [QUICKSTART.md](./QUICKSTART.md)
3. Experimenta modificando especificaciones
4. Intenta los ejercicios propuestos

---

**Profe Millo**
_"Si algo no funciona, tranqui papas. Revisa los errores paso a paso."_
