/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  CONTROLLER-SERVICE - PASO 7 de 7: LA COMPOSICIÓN                         ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/infrastructure/http/server.ts                          ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Qué es la COMPOSICIÓN y por qué es importante                       ║
 * ║     • Cómo conectar todas las capas                                       ║
 * ║     • El orden de creación de dependencias                                ║
 * ║                                                                           ║
 * ║  ⭐ AQUÍ ES DONDE TODO COBRA SENTIDO ⭐                                   ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { InMemoryTaskRepository } from './persistence/InMemoryTaskRepository.js';
import { TaskService } from '../application/TaskService.js';
import { TaskController } from './http/TaskController.js';
import { createServer, startServer } from './http/server.js';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  💡 ¿QUÉ ES LA COMPOSICIÓN?                                               ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  La composición es donde CONECTAMOS todas las piezas.                     ║
 * ║                                                                           ║
 * ║  Es el ÚNICO lugar donde hacemos "new" de las implementaciones concretas. ║
 * ║  El resto del código trabaja con interfaces (abstracciones).              ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "Es como armar un Lego. Tienes todas las piezas     ║
 * ║  sueltas (Repository, Service, Controller) y aquí las encajas."           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * COMPOSICIÓN: Conectamos todas las piezas
 *
 * El orden importa:
 * 1. Primero creamos lo que NO tiene dependencias (Repository)
 * 2. Luego lo que depende de ello (Service depende de Repository)
 * 3. Finalmente lo que depende de lo anterior (Controller depende de Service)
 */

// 1. Creamos el ADAPTADOR DE SALIDA (persistencia)
//    No tiene dependencias, es la base
const taskRepository = new InMemoryTaskRepository();

// 2. Creamos el SERVICE (capa de aplicación)
//    Depende del repositorio (se lo inyectamos)
const taskService = new TaskService(taskRepository);

// 3. Creamos el ADAPTADOR DE ENTRADA (controller HTTP)
//    Depende del service (se lo inyectamos)
const taskController = new TaskController(taskService);

// 4. Creamos el servidor Express con el controller
const app = createServer(taskController);

// 5. Iniciamos el servidor
const PORT = 3000;
startServer(app, PORT);

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🔄 DIAGRAMA FINAL: FLUJO COMPLETO                                        ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║   COMPOSICIÓN (este archivo):                                             ║
 * ║   ┌────────────────────────────────────────────────────────────────┐      ║
 * ║   │                                                                │      ║
 * ║   │  Repository ─────▶ Service ─────▶ Controller ─────▶ Server    │      ║
 * ║   │      │                │                │               │       │      ║
 * ║   │      └────────────────┴────────────────┴───────────────┘       │      ║
 * ║   │                    INYECCIÓN DE DEPENDENCIAS                   │      ║
 * ║   │                                                                │      ║
 * ║   └────────────────────────────────────────────────────────────────┘      ║
 * ║                                                                           ║
 * ║   FLUJO DE UNA PETICIÓN:                                                  ║
 * ║   ┌────────────────────────────────────────────────────────────────┐      ║
 * ║   │                                                                │      ║
 * ║   │  Cliente                                                       │      ║
 * ║   │     │                                                          │      ║
 * ║   │     │ POST /tasks {"title": "Aprender arquitectura"}           │      ║
 * ║   │     ▼                                                          │      ║
 * ║   │  Server (Express)                                              │      ║
 * ║   │     │                                                          │      ║
 * ║   │     ▼                                                          │      ║
 * ║   │  Controller ─── Extrae title, valida, llama al service         │      ║
 * ║   │     │                                                          │      ║
 * ║   │     ▼                                                          │      ║
 * ║   │  Service ────── Crea ID, crea Task, guarda en repository       │      ║
 * ║   │     │                                                          │      ║
 * ║   │     ▼                                                          │      ║
 * ║   │  Repository ─── Guarda en memoria (Map)                        │      ║
 * ║   │     │                                                          │      ║
 * ║   │     ▼                                                          │      ║
 * ║   │  Controller ─── Convierte Task a JSON, responde 201            │      ║
 * ║   │     │                                                          │      ║
 * ║   │     ▼                                                          │      ║
 * ║   │  Cliente ────── Recibe: {"id": "...", "title": "...", ...}     │      ║
 * ║   │                                                                │      ║
 * ║   └────────────────────────────────────────────────────────────────┘      ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  🎉 ¡FELICIDADES! HAS COMPLETADO EL RECORRIDO                             ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has aprendido:                                                           ║
 * ║                                                                           ║
 * ║  1. ENTIDAD (Task)                                                        ║
 * ║     → Representa el conocimiento del negocio                              ║
 * ║                                                                           ║
 * ║  2. PUERTO (TaskRepository interface)                                     ║
 * ║     → Define QUÉ necesitamos, no CÓMO                                     ║
 * ║                                                                           ║
 * ║  3. ADAPTADOR DE SALIDA (InMemoryTaskRepository)                          ║
 * ║     → Implementa el puerto para persistir datos                           ║
 * ║                                                                           ║
 * ║  4. SERVICE (TaskService)                                                 ║
 * ║     → Orquesta el dominio, ejecuta casos de uso                           ║
 * ║     → NO sabe de HTTP                                                     ║
 * ║                                                                           ║
 * ║  5. ADAPTADOR DE ENTRADA (TaskController)                                 ║
 * ║     → Traduce HTTP ↔ Service                                              ║
 * ║     → Maneja errores y códigos HTTP                                       ║
 * ║                                                                           ║
 * ║  6. SERVIDOR (Express)                                                    ║
 * ║     → Configura y arranca la aplicación                                   ║
 * ║                                                                           ║
 * ║  7. COMPOSICIÓN (este archivo)                                            ║
 * ║     → Conecta todas las piezas con inyección de dependencias              ║
 * ║                                                                           ║
 * ║  El Profe Millo dice: "¡Ea, ya sabes más que muchos seniors!              ║
 * ║  Ahora a practicar. Prueba a añadir un endpoint nuevo o cambiar           ║
 * ║  el repositorio por uno que use archivos JSON."                           ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
