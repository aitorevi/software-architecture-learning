/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  📚 PATRÓN REPOSITORY - PASO 5 de 6: LA COMPOSICIÓN                       ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/application/TaskService.ts (los casos de uso)          ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Cómo CONECTAR todas las piezas del patrón                           ║
 * ║     • Dónde se decide qué implementación concreta usar                    ║
 * ║     • Ver el patrón Repository funcionando end-to-end                     ║
 * ║     • Por qué esta composición es el único punto de acoplamiento          ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ============================================
 * PUNTO DE ENTRADA: Aquí juntamos todo
 * ============================================
 *
 * Este archivo demuestra cómo se conectan todas las piezas:
 * 1. Creamos la implementación concreta del repositorio
 * 2. Se la inyectamos al servicio de aplicación
 * 3. Usamos el servicio para hacer cosas
 *
 * A esto se le llama COMPOSICIÓN o "cablear las dependencias".
 * En aplicaciones reales usarías un contenedor de inyección
 * de dependencias, pero para aprender está perfecto así.
 *
 * El Profe Millo dice: "Este es el ÚNICO lugar donde decides
 * qué implementación concreta usar. El resto del código no lo sabe."
 */

import { TaskService } from '../application/TaskService.js';
import { InMemoryTaskRepository } from './InMemoryTaskRepository.js';

/**
 * ============================================
 * COMPOSICIÓN DE LA APLICACIÓN
 * ============================================
 */

// 1. Creamos el repositorio concreto (ADAPTADOR)
const taskRepository = new InMemoryTaskRepository();

// 2. Se lo inyectamos al servicio (INVERSIÓN DE DEPENDENCIAS)
//    Fíjate que el TaskService recibe TaskRepository (interface),
//    no InMemoryTaskRepository (implementación concreta).
//    Eso permite cambiar la implementación fácilmente.
const taskService = new TaskService(taskRepository);

/**
 * ============================================
 * DEMOSTRACIÓN DEL PATRÓN REPOSITORY
 * ============================================
 */

async function demo() {
  console.log('==========================================');
  console.log('DEMO: Patrón Repository - by Profe Millo');
  console.log('==========================================\n');

  try {
    // 1. Creamos algunas tareas
    console.log('1️⃣  CREANDO TAREAS...\n');

    const tarea1 = await taskService.createTask('Aprender el patrón Repository');
    console.log(`✅ Tarea creada: "${tarea1.title}"`);
    console.log(`   ID: ${tarea1.id}`);
    console.log(`   Completada: ${tarea1.completed}`);
    console.log(`   Creada: ${tarea1.createdAt.toLocaleString()}\n`);

    const tarea2 = await taskService.createTask('Practicar inversión de dependencias');
    console.log(`✅ Tarea creada: "${tarea2.title}"`);
    console.log(`   ID: ${tarea2.id}\n`);

    const tarea3 = await taskService.createTask('Hacer las papas arrugadas del Profe Millo');
    console.log(`✅ Tarea creada: "${tarea3.title}"`);
    console.log(`   ID: ${tarea3.id}\n`);

    // 2. Listamos todas las tareas
    console.log('2️⃣  LISTANDO TODAS LAS TAREAS...\n');
    const todasLasTareas = await taskService.getAllTasks();
    console.log(`📋 Total de tareas: ${todasLasTareas.length}\n`);

    // 3. Completamos una tarea
    console.log('3️⃣  COMPLETANDO UNA TAREA...\n');
    await taskService.completeTask(tarea1.id);
    console.log(`✔️  Tarea "${tarea1.title}" marcada como completada\n`);

    // 4. Mostramos las tareas pendientes
    console.log('4️⃣  TAREAS PENDIENTES...\n');
    const pendientes = await taskService.getPendingTasks();
    pendientes.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title}`);
    });
    console.log('');

    // 5. Mostramos las tareas completadas
    console.log('5️⃣  TAREAS COMPLETADAS...\n');
    const completadas = await taskService.getCompletedTasks();
    completadas.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title}`);
    });
    console.log('');

    // 6. Buscamos una tarea por ID
    console.log('6️⃣  BUSCANDO UNA TAREA ESPECÍFICA...\n');
    const tareaEncontrada = await taskService.getTaskById(tarea2.id);
    if (tareaEncontrada) {
      console.log(`🔍 Encontrada: "${tareaEncontrada.title}"`);
      console.log(`   Estado: ${tareaEncontrada.completed ? 'Completada' : 'Pendiente'}\n`);
    }

    // 7. Intentamos buscar una tarea que no existe
    console.log('7️⃣  BUSCANDO UNA TAREA INEXISTENTE...\n');
    const noExiste = await taskService.getTaskById('id-inventado-123');
    console.log(`🔍 Resultado: ${noExiste === null ? 'null (no existe)' : 'encontrada'}\n`);

    // 8. Intentamos completar una tarea ya completada (esto lanzará error)
    console.log('8️⃣  INTENTANDO COMPLETAR UNA TAREA YA COMPLETADA...\n');
    try {
      await taskService.completeTask(tarea1.id);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`❌ Error capturado (esto es correcto): ${error.message}\n`);
      }
    }

    // 9. Eliminamos una tarea
    console.log('9️⃣  ELIMINANDO UNA TAREA...\n');
    const eliminada = await taskService.deleteTask(tarea3.id);
    console.log(`🗑️  Tarea eliminada: ${eliminada ? 'Sí' : 'No'}\n`);

    // 10. Verificamos el total final
    console.log('🔟 VERIFICACIÓN FINAL...\n');
    const tareasFinales = await taskService.getAllTasks();
    console.log(`📊 Tareas restantes: ${tareasFinales.length}`);
    console.log(`   Completadas: ${(await taskService.getCompletedTasks()).length}`);
    console.log(`   Pendientes: ${(await taskService.getPendingTasks()).length}\n`);

    console.log('==========================================');
    console.log('DEMO COMPLETADA ✅');
    console.log('==========================================\n');

    console.log('🎓 LECCIONES APRENDIDAS:\n');
    console.log('1. El DOMINIO (Task, TaskRepository) no sabe nada de cómo se guardan los datos');
    console.log('2. La APLICACIÓN (TaskService) orquesta el dominio sin conocer detalles de BD');
    console.log('3. La INFRAESTRUCTURA (InMemoryTaskRepository) implementa el PUERTO del dominio');
    console.log('4. Podríamos cambiar a MongoDB sin tocar NADA del dominio ni aplicación');
    console.log('5. Esta separación hace el código TESTEABLE y MANTENIBLE\n');

    console.log('💡 SIGUIENTE PASO:\n');
    console.log('Mira el proyecto hexagonal/ para ver cómo añadir:');
    console.log('- DTOs (Data Transfer Objects)');
    console.log('- Eventos de dominio');
    console.log('- Arquitectura hexagonal completa\n');

  } catch (error) {
    console.error('💥 Error en la demo:', error);
  }
}

// Ejecutamos la demo
demo();

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 5                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║  • Cómo ensamblar todas las piezas del patrón Repository                  ║
 * ║  • La composición es donde decides qué adaptador usar                     ║
 * ║  • El resto del código NO conoce la implementación concreta               ║
 * ║  • Has visto el patrón completo funcionando en una demo real              ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE PASO: tests/task.test.ts                                    ║
 * ║     Ruta completa: /Users/aitorevi/Dev/hexagonal/                         ║
 * ║                    repository-pattern-example/tests/task.test.ts          ║
 * ║                                                                           ║
 * ║     (Aprenderás cómo TESTEAR todo esto - la gran ventaja del patrón)      ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
