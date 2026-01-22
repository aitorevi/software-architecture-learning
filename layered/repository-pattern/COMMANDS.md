# 🔧 Comandos Útiles

## 🚀 Comandos Principales

```bash
# Instalar dependencias
npm install

# Ejecutar la demo
npm run dev

# Ejecutar tests
npm test
```

## 📂 Navegación del Código

### Orden Recomendado de Lectura

```bash
# 1. El dominio - Empezar por aquí
cat src/domain/Task.ts
cat src/domain/TaskRepository.ts

# 2. La infraestructura - Ver cómo se implementa
cat src/infrastructure/InMemoryTaskRepository.ts

# 3. La aplicación - Ver cómo se orquesta
cat src/application/TaskService.ts

# 4. El punto de entrada - Ver cómo se conecta todo
cat src/infrastructure/index.ts

# 5. Los tests - Ver cómo se testea
cat tests/task.test.ts
```

### Ver el Código Limpio (Sin Comentarios)

```bash
# Ver solo el código (sin comentarios)
grep -v '^\s*//' src/domain/Task.ts | grep -v '^\s*\*' | grep -v '^\s*$'

# Contar líneas reales de código
grep -v '^\s*//' src/**/*.ts | grep -v '^\s*\*' | grep -v '^\s*$' | wc -l
```

## 🧪 Tests

### Ejecutar Todos los Tests

```bash
npm test
```

### Ejecutar con Más Detalles

```bash
npm test -- --reporter=spec
```

### Ver Cobertura (Manual)

```bash
# No hay herramienta de cobertura configurada intencionadamente
# (para mantener el proyecto simple)
# Pero todos los archivos tienen tests correspondientes
```

## 📊 Análisis del Proyecto

### Contar Archivos TypeScript

```bash
find src -name "*.ts" | wc -l
```

### Contar Líneas por Archivo

```bash
wc -l src/**/*.ts tests/*.test.ts
```

### Ver Estructura del Proyecto

```bash
# Si tienes tree instalado
tree -I 'node_modules|dist'

# Si no, usa find
find . -type f -name "*.ts" -o -name "*.md" | grep -v node_modules | sort
```

## 🔍 Búsquedas Útiles

### Encontrar Todos los Comentarios del Profe Millo

```bash
grep -r "Profe Millo" src/
```

### Buscar Interfaces

```bash
grep -r "interface " src/
```

### Buscar Implementaciones

```bash
grep -r "implements " src/
```

### Buscar Inyección de Dependencias

```bash
grep -r "constructor.*private" src/
```

## 📝 Edición

### Abrir en VS Code

```bash
code .
```

### Abrir Archivos Específicos

```bash
# Abrir los archivos principales
code src/domain/Task.ts \
     src/domain/TaskRepository.ts \
     src/application/TaskService.ts \
     src/infrastructure/InMemoryTaskRepository.ts \
     src/infrastructure/index.ts
```

## 🧹 Limpieza

### Limpiar Build

```bash
rm -rf dist/
```

### Limpiar Node Modules

```bash
rm -rf node_modules/
npm install
```

### Limpiar Todo

```bash
rm -rf dist/ node_modules/
```

## 📚 Documentación

### Leer README Completo

```bash
cat README_ES.md | less
```

### Leer Quickstart

```bash
cat QUICKSTART.md
```

### Ver Diagramas

```bash
cat DIAGRAMA.md
```

## 🎓 Ejercicios

### Setup para Ejercicio 1 (Añadir findByTitle)

```bash
# 1. Abrir archivos necesarios
code src/domain/TaskRepository.ts \
     src/infrastructure/InMemoryTaskRepository.ts \
     src/application/TaskService.ts \
     tests/task.test.ts

# 2. Ejecutar tests en watch mode (si quieres)
npm test -- --watch
```

### Setup para Ejercicio 2 (FileTaskRepository)

```bash
# 1. Crear el nuevo archivo
touch src/infrastructure/FileTaskRepository.ts

# 2. Abrirlo
code src/infrastructure/FileTaskRepository.ts
```

## 🐛 Debug

### Ejecutar con Logging

```bash
# Añadir console.log en el código y ejecutar
npm run dev
```

### Ejecutar TypeScript con Debug

```bash
# Añadir debugger en el código
node --inspect --import tsx src/infrastructure/index.ts
```

### Ver Tipos de TypeScript

```bash
# Compilar sin ejecutar
npx tsc --noEmit
```

## 📦 NPM Útiles

### Ver Versiones

```bash
npm list
```

### Actualizar Dependencias

```bash
npm update
```

### Ver Scripts Disponibles

```bash
npm run
```

## 🔄 Git (Si Inicializas Repo)

### Inicializar Git

```bash
git init
git add .
git commit -m "Initial commit: Repository Pattern example"
```

### Ver Cambios

```bash
git status
git diff
```

## 💡 Trucos

### Ver Solo los Comentarios Pedagógicos

```bash
grep -r "El Profe Millo dice" src/
```

### Contar Palabras Totales en Comentarios

```bash
grep -r "//" src/ | wc -w
```

### Ver Todas las Interfaces Definidas

```bash
grep -A 5 "^export interface" src/**/*.ts
```

### Ver Todas las Clases

```bash
grep -A 3 "^export class" src/**/*.ts
```

### Ver Todos los Métodos Públicos

```bash
grep -E "^\s+(public\s+)?async" src/**/*.ts
```

## 🎯 Atajos Rápidos

```bash
# Setup completo desde cero
npm install && npm run dev && npm test

# Ver estructura + ejecutar + testear
find src -name "*.ts" && npm run dev && npm test

# Abrir documentación en navegador (si tienes markdown viewer)
open README_ES.md  # macOS
xdg-open README_ES.md  # Linux
start README_ES.md  # Windows
```

## 🚦 Verificación Rápida

```bash
# ¿Todo funciona?
npm install && npm run dev && npm test && echo "✅ TODO FUNCIONA"

# ¿Hay errores de TypeScript?
npx tsc --noEmit && echo "✅ SIN ERRORES DE TIPOS"

# ¿Los tests pasan?
npm test && echo "✅ TESTS PASANDO"
```

---

**Tip del Profe Millo:**
_"Guarda esta chuleta a mano. Los comandos son tus herramientas, conócelas bien."_
