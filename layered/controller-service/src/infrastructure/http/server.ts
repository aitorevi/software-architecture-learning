/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  CONTROLLER-SERVICE - PASO 6 de 7: EL SERVIDOR HTTP                       ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/infrastructure/http/TaskController.ts                  ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Cómo configurar Express                                             ║
 * ║     • Cómo conectar el Controller al servidor                             ║
 * ║     • Middlewares básicos (json parser)                                   ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import express, { Application } from 'express';
import { TaskController } from './TaskController.js';

/**
 * Crea y configura el servidor Express.
 *
 * El servidor:
 * 1. Configura middlewares (parseo de JSON)
 * 2. Conecta los controllers a sus rutas
 * 3. Puede iniciarse en un puerto específico
 *
 * Separamos la creación del servidor del inicio
 * para poder hacer tests sin levantar el servidor.
 */
export function createServer(taskController: TaskController): Application {
  const app = express();

  // Middleware para parsear JSON en el body de las peticiones
  app.use(express.json());

  // Conectamos el controller
  // Todas las rutas del TaskController estarán disponibles
  app.use(taskController.router);

  // Ruta de health check (útil para verificar que el servidor está vivo)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}

/**
 * Inicia el servidor en el puerto especificado.
 *
 * Esta función es usada por el index.ts para arrancar la aplicación.
 */
export function startServer(app: Application, port: number): void {
  app.listen(port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🚀 Servidor corriendo en http://localhost:${port}             ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Endpoints disponibles:                                       ║
║                                                               ║
║  POST   /tasks              → Crear tarea                     ║
║  GET    /tasks              → Listar todas                    ║
║  GET    /tasks/:id          → Obtener por ID                  ║
║  POST   /tasks/:id/complete → Completar tarea                 ║
║  DELETE /tasks/:id          → Eliminar tarea                  ║
║                                                               ║
║  Ejemplo:                                                     ║
║  curl -X POST http://localhost:${port}/tasks \\                ║
║       -H "Content-Type: application/json" \\                  ║
║       -d '{"title":"Mi primera tarea"}'                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 6                                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Has visto:                                                               ║
 * ║  • Express se configura con middlewares y rutas                           ║
 * ║  • El Controller se conecta al servidor con app.use()                     ║
 * ║  • Separamos creación de inicio para facilitar tests                      ║
 * ║                                                                           ║
 * ║  👉 SIGUIENTE: src/infrastructure/index.ts                                ║
 * ║     (La COMPOSICIÓN - donde conectamos todas las piezas)                  ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
