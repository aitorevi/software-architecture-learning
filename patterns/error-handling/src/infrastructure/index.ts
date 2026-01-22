/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  COMPOSICIÓN - CONECTAR TODO                                              ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  Este archivo conecta todas las piezas:                                   ║
 * ║  1. Crear repositorio                                                     ║
 * ║  2. Crear use case (inyectar repositorio)                                 ║
 * ║  3. Crear controller (inyectar use case)                                  ║
 * ║  4. Crear app (inyectar controller)                                       ║
 * ║  5. Iniciar servidor                                                      ║
 * ║                                                                           ║
 * ║  Esto es DEPENDENCY INJECTION manual.                                     ║
 * ║  En apps grandes usarías un DI container (InversifyJS, tsyringe).         ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { InMemoryUserRepository } from './persistence/InMemoryUserRepository.js';
import { RegisterUserUseCase } from '../application/RegisterUserUseCase.js';
import { UserController } from './http/UserController.js';
import { createApp } from './http/server.js';

// ═══════════════════════════════════════════════════════════════════════
// COMPOSICIÓN (Dependency Injection)
// ═══════════════════════════════════════════════════════════════════════

// 1. Crear adaptador de persistencia (salida)
const userRepository = new InMemoryUserRepository();

// 2. Crear use case (inyectar dependencias)
const registerUserUseCase = new RegisterUserUseCase(userRepository);

// 3. Crear controller (inyectar dependencias)
const userController = new UserController(registerUserUseCase);

// 4. Crear app Express
const app = createApp(userController);

// ═══════════════════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║  🚀 ERROR HANDLING - SERVIDOR INICIADO                               ║
║                                                                      ║
║  Puerto: ${PORT}                                                     ║
║  URL: http://localhost:${PORT}                                      ║
║                                                                      ║
║  Endpoints disponibles:                                              ║
║  • POST /users       - Registrar usuario                             ║
║  • GET  /health      - Health check                                  ║
║                                                                      ║
║  Prueba con curl:                                                    ║
║  curl -X POST http://localhost:${PORT}/users \\                      ║
║    -H "Content-Type: application/json" \\                            ║
║    -d '{"email":"millo@laspalmas.com","password":"Abc123!","acceptedTerms":true}'
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
  `);
});
