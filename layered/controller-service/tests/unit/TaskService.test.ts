/**
 * Tests unitarios para TaskService
 *
 * Aquí testeamos el Service en AISLAMIENTO.
 * Usamos un repositorio "falso" (mock) para no depender de la implementación real.
 *
 * NOTA: Ahora que usamos Value Objects, en los tests debemos usar
 * .getValue() para obtener los valores primitivos al comparar.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskService } from '../../src/application/TaskService.js';
import { InMemoryTaskRepository } from '../../src/infrastructure/persistence/InMemoryTaskRepository.js';

describe('TaskService', () => {
  let taskService: TaskService;
  let repository: InMemoryTaskRepository;

  beforeEach(() => {
    // Creamos un repositorio limpio antes de cada test
    repository = new InMemoryTaskRepository();
    taskService = new TaskService(repository);
  });

  describe('createTask', () => {
    it('debe crear una tarea con título', async () => {
      const task = await taskService.createTask('Mi primera tarea');

      // Usamos .getValue() porque ahora title es un TaskTitle (Value Object)
      expect(task.title.getValue()).toBe('Mi primera tarea');
      expect(task.completed).toBe(false);
      // id también es un TaskId (Value Object)
      expect(task.id.getValue()).toBeDefined();
    });

    it('debe guardar la tarea en el repositorio', async () => {
      const task = await taskService.createTask('Tarea guardada');

      // Usamos el TaskId directamente para buscar
      const found = await repository.findById(task.id);
      expect(found).not.toBeNull();
      expect(found?.title.getValue()).toBe('Tarea guardada');
    });

    it('debe lanzar error si el título está vacío', async () => {
      await expect(taskService.createTask('')).rejects.toThrow(
        'El título de la tarea no puede estar vacío'
      );
    });
  });

  describe('completeTask', () => {
    it('debe marcar una tarea como completada', async () => {
      const task = await taskService.createTask('Tarea a completar');

      // Pasamos el string, que es lo que espera el Service
      const completed = await taskService.completeTask(task.id.getValue());

      expect(completed.completed).toBe(true);
    });

    it('debe lanzar error si la tarea no existe', async () => {
      await expect(taskService.completeTask('id-inexistente')).rejects.toThrow(
        'No existe la tarea con id id-inexistente'
      );
    });

    it('debe lanzar error si la tarea ya está completada', async () => {
      const task = await taskService.createTask('Tarea');
      await taskService.completeTask(task.id.getValue());

      await expect(taskService.completeTask(task.id.getValue())).rejects.toThrow(
        'Esta tarea ya está completada'
      );
    });
  });

  describe('getAllTasks', () => {
    it('debe devolver array vacío si no hay tareas', async () => {
      const tasks = await taskService.getAllTasks();

      expect(tasks).toEqual([]);
    });

    it('debe devolver todas las tareas creadas', async () => {
      await taskService.createTask('Tarea 1');
      await taskService.createTask('Tarea 2');
      await taskService.createTask('Tarea 3');

      const tasks = await taskService.getAllTasks();

      expect(tasks).toHaveLength(3);
    });
  });

  describe('getTaskById', () => {
    it('debe devolver la tarea si existe', async () => {
      const created = await taskService.createTask('Mi tarea');

      // Pasamos el string del id
      const found = await taskService.getTaskById(created.id.getValue());

      expect(found).not.toBeNull();
      expect(found?.title.getValue()).toBe('Mi tarea');
    });

    it('debe devolver null si no existe', async () => {
      const found = await taskService.getTaskById('no-existe');

      expect(found).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('debe eliminar la tarea y devolver true', async () => {
      const task = await taskService.createTask('Tarea a eliminar');

      const deleted = await taskService.deleteTask(task.id.getValue());

      expect(deleted).toBe(true);
      expect(await taskService.getTaskById(task.id.getValue())).toBeNull();
    });

    it('debe devolver false si la tarea no existe', async () => {
      const deleted = await taskService.deleteTask('no-existe');

      expect(deleted).toBe(false);
    });
  });
});
