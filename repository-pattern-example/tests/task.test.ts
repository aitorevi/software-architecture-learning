/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  📚 PATRÓN REPOSITORY - PASO 6 de 6: LOS TESTS (¡LA JOYA!)                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  👈 VIENES DE: src/infrastructure/index.ts (la composición)               ║
 * ║                                                                           ║
 * ║  📖 EN ESTE ARCHIVO APRENDERÁS:                                           ║
 * ║     • Por qué el patrón Repository facilita TANTO los tests               ║
 * ║     • Cómo testear el dominio, el repositorio y la aplicación             ║
 * ║     • Tests rápidos sin necesidad de BD reales                            ║
 * ║     • La belleza de tests aislados e independientes                       ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * ============================================
 * TESTS: Demostrando la testabilidad
 * ============================================
 *
 * Aquí verás la GRAN VENTAJA del patrón Repository:
 * ¡Es facilísimo de testear!
 *
 * ¿Por qué?
 * Porque el TaskService NO depende de una implementación concreta,
 * sino de la INTERFACE. Podemos pasarle un repositorio falso (mock).
 *
 * El Profe Millo dice: "Si tu código es difícil de testear,
 * probablemente tienes dependencias acopladas. El patrón Repository
 * soluciona esto de forma fetén."
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { TaskService } from '../src/application/TaskService.js';
import { InMemoryTaskRepository } from '../src/infrastructure/InMemoryTaskRepository.js';
import { Task } from '../src/domain/Task.js';

/**
 * ============================================
 * TESTS DEL DOMINIO (Entidad Task)
 * ============================================
 */

test('Task se crea correctamente con valores válidos', () => {
  const task = new Task('123', 'Mi tarea');

  assert.strictEqual(task.id, '123');
  assert.strictEqual(task.title, 'Mi tarea');
  assert.strictEqual(task.completed, false);
  assert.ok(task.createdAt instanceof Date);
});

test('Task lanza error si el id está vacío', () => {
  assert.throws(
    () => new Task('', 'Mi tarea'),
    /El id de la tarea no puede estar vacío/
  );
});

test('Task lanza error si el título está vacío', () => {
  assert.throws(
    () => new Task('123', ''),
    /El título de la tarea no puede estar vacío/
  );
});

test('complete() marca la tarea como completada', () => {
  const task = new Task('123', 'Mi tarea');

  task.complete();

  assert.strictEqual(task.completed, true);
});

test('complete() lanza error si la tarea ya está completada', () => {
  const task = new Task('123', 'Mi tarea');
  task.complete();

  assert.throws(
    () => task.complete(),
    /ya está completada/
  );
});

test('isPending() devuelve true para tareas no completadas', () => {
  const task = new Task('123', 'Mi tarea');

  assert.strictEqual(task.isPending(), true);
});

/**
 * ============================================
 * TESTS DEL REPOSITORIO
 * ============================================
 */

test('InMemoryTaskRepository guarda y recupera tareas', async () => {
  const repo = new InMemoryTaskRepository();
  const task = new Task('123', 'Mi tarea');

  await repo.save(task);
  const found = await repo.findById('123');

  assert.ok(found !== null);
  assert.strictEqual(found.id, '123');
  assert.strictEqual(found.title, 'Mi tarea');
});

test('findById devuelve null si la tarea no existe', async () => {
  const repo = new InMemoryTaskRepository();

  const found = await repo.findById('no-existe');

  assert.strictEqual(found, null);
});

test('findAll devuelve todas las tareas', async () => {
  const repo = new InMemoryTaskRepository();
  await repo.save(new Task('1', 'Tarea 1'));
  await repo.save(new Task('2', 'Tarea 2'));
  await repo.save(new Task('3', 'Tarea 3'));

  const all = await repo.findAll();

  assert.strictEqual(all.length, 3);
});

test('delete elimina la tarea y devuelve true', async () => {
  const repo = new InMemoryTaskRepository();
  await repo.save(new Task('123', 'Mi tarea'));

  const deleted = await repo.delete('123');
  const found = await repo.findById('123');

  assert.strictEqual(deleted, true);
  assert.strictEqual(found, null);
});

test('delete devuelve false si la tarea no existe', async () => {
  const repo = new InMemoryTaskRepository();

  const deleted = await repo.delete('no-existe');

  assert.strictEqual(deleted, false);
});

test('findByStatus filtra correctamente las tareas', async () => {
  const repo = new InMemoryTaskRepository();

  const task1 = new Task('1', 'Tarea 1');
  const task2 = new Task('2', 'Tarea 2');
  const task3 = new Task('3', 'Tarea 3');

  task1.complete(); // Completamos la primera

  await repo.save(task1);
  await repo.save(task2);
  await repo.save(task3);

  const completed = await repo.findByStatus(true);
  const pending = await repo.findByStatus(false);

  assert.strictEqual(completed.length, 1);
  assert.strictEqual(pending.length, 2);
});

/**
 * ============================================
 * TESTS DE LA CAPA DE APLICACIÓN
 * ============================================
 *
 * Fíjate que aquí testeamos TaskService INDEPENDIENTEMENTE
 * de la implementación concreta del repositorio.
 *
 * Usamos InMemoryTaskRepository para los tests porque es rápido,
 * pero podríamos usar un mock o stub si quisiéramos.
 */

test('TaskService.createTask crea una tarea correctamente', async () => {
  const repo = new InMemoryTaskRepository();
  const service = new TaskService(repo);

  const task = await service.createTask('Mi tarea');

  assert.ok(task.id); // Tiene un ID generado
  assert.strictEqual(task.title, 'Mi tarea');
  assert.strictEqual(task.completed, false);

  // Verificamos que se guardó en el repositorio
  const found = await repo.findById(task.id);
  assert.ok(found !== null);
});

test('TaskService.completeTask marca la tarea como completada', async () => {
  const repo = new InMemoryTaskRepository();
  const service = new TaskService(repo);

  const task = await service.createTask('Mi tarea');
  await service.completeTask(task.id);

  const found = await repo.findById(task.id);
  assert.strictEqual(found?.completed, true);
});

test('TaskService.completeTask lanza error si la tarea no existe', async () => {
  const repo = new InMemoryTaskRepository();
  const service = new TaskService(repo);

  await assert.rejects(
    async () => await service.completeTask('no-existe'),
    /No existe ninguna tarea/
  );
});

test('TaskService.getAllTasks devuelve todas las tareas', async () => {
  const repo = new InMemoryTaskRepository();
  const service = new TaskService(repo);

  await service.createTask('Tarea 1');
  await service.createTask('Tarea 2');
  await service.createTask('Tarea 3');

  const all = await service.getAllTasks();

  assert.strictEqual(all.length, 3);
});

test('TaskService.getPendingTasks devuelve solo las pendientes', async () => {
  const repo = new InMemoryTaskRepository();
  const service = new TaskService(repo);

  const task1 = await service.createTask('Tarea 1');
  await service.createTask('Tarea 2');
  await service.createTask('Tarea 3');

  await service.completeTask(task1.id);

  const pending = await service.getPendingTasks();

  assert.strictEqual(pending.length, 2);
});

test('TaskService.getCompletedTasks devuelve solo las completadas', async () => {
  const repo = new InMemoryTaskRepository();
  const service = new TaskService(repo);

  const task1 = await service.createTask('Tarea 1');
  const task2 = await service.createTask('Tarea 2');
  await service.createTask('Tarea 3');

  await service.completeTask(task1.id);
  await service.completeTask(task2.id);

  const completed = await service.getCompletedTasks();

  assert.strictEqual(completed.length, 2);
});

test('TaskService.deleteTask elimina la tarea', async () => {
  const repo = new InMemoryTaskRepository();
  const service = new TaskService(repo);

  const task = await service.createTask('Mi tarea');
  const deleted = await service.deleteTask(task.id);
  const found = await service.getTaskById(task.id);

  assert.strictEqual(deleted, true);
  assert.strictEqual(found, null);
});

/**
 * ============================================
 * RESUMEN DE LOS TESTS:
 * ============================================
 *
 * Hemos testeado:
 * 1. El DOMINIO (entidad Task y sus reglas de negocio)
 * 2. El REPOSITORIO (implementación InMemory)
 * 3. La APLICACIÓN (casos de uso del TaskService)
 *
 * ¿Te das cuenta?
 * - No necesitamos una BD real para testear
 * - Los tests son RÁPIDOS (todo en memoria)
 * - Los tests son AISLADOS (cada test tiene su propio repositorio)
 * - Los tests son CLAROS (cada test prueba UNA cosa)
 *
 * El Profe Millo dice: "Así es como debería ser testear software.
 * Si tus tests tardan minutos y necesitan Docker, algo va mal.
 * El patrón Repository te permite tests rápidos y confiables."
 *
 * ¡Ejecuta estos tests con: npm test
 */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ✅ RESUMEN DEL PASO 6 - ¡HAS COMPLETADO EL FLUJO DE APRENDIZAJE!         ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  🎉 ¡ENHORABUENA, MI NIÑO/A! Has aprendido:                               ║
 * ║                                                                           ║
 * ║  1️⃣  ENTIDAD (Task): El corazón del dominio con lógica de negocio        ║
 * ║  2️⃣  PUERTO (TaskRepository): La interface que define el contrato        ║
 * ║  3️⃣  ADAPTADOR (InMemoryTaskRepository): La implementación concreta      ║
 * ║  4️⃣  APLICACIÓN (TaskService): Los casos de uso que orquestan            ║
 * ║  5️⃣  COMPOSICIÓN (index.ts): Dónde conectas todas las piezas             ║
 * ║  6️⃣  TESTS: La prueba de que el patrón funciona fetén                    ║
 * ║                                                                           ║
 * ║  💡 AHORA ENTIENDES:                                                      ║
 * ║     • Inversión de dependencias                                           ║
 * ║     • Separación de responsabilidades                                     ║
 * ║     • Cómo testear sin acoplamiento a BD                                  ║
 * ║     • Por qué esto es arquitectura hexagonal                              ║
 * ║                                                                           ║
 * ║  🚀 PRÓXIMOS PASOS:                                                       ║
 * ║     • Implementa un PostgresTaskRepository o MongoTaskRepository          ║
 * ║     • Añade DTOs para separar la API del dominio                          ║
 * ║     • Explora eventos de dominio                                          ║
 * ║     • Mira los otros ejemplos del repositorio                             ║
 * ║                                                                           ║
 * ║  Ejecuta: npm test (para ver los tests)                                   ║
 * ║  Ejecuta: npm start (para ver la demo)                                    ║
 * ║                                                                           ║
 * ║  El Profe Millo está orgulloso de ti. ¡Eso está fetén! 🏝️                ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
